import {WIDTH, HEIGHT} from "./utils/deck";
import {createCanvas} from "canvas";
import waterfall from "./utils/waterfall";

const FPS = 60;

// const width = 72 * 5, height = 72 * 3;

export default class Renderer extends Array {

  async start(deck) {
    this.disabled = false;
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
      if (Array.isArray(layer)) {
        return waterfall(layer, (l) => (this.updateLayer(l)));
      }
      return this.updateLayer(layer);
    }));
    return setTimeout(() => this.beginUpdateCycle(), 100);
  }
  updateLayer(layer) {
    return layer.beginUpdate();
  }

  async beginRenderCycle() {
    const layers = this.filter((f) => f.enabled);
    if (layers.length > 0) {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      this.renderToScreen = true;
      this.clear = false;
      await Promise.all(layers.map((layer) => {
        if (Array.isArray(layer)) {
          return Promise.all(layer.map((l) => l.beginRender()));
        }
        return layer.beginRender();
      }));
      await waterfall(layers, async(layer) => {
        if (Array.isArray(layer)) {
          return waterfall(layer, (l) => this.renderLayer(l));
        }
        return this.renderLayer(layer);
      });
    } else {
      this.renderToScreen = false;
    }
    return setTimeout(() => this.beginRenderCycle(), 1000 / this.fps);
  }
  renderLayer(layer) {
    this.ctx.globalAlpha = layer.opacity;
    this.ctx.drawImage(layer.canvas, 0, 0);
  }
  async renderCanvas() {
    if (!this.disabled) {
      if (!this.renderToScreen && !this.clear) {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.deck.renderCanvasCtx(this.ctx);
        this.clear = true;
      }
      if (this.renderToScreen) {
        this.deck.renderCanvasCtx(this.ctx);
      }
    }
    return setTimeout(() => this.renderCanvas(), 1000 / this.fps);
  }
}
