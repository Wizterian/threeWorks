import DomLoaded from '../../common/js/libs/DomLoaded.js';
import { createApp } from 'vue';
// import SubClass from './sub/SubClass.js';
import particle from './parts/particle.js';

class Entry {
    constructor() {
      new particle();
        // new SubClass();
        // createApp(OtherSliderApp).mount('#stageSlider');
    }
}

(function() {
  new DomLoaded(Entry);
}());
