// ascii info: aspect ratio, characters to use, brightness value for each
const asciiRatio = 0.5152913184027207;
const asciiChars =
  " `¸¨·.'¯,_:°¹-\"^~²³;¬¡!¦/«\\¤÷+|<rº(=×¿?ª*c[]lvL7Tzstx}ìf{iç%±ï1JYj©îCn¢®u½oIÝFy2w¾3e4aÌÇ5ùVòkSXhüÞ§ñPöý$ÎÏZõûmµAÿôèàGEæ96øäqpdbU¥ãê#8K¶â&OHÈÂÄDÙÚÃåR0ÅÊgßËNÒÆQWÛÜþM@ÐBÔÖÕÑØ";
const asciiValues = [
  0.0, 0.0798, 0.088, 0.1017, 0.1036, 0.1038, 0.1212, 0.1565, 0.1579, 0.205,
  0.2073, 0.2208, 0.2241, 0.2384, 0.2405, 0.2434, 0.2594, 0.2601, 0.2645,
  0.2688, 0.2702, 0.2805, 0.2808, 0.2928, 0.3187, 0.3213, 0.3215, 0.3763,
  0.3841, 0.3916, 0.3919, 0.3935, 0.3949, 0.4067, 0.4076, 0.4203, 0.4222, 0.429,
  0.4305, 0.4446, 0.4542, 0.4672, 0.4829, 0.4855, 0.4971, 0.4992, 0.5041,
  0.5147, 0.5255, 0.5269, 0.5317, 0.5347, 0.5354, 0.5422, 0.5434, 0.5448,
  0.5455, 0.5484, 0.5507, 0.554, 0.563, 0.5651, 0.567, 0.5693, 0.5707, 0.578,
  0.5785, 0.5884, 0.5924, 0.5945, 0.5976, 0.5985, 0.5999, 0.6063, 0.6086,
  0.6204, 0.6256, 0.6272, 0.6317, 0.6345, 0.6354, 0.6378, 0.6597, 0.6602,
  0.6632, 0.6717, 0.6752, 0.6757, 0.6771, 0.6797, 0.6809, 0.6884, 0.6912, 0.695,
  0.6971, 0.6995, 0.7013, 0.7023, 0.7068, 0.7072, 0.7079, 0.71, 0.7115, 0.7136,
  0.7143, 0.7185, 0.7209, 0.7223, 0.7246, 0.7263, 0.7282, 0.7312, 0.7331,
  0.7336, 0.7399, 0.7515, 0.7581, 0.7618, 0.767, 0.7684, 0.7698, 0.7703, 0.7731,
  0.7745, 0.7748, 0.7767, 0.7769, 0.7814, 0.7818, 0.7844, 0.7849, 0.7861,
  0.7884, 0.7917, 0.7931, 0.7964, 0.8054, 0.8115, 0.8136, 0.8169, 0.8251,
  0.8294, 0.8334, 0.8362, 0.8364, 0.8376, 0.8458, 0.8477, 0.8529, 0.8555,
  0.8557, 0.8574, 0.8583, 0.8607, 0.863, 0.8663, 0.8675, 0.8691, 0.8727, 0.8753,
  0.8795, 0.8804, 0.8939, 0.8955, 0.9009, 0.9028, 0.9052, 0.9096, 0.9179,
  0.9694, 1.0,
];

// TODO: init HTML values based on the variable values here
// more than 1.0 to boost contrast
let contrast = 1.5;

// size of one pixel
let pixelate = 3.5;

// will be calculated after video load
let width, height;

// when we're ready to process the next frame
function onFrame() {
  // abort if video is not playing
  if (video.paused || video.ended) {
    return;
  }
  // process the current frame
  processFrame();
  // schedule the next frame
  video.requestVideoFrameCallback(onFrame);
}

// first frame is loaded, calculate size
function onLoadedData() {
  // pixelated size
  width = Math.round(video.videoWidth / pixelate);
  height = Math.round(video.videoHeight / (pixelate / asciiRatio));
  // update all canvases
  pixelatedCanvas.width = width;
  pixelatedCanvas.height = height;
  colorCanvas.width = width;
  colorCanvas.height = height;
  brightnessCanvas.width = width;
  brightnessCanvas.height = height;
  outputCanvas.width = width;
  outputCanvas.height = height;
  // debug info
  processFrame();
  const { videoWidth, videoHeight } = video;
  console.log(`Video: ${videoWidth} x ${videoHeight}`);
  console.log(`Pixelated: ${width} x ${height}`);
  const outRect = outputText.getBoundingClientRect();
  const outWidth = Math.round(outRect.width);
  const outHeight = Math.round(outRect.height);
  console.log(`Output: ${outWidth} x ${outHeight}`);
  const videoRatio = videoWidth / videoHeight;
  const correct = Math.round(outWidth / videoRatio);
  const actual = Math.round(outHeight);
  const error = Math.abs(actual - correct);
  console.log(`Correct: ${correct}, Actual: ${actual}, Error: ${error}`);
  // TODO: remove
  video.currentTime = 47;
}

