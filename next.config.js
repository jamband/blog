/** @type {import('next').NextConfig} */
module.exports = {
  basePath: process.env.GITHUB_ACTIONS ? "/blog" : "",
  reactStrictMode: true,
  trailingSlash: true,
};
