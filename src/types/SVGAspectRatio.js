import SVGTransform from '../types/SVGTransform';

class SVGAspectRatio {
  static parse(value = '') {
    value = value.replace(/[\s\r\t\n]+/gm, ' ') // single spaces
           .replace(/^defer\s/, '')             // ignore defer
           .split(' ');

    let align = value[0] || 'xMidYMid';
    let meetOrSlice = value[1] || 'meet';

    return new SVGAspectRatio(align, meetOrSlice);
  }

  constructor(align, meetOrSlice) {
    this.align = align;
    this.meetOrSlice = meetOrSlice;
  }

  getTransform(viewBox, width, height) {
    let transform = new SVGTransform;
    if ((viewBox == null) || (width == null) || (height == null)) {
      return transform;
    }

    let [x, y, logicalWidth, logicalHeight] = viewBox;
    let logicalRatio = logicalWidth / logicalHeight;
    let physicalRatio = width / height;
    let scaleX = width / logicalWidth;
    let scaleY = height / logicalHeight;

    if (this.align === 'none') {
      transform.scale(scaleX, scaleY);
      transform.translate(-x, -y);
      return transform;
    }

    if ((logicalRatio < physicalRatio && this.meetOrSlice === 'meet') || (logicalRatio >= physicalRatio && this.meetOrSlice === 'slice')) {
      transform.scale(scaleY, scaleY);

      switch (this.align) {
        case 'xMinYMin':
        case 'xMinYMid':
        case 'xMinYMax':
          transform.translate(-x, -y);
          break;

        case 'xMidYMin':
        case 'xMidYMid':
        case 'xMidYMax':
          transform.translate(-x - (logicalWidth - width * logicalHeight / height) / 2, -y);
          break;

        default:
          transform.translate(-x - (logicalWidth - width * logicalHeight / height), -y);
      }

    } else {
      transform.scale(scaleX, scaleX);

      switch (this.align) {
        case 'xMinYMin':
        case 'xMidYMin':
        case 'xMaxYMin':
          transform.translate(-x, -y);
          break;

        case 'xMinYMid':
        case 'xMidYMid':
        case 'xMaxYMid':
          transform.translate(-x, -y - (logicalHeight - height * logicalWidth / width) / 2);
          break;

        default:
          transform.translate(-x, -y - (logicalHeight - height * logicalWidth / width));
      }
    }

    return transform;
  }

  apply(ctx, viewBox, width, height) {
    this.getTransform(viewBox, width, height).apply(ctx);
  }
}

export default SVGAspectRatio;