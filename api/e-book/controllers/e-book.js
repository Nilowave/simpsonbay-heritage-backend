"use strict";

const { fromBuffer } = require("pdf2pic");
const axios = require("axios");
const AWS = require("aws-sdk");
const PDFParser = require("pdf2json");
const pdfParser = new PDFParser();
const { sanitizeEntity } = require("strapi-utils");

const PAGES_DIR = "ebook-pages/";

const initS3 = () => {
  return new AWS.S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    region: process.env.AWS_REGION,
  });
};

const getPagesFromS3 = () => {
  const S3 = initS3();
  return new Promise((resolve, reject) => {
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: PAGES_DIR,
    };

    S3.listObjectsV2(getParams, function (err, data) {
      if (err) {
        resolve(err);
      }
      resolve(data);
    });
  });
};

const uploadToS3 = (config) => {
  const S3 = initS3();

  return new Promise((resolve, reject) => {
    const configData = { ...config, pages: config.pages.length };
    const bucketName = process.env.AWS_BUCKET_NAME;

    const defaultParams = {
      Bucket: bucketName,
      // Key: bucketPath,
      // Body: pageBuffer,
      ContentEncoding: "base64",
      ContentType: "image/jpeg",
    };

    let completed = 0;

    config.pages.forEach((page) => {
      const pageBuffer = Buffer.from(page.base64, "base64");
      const subDir = "";
      const bucketPath = `${PAGES_DIR}${subDir}page_${page.page}.jpg`;

      const params = {
        ...defaultParams,
        Key: bucketPath,
        Body: pageBuffer,
        ACL: "public-read",
      };

      S3.putObject(params, function (err, data) {
        if (err) {
          completed++;
          reject(err);
          console.log(err);
          console.log("Error uploading data: ", data);
        } else {
          completed++;
          console.log("successfully uploaded page ", completed, data);
        }

        if (completed === config.pages.length) {
          resolve(configData);
        }
      });
    });
  });
};

const getPdfPageSize = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataReady", function (data) {
      resolve({
        width: data.Pages[0].Width,
        height: data.Pages[0].Height,
        ratio: data.Pages[0].Height / data.Pages[0].Width,
        pageNum: data.Pages.length,
      });
    });

    pdfParser.on("error", (err) => {
      console.error("Parser Error", err);
      resolve(err);
    });

    pdfParser.parseBuffer(pdfBuffer);
  });
};

module.exports = {
  async find(ctx) {
    const user = ctx.state.user;

    let entities;
    if (ctx.query._q) {
      entities = await strapi.services["e-book"].search(ctx.query);
    } else {
      entities = await strapi.services["e-book"].find(ctx.query);
    }

    if (entities) entities.user = user;

    return sanitizeEntity(entities, { model: strapi.models["e-book"] });
  },

  async getPages(ctx) {
    const book = await strapi.services["e-book"].find();
    const bookData = JSON.parse(book.book_pages);
    const _pages = await getPagesFromS3();
    const pages = _pages.Contents.map((page) => {
      if (page.Key !== "ebook-pages/") {
        return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${page.Key}`;
      }
    }).filter((page) => page);

    // sort array by page number
    pages.sort((a, b) => {
      const pA = parseInt(a.split("_")[1].split(".")[0]);
      const pB = parseInt(b.split("_")[1].split(".")[0]);
      if (pA > pB) {
        return 1;
      } else {
        return -1;
      }
    });

    ctx.send({
      pages: pages.filter((page, index) => index < bookData.pages && page),
      book: bookData,
    });
  },

  async convert(ctx) {
    console.log(" > Get Book");
    console.time(" > Get Book");
    let book;
    try {
      book = await strapi.services["e-book"].find();
      console.log("book details", book);
    } catch (err) {
      console.log("book errror", err);
      console.error(err);
      ctx.badRequest({
        message: "There was an error fetching book details",
        err,
      });
    }
    console.timeEnd(" > Get Book");

    if (!book) {
      ctx.badRequest({
        message: "There was an error fetching book details",
        err,
      });
    }

    if (book.file) {
      console.log(" > Download PDF Buffer");
      console.time(" > Download PDF Buffer");
      const response = await axios.get(book.file.url, {
        responseType: "arraybuffer",
      });
      console.timeEnd(" > Download PDF Buffer");

      const pdfBuffer = response.data;

      console.time(" > Get Page Size");
      const pageSize = await getPdfPageSize(pdfBuffer);
      console.timeEnd(" > Get Page Size");
      console.log(pageSize);

      // TODO: Optimize CPU usage by converting pages in batches of 10

      const size = 1200;
      const ratio = pageSize.ratio || 1.4142;

      const options = {
        density: 400,
        quality: 75,
        format: "jpg",
        width: size,
        height: Math.round(size * ratio),
      };

      const convert = fromBuffer(pdfBuffer, options);
      const pagesToConvert = [1];

      const chunkSize = 10;
      const pageList = Array.from(
        { length: pageSize.pageNum },
        (_, i) => i + 1
      );
      const pageChunks = pageList.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
      }, []);

      // Convert PDF pages to base64
      console.time(" > Convert Pages");
      let pages = [];
      for (let i = 0; i < pageChunks.length; i++) {
        const pagesChunk = await convert.bulk(pageChunks[i], true);
        pages = pages.concat(pagesChunk);
      }
      console.timeEnd(" > Convert Pages");

      const config = {
        file: book.file,
        pages,
      };

      console.time(" > Upload S3");
      const upload = await uploadToS3(config);
      console.timeEnd(" > Upload S3");

      upload.last_update = new Date().toISOString();

      ctx.send(upload);
    } else {
      ctx.badRequest(null, {
        message: "No file upload. Make sure to upload a PDF file first.",
      });
    }
  },
};
