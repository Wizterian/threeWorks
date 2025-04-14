import DomLoaded from './js/common/DomLoaded.js';
import App from './App.js';
// import SubClass from './sub/SubClass.js';

class Entry {
  constructor() {
    new App();
  }
}

(function() {
  new DomLoaded(Entry);
}());
