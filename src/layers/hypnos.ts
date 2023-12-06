

import { WIDTH, HEIGHT } from "../utils/deck";

// import { createCanvas, loadImage } from "canvas";
import { Layer } from "../engine";



export default class Hypnos extends Layer {
  initialise() {
    let width = HEIGHT * 0.9,
      height = HEIGHT * 0.9,
      quality = 180,
      radius = Math.min(width, height) * 0.5,
      layerSize = radius * 0.25,
      layerOverlap = Math.round(quality * 0.1);
    this.hypnos = {
      width,
      height,
      radius,
      quality,
      layers: [],
      layerSize,
      layerOverlap,
    };

    for (var i = 0; i < quality; i++) {
      this.hypnos.layers.push({
        x: width / 2 + Math.sin(i / quality * 2 * Math.PI) * (radius - layerSize),
        y: height / 2 + Math.cos(i / quality * 2 * Math.PI) * (radius - layerSize),
        r: (i / quality) * Math.PI,
      });
    }
  }
  update(delta) {
    for (var i = 0, len = this.hypnos.layers.length; i < len; i++) {
      this.hypnos.layers[i].r += (delta / 1000);
    }
  }
  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.restore();
    // Number of layers in total
    var layersLength = this.hypnos.layers.length;

    // Draw the overlap layers
    for (let i = layersLength - this.hypnos.layerOverlap, len = layersLength; i < len; i++) {

      this.ctx.save();
      // this.ctx.globalCompositeOperation = "destination-over";
      this.paintLayer(this.hypnos.layers[i]);
      this.ctx.restore();

    }

    // this.ctx.fillStyle = "#ffffff";
    // this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Cut out the overflow layers using the first layer as a mask
    this.ctx.save();
    // this.ctx.globalCompositeOperation = "destination-in";
    this.paintLayer(this.hypnos.layers[0], true);
    this.ctx.restore();

    // // Draw the normal layers underneath the overlap
    for (let i = 0, lens = layersLength; i < lens; i++) {

      this.ctx.save();
      // this.ctx.globalCompositeOperation = "destination-over";
      this.paintLayer(this.hypnos.layers[i]);
      this.ctx.restore();

    }

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

  }

  // Pains one layer
  paintLayer(layer, mask) {
    let xOffset = (WIDTH - this.hypnos.width) / 2;
    let yOffset = (HEIGHT - this.hypnos.height) / 2;
    let size = this.hypnos.layerSize + (mask ? 10 : 0);
    let size2 = size / 2;
    this.ctx.translate(xOffset + layer.x, yOffset + layer.y);
    this.ctx.rotate(layer.r);

    // No stroke if this is a mask
    if (!mask) {
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-size2, -size2, size, size);
    }

    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(-size2, -size2, size, size);

  }
}
