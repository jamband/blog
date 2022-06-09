/** @type {import("next").NextConfig} */
module.exports = {
  basePath: process.env.GITHUB_ACTIONS ? "/blog" : "",
  experimental: {
    newNextLinkBehavior: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  swcMinify: true,
};
