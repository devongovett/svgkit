import SVGElement from './SVGElement';
import SVGPoint from './SVGPoint';

let parameters = {
  A: 7,
  a: 7,
  C: 6,
  c: 6,
  H: 1,
  h: 1,
  L: 2,
  l: 2,
  M: 2,
  m: 2,
  Q: 4,
  q: 4,
  S: 4,
  s: 4,
  T: 2,
  t: 2,
  V: 1,
  v: 1,
  Z: 0,
  z: 0
};

class SVGPath extends SVGElement {  
  parse() {
    super.parse(...arguments);
    this.d = this.node.getAttribute('d');
    
    this.d = this.d.replace(/[\r\n]/g, '');
        
    // parse the data
    let path = this.d;
    let ret = [];
    let args = [];
    let curArg = "";
    let foundDecimal = false;
    let params = 0;

    for (let i = 0; i < path.length; i++) {
      // new command
      let c = path[i];
      if (parameters[c] != null) {
        params = parameters[c];
        if (cmd) { // save existing command
          if (curArg.length > 0) { args[args.length] = +curArg; }
          ret[ret.length] = {cmd,args};

          args = [];
          curArg = "";
          foundDecimal = false;
        }

        var cmd = c;

      // command separator
      } else if (c === " " || c === "\t" || c === "," || (c === "-" && curArg.length > 0 && curArg[curArg.length - 1] !== 'e') || (c === "." && foundDecimal)) {
        if (curArg.length === 0) { continue; }
          
        if (args.length === params) { // handle reused commands
          ret[ret.length] = {cmd, args};
          args = [+curArg];

          // handle assumed commands
          if (cmd === "M") { var cmd = "L"; }
          if (cmd === "m") { var cmd = "l"; }

        } else {
          args[args.length] = +curArg;
        }

        foundDecimal = (c === ".");

        // fix for negative numbers or repeated decimals with no delimeter between commands
        curArg = c === '-' || c === '.' ? c : '';

      // argument
      } else if (c === '0' || c === '1' || c === '2' || c === '3' || c === '4' || c === '5' || c === '6' || c === '7' || c === '8' || c === '9' || c === '.' || c === '-' || c === '+' || c === 'e' || c === 'E') {
        curArg += c;
        if (c === '.') { foundDecimal = true; }
        
      } else {
        console.log(JSON.stringify(c));
        // bad character, stop parsing
        break;
      }
    }

    // add the last command
    if (curArg.length > 0) {
      if (args.length === params) { // handle reused commands
        ret[ret.length] = {cmd, args};
        args = [+curArg];
    
        // handle assumed commands
        if (cmd === "M") { var cmd = "L"; }
        if (cmd === "m") { var cmd = "l"; }
      } else {
        args[args.length] = +curArg;
      }
    }
        
    if (curArg.length > 0) { args[args.length] = +curArg; }
    ret[ret.length] = {cmd,args};
    return this.commands = ret;
  }
    
  getMarkers() {
    return this.render(null);
  }
    
  _addMarker(p, from, prior) {
    if ((prior != null) && this._angles.length > 0) {
      let name;
      if (this._angles[name = this._angles.length - 1] == null) { this._angles[name] =  this._points[this._points.length - 1].angleTo(prior); }
    }
      
    this._points.push(p);
    return this._angles.push(__guard__(from, x => x.angleTo(p)));
  }
    
  render(ctx) {
    // current point, control point, and subpath starting point
    this.cx = this.cy = this.px = this.py = this.sx = this.sy = 0;
    this.ctx = ctx;
    this._points = [];
    this._angles = [];
    
    for (let i = 0; i < this.commands.length; i++) {
      let c = this.commands[i];
      __guard__(runners[c.cmd], x => x.call(this, c.args));
    }
      
  }
}
    
