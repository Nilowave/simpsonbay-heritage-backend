"use strict";

const { fromBuffer } = require("pdf2pic");
const axios = require("axios");
const AWS = require("aws-sdk");
const Boom = require("boom");

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

module.exports = {
  async getPages(ctx) {
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

    ctx.send({ pages });
  },

  async convert(ctx) {
    const book = await strapi.services["e-book"].find();

    if (book.file) {
      console.log("Get PDF as buffer");
      const response = await axios.get(book.file.url, {
        responseType: "arraybuffer",
      });

      // TODO: Make this dynamic somehow..
      const size = 1200;
      const ratio = 1.4142;

      const options = {
        density: 400,
        quality: 80,
        format: "jpg",
        width: size,
        height: Math.round(size * ratio),
      };

      const convert = fromBuffer(response.data, options);
      const pagesToConvert = -1;

      // Convert PDF pages to base64
      console.log("Begin converting pages in bulk");
      const pages = await convert.bulk(pagesToConvert, true);

      const config = {
        file: book.file,
        pages,
      };

      console.log("Pages ready for upload to S3");
      const upload = await uploadToS3(config);

      upload.last_update = new Date().toISOString();

      ctx.send(upload);
    } else {
      ctx.badRequest(null, {
        message: "No file upload. Make sure to upload a PDF file first.",
      });
    }
  },
};
