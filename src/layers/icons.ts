import {Layer} from "../engine";
import {ICON_SIZE, WIDTH, HEIGHT } from "../utils/deck";
import {loadImage} from "canvas";
import path from "path";


export default class IconSheet extends Layer {
  icons: any[];
  iconData: any[];

  constructor(icons: any) {
    super();

    this.icons = icons;
    this.iconData = [];
  }
  initialise = async() => {
    this.iconData = await Promise.all(this.icons.map(async(i) => {
      return Object.assign({}, {
        image: await loadImage(path.resolve(process.cwd(), i.path)),
      }, i);
    }));
  }
  render = async() => {
    this.iconData.forEach((i) => {
      this.ctx.drawImage(i.image, i.x * ICON_SIZE, i.y * ICON_SIZE, ICON_SIZE, ICON_SIZE);
    });
  }
}
