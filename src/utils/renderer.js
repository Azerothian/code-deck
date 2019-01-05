import Deck, {ICON_SIZE, WIDTH, HEIGHT} from "./deck";
import {createCanvas} from "canvas";
import waterfall from "./waterfall";

const FPS = 60;

// const width = 72 * 5, height = 72 * 3;

export class Renderer extends Array {
  constructor() {
    super();
    this.deck = new Deck();
    this.canvas = createCanvas(WIDTH, HEIGHT);
    this.ctx = this.canvas.getContext("2d");
  }
  start() {
    this.beginUpdateCycle();
    this.beginRenderCycle();
    this.renderCanvas();
  }
  async beginUpdateCycle() {
    await Promise.all(this.map(async(layer) => {
      if (layer.update) {
        await layer.update();
      }
      return;
    }));
    return setTimeout(() => this.beginUpdateCycle(), 100);
  }

  async beginRenderCycle() {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    await waterfall(this.filter((f) => !f.enabled), async(layer) => {
      await layer.render();
      this.ctx.drawImage(layer.canvas, 0, 0);
    });
    return setTimeout(() => this.beginRenderCycle(), 100);
  }
  async renderCanvas() {
    this.deck.renderCanvasCtx(this.ctx);
    setTimeout(() => this.renderCanvas(), 1000 / FPS);
  }
}
export class Layer {
  constructor() {
    this.canvas = createCanvas(WIDTH, HEIGHT);
    this.ctx = this.canvas.getContext("2d");
    this.enabled = true;
  }
}
