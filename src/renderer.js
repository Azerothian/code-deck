import {WIDTH, HEIGHT} from "./utils/deck";
import {createCanvas} from "canvas";
import waterfall from "./utils/waterfall";
import { timingSafeEqual } from "crypto";

const FPS = 60;

// const width = 72 * 5, height = 72 * 3;

export default class Renderer extends Array {

  async start(deck) {
    this.fps = 60;
    this.deck = deck;
    this.canvas = createCanvas(WIDTH, HEIGHT);
    this.ctx = this.canvas.getContext("2d", {pixelFormat: "RGB24"});
    await Promise.all(this.map((l) => (l.start) ? l.start() : Promise.resolve()));
    this.beginUpdateCycle();
    this.beginRenderCycle();
    this.renderCanvas();
  }
  async beginUpdateCycle() {
    await Promise.all(this.map(async(layer) => {
      return layer.beginUpdate();
    }));
    return setTimeout(() => this.beginUpdateCycle(), 100);
  }

  async beginRenderCycle() {
    const layers = this.filter((f) => f.enabled && f.opacity > 0);
    if (layers.length > 0) {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      this.renderToScreen = true;
      this.clear = false;
      await Promise.all(layers.map((l) => l.beginRender()));
      await waterfall(layers, async(layer) => {
        this.ctx.globalAlpha = layer.opacity;
        this.ctx.drawImage(layer.canvas, 0, 0);
      });
    } else {
      this.renderToScreen = false;
    }
    return setTimeout(() => this.beginRenderCycle(), 1000 / this.fps);
  }
  async renderCanvas() {
    if (!this.renderToScreen && !this.clear) {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      this.deck.renderCanvasCtx(this.ctx);
      this.clear = true;
    }
    if (this.renderToScreen) {
      this.deck.renderCanvasCtx(this.ctx);
    }
    return setTimeout(() => this.renderCanvas(), 1000 / this.fps);
  }
}
