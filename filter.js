const processor = {
  // size of one pixel
  pixelateX: 3.6,
  pixelateY: 3.6 * (16 / 9),
  // asci characters to use
  asciiChars:
    " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
  asciiValues: [
    0, 0.0751, 0.0829, 0.0848, 0.1227, 0.1403, 0.1559, 0.185, 0.2183, 0.2417,
    0.2571, 0.2852, 0.2902, 0.2919, 0.3099, 0.3192, 0.3232, 0.3294, 0.3384,
    0.3609, 0.3619, 0.3667, 0.3737, 0.3747, 0.3838, 0.3921, 0.396, 0.3984,
    0.3993, 0.4075, 0.4091, 0.4101, 0.42, 0.423, 0.4247, 0.4274, 0.4293, 0.4328,
    0.4382, 0.4385, 0.442, 0.4473, 0.4477, 0.4503, 0.4562, 0.458, 0.461, 0.4638,
    0.4667, 0.4686, 0.4693, 0.4703, 0.4833, 0.4881, 0.4944, 0.4953, 0.4992,
    0.5509, 0.5567, 0.5569, 0.5591, 0.5602, 0.5602, 0.565, 0.5776, 0.5777,
    0.5818, 0.587, 0.5972, 0.5999, 0.6043, 0.6049, 0.6093, 0.6099, 0.6465,
    0.6561, 0.6595, 0.6631, 0.6714, 0.6759, 0.6809, 0.6816, 0.6925, 0.7039,
    0.7086, 0.7235, 0.7302, 0.7332, 0.7602, 0.7834, 0.8037, 0.9999,
  ],
};

processor.doLoad = function doLoad() {
  const video = document.getElementById("video");
  video.muted = true;
  this.video = video;

  this.c1 = document.getElementById("c1");
  this.ctx1 = this.c1.getContext("2d", { willReadFrequently: true });

  this.c2 = document.getElementById("c2");
  this.ctx2 = this.c2.getContext("2d");

  this.c3 = document.getElementById("c3");
  this.ctx3 = this.c3.getContext("2d");

  document.getElementById("color").onchange = (event) => {
    this.c3.style.opacity = event.target.checked ? 1 : 0;
  };

  this.output = document.getElementById("output-text");

  video.addEventListener(
    "play",
    () => {
      this.width = Math.round(video.videoWidth / this.pixelateX);
      this.height = Math.round(video.videoHeight / this.pixelateY);

      this.c1.width = this.width;
      this.c1.height = this.height;
      this.c2.width = this.width;
      this.c2.height = this.height;
      this.c3.width = this.width;
      this.c3.height = this.height;
      console.log(`Pixelated to ${this.width} x ${this.height}`);

      this.timerCallback();
    },
    false
  );

  video.addEventListener("seeked", () => {
    if (this.video.paused) this.computeFrame();
  });
};

processor.timerCallback = function timerCallback() {
  if (this.video.paused || this.video.ended) {
    return;
  }

  this.computeFrame();

  this.video.requestVideoFrameCallback(() => this.timerCallback());
};

// gamma encoded sRGB -> linear luminance
const gammaCorrect = (value) => {
  if (value <= 0.04045) return value / 12.92;
  return Math.pow((value + 0.055) / 1.055, 2.4);
};

processor.computeFrame = function computeFrame() {
  this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
  const frame = this.ctx1.getImageData(0, 0, this.width, this.height);
  const data = frame.data;

  this.ctx3.putImageData(frame, 0, 0);

  let output = "";
  for (let i = 0; i < data.length; i += 4) {
    const r = gammaCorrect(data[i + 0] / 255);
    const g = gammaCorrect(data[i + 1] / 255);
    const b = gammaCorrect(data[i + 2] / 255);

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const scaled = luminance * 255;
    data[i + 0] = scaled;
    data[i + 1] = scaled;
    data[i + 2] = scaled;

    const scaledValue = scaled / 255;
    let closestChar = "";
    let closestDiff = Infinity;
    for (let v = 0; v < this.asciiValues.length; v += 1) {
      const diff = Math.abs(this.asciiValues[v] - scaledValue);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestChar = this.asciiChars[v];
      } else if (diff > closestDiff) {
        break;
      }
      // TODO: early exit or binary search
    }

    output += closestChar;
    if ((i / 4 + 1) % this.width === 0) {
      output += "\n";
    }
  }

  this.ctx2.putImageData(frame, 0, 0);
  this.output.innerText = output;
};

processor.doLoad();
