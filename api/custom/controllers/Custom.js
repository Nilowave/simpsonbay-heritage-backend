"use strict";
module.exports = {
  async logout(ctx) {
    const token = ctx.cookies.get("token");
    ctx.cookies.set("token", null);
    ctx.send({
      authorized: true,
      message: "Successfully destroyed session",
    });
  },
};
