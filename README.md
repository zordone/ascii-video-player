# ASCII Video Player

This is a POC for rendering a video as ASCII art.

- Copies the video frames to a pixelated canvas.
- Splits the RGB pixel values to separate color and brightness values.
- Displays these in additional canvases for demonstration.
- Choses the ASCII character closest to the brightness value of each pixel.
- Puts the color values on a canvas behind the text for the color mode.

## Demo

Feel free to try the [live demo](https://zordone.github.io/ascii-video-player/).

## Pages

- The `index` page is the actual player.
- The `scale` page is a code generation tool for creating the ASCII "color scale" for a given font.

## Test videos

Only one (online) test video is included.

You can simply add more (local or online) in the HTML.

You can find some examples [here](https://gist.github.com/jsturgis/3b19447b304616f18657).

## Screenshots

![Player in black and white mode](images/player-white.png)

![Player in color mode](images/player-color.png)

![Scale page](images/scale.png)
