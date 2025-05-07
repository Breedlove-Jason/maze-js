// quokka.js
const { JSDOM } = require('jsdom');

const { window } = new JSDOM(`<!doctype html><html><body></body></html>`);

global.window = window;
global.document = window.document;
global.navigator = { userAgent: 'node.js' };

module.exports = {
  babel: true, // Inherit Babel config
  env: {
    type: 'node', // Use Node.js env, plus jsdom to simulate browser
  },
  files: [
    'src/**/*.js',
  ],
};
