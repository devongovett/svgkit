import fs from 'fs';
import Path from 'path';
import CSSOM, {CSSStyleDeclaration} from 'cssom';
import NWMatcher from 'nwmatcher';

// include supported elements
import './elements/SVGNode';
import './elements/SVGPath';
import './elements/SVGPolygon';
import './elements/SVGPolyline';
import './elements/SVGCircle';
import './elements/SVGEllipse';
import './elements/SVGLine';
import './elements/SVGRect';
import './elements/SVGDefs';
import './elements/SVGUse';
import './elements/SVGGradient';
import './elements/SVGClipPath';
import './elements/SVGImage';
import './elements/SVGText';
import './elements/SVGMarker';
import './elements/Style';
import SVGElement from './elements/SVGElement';

export default class SVGDocument {
  constructor(path) {
    if (path) {
      this.path = Path.resolve(path);
    }

    this.documentElement = null;
    this.defs = {};
    this.styleSheets = [];
  }

  init(documentElement) {
    this.documentElement = documentElement;
    this.NW = NWMatcher({
      document: this
    });
  }

  createElement(tagName) {
    return new SVGElement(this, null, tagName, {})
  }

  getElementById(id) {
    // check defs first for performance
    if (this.defs[id]) {
      return this.defs[id];
    }

    // loop through all child nodes looking for the node
    return this.documentElement.getElementById(...arguments);
  }

  get width() {
    return this.documentElement.width;
  }

  get height() {
    return this.documentElement.height;
  }

  draw(ctx) {
    this.documentElement.draw(ctx);
  }

  getComputedStyle(element) {
    let css = new CSSStyleDeclaration;
    for (let sheet of this.styleSheets) {
      for (let rule of sheet.cssRules) {
        let selectors = (rule.selectorText || '').split(/((?:[^,"']|"[^"]*"|'[^']*')+)/);
        for (let selectorText of selectors) {
          if (selectorText !== '' && selectorText !== ',' && element.matchesSelector(selectorText)) {
            for (let prop of Array.from(rule.style)) {
              css.setProperty(prop, rule.style.getPropertyValue(prop), rule.style.getPropertyPriority(prop));
            }

            break;
          }
        }
      }
    }

    let style = new CSSStyleDeclaration;
    style.cssText = element.attributes.style || '';

    for (let prop of Array.from(style)) {
      css.setProperty(prop, style.getPropertyValue(prop), style.getPropertyPriority(prop));
    }

    return css;
  }
}
