import {Layer} from "../engine";

import { WIDTH, HEIGHT } from "../utils/deck";

var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑".split("");
//converting the string into an array of single characters

var fontSize = 10;
var columns = WIDTH / fontSize; //number of columns for the rain
//an array of drops - one per column
var drops: any = [];
//x below is the x coordinate
//1 = y co-ordinate of the drop(same for every drop initially)
for (var x = 0; x < columns; x++) {
  drops[x] = 1;
}

export default class Matrix extends Layer {
  disable = async() => {
    await super.disable();
    for (var x = 0; x < columns; x++) {
      drops[x] = 1;
    }
  }
  update = async() => {
    if (this.enabled) {
      for (var i = 0; i < drops.length; i++) {
        //sending the drop back to the top randomly after it has crossed the screen
        //adding a randomness to the reset to make the drops scattered on the Y axis
        if (drops[i] * fontSize > HEIGHT && Math.random() > 0.975) {
          drops[i] = 0;
        }
        //incrementing Y coordinate
        drops[i]++;
      }
    }
  }
  render = async() => {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#0F0"; //green text
    ctx.font = fontSize + "px arial";
    //looping over drops
    for (var i = 0; i < drops.length; i++) {
      //a random chinese character to print
      var text = chinese[Math.floor(Math.random() * chinese.length)];
      //x = i*font_size, y = value of drops[i]*font_size
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    }
  }
}
