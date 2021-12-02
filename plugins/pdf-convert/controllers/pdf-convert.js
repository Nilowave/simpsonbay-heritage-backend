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
    const user = ctx.state.user;
    console.log(user);
    // Send 200 `ok`
    ctx.badRequest({
      message: "ok",
    });
  },
};
