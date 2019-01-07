import Deck from "./utils/deck";
import Renderer from "./renderer";

import ScreenSaverLayer from "./layers/screen-saver";
import LockScreen from "./layers/lock-screen";
import IconLayer from "./layers/icons";
import ColourLayer from "./layers/colours";

// const iconLayer = new IconLayer([{
//   x: 0,
//   y: 0,
//   path: "./images/icons/vostro.png",
// }]);
// iconLayer.opacity = 0;

// // const colourLayer = new ColourLayer();
// // colourLayer.opacity = 0.2;

// const screenSaverArr = [];


// // rdn.push(colourLayer);
// for (let i = 1; i < 4; i++) {
//   const s = new ScreenSaverLayer();
//   s.opacitySpeed = i / 10;
//   s.opacity = i / 10;
//   s.opacityDir = i === 2;
//   screenSaverArr.push(s);
//   rdn.push(s);
// }
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
//     iconLayer.opacity = 0;
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

const deck = new Deck();
const renderer = new Renderer();

const SCREENSAVER = 0, SCREENLOCK = 1, SCREENICONS = 2;
// function createScreenSaver() {
//   let screenSaverArr = [];
//   for (let i = 1; i < 4; i++) {
//     const s = new ScreenSaverLayer();
//     s.opacitySpeed = i / 10;
//     s.opacity = i / 10;
//     s.opacityDir = i === 2;
//     screenSaverArr.push(s);
//   }
//   return screenSaverArr;
// }


class ScreenSaver extends Array {
  constructor() {
    super();
    this.enabled = true;
    for (let i = 1; i < 4; i++) {
      const s = new ScreenSaverLayer();
      s.opacitySpeed = i / 10;
      s.opacity = i / 10;
      s.opacityDir = i === 2;
      this.push(s);
    }
  }
  disable() {
    this.enabled = false;
    //this.map((l) => (l.enabled = false));
  }
  enable() {
    this.enabled = true;
  }
}

// const screenSaver = createScreenSaver();

const screenSaver = new ScreenSaver();
const lockScreen = new LockScreen();
renderer.push(screenSaver);
lockScreen.disable();
lockScreen.opacity = 0.5;
renderer.push(lockScreen);
renderer.start(deck);

let currState = SCREENSAVER;

deck.on("down", key => {
  console.log("key", {key, currState});
  if (currState === SCREENSAVER) {
    return setState(SCREENLOCK);
  } else if (currState === SCREENLOCK) {
    refreshResetState();
    lockScreen.onKeyDown(key);
  }
  return undefined;
});


let resetTimeout;
function resetState() {
  clearTimeout(resetTimeout);
  setState(SCREENSAVER);
}
function refreshResetState() {
  clearTimeout(resetTimeout);
  resetTimeout = setTimeout(resetState, 30000);
}

function setState(newState) {
  switch (currState) {
    case SCREENSAVER:
      switch (newState) {
        case SCREENLOCK:
          screenSaver.disable();
          lockScreen.enable();
          refreshResetState();
          break;
      }
      break;
    case SCREENLOCK:
      switch (newState) {
        case SCREENSAVER:
          screenSaver.enable();
          lockScreen.disable();
          break;
      }
      break;
  }
  currState = newState;
}
