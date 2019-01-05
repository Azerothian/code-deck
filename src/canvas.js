// const StreamDeck = require("elgato-stream-deck");
import Deck from "./utils/deck";
const {
  createCanvas
} = require("canvas");

// const ICON_SIZE = 72;

// const NUM_FIRST_PAGE_PIXELS = 2583;
// const NUM_SECOND_PAGE_PIXELS = 2601;
// const NUM_TOTAL_PIXELS = NUM_FIRST_PAGE_PIXELS + NUM_SECOND_PAGE_PIXELS;

const g = [
  {
    position: 0,
    colour: {
      r: 49,
      g: 192,
      b: 246,
    },
  },
  {
    position: 50,
    colour: {
      r: 165,
      g: 0,
      b: 165,
    },
  },
  {
    position: 100,
    colour: {
      r: 255,
      g: 126,
      b: 39,
    },
  },
];
import {getColours, rgbToHex} from "./utils/gradient";

const streamDeck = new Deck();

let w = 72 * 5, h = 72 * 3;
const canvas = createCanvas(w, h);
let ctx = canvas.getContext("2d", {pixelFormat: "RGB24"}),
  particles = [],
  particlesNum = 20,
  colors =  getColours(g, 11).map((c) => rgbToHex(c));


function Factory() {
  this.x = Math.round(Math.random() * w);
  this.y = Math.round(Math.random() * h);
  this.rad = Math.round(Math.random() * 1) + 1;
  this.rgba = colors[Math.round(Math.random() * 10)];
  this.vx = Math.round(Math.random() * 3) - 1.5;
  this.vy = Math.round(Math.random() * 3) - 1.5;
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  for (var i = 0; i < particlesNum; i++) {
    var temp = particles[i];
    var factor = 1;

    for (var j = 0; j < particlesNum; j++) {

      var temp2 = particles[j];
      ctx.linewidth = 0.5;

      if (temp.rgba === temp2.rgba && findDistance(temp, temp2) < 50) {
        ctx.strokeStyle = temp.rgba;
        ctx.beginPath();
        ctx.moveTo(temp.x, temp.y);
        ctx.lineTo(temp2.x, temp2.y);
        ctx.stroke();
        factor++;
      }
    }


    ctx.fillStyle = temp.rgba;
    ctx.strokeStyle = temp.rgba;

    ctx.beginPath();
    ctx.arc(temp.x, temp.y, temp.rad * factor, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(temp.x, temp.y, (temp.rad + 5) * factor, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();


    temp.x += temp.vx;
    temp.y += temp.vy;

    if (temp.x > w) {temp.x = 0;}
    if (temp.x < 0) {temp.x = w;}
    if (temp.y > h) {temp.y = 0;}
    if (temp.y < 0) {temp.y = h;}
  }
}

function findDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function requestAnimFrame(callback) {
  setTimeout(callback, 1000 / 60);
}

(function init() {
  for (var i = 0; i < particlesNum; i++) {
    particles.push(new Factory());
  }
})();

(function loop() {
  draw();
  return requestAnimFrame(loop);
})();



// function render() {
//   // const iconCanvas = createCanvas(72, 72);
//   // let iconCtx = canvas.getContext("2d", {pixelFormat: "A8"});
//   let i = 0;
//   for(var y = 0; y < 3; y++) {
//     for(var x = 4; x >= 0; x--) {
//       let xPos = x * 72;
//       let yPos = y * 72;
//       const imageData = ctx.getImageData(xPos, yPos, 72, 72)
//       const imageBuffer = imageData.data.buffer;
//       streamDeck.fillImageRGBA(i, Buffer.from(imageBuffer))
//       i++;
//     }
//   }
// }
(function loop2() {
  // const buf = canvas.toBuffer();
  // streamDeck.fillPanel(buf);
  streamDeck.renderCanvasCtx(ctx);
  // render();
  return setTimeout(loop2, 1);
})();


// function fillImageRGBA(keyIndex, imageBuffer) {
//   StreamDeck.checkValidKeyIndex(keyIndex);

//   if (imageBuffer.length !== 20736) {
//     throw new RangeError(`Expected image buffer of length 20736, got length ${imageBuffer.length}`);
//   }

//   let pixels = [];
//   for (let r = 0; r < ICON_SIZE; r++) {
//     const row = [];
//     const start = r * 4 * ICON_SIZE;
//     for (let i = start; i < start + (ICON_SIZE * 4); i += 4) {
//       const r = imageBuffer.readUInt8(i);
//       const g = imageBuffer.readUInt8(i + 1);
//       const b = imageBuffer.readUInt8(i + 2);
//       row.push(r, g, b);
//     }
//     pixels = pixels.concat(row.reverse());
//   }

//   const firstPagePixels = pixels.slice(0, NUM_FIRST_PAGE_PIXELS * 3);
//   const secondPagePixels = pixels.slice(NUM_FIRST_PAGE_PIXELS * 3, NUM_TOTAL_PIXELS * 3);
//   streamDeck._writePage1(keyIndex, Buffer.from(firstPagePixels)); //eslint-disable-line
//   streamDeck._writePage2(keyIndex, Buffer.from(secondPagePixels)); //eslint-disable-line
// }