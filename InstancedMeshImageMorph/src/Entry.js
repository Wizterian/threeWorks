import DomLoaded from './js/common/DomLoaded.js';
import App from './App.js';

class Entry {
  constructor() {
    new App();
  }
}

(function() {
  new DomLoaded(Entry);
}());
