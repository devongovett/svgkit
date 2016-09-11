import SVGTransform from './SVGTransform';

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
    
  apply(ctx, viewBox, width, height) {
    if ((viewBox == null) || (width == null) || (height == null)) { return; }
    
    let [x, y, logicalWidth, logicalHeight] = viewBox;
    let logicalRatio = logicalWidth / logicalHeight;
    let physicalRatio = width / height;
    
    // clip to the viewBox
    ctx.rect(x, y, logicalWidth, logicalHeight);
    ctx.clip();
    
    if (this.align === 'none') {
      ctx.scale(width / logicalWidth, height / logicalHeight);
      ctx.translate(-x, -y);
      return;
    }
      
    if ((logicalRatio < physicalRatio && this.meetOrSlice === 'meet') || (logicalRatio >= physicalRatio && this.meetOrSlice === 'slice')) {
      ctx.scale(height / logicalHeight);
      
      switch (this.align) {
        case 'xMinYMin': case 'xMinYMid': case 'xMinYMax':
          return ctx.translate(-x, -y);
        
        case 'xMidYMin': case 'xMidYMid': case 'xMidYMax':
          return ctx.translate(-x - ((logicalWidth - ((width * logicalHeight) / height)) / 2), -y);
          
        default:
          return ctx.translate(-x - (logicalWidth - ((width * logicalHeight) / height)), -y);
      }
          
    } else {
      ctx.scale(width / logicalWidth);
    
      switch (this.align) {
        case 'xMinYMin': case 'xMidYMin': case 'xMaxYMin':
          return ctx.translate(-x, -y);
        
        case 'xMinYMid': case 'xMidYMid': case 'xMaxYMid':
          return ctx.translate(-x, -y - ((logicalHeight - ((height * logicalWidth) / width)) / 2));
      
        default:
          return ctx.translate(-x, -y - (logicalHeight - ((height * logicalWidth) / width)));
      }
    }
  }
}
    
export default SVGAspectRatio;