// find the closest character to given brightness
function searchChar(brightness) {
  let low = 0;
  let high = asciiValues.length - 1;
  // outside the range?
  if (brightness <= asciiValues[low]) return asciiChars[low];
  if (brightness >= asciiValues[high]) return asciiChars[high];
  // binary search
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    // exact match
    if (asciiValues[mid] === brightness) return asciiChars[mid];
    // narrow down
    if (asciiValues[mid] < brightness) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  // no exact match, we're between `low-1` and `low`
  const diffUp = Math.abs(asciiValues[low] - brightness);
  const diffDown = Math.abs(asciiValues[low - 1] - brightness);
  return diffUp < diffDown ? asciiChars[low] : asciiChars[low - 1];
}

// convert current frame to ascii
function processFrame() {
  // copy frame to canvas in reduced size to pixelate it
  pixelatedCtx.drawImage(video, 0, 0, width, height);
  // pixelated frame -> full brightness, color only
  const colorFrame = pixelatedCtx.getImageData(0, 0, width, height);
  const colorData = colorFrame.data;
  for (let i = 0; i < colorData.length; i += 4) {
    const r = colorData[i + 0];
    const g = colorData[i + 1];
    const b = colorData[i + 2];
    const max = Math.max(r, g, b, 0.01);
    const multiplier = 255 / max;
    colorData[i + 0] = r * multiplier;
    colorData[i + 1] = g * multiplier;
    colorData[i + 2] = b * multiplier;
  }
  colorCtx.putImageData(colorFrame, 0, 0);
  outputCtx.putImageData(colorFrame, 0, 0);
  // pixelated frame -> brightness only -> ascii characters
  const brightnessFrame = pixelatedCtx.getImageData(0, 0, width, height);
  const brightnessData = brightnessFrame.data;
  let output = "";
  for (let i = 0; i < brightnessData.length; i += 4) {
    // brightness
    const r = (brightnessData[i + 0] / 255) ** contrast;
    const g = (brightnessData[i + 1] / 255) ** contrast;
    const b = (brightnessData[i + 2] / 255) ** contrast;
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // replace pixel with the brightness value just for debug visualisation
    const scaled = brightness * 255;
    brightnessData[i + 0] = scaled;
    brightnessData[i + 1] = scaled;
    brightnessData[i + 2] = scaled;
    // find ascii character with the closest brightness
    output += searchChar(brightness);
    // new line?
    if ((i / 4 + 1) % width === 0) {
      output += "\n";
    }
  }
  // draw to the luminosity canvas
  brightnessCtx.putImageData(brightnessFrame, 0, 0);
  // update the ascii output
  outputText.innerText = output;
}

// select video
function onVideoChange() {
  video.src = paramVideo.value;
}

// set pixelation factor
function onPixelChange(event) {
  pixelate = event.target.value;
  onLoadedData(); // TODO: only width init, instead of full re-init?
}

// set font size
function onSizeChange(event) {
  const size = event.target.value;
  outputText.style.fontSize = `${size}px`;
}

// set contrast
function onContrastChange(event) {
  contrast = event.target.value;
  processFrame();
}

// toggle color mode on/off
function onColorModeChange(event) {
  outputCanvas.style.opacity = event.target.checked ? 1 : 0;
}

// getting DOM stuff
const video = document.getElementById("video");
video.muted = true;

const pixelatedCanvas = document.getElementById("pixelated");
const pixelatedCtx = pixelatedCanvas.getContext("2d", {
  willReadFrequently: true,
});

const colorCanvas = document.getElementById("color");
const colorCtx = colorCanvas.getContext("2d");

const brightnessCanvas = document.getElementById("brightness");
const brightnessCtx = brightnessCanvas.getContext("2d");

const outputCanvas = document.getElementById("output-color");
const outputCtx = outputCanvas.getContext("2d");
const outputText = document.getElementById("output-text");

const paramVideo = document.getElementById("param-video");
const paramPixel = document.getElementById("param-pixel");
const paramSize = document.getElementById("param-size");
const paramContrast = document.getElementById("param-contrast");
const paramColor = document.getElementById("param-color");

// events
paramVideo.onchange = onVideoChange;
paramPixel.onchange = onPixelChange;
paramSize.onchange = onSizeChange;
paramContrast.onchange = onContrastChange;
paramColor.onchange = onColorModeChange;
video.onloadeddata = onLoadedData;
video.onplay = onFrame;
video.onseeked = processFrame;

// load video
onVideoChange();
