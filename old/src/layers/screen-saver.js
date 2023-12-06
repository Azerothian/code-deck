import {Layer, LayerGroup} from "../engine";
import { getColours, rgbToHex } from "../utils/gradient";
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

function Factory(colours) {
  this.x = Math.round(Math.random() * WIDTH);
  this.y = Math.round(Math.random() * HEIGHT);
  this.rad = Math.round(Math.random() * 1) + 1;
  this.rgba = colours[Math.round(Math.random() * 10)];
  this.vx = Math.round(Math.random() * 3) - 1.5;
  this.vy = Math.round(Math.random() * 3) - 1.5;
}

class ScreenSaverLayer extends Layer {
  constructor() {
    super();
    this.particles = [];
    this.particlesNum = 20;
    this.colors = getColours(g, 11).map((c) => rgbToHex(c));
    for (var i = 0; i < this.particlesNum; i++) {
      this.particles.push(new Factory(this.colors));
    }
    this.opacitySpeed = 0.1;
    this.opacityDir = true; //true = increment
  }
  update(delta) {
    const diff = 1 / (delta * this.opacitySpeed);
    let o = this.opacity;
    if (this.opacityDir) {
      o += diff;
    } else {
      o -= diff;
    }
    if (o > 1) {
      this.opacityDir = false;
      o = 1;
    } else if (o < 0) {
      this.opacityDir = true;
      o = 0;
    }
    this.opacity = o;
  }

  render() {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < this.particlesNum; i++) {
      var temp = this.particles[i];
      var factor = 1;

      for (var j = 0; j < this.particlesNum; j++) {

        var temp2 = this.particles[j];
        this.ctx.linewidth = 0.5;

        if (temp.rgba === temp2.rgba && findDistance(temp, temp2) < 50) {
          this.ctx.strokeStyle = temp.rgba;
          this.ctx.beginPath();
          this.ctx.moveTo(temp.x, temp.y);
          this.ctx.lineTo(temp2.x, temp2.y);
          this.ctx.stroke();
          factor++;
        }
      }


      this.ctx.fillStyle = temp.rgba;
      this.ctx.strokeStyle = temp.rgba;

      this.ctx.beginPath();
      this.ctx.arc(temp.x, temp.y, temp.rad * factor, 0, Math.PI * 2, true);
      this.ctx.fill();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.arc(temp.x, temp.y, (temp.rad + 5) * factor, 0, Math.PI * 2, true);
      this.ctx.stroke();
      this.ctx.closePath();


      temp.x += temp.vx;
      temp.y += temp.vy;

      if (temp.x > WIDTH) { temp.x = 0; }
      if (temp.x < 0) { temp.x = WIDTH; }
      if (temp.y > HEIGHT) { temp.y = 0; }
      if (temp.y < 0) { temp.y = HEIGHT; }
    }
  }
}

function findDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}


export default () => {
  const screenSaverArr = [];
  for (let i = 1; i < 4; i++) {
    const s = new ScreenSaverLayer();
    s.opacitySpeed = i / 10;
    s.opacity = i / 10;
    s.opacityDir = i === 2;
    screenSaverArr.push(s);
  }
  return new LayerGroup(screenSaverArr);
};
