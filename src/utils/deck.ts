import {StreamDeck, openStreamDeck, listStreamDecks} from "@elgato-stream-deck/node";
import { CanvasRenderingContext2D } from "canvas";
import crc32 from "fast-crc32";
import { EventEmitter } from "events";

export const ICON_SIZE = 72;
export const NUM_FIRST_PAGE_PIXELS = 2583;
export const NUM_SECOND_PAGE_PIXELS = 2601;
export const NUM_TOTAL_PIXELS = NUM_FIRST_PAGE_PIXELS + NUM_SECOND_PAGE_PIXELS;

export const WIDTH = 72 * 5;
export const HEIGHT = 72 * 3;


export default class Deck extends EventEmitter  {
  hw?: StreamDeck
  crc: number[]
  enableCRC: boolean
  loading = false;
  
  constructor() {
    super();
    this.crc = new Array(3 * 5);
    // this.enableCRC = true;
    process.on("uncaughtException", async(err) => {
      this.hw = undefined;
    })
  }
  initialise = async() => {
    if(!this.hw) {
      const results = await listStreamDecks();
      if(results.length === 0) {
        throw new Error("No StreamDeck connected");
      }
      const l = results[0];
      this.hw = await openStreamDeck(l.path, {
        resetToLogoOnClose: true,
      })
      if(this.hw.listenerCount("down") === 0) {
        this.hw.on("down", this.onKeyDown);
      }
      if(this.hw.listenerCount("up") === 0) {
        this.hw.on("up", this.onKeyUp);
      }
    }
  }
  onKeyDown = (keyIndex: number) => {
    this.emit("down", keyIndex);
  }
  onKeyUp = (keyIndex: number) => {
    this.emit("up", keyIndex);
  }
  reset = async() => {
    
    this.hw = undefined;
    await this.initialise();
  }
  // fillImageRGBA = (keyIndex: number, imageBuffer: Buffer) => {
  //   if(!this.hw) {
  //     throw new Error("StreamDeck not initialized");
  //   }
  //   this.hw.checkValidKeyIndex(keyIndex);
  //   if (imageBuffer.length !== 20736) {
  //     throw new RangeError(`Expected image buffer of length 20736, got length ${imageBuffer.length}`);
  //   }
  //   let pixels: any = [];
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
  //   this.hw.
  //   this.hw._writePage1(keyIndex, Buffer.from(firstPagePixels)); //eslint-disable-line
  //   this.hw._writePage2(keyIndex, Buffer.from(secondPagePixels)); //eslint-disable-line
  // }

  // https://stackoverflow.com/questions/68885669/canvas-rgba-to-rgb-conversion
  renderCanvasCtx(ctx: CanvasRenderingContext2D) {
    if(!this.hw) {
      throw new Error("StreamDeck not initialized");
    }
    let i = 0;
    for (var y = 0; y < 3; y++) {
      for (var x = 4; x >= 0; x--) {
        let xPos = x * 72;
        let yPos = y * 72;
        const imageData = ctx.getImageData(xPos, yPos, 72, 72);
        const length = imageData.data.length;
        const imageBuffer = new Uint8Array(length - length / 4);
        let j = 0;
        for (let i = 0; i < length; i = i + 4) {
          imageBuffer[j] = imageData.data[i]; // R
          imageBuffer[j + 1] = imageData.data[i + 1]; // G
          imageBuffer[j + 2] = imageData.data[i + 2]; // B
          j = j + 3;
        }
        // const imageBuffer = Buffer.from(imageData.data.buffer).filter((el,i) => {
        //   return i % 4 !== 4 - 1
        // });
        let skip = false;
        if (this.enableCRC) {
          const crc = crc32.calculate(imageBuffer);
          if (crc === this.crc[i]) {
            skip = true;
          }
          this.crc[i] = crc;
        }
        if (!skip) {
          this.hw?.fillKeyBuffer(i, Buffer.from(imageBuffer));
        }
        i++;
      }
    }
  }
}
