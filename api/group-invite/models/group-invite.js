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
        msecs: Math.floor(Date.now() * Math.random()),
      };
      console.log(v1options);
      const uuid = uuidv1(v1options);
      const link = `${process.env.API_DOMAIN}/register/group/${uuid}`;
      data.link = link;

      console.log(data);
    },
  },
};
