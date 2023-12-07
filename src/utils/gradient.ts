
export function getColours(gradient: { position: number; colour: { r: number; g: number; b: number; }; }[], count: number) {
  let colours = [];
  if (count === 2) {
    return [
      pickColourFromGradient(gradient, 0),
      pickColourFromGradient(gradient, 100)
    ];
  }
  const interval = 100 / count;
  for (let i = 0; i < 100; i += interval) {
    colours.push(pickColourFromGradient(gradient, i));
  }
  return colours;
}

function pickColourFromGradient(gradient: string | any[], position: number) {
  let high, low;
  for (let i = 1; i <= gradient.length; i++) {
    if (position <= gradient[i].position) {
      high = gradient[i];
      low = gradient[i - 1];
      break;
    }
  }
  if (!high || !low) {
    throw new Error("Unable to select gradient sectors");
  }
  const ratio = (position - low.position) / (high.position - low.position);
  return pickColourBetween(high.colour, low.colour, ratio);
}

function pickColourBetween(color1: { r: number; g: number; b: number; }, color2: { r: number; g: number; b: number; }, weight: number) {
  const p = weight;
  const w = p * 2 - 1;
  const w1 = (w / 1 + 1) / 2;
  const w2 = 1 - w1;
  return {
    r: Math.round(color1.r * w1 + color2.r * w2),
    g: Math.round(color1.g * w1 + color2.g * w2),
    b: Math.round(color1.b * w1 + color2.b * w2)
  };
}

export function rgbToHex(rgb: { r?: any; g?: any; b?: any; a?: any; }) {
  const {r, g, b} = rgb;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${((rgb.a >= 0 ? rgb.a : 1) * 255).toString(16)}`.substring(0, 7);
}
