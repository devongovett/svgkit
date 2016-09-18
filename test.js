import SVGParser from './src/SVGParser';
import fs from 'fs';
import CanvasContext from './src/CanvasContext';
import Canvas from 'canvas';
import async from 'async';
import {resemble} from 'resemble';
import del from 'del';

var canvas = null;
var ctx = null;
var first = true;
var count = 0;
var pass = 0;

del.sync('tests/out/*.png');

let tests = process.argv.slice(2);
console.log(tests)

if (tests.length === 0) {
  tests = fs.readdirSync('tests/svg').map(t => 'tests/svg/' + t);
}

async.forEachSeries(tests, (file, next) => {
  if (!/\.svg$/.test(file) || !fs.existsSync(file.replace('/svg', '/png').replace('.svg', '.png'))) {
    return next();
  }

  test(file, next);
}, err => {
  if (err) {
    console.error('ERROR', err);
  }

  console.log(count, pass, pass / count * 100)
});

function test(file, next) {
  console.log('Processing test ' + file);

  fs.createReadStream(file)
    .pipe(new SVGParser(file))
    .once('finish', function () {
      if (this.document.width === 0 || this.document.height === 0) {
        console.error('zero width or height');
        return next();
      }

        canvas = new Canvas(this.document.width, this.document.height);
        ctx = new CanvasContext(canvas.getContext('2d'), Canvas.Image);

      this.document.draw(ctx);

      first = false;

      count++;
      let actual = canvas.toBuffer();

      resemble(actual).compareTo(file.replace('/svg', '/png').replace('.svg', '.png')).ignoreAntialiasing().onComplete(function(data) {
        if (+data.misMatchPercentage > 0) {
          console.log('BAD RESULT:', data.misMatchPercentage)
          fs.writeFileSync(file.replace('/svg', '/out').replace('.svg', '.png'), actual);
        } else {
          pass++;
        }

        next();
      });
    });
}
