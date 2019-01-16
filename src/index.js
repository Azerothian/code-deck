import "source-map-support/register";
import "dotenv/config";
import {loadImage} from "canvas";
import path from "path";
// registerFont(path.resolve(process.cwd(), "./fa-light-300.ttf"), {
//   family: "FontAwesomeLight"
// });

import Deck from "./utils/deck";

import {WIDTH, HEIGHT} from "./utils/deck";
import createScreenSaver from "./layers/screen-saver";
import MatrixBackground from "./layers/matrix";
// import Kewl from "./layers/kewl";
import {Engine, LayerGroup, Layer} from "./engine";
import {EventEmitter} from "events";
import Hypnos from "./layers/hypnos";
import ButtonRenderer from "./layers/buttons";

import {spawn} from "child_process";

const keyPhrase = ["let", "me", "in"];


const events = new EventEmitter();
const deck = new Deck();
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


class LockButtons extends ButtonRenderer {
  async initialise() {
    events.on("clear-lock", () => this.clearLock());
    this.lockIcon = await loadImage(path.resolve(process.cwd(), "./images/icons/lock-alt.svg"));
    this.closeIcon = await loadImage(path.resolve(process.cwd(), "./images/icons/caret-circle-left.svg"));
    this.codeBG = await loadImage(path.resolve(process.cwd(), "./images/icons/expand.svg"));
    this.input = ["", "", ""];
    this.codes = ["let", "yes", "cha", "you", "me", "hai", "lol", "no", "in"];

    // shuffleArray(this.codes);
    this.inputPos = 0;
    return this.createButtonSet();
  }

  onKeyDown(keyIndex) {
    let code, valid = true;
    switch (keyIndex) {
      case 2:
        code = this.buttons[0][2];
        break;
      case 1:
        code = this.buttons[0][3];
        break;
      case 0:
        code = this.buttons[0][4];
        break;
      case 7:
        code = this.buttons[1][2];
        break;
      case 6:
        code = this.buttons[1][3];
        break;
      case 5:
        code = this.buttons[1][4];
        break;
      case 12:
        code = this.buttons[2][2];
        break;
      case 11:
        code = this.buttons[2][3];
        break;
      case 10:
        code = this.buttons[2][4];
        break;
      case 14:
        this.clearLock();
        return events.emit("lock-screen");
      case 4:
        this.input.forEach((v, i) => {
          if (keyPhrase[i] !== v) {
            valid = false;
          }
        });
        if (valid) {
          this.clearLock();
          events.emit("login-success");
        }
    }
    if (code) {
      this.input[this.inputPos] = code;
      this.inputPos++;
      if (this.inputPos > 3) {
        this.inputPos = 0;
        this.input = ["", "", ""];
      }
      return this.createButtonSet();
    }
    return undefined;
  }
  clearLock() {
    this.inputPos = 0;
    this.input = ["", "", ""];
    return this.createButtonSet();
  }
  createButtonSet() {
    const codes = this.codes;
    let input = this.input.map((i) => {
      if (i !== "") {
        return {
          image: this.codeBG,
          text: i,
        };
      }
      return i;
    });

    this.buttons = [
      [{ image: this.lockIcon }, input[0], codes[0], codes[1], codes[2]],
      ["", input[1], codes[3], codes[4], codes[5]],
      [{ image: this.closeIcon }, input[2], codes[6], codes[7], codes[8]],
    ];
  }
}

class LockScreen extends LayerGroup {
  constructor() {
    const matrix = new MatrixBackground();
    const lockButtons = new LockButtons();
    lockButtons.opacity = 1;
    matrix.opacity = 0.8;
    super([matrix, lockButtons]);
  }
}

/*
if [ "$(pidof spotify)" ]; then
    # status can be: Playing, Paused or Stopped
    status=`dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'PlaybackStatus'|egrep -A 1 "string"|cut -b 26-|cut -d '"' -f 1|egrep -v ^$`
    artist=`dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata'|egrep -A 2 "artist"|egrep -v "artist"|egrep -v "array"|cut -b 27-|cut -d '"' -f 1|egrep -v ^$`
    album=`dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata'|egrep -A 1 "album"|egrep -v "album"|cut -b 44-|cut -d '"' -f 1|egrep -v ^$`
    title=`dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata'|egrep -A 1 "title"|egrep -v "title"|cut -b 44-|cut -d '"' -f 1|egrep -v ^$`
fi
*/


