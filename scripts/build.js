import fs from "fs";
import path from "path";

const srcDir = path.resolve("src");
const distDir = path.resolve("dist");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(distDir, { recursive: true, force: true });
copyDir(srcDir, distDir);
console.log("Build ok: src -> dist");
