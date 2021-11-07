const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async index(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.invite.findOne({
      code: id,
      confirmed: false,
    });
    return sanitizeEntity(entity, { model: strapi.models.invite });
  },
};
