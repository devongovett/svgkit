import SVGElement from './SVGElement';
import SVGTransform from '../types/SVGTransform';
import SVGLength from '../types/SVGLength';

class SVGText extends SVGElement {
  parse() {
    this.parseStyle();
    this.transform = SVGTransform.parse(this.attributes.transform);

    this.x = this.parseUnits('x', 0);
    this.y = this.parseUnits('y', 0);

    this.spans = [];
    // return (() => {
    //   let result = [];
    //   for (let i = 0; i < this.node.childNodes.length; i++) {
    //     let node = this.node.childNodes[i];
    //     let item;
    //     if (node.nodeType === 3 || node.nodeName === 'TSPAN') {
    //       item = this.spans.push(new SVGTextSpan(this.document, this, node));
    //     }
    //     result.push(item);
    //   }
    //   return result;
    // })();

    for (let node of this.childNodes) {
      if (node instanceof SVGTextSpan) {
        this.spans.push(node);
      } else if (node.text) {
        let span = new SVGTextSpan(this.document, this, 'tspan', {});
        span.childNodes.push(node);
        span.parse();
        this.spans.push(span);
      }
    }
  }

  getWidth(ctx) {
    let width = 0;
    for (let i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      width += span.getWidth(ctx);
    }

    return width;
  }

  draw(ctx, clip) {
    if (this.style.display === 'none' || this.style.visibility === 'hidden') { return; }

    if (!clip) { ctx.save(); }

    let {x,y} = this;
    for (let i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      if (span.x != null) { ({ x } = span); }
      if (span.y != null) { ({ y } = span); }

      span.draw(ctx, clip, x, y);
      x += span.getWidth(ctx);
    }

    if (!clip) { return ctx.restore(); }
  }
}

SVGElement.parsers['text'] = SVGText;

class SVGTextSpan extends SVGElement {
  parse() {
    this.text = '';
    for (let node of this.childNodes) {
      this.text += node.text;
    }

    this.x = this.parseUnits('x');
    this.y = this.parseUnits('y');

    var space = this.attributes['xml:space'] || this.parentNode.attributes['xml:space'];
    if (space !== 'preserve') {
      this.text = this.text.trim();
    }
  }

  getWidth(ctx) {
    return ctx.widthOfString(this.text || '');
  }

  applyStyles(ctx) {
    super.applyStyles(...arguments);
    return ctx.fontSize(this.style.fontSize);
  }

  draw(ctx, clip = false, x, y) {
    if (this.style.display === 'none' || this.style.visibility === 'hidden') { return; }

    if (!clip) { ctx.save(); }
    this.applyStyles(ctx);

    switch (this.style.textAnchor) {
      case 'middle':
        x -= this.getWidth(ctx) / 2;
        break;

      case 'end':
        x -= this.getWidth(ctx);
        break;
    }

    switch (this.style.baselineShift) {
      case 'baseline':
        y = y; // do nothing
        break;

      case 'sub':
        y += ctx.currentLineHeight() * 0.7; // TODO: get from font info
        break;

      case 'super':
        y -= ctx.currentLineHeight() * 0.7;
        break;

      default:
        let value = SVGLength.parse(this.document, this.style.baselineShift);
        if (value) {
          let v = __guard__(value, x1 => x1.toPixels(this.document, 'baselineShift', 'objectBoundingBox'));
          if (value.isPercentage()) {
            v *= ctx.currentLineHeight();
          }

          y -= v;
        }
    }

    y -= ctx.currentLineHeight();
    ctx.text(this.text, x, y, {lineBreak: false});

    if (!clip) { return ctx.restore(); }
  }
}

SVGElement.parsers['tspan'] = SVGText;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}