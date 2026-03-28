/** @type {import('next').NextConfig} */

import fs from "fs";
import withLlamaIndex from "llamaindex/next";
import webpack from "./webpack.config.mjs";

const nextConfig = JSON.parse(fs.readFileSync("./next.config.json", "utf-8"));

// Add transpilePackages configuration
nextConfig.transpilePackages = ["highlight.js"];
nextConfig.images = { ...(nextConfig.images ?? {}), unoptimized: true };

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep assets local so the exported site can be served without external CDNs.
nextConfig.assetPrefix = undefined;

if (isDevelopment || process.env.ENVIRONMENT === "dev") {
  delete nextConfig.output;
}

nextConfig.webpack = webpack;

// use withLlamaIndex to add necessary modifications for llamaindex library
export default withLlamaIndex(nextConfig);
