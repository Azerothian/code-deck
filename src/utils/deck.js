import StreamDeck from "elgato-stream-deck";
import crc32 from "fast-crc32";

export const ICON_SIZE = 72;
export const NUM_FIRST_PAGE_PIXELS = 2583;
export const NUM_SECOND_PAGE_PIXELS = 2601;
export const NUM_TOTAL_PIXELS = NUM_FIRST_PAGE_PIXELS + NUM_SECOND_PAGE_PIXELS;

export const WIDTH = 72 * 5;
export const HEIGHT = 72 * 3;


export default class Deck extends StreamDeck {
  constructor() {
    super();
    this.crc = new Array(3 * 5);
    this.enableCRC = false;
  }
  fillImageRGBA(keyIndex, imageBuffer) {
    StreamDeck.checkValidKeyIndex(keyIndex);
    if (imageBuffer.length !== 20736) {
      throw new RangeError(`Expected image buffer of length 20736, got length ${imageBuffer.length}`);
    }
    let pixels = [];
    for (let r = 0; r < ICON_SIZE; r++) {
      const row = [];
      const start = r * 4 * ICON_SIZE;
      for (let i = start; i < start + (ICON_SIZE * 4); i += 4) {
        const r = imageBuffer.readUInt8(i);
        const g = imageBuffer.readUInt8(i + 1);
        const b = imageBuffer.readUInt8(i + 2);
        row.push(r, g, b);
      }
      pixels = pixels.concat(row.reverse());
    }
    const firstPagePixels = pixels.slice(0, NUM_FIRST_PAGE_PIXELS * 3);
    const secondPagePixels = pixels.slice(NUM_FIRST_PAGE_PIXELS * 3, NUM_TOTAL_PIXELS * 3);
    this._writePage1(keyIndex, Buffer.from(firstPagePixels)); //eslint-disable-line
    this._writePage2(keyIndex, Buffer.from(secondPagePixels)); //eslint-disable-line
  }
  renderCanvasCtx(ctx) {
    let i = 0;
    for (var y = 0; y < 3; y++) {
      for (var x = 4; x >= 0; x--) {
        let xPos = x * 72;
        let yPos = y * 72;
        const imageData = ctx.getImageData(xPos, yPos, 72, 72);
        const imageBuffer = Buffer.from(imageData.data.buffer);
        let skip = false;
        if (this.enableCRC) {
          const crc = crc32.calculate(imageBuffer);
          if (crc === this.crc[i]) {
            skip = true;
          }
          this.crc[i] = crc;
        }
        if (!skip) {
          this.fillImageRGBA(i, Buffer.from(imageBuffer));
        }
        i++;
      }
    }
  }
}
