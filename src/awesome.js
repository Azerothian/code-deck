import {Renderer, Layer} from "./utils/renderer";

import ScreenSaverLayer from "./layers/screen-saver";

const rdn = new Renderer();
const layer = new ScreenSaverLayer();
rdn.push(layer);
rdn.start();
