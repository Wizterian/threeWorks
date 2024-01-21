import DomLoaded from '../../common/js/libs/DomLoaded.js';
// import { createApp } from 'vue';
// import SubClass from './sub/SubClass.js';
import App from './App.js';

class Entry {
  constructor() {
    new App();
  }
}

(function() {
  new DomLoaded(Entry);
}());
