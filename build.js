// js13k build: minify -> inline -> zip. The zip container is written by hand
// so the reported number is the real submission size.
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const { minify } = require('terser');

const SRC = path.join(__dirname, 'src', 'index.html');
const OUT = path.join(__dirname, 'dist');
const LIMIT = 13312;

function zip(name, data) {
  const body = zlib.deflateRawSync(data, { level: 9, memLevel: 9, windowBits: 15 });
  const tbl = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tbl[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of data) crc = tbl[(crc ^ b) & 0xff] ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;

  const nm = Buffer.from(name);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6); local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0, 10); local.writeUInt16LE(0x21, 12);
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(body.length, 18);
  local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nm.length, 26);
  local.writeUInt16LE(0, 28);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6); central.writeUInt16LE(0, 8);
  central.writeUInt16LE(8, 10); central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0x21, 14); central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(body.length, 20); central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nm.length, 28); central.writeUInt32LE(0, 38);

  const off = local.length + nm.length + body.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + nm.length, 12); end.writeUInt32LE(off, 16);

  return Buffer.concat([local, nm, body, central, nm, end]);
}

(async () => {
  const src = fs.readFileSync(SRC, 'utf8');
  const js = src.slice(src.indexOf('<script>') + 8, src.lastIndexOf('</script>'));
  const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>'));
  const body = src.slice(src.indexOf('<body>') + 6, src.indexOf('<script>'));

  const res = await minify(js, {
    ecma: 2020,
    compress: {
      passes: 4, unsafe: true, unsafe_arrows: true, unsafe_math: true,
      booleans_as_integers: true, pure_getters: true, toplevel: true,
      sequences: true, drop_console: true,
    },
    mangle: { toplevel: true },
    format: { comments: false },
  });
  if (res.error) throw res.error;

  const minCss = css.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>])\s*/g, '$1').replace(/\s+/g, ' ')
    .replace(/;}/g, '}').trim();
  const minBody = body.replace(/\n\s*/g, '').replace(/>\s+</g, '><').trim();

  // browsers infer html/head/body, so those tags are dead weight
  const html = '<!doctype html><meta charset=utf-8>'
    + '<meta name=viewport content="width=device-width,initial-scale=1,'
    + 'user-scalable=no,viewport-fit=cover">'
    + '<title>Piano Jumper</title>'
    + '<style>' + minCss + '</style>'
    + minBody
    + '<script>' + res.code + '</script>';

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  const z = zip('index.html', Buffer.from(html));
  fs.writeFileSync(path.join(OUT, 'game.zip'), z);

  console.log(`source   ${src.length} B`);
  console.log(`minified ${html.length} B  (js ${res.code.length} B)`);
  console.log(`zipped   ${z.length} B / ${LIMIT}  = ${(z.length / LIMIT * 100).toFixed(1)}%`
    + `   headroom ${LIMIT - z.length} B`);
  if (z.length > LIMIT) { console.error('OVER LIMIT'); process.exit(1); }
})();
