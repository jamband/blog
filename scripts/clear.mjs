import { rmSync } from "fs";

/** @type {import("fs").RmOptions} */
const options = {
  recursive: true,
  force: true,
};

rmSync(".next", options);
rmSync("out", options);