var runners = { 
  M(a) {
    this.cx = a[0];
    this.cy = a[1];
    this.px = this.py = null;
    this.sx = this.cx;
    this.sy = this.cy;
    this._addMarker(new SVGPoint(this.cx, this.cy));
    return __guard__(this.ctx, x => x.moveTo(this.cx, this.cy));
  },

  m(a) {
    this.cx += a[0];
    this.cy += a[1];
    this.px = this.py = null;
    this.sx = this.cx;
    this.sy = this.cy;
    this._addMarker(new SVGPoint(this.cx, this.cy));
    return __guard__(this.ctx, x => x.moveTo(this.cx, this.cy));
  },

  C(a) {
    this.cx = a[4];
    this.cy = a[5];
    this.px = a[2];
    this.py = a[3];
    this._addMarker(new SVGPoint(this.cx, this.cy), new SVGPoint(this.px, this.py), new SVGPoint(a[0], a[1]));
    return __guard__(this.ctx, x => x.bezierCurveTo(...a));
  },

  c(a) {
    __guard__(this.ctx, x => x.bezierCurveTo(a[0] + this.cx, a[1] + this.cy, a[2] + this.cx, a[3] + this.cy, a[4] + this.cx, a[5] + this.cy));
    this.px = this.cx + a[2];
    this.py = this.cy + a[3];
    this.cx += a[4];
    this.cy += a[5];
    return this._addMarker(new SVGPoint(this.cx, this.cy), new SVGPoint(this.px, this.py), new SVGPoint(a[0], a[1]));
  },

  S(a) {
    if (this.px === null) {
      this.px = this.cx;
      this.py = this.cy;
    }

    __guard__(this.ctx, x => x.bezierCurveTo(this.cx-(this.px-this.cx), this.cy-(this.py-this.cy), a[0], a[1], a[2], a[3]));
    this.px = a[0];
    this.py = a[1];
    this.cx = a[2];
    this.cy = a[3];
    
    return this._addMarker(new SVGPoint(this.cx, this.cy), new SVGPoint(this.px, this.py), new SVGPoint(a[0], a[1]));
  },

  s(a) {
    if (this.px === null) {
      this.px = this.cx;
      this.py = this.cy;
    }
    
    __guard__(this.ctx, x => x.bezierCurveTo(this.cx-(this.px-this.cx), this.cy-(this.py-this.cy), this.cx + a[0], this.cy + a[1], this.cx + a[2], this.cy + a[3]));
    this.px = this.cx + a[0];
    this.py = this.cy + a[1];
    this.cx += a[2];
    return this.cy += a[3];
  },

  Q(a) {
    this.px = a[0];
    this.py = a[1];
    this.cx = a[2];
    this.cy = a[3];
    return __guard__(this.ctx, x => x.quadraticCurveTo(a[0], a[1], this.cx, this.cy));
  },

  q(a) {
    __guard__(this.ctx, x => x.quadraticCurveTo(a[0] + this.cx, a[1] + this.cy, a[2] + this.cx, a[3] + this.cy));
    this.px = this.cx + a[0];
    this.py = this.cy + a[1];
    this.cx += a[2];
    return this.cy += a[3];
  },

  T(a) {
    if (this.px === null) {
      this.px = this.cx;
      this.py = this.cy;
    } else { 
      this.px = this.cx-(this.px-this.cx);
      this.py = this.cy-(this.py-this.cy);
    }

    __guard__(this.ctx, x => x.quadraticCurveTo(this.px, this.py, a[0], a[1]));
    this.px = this.cx-(this.px-this.cx);
    this.py = this.cy-(this.py-this.cy);
    this.cx = a[0];
    return this.cy = a[1];
  },

  t(a) {
    if (this.px === null) {
      this.px = this.cx;
      this.py = this.cy;
    } else {
      this.px = this.cx-(this.px-this.cx);
      this.py = this.cy-(this.py-this.cy);
    }

    __guard__(this.ctx, x => x.quadraticCurveTo(this.px, this.py, this.cx + a[0], this.cy + a[1]));
    this.cx += a[0];
    return this.cy += a[1];
  },

  A(a) {
    if (this.ctx) { solveArc(this.ctx, this.cx, this.cy, a); }
    this.cx = a[5];
    return this.cy = a[6];
  },

  a(a) {
    a[5] += this.cx;
    a[6] += this.cy;
    if (this.ctx) { solveArc(this.ctx, this.cx, this.cy, a); }
    this.cx = a[5];
    return this.cy = a[6];
  },

  L(a) {
    this.cx = a[0];
    this.cy = a[1];
    this.px = this.py = null;
    return __guard__(this.ctx, x => x.lineTo(this.cx, this.cy));
  },

  l(a) {
    this.cx += a[0];
    this.cy += a[1];
    this.px = this.py = null;
    return __guard__(this.ctx, x => x.lineTo(this.cx, this.cy));
  },

  H(a) {
    this.cx = a[0];
    this.px = this.py = null;
    return __guard__(this.ctx, x => x.lineTo(this.cx, this.cy));
  },

  h(a) {
    this.cx += a[0];
    this.px = this.py = null;
    return __guard__(this.ctx, x => x.lineTo(this.cx, this.cy));
  },

  V(a) {
    this.cy = a[0];
    this.px = this.py = null;
    return __guard__(this.ctx, x => x.lineTo(this.cx, this.cy));
  },

  v(a) {
    this.cy += a[0];
    this.px = this.py = null;
    return __guard__(this.ctx, x => x.lineTo(this.cx, this.cy));
  },

  Z() {
    __guard__(this.ctx, x => x.closePath());
    this.cx = this.sx;
    return this.cy = this.sy;
  },

  z() {
    __guard__(this.ctx, x => x.closePath());
    this.cx = this.sx;
    return this.cy = this.sy;
  }
};

