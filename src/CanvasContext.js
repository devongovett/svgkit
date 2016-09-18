const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);

export default class CanvasContext {
  constructor(ctx, Image) {
    this.ctx = ctx;
    this.Image = Image;
    this.state = {
      fillOpacity: 1,
      strokeOpacity: 1
    };
    this.stack = [];
  }

  save() {
    this.stack.push(Object.assign({}, this.state));
    this.ctx.save();
  }

  restore() {
    if (this.stack.length) {
      this.state = this.stack.pop();
      this.ctx.restore();
    }
  }

  dash(length, options = {}) {
    if (!length) return;
    let space = options.space != null ? options.space : length;
    let phase = options.phase || 0;

    this.ctx.setLineDash([length, space]);
    this.ctx.lineDashOffset = phase;
    return this;
  }

  undash() {
    this.ctx.setLineDash([]);
    return this;
  }

  roundedRect(x, y, w, h, r = 0) {
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  }

  ellipse(x, y, r1, r2 = r1) {
    // x -= r1;
    // y -= r2;
    // let ox = r1 * KAPPA;
    // let oy = r2 * KAPPA;
    // let xe = x + r1 * 2;
    // let ye = y + r2 * 2;
    // let xm = x + r1;
    // let ym = y + r2;
    // this.moveTo(x, ym);
    // this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    // this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    // this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    // this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    // this.closePath();
    // return this;
    // console.log(x, y)
    this.ctx.arc(x, y, r1, 0, 2 * Math.PI);
    return this;
  }

  circle(x, y, radius) {
    return this.ellipse(x, y, radius);
  }

  fillColor(color, opacity = 1) {
    this.ctx.fillStyle = normalizeColor(color);
    this.state.fillOpacity = opacity;
    return this;
  }

  strokeColor(color, opacity = 1) {
    this.ctx.strokeStyle = normalizeColor(color);
    this.state.strokeOpacity = opacity;
    return this;
  }

  opacity(opacity) {
    this.state.fillOpacity = opacity;
    this.state.strokeOpacity = opacity;
    return this;
  }

  fillOpacity(opacity) {
    this.state.fillOpacity = opacity;
    return this;
  }

  strokeOpacity(opacity) {
    this.state.strokeOpacity = opacity;
    return this;
  }

  fill(color, rule) {
    if (/(even-?odd)|(non-?zero)/.test(color)) {
      rule = color;
      color = null;
    }

    if (color) {
      this.fillColor(color);
    }

    rule = rule.replace('-', '') || 'nonzero';
    this.ctx.globalAlpha = this.state.fillOpacity;
    this.ctx.fill(rule);

    this.ctx.beginPath();
    return this;
  }

  stroke(color) {
    if (color) {
      this.strokeColor(color);
    }

    this.ctx.globalAlpha = this.state.strokeOpacity;
    this.ctx.stroke();
    this.ctx.beginPath();
    return this;
  }

  fillAndStroke(fillColor, strokeColor = fillColor, rule) {
    let isFillRule = /(even-?odd)|(non-?zero)/;
    if (isFillRule.test(fillColor)) {
      rule = fillColor;
      fillColor = null;
    }

    if (isFillRule.test(strokeColor)) {
      rule = strokeColor;
      strokeColor = fillColor;
    }

    if (fillColor) {
      this.fillColor(fillColor);
      this.strokeColor(strokeColor);
    }

    rule = rule.replace('-', '') || 'nonzero';
    this.ctx.globalAlpha = this.state.fillOpacity;
    this.ctx.fill(rule);
    this.ctx.globalAlpha = this.state.strokeOpacity;
    this.ctx.stroke();
    this.ctx.beginPath();
    return this;
  }

  clip() {
    this.ctx.clip();
    this.ctx.beginPath();
    return this;
  }

