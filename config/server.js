module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  proxy: true,
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "9048c4c8f9fa11149dffc33c0e4de609"),
    },
  },
});
