import {Layer} from "../engine";
import {getColours, rgbToHex} from "../utils/gradient";

import { WIDTH, HEIGHT } from "../utils/deck";


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



export default class Colours extends Layer {
  reverse: boolean;
  i: number;
  colourCount: number;
  colourDisplay: number;
  colours: any[];

  constructor() {
    super();
    this.reverse = false;
    this.i = 0;
    this.colourCount = 500;
    this.colourDisplay = 3;
    this.colours = getColours(g, this.colourCount);
  }
  update = async(delta: number) => {
    const inc = Math.round(delta * 0.001);
    if (this.reverse) {
      this.i -= inc;
    } else {
      this.i += inc;
    }
    if (this.i > this.colourCount - this.colourDisplay) {
      this.reverse = true;
      this.i = (this.colourCount - this.colourDisplay) - 1;
    }
    if (this.i < this.colourDisplay && this.reverse) {
      this.reverse = false;
      this.colourDisplay = 0;
      this.i = 0;
    }
  }
  getColour = (i: number) => {
    if(i > this.colours.length - 1 || i < 0) {
      console.log("invalid colour", i);
      return this.colours[0];
    }
    return this.colours[i];
  }
  render = async() => {
    var grd = this.ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    let index = this.i;
    let intervals = 1 / this.colourDisplay;
    let itvlIdx = 0;
    if (this.reverse) {
      for (let i = index; i > (index - this.colourDisplay); i--) {
        grd.addColorStop(intervals * itvlIdx, rgbToHex(this.getColour(i)));
        itvlIdx++;
      }
    } else {

      for (let i = index; i < (index + this.colourDisplay); i++) {
        grd.addColorStop(intervals * itvlIdx, rgbToHex(this.getColour(i)));
        itvlIdx++;
      }
    }
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.i += this.colourDisplay;
  }
}
