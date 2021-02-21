const cp = require('child_process');
const path = require('path');

const ANT_DIR = path.join(__dirname, 'ant');

function run(args, options) {
  if (!Array.isArray(args)) {
    args = [args];
  }
  if (typeof(options) == 'string') {
    options = {
      dir: options
    };
  } else if (!options) {
    options = {};
  }

  let procOpts = {
    shell: true,
    stdio: ['ignore', 'inherit', 'inherit']
  };
  if (options.dir) {
    procOpts.cwd = options.dir;
  }

  let cmd = path.join(ANT_DIR, 'bin', 'ant');
  if (process.platform != 'win32') {
    args = [cmd].concat(args);
    cmd = '/bin/sh';
  }

  let proc = cp.spawn(cmd, args, procOpts);
  return new Promise((ok, fail) => {
    proc.on('error', fail);
    proc.on('close', (code, signal) => {
      if (signal) {
        fail(`exited with signal ${signal}`);
      } else if (code) {
        fail(`exited with code ${code}`);
      } else {
        ok()
      }
    });
  });
}

module.exports = run;
