import Deck from "./utils/deck";
import Renderer from "./renderer";

import ScreenSaverLayer from "./layers/screen-saver";
import IconLayer from "./layers/icons";
import ColourLayer from "./layers/colours";

const iconLayer = new IconLayer([{
  x: 0,
  y: 0,
  path: "./images/icons/vostro.png",
}]);

const colourLayer = new ColourLayer();
colourLayer.opacity = 0.1;

const screenSaverArr = [];

const deck = new Deck();
const rdn = new Renderer();
rdn.push(colourLayer);
for (let i = 1; i < 4; i++) {
  const s = new ScreenSaverLayer();
  s.opacitySpeed = i / 10;
  s.opacity = i / 10;
  s.opacityDir = i === 2;
  screenSaverArr.push(s);
  rdn.push(s);
}
iconLayer.opacity = 0.3;
rdn.push(iconLayer);
rdn.start(deck);

let iconsActive = false, resetScreen;

function toggleIcons(forceOff) {
  if (resetScreen) {
    clearTimeout(resetScreen);
  }
  if (!iconsActive && !forceOff) {
    iconLayer.opacity = 0.9;
    screenSaverArr.forEach((ss) => (ss.enabled = false));
    iconsActive = true;
    resetScreen = setTimeout(() => toggleIcons(true), 10000);
    rdn.fps = 10;
  } else {
    rdn.fps = 60;
    iconLayer.opacity = 0.3;
    screenSaverArr.forEach((ss) => (ss.enabled = true));
    iconsActive = false;
  }
}

deck.on("down", keyIndex => {
  console.log("key %d down", keyIndex);
  switch (keyIndex) {
    case 4:
      return toggleIcons();
    // case 9:
    //   screenSaverArr.forEach((ss) => (ss.enabled = true));
    //   break;
  }
  return undefined;
});
