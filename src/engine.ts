import {EventEmitter} from "events";
import Deck, {WIDTH, HEIGHT} from "./utils/deck";
import {v4} from "uuid";
import waterfall from "./utils/waterfall";
import moment from "moment";
import {Canvas, CanvasRenderingContext2D, NodeCanvasRenderingContext2DSettings, createCanvas} from "canvas";
import SysTray from "systray";
import path from "path";

import fs from "fs/promises";


async function base64File(path: string) {
  const data = await fs.readFile(path);
  return `${data.toString("base64")}`;
}

export class Fade {
  from: any;
  to: any;
  enabled = true;
  
  constructor(from: any, to: any) {
    this.from = from;
    this.to = to;
  }
  render(ctx: any, layer: Layer, delta: number) {
    ctx.globalAlpha = layer.opacity;
    ctx.drawImage(layer.canvas, 0, 0);
  }
}


export type LayerOptions = {
  canvas: {
    width: number;
    height: number;
  };
  ctx?: NodeCanvasRenderingContext2DSettings;
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
  constructor(options: LayerOptions = {
    canvas: {
      width: WIDTH,
      height: HEIGHT,
    },
    ctx: {pixelFormat: "RGB24"},
  }) {
    const {canvas = {width: WIDTH, height: HEIGHT}, ctx} = options;
    this.canvas = createCanvas(canvas.width, canvas.height);
    this.ctx = this.canvas.getContext("2d", {
      
    });
    this.enabled = true;
    this.opacity = 1;
    this.lastUpdate = moment();
    this.lastRender = moment();
    this.id = v4();
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
  constructor(layers: Layer[] = [], layerOptions?: LayerOptions) {
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
  render = async(delta: number) => {
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
  deck: Deck;
  fps: number;
  constructor(deck: Deck, layers: Layer[] = []) {
    super(layers, {
      canvas: {
        width: WIDTH,
        height: HEIGHT,
      },
      ctx: {pixelFormat: "RGB24"},
    });
    this.deck = deck;

    this.fps = 10;
  }
  createMenu = async() => {
    try {
      const icon = await base64File(path.resolve(process.cwd(), "./images/icons/idea.png"));
      const systray = new (SysTray as any).default({
        menu: {
          // you should using .png icon in macOS/Linux, but .ico format in windows
          icon,
          title: "CodeDeck",
          tooltip: "Tips",
          items: [{
              title: "Reset",
              tooltip: "Reset the deck",
              checked: false,
              enabled: true
          }, {
              title: "Exit",
              tooltip: "exut",
              checked: false,
              enabled: true
          }]
        },
        debug: false,
        copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
      });
      systray.onClick(action => {
        if (action.seq_id === 0) {
          this.deck.reset();
        }
        if (action.seq_id === 1) {
          process.exit(0);
        }
      });
    } catch(err: any) {
      console.log("errr", err);
    }

  }

  async start() {
    await this.createMenu();
    this.monitorDeck();
    // await this.deck.initialise();
    if(this.deck.listenerCount("down") === 0) {
      this.deck.on("down", (ki) => this.onKeyDown(ki));
    }
    if(this.deck.listenerCount("up") === 0) {
      this.deck.on("up", (ki) => this.onKeyUp(ki));
    }
    await this.initialise();
    this.beginUpdateCycle();
    this.beginRenderCycle();
    this.renderCanvas();
  }
  monitorDeck = async() => {
    if (!this.deck.hw) {
      try {
        await this.deck.initialise();
      } catch(err: any) {
        // console.error(err);
      }
    }
    setTimeout(() => this.monitorDeck(), 1000);
  }
  beginUpdateCycle = async() => {
    await this.beginUpdate();
    setTimeout(() => this.beginUpdateCycle(), 1000 / this.fps);
  }
  beginRenderCycle = async() => {
    await this.beginRender();
    setTimeout(() => this.beginRenderCycle(), 1000 / this.fps);
  }
  renderCanvas = async() => {
    try {
      if (this.deck.hw) {
        if (!this.renderToScreen && !this.clear) {
          this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
          this.deck.renderCanvasCtx(this.ctx);
          this.clear = true;
        }
        if (this.renderToScreen) {
          this.deck.renderCanvasCtx(this.ctx);
        }
      }
    } catch(err: any) {
      console.error(err);
      await this.deck.reset();
    }
    setTimeout(() => this.renderCanvas(), 1000 / this.fps);
  }


}
