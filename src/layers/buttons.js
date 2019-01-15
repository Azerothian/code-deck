import {Layer} from "../engine";
import { WIDTH, HEIGHT } from "../utils/deck";

export default class ButtonRenderer extends Layer {
  constructor() {
    super();
    this.buttons = [];
    for (let y = 0; y < 3; y++) {
      this.buttons.push([]);
      for (let x = 0; x < 5; x++) {
        this.buttons[y].push(undefined);
      }
    }
  }
  render() {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 3; y++) {
        this.ctx.font = "400 12px Noto Sans";
        let xpos = (x * 72);
        let ypos = (y * 72);
        const button = this.buttons[y][x];
        if (button) {
          if (button.image) {
            this.ctx.save();
            this.ctx.drawImage(button.image, xpos + 9, ypos + 9, 54, 54);
            this.ctx.restore();
          }
          if (button.text || typeof button === "string") {
            let text;
            if (typeof button === "string") {
              text = button;
            } else if (button.text) {
              if (button.font) {
                this.ctx.font = button.font;
              }
              text = button.text;
            }
            // const m = this.ctx.measureText(text);

            this.ctx.save();
            this.ctx.textAlign = button.textAlign || "center";
            this.ctx.textBaseline = button.textBaseline || "middle";
            this.ctx.fillStyle = button.fillStyle || "white";
            this.ctx.fillText(text, xpos + 36, ypos + 36);
            this.ctx.restore();
          }
        }
      }
    }
  }
}
