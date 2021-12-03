"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findInvite(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services["group-invite"].findOne({
      code: id,
    });

    // check date
    if (entity.expires) {
      if (new Date(entity.expires) < new Date()) {
        return null;
      }
    }

    // check if maximum
    if (entity.maximum) {
      if (entity.users.length >= entity.maximum) {
        return null;
      }
    }

    return sanitizeEntity(entity, { model: strapi.models.invite });
  },
};