var solveArc = function(ctx, x, y, coords) {
  let bez;
  let [rx,ry,rot,large,sweep,ex,ey] = coords;
  let segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y);

  return segs.map((seg) =>
    (bez = segmentToBezier(...seg),
    ctx.bezierCurveTo(...bez)));
};

// from Inkscape svgtopdf, thanks!
var arcToSegments = function(x, y, rx, ry, large, sweep, rotateX, ox, oy) {
  let th = rotateX * (Math.PI / 180);
  let sin_th = Math.sin(th);
  let cos_th = Math.cos(th);
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  let px = (cos_th * (ox - x) * 0.5) + (sin_th * (oy - y) * 0.5);
  let py = (cos_th * (oy - y) * 0.5) - (sin_th * (ox - x) * 0.5);
  let pl = ((px*px) / (rx*rx)) + ((py*py) / (ry*ry));
  if (pl > 1) {
    pl = Math.sqrt(pl);
    rx *= pl;
    ry *= pl;
  }

  let a00 = cos_th / rx;
  let a01 = sin_th / rx;
  let a10 = (-sin_th) / ry;
  let a11 = (cos_th) / ry;
  let x0 = (a00 * ox) + (a01 * oy);
  let y0 = (a10 * ox) + (a11 * oy);
  let x1 = (a00 * x) + (a01 * y);
  let y1 = (a10 * x) + (a11 * y);

  let d = ((x1-x0) * (x1-x0)) + ((y1-y0) * (y1-y0));
  let sfactor_sq = (1 / d) - 0.25;
  if (sfactor_sq < 0) { sfactor_sq = 0; }
  let sfactor = Math.sqrt(sfactor_sq);
  if (sweep === 1 && large === 1) { sfactor = -sfactor; }

  let xc = (0.5 * (x0 + x1)) - (sfactor * (y1-y0));
  let yc = (0.5 * (y0 + y1)) + (sfactor * (x1-x0));

  let th0 = Math.atan2(y0-yc, x0-xc);
  let th1 = Math.atan2(y1-yc, x1-xc);

  let th_arc = th1-th0;
  if (th_arc < 0 && sweep === 1) {
    th_arc += 2 * Math.PI;
  } else if (th_arc > 0 && sweep === 0) {
    th_arc -= 2 * Math.PI;
  }

  let segments = Math.ceil(Math.abs(th_arc / ((Math.PI * 0.5) + 0.001)));
  let result = [];

  let iterable = __range__(0, segments, false);
  for (let j = 0; j < iterable.length; j++) {
    let i = iterable[j];
    let th2 = th0 + ((i * th_arc) / segments);
    let th3 = th0 + (((i+1) * th_arc) / segments);
    result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th];
  }

  return result;
};

var segmentToBezier = function(cx, cy, th0, th1, rx, ry, sin_th, cos_th) {
  let a00 = cos_th * rx;
  let a01 = -sin_th * ry;
  let a10 = sin_th * rx;
  let a11 = cos_th * ry;

  let th_half = 0.5 * (th1 - th0);
  let t = ((8 / 3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5)) / Math.sin(th_half);
  let x1 = (cx + Math.cos(th0)) - (t * Math.sin(th0));
  let y1 = cy + Math.sin(th0) + (t * Math.cos(th0));
  let x3 = cx + Math.cos(th1);
  let y3 = cy + Math.sin(th1);
  let x2 = x3 + (t * Math.sin(th1));
  let y2 = y3 - (t * Math.cos(th1));

  return [
    (a00 * x1) + (a01 * y1),   (a10 * x1) + (a11 * y1),
    (a00 * x2) + (a01 * y2),   (a10 * x2) + (a11 * y2),
    (a00 * x3) + (a01 * y3),   (a10 * x3) + (a11 * y3)
  ];
};

SVGElement.parsers['path'] = SVGPath;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}