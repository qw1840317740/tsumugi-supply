// Load the browser i18n dictionaries (assets/js/i18n.js) in Node for static page generation.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = function loadI18n() {
  const file = path.resolve(__dirname, '..', 'assets/js/i18n.js');
  const noop = () => {};
  const sandbox = {
    window: {}, console, location: { pathname: '/', search: '', hash: '' },
    localStorage: { getItem: () => null, setItem: noop },
    document: { documentElement: { setAttribute: noop }, querySelectorAll: () => [], addEventListener: noop },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(file, 'utf8')}\n;globalThis.__L = L; globalThis.__META = LANG_META;`, sandbox);
  return { L: sandbox.__L, META: sandbox.__META };
};
