import {WIDTH, HEIGHT} from "./utils/deck";
import {createCanvas} from "canvas";
import moment from "moment";

export default class Layer {
  constructor() {
    this.canvas = createCanvas(WIDTH, HEIGHT);
    this.ctx = this.canvas.getContext("2d");
    this.enabled = true;
    this.opacity = 1;
    this.lastUpdate = moment();
  }
  async beginUpdate() {
    if (this.update && this.enabled) {
      const delta = moment().diff(this.lastUpdate, "milliseconds");
      this.lastUpdate = moment();
      await this.update(delta);
    }
  }
  async beginRender() {
    // this.ctx.globalAlpha = this.opacity;
    return this.render();
  }
}
