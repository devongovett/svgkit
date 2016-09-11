import PDFDocument from 'pdfkit';
import SVGParser from './src/SVGParser';
import fs from 'fs';

let pdf = new PDFDocument;
pdf.pipe(fs.createWriteStream('out.pdf'));

fs.createReadStream('test/window.svg')
  .pipe(new SVGParser)
  .once('finish', function () {
    this.document.draw(pdf);
    pdf.end();
  });
