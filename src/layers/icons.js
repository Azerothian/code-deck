import Layer from "../layer";
import {ICON_SIZE, WIDTH, HEIGHT } from "../utils/deck";
import {loadImage} from "canvas";
import path from "path";


export default class IconSheet extends Layer {
  constructor(icons) {
    super();

    this.icons = icons;
  }
  async start() {
    this.iconData = await Promise.all(this.icons.map(async(i) => {
      return Object.assign({}, {
        image: await loadImage(path.resolve(process.cwd(), i.path)),
      }, i);
    }));
  }
  render() {
    this.iconData.forEach((i) => {
      this.ctx.drawImage(i.image, i.x * ICON_SIZE, i.y * ICON_SIZE, ICON_SIZE, ICON_SIZE);
    });
  }
}
