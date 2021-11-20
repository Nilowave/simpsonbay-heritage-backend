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
      const link = `${process.env.API_DOMAIN}/register/${uuid}`;
      data.code = uuid;
      data.invite_link = link;

      // console.log(data);

      await strapi.plugins["email"].services.email
        .send({
          to: data.email,
          templateId: "d-3941c8bb26c9419dbd9a7a75199e0c63",
          dynamic_template_data: {
            register_link: link,
          },
        })
        .then((res) => {
          console.log("email send success", res);
        })
        .catch((err) => {
          console.error(err);
          console.log("error sending email", err.response.body);
        });

      console.log("done");
    },
  },
};
