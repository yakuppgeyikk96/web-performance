// Generates public/img/hero.png: a large, unoptimised hero image, dependency-free.
// PNG = signature + IHDR + IDAT (zlib of filtered scanlines) + IEND.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 2400;
const HEIGHT = 1200;

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (CRC_TABLE[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, crc]);
}

let seed = 7;
function noise(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed >>> 16) & 0xff;
}

const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
for (let y = 0; y < HEIGHT; y += 1) {
  const row = y * (WIDTH * 3 + 1);
  raw[row] = 0; // filter: none
  for (let x = 0; x < WIDTH; x += 1) {
    const i = row + 1 + x * 3;
    const n = noise() >> 6; // ±4 levels of grain
    raw[i] = Math.min(255, 180 + Math.floor((x / WIDTH) * 60) + n);
    raw[i + 1] = Math.min(255, 90 + Math.floor((y / HEIGHT) * 80) + n);
    raw[i + 2] = Math.min(255, 40 + Math.floor(((x + y) / (WIDTH + HEIGHT)) * 60) + n);
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 6 })),
  chunk("IEND", new Uint8Array(0)),
]);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(dirname, "..", "public", "img", "hero.png");
mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, png);
console.log(`${target}: ${(png.length / 1024 / 1024).toFixed(2)} MB`);
