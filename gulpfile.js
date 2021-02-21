const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gunzip = require('gulp-gunzip')
const untar = require('gulp-untar');
const ignore = require('gulp-ignore');
const rename = require('gulp-rename');
const del = require('del');
const fetch = require('node-fetch');
const {promisify} = require('util');
const pump = promisify(require('pump'));

const BASE_URL = 'https://apache.osuosl.org/ant/binaries/'
const ANT_VERSION = '1.10.9';
const TARBALL = `apache-ant-${ANT_VERSION}-bin.tar.gz`;
const TAR_PATH = path.join(__dirname, TARBALL);

async function download() {
  
  if (fs.existsSync(TARBALL)) return true;
  let url = BASE_URL + TAR_PATH;
  let res = await fetch(url);
  let out = fs.createWriteStream(TAR_PATH);
  return pump([res.body, out]);
}

async function unpack() {
  return pump([
    gulp.src(TAR_PATH),
    gunzip(),
    untar(),
    rename((path) => {
      return {
        dirname: path.dirname.replace(/^apache-ant-[0-9.]+[\\\/]?/, ''),
        basename: path.basename,
        extname: path.extname
      }
    }),
    ignore.exclude('manual/**'),
    gulp.dest(path.join(__dirname, 'ant'))
  ])
}

async function clean() {
  return del(path.join(__dirname, 'ant'));
}

const build = gulp.series(download, unpack);

module.exports = {
  download, unpack, clean, build
}
