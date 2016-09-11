import fs from 'fs';
import Path from 'path';

export default class SVGDocument {
  constructor(path) {
    if (path) {
      this.path = Path.normalize(path);
    }

    this.documentElement = null;
    this.defs = {};
  }

  getElementById(id) {
    // check defs first for performance
    if (this.defs[id]) {
      return this.defs[id];
    }

    // loop through all child nodes looking for the node
    return this.documentElement.getElementById(...arguments);
  }

  draw(ctx) {
    this.documentElement.draw(ctx);
  }
}

// include supported elements
import './SVGPath';
import './SVGPolygon';
import './SVGPolyline';
import './SVGCircle';
import './SVGEllipse';
import './SVGLine';
import './SVGRect';
import './SVGDefs';
import './SVGUse';
import './SVGGradient';
import './SVGClipPath';
import './SVGImage';
import './SVGText';
