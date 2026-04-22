const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const potong_atass = 50;

async function getbufer(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function drawcircleimg(ctx, img, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

async function loadAssets() {
  const fontPath = path.join(__dirname, 'WhatsAppFont.ttf');
  if (!fs.existsSync(fontPath)) {
    const res = await fetch('https://uploader.zenzxz.dpdns.org/uploads/1775659852069.ttf');
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(fontPath, Buffer.from(arrayBuffer));
  }
  GlobalFonts.registerFromPath(fontPath, 'WhatsApp');
}

module.exports = async (req, res) => {
  try {
    const { pp, nama, tentang, telepon } = req.query;

    if (!pp || !nama || !tentang || !telepon) {
      return res.status(400).json({ error: 'Parameter tidak lengkap' });
    }

    await loadAssets();

    const bgBuffer = await getbufer('https://uploader.zenzxz.dpdns.org/uploads/1775722039920.png');
    const ppBuffer = await getbufer(pp);

    const bg = await loadImage(bgBuffer);
    const ppImg = await loadImage(ppBuffer);

    const canvasHeight = bg.height - potong_atass;
    const canvas = createCanvas(bg.width, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bg, 0, potong_atass, bg.width, canvasHeight, 0, 0, bg.width, canvasHeight);

    drawcircleimg(ctx, ppImg, 360, 200 - potong_atass, 360);

    ctx.fillStyle = '#889093';
    ctx.font = '30px WhatsApp';

    ctx.fillText(nama, 157, 870 - potong_atass);
    ctx.fillText(tentang, 169, 1030 - potong_atass);
    ctx.fillText(telepon, 172, 1190 - potong_atass);

    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
