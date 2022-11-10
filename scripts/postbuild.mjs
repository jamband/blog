import { exec } from "node:child_process";
import { rename, rm } from "node:fs/promises";

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

await rename("out/404/index.html", "out/404.html");
await rm("out/404", { recursive: true, force: true });
