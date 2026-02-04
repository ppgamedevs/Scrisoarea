import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const logoPath = join(publicDir, "logo-scrisoare.png");
const outPath = join(publicDir, "logo-scrisoare-nobg.png");

const THRESHOLD = 35; // pixels with R,G,B all below this become transparent

const { data, info } = await sharp(logoPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const channels = info.channels || 4;
for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r <= THRESHOLD && g <= THRESHOLD && b <= THRESHOLD) {
    data[i + 3] = 0; // alpha = 0
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: channels },
})
  .png()
  .toFile(outPath);

console.log("Saved:", outPath);
