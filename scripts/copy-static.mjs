import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const files = [
  "404.html",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll"
];

await mkdir("dist", { recursive: true });

await Promise.all(files.map(async (file) => {
  try {
    await stat(file);
    const target = join("dist", file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(file, target);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}));
