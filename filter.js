// TODO: move out everything, remove this usages
const filter = {
  // size of one pixel
  pixelateX: 3.5,
  pixelateY: 3.5 * (16 / 9), // TODO: use actual aspect ratio

  // ascii characters to use and the luminosity values for each
  asciiChars:
    " ´`¸¨·.'¯,_:°¹-\"^~²³;¬¡!¦/«»\\¤÷+|<>rº()=×¿?ª*c[]lvL7Tzstx}íìf{iç%±ï1JYj©îCn¢¼®u½oIÝFy2w¾3e4aÌÍÇ5úùVòó£kSXhüÞ§ñPöý$ÎÏZõûmµAÿôèéáàGEëæ96øäqpdbU¥ãðê#ÀÁ8K¶â&OHÈÉÂÄDÙÚÃåR0ÅÊgßËNÒÓÆQWÛÜþM@ÐBÔÖÕÑØ",
  asciiValues: [
    0.0, 0.0798, 0.0798, 0.088, 0.1016, 0.1036, 0.1038, 0.1213, 0.1565, 0.158,
    0.205, 0.2073, 0.2207, 0.224, 0.2385, 0.2406, 0.2433, 0.2593, 0.26, 0.2646,
    0.2689, 0.2701, 0.2805, 0.2807, 0.2927, 0.3187, 0.3211, 0.3212, 0.3214,
    0.3762, 0.384, 0.3916, 0.3919, 0.3935, 0.3936, 0.395, 0.4068, 0.4077,
    0.4077, 0.4202, 0.4222, 0.4291, 0.4303, 0.4446, 0.4543, 0.4672, 0.4829,
    0.4855, 0.4971, 0.4993, 0.5042, 0.5148, 0.5256, 0.527, 0.5317, 0.5348,
    0.5353, 0.5422, 0.5433, 0.5434, 0.5448, 0.5455, 0.5483, 0.5506, 0.554,
    0.563, 0.5651, 0.567, 0.5694, 0.5706, 0.5781, 0.5785, 0.5884, 0.5923,
    0.5944, 0.5975, 0.5976, 0.5984, 0.5998, 0.6062, 0.6087, 0.6204, 0.6256,
    0.6273, 0.6316, 0.6345, 0.6355, 0.6379, 0.6597, 0.6601, 0.6631, 0.6716,
    0.6753, 0.6753, 0.6756, 0.677, 0.6796, 0.6796, 0.6808, 0.6883, 0.6884,
    0.6911, 0.6911, 0.695, 0.697, 0.6994, 0.7014, 0.7023, 0.7068, 0.7071,
    0.7079, 0.7101, 0.7114, 0.7136, 0.7142, 0.7186, 0.7208, 0.7223, 0.7246,
    0.7264, 0.7281, 0.7312, 0.7331, 0.7335, 0.74, 0.74, 0.7514, 0.7514, 0.758,
    0.7619, 0.7619, 0.767, 0.7685, 0.7698, 0.7704, 0.7732, 0.7746, 0.7748,
    0.7765, 0.7768, 0.7813, 0.7817, 0.7844, 0.7849, 0.785, 0.786, 0.7861,
    0.7862, 0.7884, 0.7917, 0.7931, 0.7965, 0.8053, 0.8114, 0.8135, 0.8168,
    0.8168, 0.825, 0.8294, 0.8334, 0.8363, 0.8363, 0.8377, 0.8459, 0.8478,
    0.853, 0.8555, 0.8557, 0.8573, 0.8583, 0.8606, 0.863, 0.8663, 0.8663,
    0.8674, 0.8692, 0.8726, 0.8752, 0.8796, 0.8805, 0.8937, 0.8955, 0.9009,
    0.9027, 0.9052, 0.9096, 0.9179, 0.9695, 1.0,
  ],

  init() {
    const video = document.getElementById("video");
    video.muted = true;
    this.video = video;

    this.pixelatedCanvas = document.getElementById("pixelated");
    this.pixelatedCtx = this.pixelatedCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    this.luminosityCanvas = document.getElementById("luminosity");
    this.luminosityCtx = this.luminosityCanvas.getContext("2d");

    this.colorCanvas = document.getElementById("output-color");
    this.colorCtx = this.colorCanvas.getContext("2d");

    document.getElementById("color").addEventListener(
      "change",
      (event) => {
        this.colorCanvas.style.opacity = event.target.checked ? 1 : 0;
      },
      false
    );

    document.getElementById("fullscreen").addEventListener(
      "click",
      (event) => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.body.requestFullscreen();
        }
      },
      false
    );

    this.outputText = document.getElementById("output-text");

    video.addEventListener("loadeddata", () => {
      this.width = Math.round(video.videoWidth / this.pixelateX);
      this.height = Math.round(video.videoHeight / this.pixelateY);

      this.pixelatedCanvas.width = this.width;
      this.pixelatedCanvas.height = this.height;
      this.luminosityCanvas.width = this.width;
      this.luminosityCanvas.height = this.height;
      this.colorCanvas.width = this.width;
      this.colorCanvas.height = this.height;
      console.log(`Pixelated to ${this.width} x ${this.height}`);

      this.timerCallback();
    });

    video.addEventListener("play", () => this.timerCallback(), false);

    video.addEventListener(
      "seeked",
      () => {
        if (this.video.paused) this.computeFrame();
      },
      false
    );
  },

  timerCallback() {
    if (this.video.paused || this.video.ended) {
      return;
    }

    this.computeFrame();

    this.video.requestVideoFrameCallback(() => this.timerCallback());
  },

  // gamma encoded sRGB -> linear luminance
  gammaCorrect(value) {
    if (value <= 0.04045) return value / 12.92;
    return Math.pow((value + 0.055) / 1.055, 2.4);
  },

  computeFrame() {
    this.pixelatedCtx.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = this.pixelatedCtx.getImageData(0, 0, this.width, this.height);
    const data = frame.data;

    this.colorCtx.putImageData(frame, 0, 0);

    let output = "";
    for (let i = 0; i < data.length; i += 4) {
      const r = this.gammaCorrect(data[i + 0] / 255);
      const g = this.gammaCorrect(data[i + 1] / 255);
      const b = this.gammaCorrect(data[i + 2] / 255);

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
        // TODO: binary search?
      }

      output += closestChar;
      if ((i / 4 + 1) % this.width === 0) {
        output += "\n";
      }
    }

    this.luminosityCtx.putImageData(frame, 0, 0);
    this.outputText.innerText = output;
  },
};

filter.init();
