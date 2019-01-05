const path = require("path");
const StreamDeck = require("elgato-stream-deck");

import {getColours} from "./utils/gradient";

// Automatically discovers connected Stream Decks, and attaches to the first one.
// Throws if there are no connected stream decks.
// You also have the option of providing the devicePath yourself as the first argument to the constructor.
// For example: const myStreamDeck = new StreamDeck("\\\\?\\hid#vid_05f3&pid_0405&mi_00#7&56cf813&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}")
// Device paths can be obtained via node-hid: https://github.com/node-hid/node-hid
const streamDeck = new StreamDeck();
streamDeck.on("error", error => {
  console.error(error);
});

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


let i = 0, reverse = false;
const colours = getColours(g, 500);
setInterval(async() => {
  for (let btn = 0; btn < 15; btn++) {
    const c = colours[i];
    // console.log('Filling with rgb(%d, %d, %d)', c.r, c.g, c.b);
    streamDeck.fillColor(btn, c.r, c.g, c.b);
    if (reverse) {
      i--;
      if (i <= 1) {
        reverse = false;
      }
    } else {
      i++;
      if (i >= colours.length - 1) {
        reverse = true;
        i = colours.length - 1;
      }
    }
  }
}, 1000 / 5);

