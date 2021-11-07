"use strict";
const { v1: uuidv1 } = require("uuid");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    beforeCreate: async (data) => {
      const v1options = {
        msecs: new Date().getTime(),
      };
      const uuid = uuidv1(v1options);
      console.log("set code", uuid);
      data.code = uuid;
      // model.set("code", uuid);
    },
  },
};