class HomeButtons extends ButtonRenderer {
  async initialise() {
    const imageAddressCard = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/address-card.svg"));
    const imageCode = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/code.svg"));
    const imageFrown = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/frown.svg"));
    const imageGamepad = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/gamepad.svg"));
    const imageHDD = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/hdd.svg"));
    const imageHeadphones = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/headphones.svg"));
    const imageKey = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/key.svg"));
    const imageListAlt = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/list-alt.svg"));
    const imageWindowClose = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/window-close.svg"));
    const imageVostro = await loadImage(path.resolve(process.cwd(), "./images/icons/vostro.png"));
    const imagePlay = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/play.svg"));
    const imageStepBackward = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/step-backward.svg"));
    const imageStepForward = await loadImage(path.resolve(process.cwd(), "./images/icons/dark/step-forward.svg"));


    this.buttons = [
      [{ image: imageHeadphones }, { image: imageCode }, { image: imageGamepad }, { image: imageKey }, { image: imageListAlt }],
      [{ image: imageHDD }, undefined, { image: imageVostro }, undefined, { image: imageAddressCard }],
      [{ image: imageWindowClose }, {image: imageStepBackward}, {image: imagePlay}, {image: imageStepForward}, { image: imageFrown }],
    ];
  }
  onKeyDown(keyIndex) {
    let code, valid = true;
    switch (keyIndex) {
      case 14:
        return events.emit("reset");
      case 4:
        return spawn("spotify", [], {detached: true});
      case 3:
        return spawn("code", [], {detached: true});
      case 2:
        return spawn("steam", [], {detached: true});
      case 1:
        return spawn("xdg-open", [process.env.EL_WEB_VAULT], {detached: true});
      case 0:
        return spawn("xdg-open", [process.env.EL_WEB_TASKS], {detached: true});
      case 9:
        return spawn("xdg-open", [process.env.EL_HOMEDIR], {detached: true});
      case 5:
        return spawn("xdg-open", [process.env.EL_WEB_MAIL], {detached: true})
      case 11: //next
        return spawn("dbus-send", ["--print-reply", "--dest=org.mpris.MediaPlayer2.spotify", "/org/mpris/MediaPlayer2", "org.mpris.MediaPlayer2.Player.Next"], {detached: true});
      case 13: //prev
        return spawn("dbus-send", ["--print-reply", "--dest=org.mpris.MediaPlayer2.spotify", "/org/mpris/MediaPlayer2", "org.mpris.MediaPlayer2.Player.Previous"], {detached: true});
      case 12: //play/pause
        return spawn("dbus-send", ["--print-reply", "--dest=org.mpris.MediaPlayer2.spotify", "/org/mpris/MediaPlayer2", "org.mpris.MediaPlayer2.Player.PlayPause"], {detached: true});

    }
    return undefined;
  }
}

class HomeScreen extends LayerGroup {
  constructor() {
    const background = new Hypnos();
    background.opacity = 0.9;
    super([background, new HomeButtons()]);
  }
}


const states = {
  SCREENSAVER: 0,
  LOCKSCREEN: 1,
  HOMESCREEN: 2,
};
class Screen extends LayerGroup {
  constructor() {
    const screenSaver = createScreenSaver();
    const lockScreen = new LockScreen();
    lockScreen.enabled = false;
    const homeScreen = new HomeScreen();
    homeScreen.enabled = false;
    super([
      screenSaver,
      lockScreen,
      homeScreen,
    ]);
    this.homeScreen = homeScreen;
    this.screenSaver = screenSaver;
    this.lockScreen = lockScreen;
    this.state = states.SCREENSAVER;
    events.on("lock-screen", () => this.lock());
    events.on("login-success", () => this.loginSuccess());
    events.on("reset", () => this.reset());
  }
  reset() {
    console.log("reset");
    clearTimeout(this.idleTimeout);
    this.state = states.SCREENSAVER;
    // const activeLayer = this.layers.filter((l) => l.enabled)[0];
    this.fadeLayer(this.getActiveLayer(), this.screenSaver, 1);

  }
  loginSuccess() {
    console.log("loginSuccess");
    clearTimeout(this.idleTimeout);
    this.state = states.HOMESCREEN;
    this.fadeLayer(this.lockScreen, this.homeScreen, 1);
  }
  async fadeLayer(fromLayer, toLayer, targetOpacity, inc = 0.1) {
    if (!this.transitioning) {
      fromLayer.opacity = 1;
      toLayer.opacity = 0;
    }
    this.transitioning = true;
    toLayer.enable();
    toLayer.opacity += inc;
    fromLayer.opacity -= inc;
    if (fromLayer.opacity < 0) {
      fromLayer.opacity = 0;
      await fromLayer.disable();
    }
    if (toLayer.opacity > targetOpacity) {
      toLayer.opacity = targetOpacity;
      this.transitioning = false;
    } else {
      setTimeout(() => this.fadeLayer(fromLayer, toLayer, targetOpacity, inc));
    }
  }
  lock() {
    console.log("lock");
    if (this.transitioning) {
      return;
    }
    this.state = states.SCREENSAVER;
    this.fadeLayer(this.getActiveLayer(), this.screenSaver, 1);
  }
  getActiveLayer() {
    return this.layers.filter((l) => l.enabled)[0];
  }
  idleCheck() {
    clearTimeout(this.idleTimeout);
    return setTimeout(() => {
      console.log("clear-lock");
      events.emit("clear-lock");
      return this.lock();
    }, 20000);
  }
  onKeyDown(keyIndex) {
    this.idleTimeout = this.idleCheck();
    if (this.transitioning) {
      return;
    }
    if (this.state === states.SCREENSAVER) {
      this.state = states.LOCKSCREEN;
      this.fadeLayer(this.screenSaver, this.lockScreen, 1);
    } else {

      this.layers.forEach((l) => {
        if (l.enabled && l.onKeyDown && !this.transitioning) {
          return l.onKeyDown(keyIndex);
        }
        return undefined;
      });
    }
    // else if (this.state === states.LOCKSCREEN) {
    //   this.state = states.SCREENSAVER;
    //   this.fadeLayer(this.lockScreen, this.screenSaver, 1);
    // }
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
