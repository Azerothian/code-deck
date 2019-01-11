import "source-map-support/register";
import Deck from "./utils/deck";
// import Renderer from "./renderer";

import createScreenSaver from "./layers/screen-saver";
import MatrixBackground from "./layers/matrix";
import {Engine, LayerGroup} from "./engine";

const deck = new Deck();

class LockScreen extends LayerGroup {
  constructor() {
    super([new MatrixBackground()]);
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
  onKeyDown(keyIndex) {
    if(this.transitioning) {
      return;
    }
    if (this.state === states.SCREENSAVER) {
      this.state = states.LOCKSCREEN;
      this.screenSaver.enabled = false;
      this.lockScreen.enabled = true;
    } else if (this.state === states.LOCKSCREEN) {
      this.state = states.SCREENSAVER;
      this.screenSaver.enabled = true;
      this.lockScreen.enabled = false;
    }
    super.onKeyDown(keyIndex);
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
