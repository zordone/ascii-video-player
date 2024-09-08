// size of one pixel
const pixelate = 3.5; // TODO: param for setting font size, calculate pixelation from that.

// more than 1.0 to boost contrast
const contrast = 2.0;

// ascii info: aspect ratio, characters to use, brightness value for each
const asciiRatio = 0.5152913184027207;
const asciiChars =
  " ´`¸¨·.'¯,_:°¹-\"^~²³;¬¡!¦/«»\\¤÷+|<>rº()=×¿?ª*c[]lvL7Tzstx}íìf{iç%±ï1JYj©îCn¢¼®u½oIÝFy2w¾3e4aÌÍÇ5úùVòó£kSXhüÞ§ñPöý$ÎÏZõûmµAÿôèéáàGEëæ96øäqpdbU¥ãðê#ÀÁ8K¶â&OHÈÉÂÄDÙÚÃåR0ÅÊgßËNÒÓÆQWÛÜþM@ÐBÔÖÕÑØ";
const asciiValues = [
  // TODO: /these\ are duplicates, should only be one
  0.0, 0.0798, 0.0798, 0.088, 0.1016, 0.1036, 0.1038, 0.1213, 0.1565, 0.158,
  0.205, 0.2073, 0.2207, 0.224, 0.2385, 0.2406, 0.2433, 0.2593, 0.26, 0.2646,
  0.2689, 0.2701, 0.2805, 0.2807, 0.2927, 0.3187, 0.3211, 0.3212, 0.3214,
  0.3762, 0.384, 0.3916, 0.3919, 0.3935, 0.3936, 0.395, 0.4068, 0.4077, 0.4077,
  0.4202, 0.4222, 0.4291, 0.4303, 0.4446, 0.4543, 0.4672, 0.4829, 0.4855,
  0.4971, 0.4993, 0.5042, 0.5148, 0.5256, 0.527, 0.5317, 0.5348, 0.5353, 0.5422,
  0.5433, 0.5434, 0.5448, 0.5455, 0.5483, 0.5506, 0.554, 0.563, 0.5651, 0.567,
  0.5694, 0.5706, 0.5781, 0.5785, 0.5884, 0.5923, 0.5944, 0.5975, 0.5976,
  0.5984, 0.5998, 0.6062, 0.6087, 0.6204, 0.6256, 0.6273, 0.6316, 0.6345,
  0.6355, 0.6379, 0.6597, 0.6601, 0.6631, 0.6716, 0.6753, 0.6753, 0.6756, 0.677,
  0.6796, 0.6796, 0.6808, 0.6883, 0.6884, 0.6911, 0.6911, 0.695, 0.697, 0.6994,
  0.7014, 0.7023, 0.7068, 0.7071, 0.7079, 0.7101, 0.7114, 0.7136, 0.7142,
  0.7186, 0.7208, 0.7223, 0.7246, 0.7264, 0.7281, 0.7312, 0.7331, 0.7335, 0.74,
  0.74, 0.7514, 0.7514, 0.758, 0.7619, 0.7619, 0.767, 0.7685, 0.7698, 0.7704,
  0.7732, 0.7746, 0.7748, 0.7765, 0.7768, 0.7813, 0.7817, 0.7844, 0.7849, 0.785,
  0.786, 0.7861, 0.7862, 0.7884, 0.7917, 0.7931, 0.7965, 0.8053, 0.8114, 0.8135,
  0.8168, 0.8168, 0.825, 0.8294, 0.8334, 0.8363, 0.8363, 0.8377, 0.8459, 0.8478,
  0.853, 0.8555, 0.8557, 0.8573, 0.8583, 0.8606, 0.863, 0.8663, 0.8663, 0.8674,
  0.8692, 0.8726, 0.8752, 0.8796, 0.8805, 0.8937, 0.8955, 0.9009, 0.9027,
  0.9052, 0.9096, 0.9179, 0.9695, 1.0,
];

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

// toggle color mode on/off
function onColorModeChange(event) {
  outputCanvas.style.opacity = event.target.checked ? 1 : 0;
}

// toggle full screen on/off
function onFullScreenClick() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen();
  }
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

const paramColor = document.getElementById("param-color");
const paramFullscreen = document.getElementById("param-fullscreen");

// events
paramColor.onchange = onColorModeChange;
paramFullscreen.onclick = onFullScreenClick;
video.onloadeddata = onLoadedData;
video.onplay = onFrame;
video.onseeked = processFrame;
