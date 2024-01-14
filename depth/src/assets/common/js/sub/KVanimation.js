/**
 *
 * アニメーション
 *
 */

import gsap from 'gsap';
import Randoms from '../../../common/js/utils/Randoms';

export default class KVanimation {
  constructor() {
    // KV IMGs in CSS
    this.IMG_ARR = [
      '/monst-freak/2021/assets/index/img/kv/kv_char-01.png',
      '/monst-freak/2021/assets/index/img/kv/kv_char-02.png',
      '/monst-freak/2021/assets/index/img/kv/kv_char-03.png',
      '/monst-freak/2021/assets/index/img/kv/kv_char-04.png',
      '/monst-freak/2021/assets/index/img/kv/kv_char-05.png',
      '/monst-freak/2021/assets/index/img/kv/kv_char-06.png',
      '/monst-freak/2021/assets/index/img/kv/kv_char-07.png',
      '/monst-freak/2021/assets/index/img/kv/kv_line-01.svg',
      '/monst-freak/2021/assets/index/img/kv/kv_line-02.svg',
      '/monst-freak/2021/assets/index/img/kv/kv_line-03.svg',
      '/monst-freak/2021/assets/index/img/kv/kv_line-04.svg',
      '/monst-freak/2021/assets/index/img/kv/kv_line-05.svg',
      '/monst-freak/2021/assets/index/img/kv/kv_line-06.svg',
      '/monst-freak/2021/assets/index/img/kv/kv_cloud.png',
      '/monst-freak/2021/assets/index/img/kv/kv_logo.png',
      '/monst-freak/2021/assets/index/img/kv/kv_logo-8th.png',
      '/monst-freak/2021/assets/index/img/kv/kv_title.png',
      '/monst-freak/2021/assets/index/img/kv/kv_confetti.png'
    ];
    this.IMG_ARR_LENGTH = this.IMG_ARR.length;

    // KV DOM
    this.kvEle = this.select('.tp-kv');
    this.kvCharLine = this.select('.tp-kv__charLine');
    this.kvLogo = this.select('.tp-kv__logo');
    this.kvTitle = this.select('.tp-kv__title');
    this.kvConfetti = this.select('.tp-kv__confetti');
    this.kvLoad = this.select('.tp-kvLoad');
    this.charNodes = this.selectAll('.tp-kv__char');
    this.charArr = [];
    for (let i = 0; i < 7; i += 1) this.charArr[i] = this.charNodes[i];
    this.charArr.reverse();
    this.kvLaod();
  }

  kvLaod() {
    let count = 0;
    for (let i = 0; i < this.IMG_ARR_LENGTH; i += 1) {
      const tmpImg = new Image();
      tmpImg.addEventListener('load', () => {  // eslint-disable-line
        count += 1;
        if (count === this.IMG_ARR_LENGTH) {
          this.kvEle.classList.add('ready');
          this.kvInit();
          this.kvLoad.addEventListener('transitionend', () => {
            this.kvLoad.style.display = 'none';
          });
        }
      });
      tmpImg.src = this.IMG_ARR[i];
    }
  }

  kvInit() {
    const TL_KV = gsap.timeline({
      onComplete: () => {
        this.charLoop();
      }
    });
    TL_KV
      .set(this.kvTitle, { scale: 4, opacity: 0 })
      .set(this.kvLogo, { scale: 0.1, opacity: 0 })
      .set(this.kvCharLine, { scale: 0.9, opacity: 0 })
      .set(this.kvConfetti, { opacity: 0, scale: 0.1 })
      .to(this.kvTitle, 1.5, {
        scale: 1,
        opacity: 1,
        ease: 'expo.in'
      })
      .to(this.kvLogo, 0.5, {
        opacity: 1,
        scale: 1,
        ease: 'elastic.out(1,0.5)'
      }, 1.5)
      .to(this.kvConfetti, 0.5, {
        opacity: 1,
        scale: 1,
        ease: 'expo.out'
      }, 1.5)
      .to(this.kvCharLine, 0.5, {
        scale: 1,
        opacity: 1,
        ease: 'expo.out'
      }, 1.7);

    // 線と同じ動きでスケーリング効果薄
    // 多要素が画面広域に動いて重い
    // const CHAR_TL = gsap.timeline();
    // for (let i = 0; i < 7; i += 1) {
    //   let perX = '';
    //   let perY = '';
    //   const evenOdd = i % 2;
    //   perX = evenOdd === 0 ? '-10%' : '10%';
    //   if (i === 0) perX = 0;
    //   perY = `${i * 20}%`;
    //   CHAR_TL
    //     .from(this.charArr[i], 0.5, {
    //       x: perX,
    //       y: perY,
    //       opacity: 0,
    //       ease: 'expo.out'
    //     }, 1.58);
    // }
  }

  charLoop() {
    const CHAR_TL = gsap.timeline();
    for (let i = 0; i < 7; i += 1) {
      CHAR_TL
        .to(this.charArr[i], 3, {
          y: '8%',
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        }, i * 0.3)
        .to(this.charArr[i], Randoms.floorMaxMin(8, 5), {
          x: '7%',
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        }, i * 0.3);
    }
  }

  select(string) {
    return document.querySelector(string);
  }

  selectAll(string) {
    return document.querySelectorAll(string);
  }
}
