import {EventEmitter} from "events";
import {WIDTH, HEIGHT} from "./utils/deck";
import {v4} from "uuid";
import waterfall from "./utils/waterfall";
import moment from "moment";
import {Canvas, CanvasRenderingContext2D, createCanvas} from "canvas";


export class Fade {
  from: any;
  to: any;
  
  constructor(from: any, to: any) {
    this.from = from;
    this.to = to;
  }
  render(ctx: any, layer: Layer, delta: number) {
    ctx.globalAlpha = layer.opacity;
    ctx.drawImage(layer.canvas, 0, 0);
  }
}


export class Layer {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  enabled: boolean;
  opacity: number;
  lastUpdate: moment.Moment;
  lastRender: moment.Moment;
  id: string;
  update?: (delta: number) => Promise<any>;
  render?: (delta: number) => Promise<any>;
  initialise?: () => Promise<any>;
  onKeyUp?: (keyIndex: any) => void;
  onKeyDown?: (keyIndex: any) => void;
  renderToScreen?: boolean;
  clear?: boolean;
  constructor(options: any = {}) {
    const {canvas = {width: WIDTH, height: HEIGHT}, ctx} = options;
    this.canvas = createCanvas(canvas.width, canvas.height);
    this.ctx = this.canvas.getContext("2d", ctx);
    this.enabled = true;
    this.opacity = 1;
    this.lastUpdate = moment();
    this.lastRender = moment();
    this.id = uuid();
  }
  async enable() {
    this.enabled = true;
  }
  async disable() {
    this.enabled = false;
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
    if (this.enabled && this.render) {
      const delta = moment().diff(this.lastRender, "milliseconds");
      this.lastRender = moment();
      return this.render(delta);
    }
    return undefined;
  }
}


export class LayerGroup extends Layer {
  layers: Layer[];
  filters: Fade[];
  constructor(layers = [], layerOptions = {}) {
    super(layerOptions);
    this.layers = layers;
    this.enabled = true;
    this.filters = [];
  }

  onKeyDown = (keyIndex: any) => {
    return this.layers.forEach((l) => {
      if (l.enabled && l.onKeyDown) {
        return l.onKeyDown(keyIndex);
      }
      return undefined;
    });
  }

  onKeyUp = (keyIndex: number) => {
    return this.layers.forEach((l) => {
      if (l.enabled && l.onKeyUp) {
        return l.onKeyUp(keyIndex);
      }
      return undefined;
    });
  }
  initialise = () => {
    return Promise.all(this.layers.map(async(layer) => {
      if (layer.initialise) {
        return layer.initialise();
      }
      return undefined;
    }));
  }
  update = async() => {
    return Promise.all(this.layers.map(async(layer) => {
      if (layer.enabled) {
        return layer.beginUpdate();
      }
      return undefined;
    }));
  }
  render = async(delta: number) {
    const layers = this.layers.filter((f) => f.enabled);
    if (layers.length > 0) {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
      this.renderToScreen = true;
      this.clear = false;
      await Promise.all(layers.map((l) => l.beginRender()));
      await waterfall(layers, async(layer, prev, index) => {
        const filters = this.filters.filter((lf) => (lf.to === index && lf.enabled));
        if (filters.length > 0) {
          filters[0].render(this.ctx, layer, delta);
        } else {
          this.ctx.globalAlpha = layer.opacity;
          this.ctx.drawImage(layer.canvas, 0, 0);
        }
      });
    } else {
      this.renderToScreen = false;
    }
  }

}

export class Engine extends LayerGroup {
  constructor(deck, layers = []) {
    super(layers, {
      canvas: {
        width: WIDTH,
        height: HEIGHT,
      },
      ctx: {pixelFormat: "RGB24"},
    });
    this.deck = deck;
    this.deck.on("down", (ki) => this.onKeyDown(ki));
    this.deck.on("up", (ki) => this.onKeyUp(ki));
    this.fps = 60;
  }


  async start() {
    await this.initialise();
    this.beginUpdateCycle();
    this.beginRenderCycle();
    this.renderCanvas();
  }
  async beginUpdateCycle() {
    await this.beginUpdate();
    return setTimeout(() => this.beginUpdateCycle(), 1000 / this.fps);
  }
  async beginRenderCycle() {
    await this.beginRender();
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
