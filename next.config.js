const env = process.env.NODE_ENV;
const assetPrefix = process.env.ASSET_PREFIX;

module.exports = {
  basePath: env === "production" && assetPrefix ? "/blog" : "",
  assetPrefix: assetPrefix ?? "",
  trailingSlash: true,
};