  // rotate(angle, options = {}) {
  //   let rad = angle * Math.PI / 180;
  //   let cos = Math.cos(rad);
  //   let sin = Math.sin(rad);
  //   let x = 0, y = 0;
  //
  //   if (options.origin) {
  //     [x, y] = options.origin;
  //     x1 = x * cos - y * sin;
  //     y1 = x * sin + y * cos;
  //     x -= x1;
  //     y -= y1;
  //   }
  //
  //   return this.transform(cos, sin, -sin, cos, x, y);
  // }
  //
  // scale(xFactor, yFactor = xFactor, options = {}) {
  //   if (arguments.length === 2) {
  //     yFactor = xFactor;
  //     options = yFactor;
  //   }
  //
  //   let x = 0, y = 0;
  //   if (options.origin) {
  //     [x, y] = options.origin
  //     x -= xFactor * x
  //     y -= yFactor * y
  //   }
  //
  //   return this.transform(xFactor, 0, 0, yFactor, x, y);
  // }

  linearGradient(x1, y1, x2, y2) {
    return new Gradient(this.ctx.createLinearGradient(x1, y1, x2, y2));
  }

  radialGradient(x1, y1, r1, x2, y2, r2) {
    return new Gradient(this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2));
  }

  image(src, x, y, options = {}) {
    let img = new (this.Image);
    img.src = src;

    this.ctx.globalAlpha = this.state.fillOpacity;
    if (options.width && options.height) {
      this.ctx.drawImage(img, x, y, options.width, options.height);
    } else {
      this.ctx.drawImage(img, x, y);
    }
    return this;
  }

  fontSize(size) {
    this.ctx.font = `${size}px Helvetica`;
    return this;
  }

  text(text, x, y, options = {}) {
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
    return this;
  }

  widthOfString(text) {
    return this.ctx.measureText(text).width;
  }

  currentLineHeight() {
    // return 20;
    let metrics = this.ctx.measureText('x');
    return metrics.emHeightAscent;
  }
}

function normalizeColor(color, opacity = 1) {
  if (color instanceof Gradient) {
    return color.finalize();
  }

  opacity = Math.max(0, Math.min(1, opacity));

  // if (typeof color === 'string') {
  //   if (color.charAt(0) === '#') {
  //     if (color.length === 4) {
  //       color = color.replace(/#([0-9A-F])([0-9A-F])([0-9A-F])/i, "#$1$1$2$2$3$3");
  //     }
  //
  //     let hex = parseInt(color.slice(1), 16);
  //     color = [hex >> 16, hex >> 8 & 0xff, hex & 0xff];
  //   } else if (NAMED_COLORS[color]) {
  //     color = NAMED_COLORS[color];
  //   }
  // }

  if (Array.isArray(color)) {
    // RGB
    // if (color.length === 3) {
      return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;

    // CMYK
    // } else if (color.length === 4) {
    //   throw new Error("CMYK not supported");
    // }
  }

  return null;
}

class Gradient {
  constructor(grad) {
    this.grad = grad;
    this.stops = [];
  }

  stop(pos, color, opacity = 1) {
    this.stops.push([pos, color, opacity]);

    color = normalizeColor(color, opacity);
    this.grad.addColorStop(pos, color);
    return this;
  }

  finalize() {
    let last = this.stops[this.stops.length - 1]
    if (last[0] < 1) {
      this.stop(1, last[1], last[2]);
    }

    return this.grad;
  }
}

const properties = ['lineWidth', 'lineCap', 'lineJoin', 'miterLimit'];
for (let prop of properties) {
  CanvasContext.prototype[prop] = function (v) {
    this.ctx[prop] = v;
    return this;
  };
}


const methods = [
  'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'closePath',
  'rect', 'transform', 'scale', 'rotate', 'translate'
];

for (let method of methods) {
  CanvasContext.prototype[method] = function (...args) {
    this.ctx[method](...args);
    return this;
  };
}

const NAMED_COLORS = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};
