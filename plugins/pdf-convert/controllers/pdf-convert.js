"use strict";

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

const sanitize = (data, options = {}) => {
  return sanitizeEntity(data, {
    model: strapi.getModel("file", "upload"),
    ...options,
  });
};

/**
 * pdf-convert.js controller
 *
 * @description: A set of functions called "actions" of the `pdf-convert` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: "ok",
    });
  },

  convert: async (ctx) => {},
};
