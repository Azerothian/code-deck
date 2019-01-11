import "source-map-support/register";

import {loadImage} from "canvas";
import path from "path";
// registerFont(path.resolve(process.cwd(), "./fa-light-300.ttf"), {
//   family: "FontAwesomeLight"
// });

import Deck from "./utils/deck";
// import Renderer from "./renderer";

import createScreenSaver from "./layers/screen-saver";
import MatrixBackground from "./layers/matrix";
import {Engine, LayerGroup, Layer} from "./engine";

const deck = new Deck();

class LockButtons extends Layer {
  async initialise() {
    this.buttons = [
      [{ image: await loadImage(path.resolve(process.cwd(), "./images/icons/lock-alt.svg"))}, "", "let", "yes", "cha"],
      ["", "", "you", "me", "hai"],
      ["", "", "lol", "no", "in"],
    ];
  }
  render() {
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 3; y++) {
        this.ctx.font = "300 18px Noto Sans";
        let xpos = (x * 72);
        let ypos = (y * 72);
        const button = this.buttons[y][x];
        if (button.image) {
          xpos += 9;
          ypos += 9;

          this.ctx.drawImage(button.image, xpos, ypos, 54, 54);
        } else {
          let text;
          xpos += 36;
          ypos += 36;
          if (typeof button === "string") {
            text = button;
          } else if(button.text) {
            if (button.font) {
              this.ctx.font = button.font;
            }
            text = button.text;
          }
          // const m = this.ctx.measureText(text);

          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillStyle = "white";
          this.ctx.fillText(text, xpos, ypos);
        }
      }
    }

  }
}

class LockScreen extends LayerGroup {
  constructor() {
    const matrix = new MatrixBackground();
    const lockButtons = new LockButtons();
    lockButtons.opacity = 0.8;
    matrix.opacity = 0.3;
    super([matrix, lockButtons]);
  }
}


const states = {
  SCREENSAVER: 0,
  LOCKSCREEN: 1,
};
class Screen extends LayerGroup {
  constructor() {
    const screenSaver = createScreenSaver();
    const lockScreen = new LockScreen();
    lockScreen.enabled = false;
    super([
      screenSaver,
      lockScreen,
    ]);
    this.screenSaver = screenSaver;
    this.lockScreen = lockScreen;
    this.state = states.SCREENSAVER;
  }
  fadeLayer(fromLayer, toLayer, targetOpacity, inc = 0.05) {
    if (!this.transitioning) {
      fromLayer.opacity = 1;
      toLayer.opacity = 0;
    }
    this.transitioning = true;
    toLayer.enabled = true;
    toLayer.opacity += inc;
    fromLayer.opacity -= inc;
    if (fromLayer.opacity < 0) {
      fromLayer.opacity = 0;
      fromLayer.enabled = false;
    }
    if (toLayer.opacity > targetOpacity) {
      toLayer.opacity = targetOpacity;
      this.transitioning = false;
    } else {
      setTimeout(() => this.fadeLayer(fromLayer, toLayer, targetOpacity, inc));
    }
  }
  onKeyDown(keyIndex) {
    if (this.transitioning) {
      return;
    }
    if (this.state === states.SCREENSAVER) {
      this.state = states.LOCKSCREEN;
      this.fadeLayer(this.screenSaver, this.lockScreen, 1);
    } else if (this.state === states.LOCKSCREEN) {
      this.state = states.SCREENSAVER;
      this.fadeLayer(this.lockScreen, this.screenSaver, 1);
    }
    super.onKeyDown(keyIndex);
  }
  enable() {
    this.enabled = true;
  }
}



const engine = new Engine(deck, [new Screen()]);
engine.start();


// import IconLayer from "./layers/icons";
// import ColourLayer from "./layers/colours";

// const iconLayer = new IconLayer([{
//   x: 0,
//   y: 0,
//   path: "./images/icons/vostro.png",
// }]);

// const colourLayer = new ColourLayer();
// colourLayer.opacity = 0.1;

// const screenSaverArr = [];

// const deck = new Deck();
// const rdn = new Renderer();
// rdn.push(colourLayer);
// for (let i = 1; i < 4; i++) {
//   const s = new ScreenSaverLayer();
//   s.opacitySpeed = i / 10;
//   s.opacity = i / 10;
//   s.opacityDir = i === 2;
//   screenSaverArr.push(s);
//   rdn.push(s);
// }
// iconLayer.opacity = 0.3;
// rdn.push(iconLayer);
// rdn.start(deck);

// let iconsActive = false, resetScreen;

// function toggleIcons(forceOff) {
//   if (resetScreen) {
//     clearTimeout(resetScreen);
//   }
//   if (!iconsActive && !forceOff) {
//     iconLayer.opacity = 0.9;
//     screenSaverArr.forEach((ss) => (ss.enabled = false));
//     iconsActive = true;
//     resetScreen = setTimeout(() => toggleIcons(true), 10000);
//     rdn.fps = 10;
//   } else {
//     rdn.fps = 60;
//     iconLayer.opacity = 0.3;
//     screenSaverArr.forEach((ss) => (ss.enabled = true));
//     iconsActive = false;
//   }
// }

// deck.on("down", keyIndex => {
//   console.log("key %d down", keyIndex);
//   switch (keyIndex) {
//     case 4:
//       return toggleIcons();
//     // case 9:
//     //   screenSaverArr.forEach((ss) => (ss.enabled = true));
//     //   break;
//   }
//   return undefined;
// });
