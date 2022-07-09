import { exec } from "child_process";
import { rmSync, renameSync } from "fs";

exec("next-sitemap --config sitemap.config.js", (error, stdout, stderr) => {
  if (error) {
    console.log(error.message);
    return;
  }

  if (stderr) {
    console.log(stderr.toString());
    return;
  }

  console.log(stdout.toString());
});

renameSync("out/404/index.html", "out/404.html");
rmSync("out/404", { recursive: true, force: true });
