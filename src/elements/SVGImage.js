import SVGElement from './SVGElement';
import SVGAspectRatio from '../types/SVGAspectRatio';
import path from 'path';
import BBox from '../types/BBox';
import SVGPoint from '../types/SVGPoint';
import SVGParser from '../SVGParser';
import fs from 'fs';

let DATA_URL_RE = /^data:image\/(?:jpeg|jpg|png);base64,/;
// /

class SVGImage extends SVGElement {
  parse() {
    this.x = this.parseUnits('x', 0);
    this.y = this.parseUnits('y', 0);
    this.width = this.parseUnits('width');
    this.height = this.parseUnits('height');
    this.href = this.attributes['xlink:href'];
    this.preserveAspectRatio = SVGAspectRatio.parse(this.attributes.preserveAspectRatio);
  }

  getBoundingBox() {
    return [this.x, this.y, this.x + this.width, this.y + this.height];
  }

  render(ctx) {
    if (this.width === 0 || this.height === 0) {
      return;
    }

    let src = null;
    if (DATA_URL_RE.test(this.href)) {
      src = this.href.replace(/[\r\n]/g, '');
    } else if (!/^(http:)|#/.test(this.href)) {
      let filePath = path.resolve(this.xmlBase, this.href);
      if (/.svg$/.test(filePath)) {
        return this.renderSVG(filePath, ctx);
      }

      src = fs.readFileSync(filePath);
    } else {
      // Invalid URL
      return;
    }

    let img = ctx.getImageSize(src);
    this.applyTransform(ctx, img.width, img.height);
    ctx.image(src, 0, 0);
  }

  renderSVG(file, ctx) {
    // Detect cycles
    if (file === this.document.path || this.document.parents.indexOf(file) !== -1) {
      return;
    }

    let parser = new SVGParser(file, this.width, this.height);
    let contents = fs.readFileSync(file, 'utf8');
    parser.end(contents);

    parser.document.parents = this.document.parents.concat(this.document.path);

    this.applyTransform(ctx, parser.document.width, parser.document.height);
    parser.document.draw(ctx);
  }

  applyTransform(ctx, nativeWidth, nativeHeight) {
    ctx.translate(this.x, this.y);
    if (this.style.overflow === 'hidden' || this.style.overflow === 'scroll') {
      ctx.rect(0, 0, this.width, this.height);
      ctx.clip();
    }

    let viewBox = new BBox(0, 0, nativeWidth, nativeHeight);
    this.preserveAspectRatio.apply(ctx, viewBox, this.width, this.height);
  }
}

SVGElement.parsers['image'] = SVGImage;
