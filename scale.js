const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

ctx.font = "900 162.7px Menlo, monospace";
ctx.textBaseline = "bottom";

// size of one character
const { width, fontBoundingBoxAscent: height } = ctx.measureText("█");
console.log("measure", width, height);

// all the printable ASCII characters
const chars = Array.from({ length: 224 }, (_, i) =>
  String.fromCharCode(i + 32)
).join("");

document.getElementById("generate").onclick = async () => {
  // go over all the characters
  const set = new Set();
  const values = [];
  for (let char of chars) {
    // exclude characters with different width
    const { width: currentWidth } = ctx.measureText(char);
    if (width !== currentWidth) {
      console.log("exclude width", { char, currentWidth });
      continue;
    }
    // clear bounding rect
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    // draw current character
    ctx.fillStyle = "#fff";
    ctx.fillText(char, 0, height);
    // get the pixels
    const frame = ctx.getImageData(0, 0, width, height);
    const data = frame.data;
    // sum pixel brightness
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = data.slice(i, i + 3);
      sum += Math.max(r, g, b) / 255;
    }
    // combined brightness for the whole character
    const brightness = sum / (width * height);
    // exclude duplicate brightness values
    if (set.has(brightness)) {
      console.log("exclude duplicate", brightness);
      continue;
    }
    // wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));
    // add to array, but exclude all the invisible characters
    if (brightness > 0) {
      values.push({ char, brightness });
      set.add(brightness);
      console.log("char", char, "=", brightness);
    }
  }
  // add space for zero
  values.push({ char: " ", brightness: 0 });
  // increasing order
  values.sort((a, z) => a.brightness - z.brightness);
  // scale to 100%
  const multiplier = 1 / values.at(-1).brightness;
  values.forEach((v) => (v.brightness *= multiplier));
  // output
  const asciiRatio = width / height;
  const asciiChars = JSON.stringify(values.map((v) => v.char).join(""));
  const asciiValues = "[" + values.map((v) => v.brightness.toFixed(4)) + "]";
  document.getElementById("output").innerText = [
    `const asciiRatio = ${asciiRatio};`,
    `const asciiChars = ${asciiChars};`,
    `const asciiValues = ${asciiValues};`,
  ].join("\n");
};
