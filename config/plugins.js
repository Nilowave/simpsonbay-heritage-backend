module.exports = ({ env }) => ({
  email: {
    provider: "sendgrid",
    providerOptions: {
      apiKey: env("SENDGRID_API_KEY"),
    },
    settings: {
      defaultFrom: "info@danilomeulens.com",
      defaultReplyTo: "info@danilomeulens.com",
    },
  },
});
