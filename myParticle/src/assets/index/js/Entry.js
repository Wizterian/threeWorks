import DomLoaded from '../../common/js/libs/DomLoaded.js';
import { createApp } from 'vue';
import OtherSliderApp from './parts/OtherSliderApp.vue';
// import SubClass from './sub/SubClass.js';
import particle from './parts/particle.js';

class Entry {
    constructor() {
        // new SubClass();
        createApp(OtherSliderApp).mount('#stageSlider');
    }
}

// import DocumentReady from '../../common/js/utils/DocumentReady';
// import PickupSlider from './site/PickupSlider';
// import EnterAnime from './site/EnterAnime';
// import KVparticle from './site/KVparticle';
// import KVconfetti from './site/KVconfetti';
// import KVanimation from './site/KVanimation';

// /**
//  * エントリーポイント
//  */
// class Entry {
//   constructor() {
//     new PickupSlider();
//     new EnterAnime();
//     new KVparticle({
//       target: 'js-particle',
//       pNum: 15, // パーティクル数
//       maxDelay: 4, // ディレイ（秒）
//       minSize: 10, // サイズ（px）
//       maxSize: 40,
//       minDur: 2, // 持続（秒）
//       maxDur: 4,
//       minHue: 0, // hsl色域（0〜360）
//       maxHue: 360,
//       minOpc: 0.5, // 透明度（0〜1）
//       maxOpc: 0.9,
//       maxBlr: 2 // ぼかし（px）
//     });
//     new KVconfetti({
//       target: 'js-confetti',
//       pNum: 35, // パーティクル数
//       minSize: 40, // サイズ（px）
//       maxSize: 80,
//       minDur: 40, // 持続（秒）
//       maxDur: 55,
//       maxBlr: 0 // ぼかし（px）
//     });
//     new KVanimation();
//   }
// }

(function() {
  new DomLoaded(Entry);
}());
