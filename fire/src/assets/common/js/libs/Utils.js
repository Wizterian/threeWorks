import {
  Vector3
} from 'three'
/****************************************
DOM選択関数
*/

/**
 * 単一クエリーセレクター
 * @param {String} string - HTMLタグ・クラス・ID
 * @return {HTMLElement} - HTML要素
 */
export function select (string) {
  return document.querySelector(string);
};

/**
 * 複数クエリーセレクター
 * @param {String} string - HTMLタグ・クラス・ID
 * @return {HTMLElement} - HTML配列要素
 */
export function selectAll (string) {
  return document.querySelectorAll(string);
};

/****************************************
数字整形
*/

/**
 * 与えられた数値以下の最大の整数を返す
 * @param {Number} num - 小数点を含む数字
 * @return {Number} - 与えられた数値以下の最大の整数
 */
 export function floor (num) {
  return Math.floor(num);
};

/****************************************
ランダム生成関数
*/

/**
 * 範囲内で乱数を生成
 * @param {Number} max - 最大値
 * @param {Number} min - 最小値
 * @return {Number} - 少数点を含む範囲内の乱数
 */
export function randomRange (max, min) {
  return Math.random() * (max - min) + min;
};

/**
 * 0を中心に正〜負の乱数生成
 * @param {Number} num - 範囲-n〜+nのn
 * @return {Number} - -n〜+n範囲の乱数
 */
export function randomCenter (num) {
  return Math.random() * (num * 2) - num;
};

/**
 * X軸両端に強く分布
 */
export function randomBothSides () {
  const base = Math.random() * Math.random() * Math.random();
  const inverse = 1.0 - base;
  const randomSideX = Math.random() < 0.5 ? base : inverse;
  const tmpPosX = Math.floor((randomSideX * this.screenW) - this.windowHalfX);
  return tmpPosX;
};

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getDeg(radian) {
  return radian / Math.PI * 180;
}

export function getRad(degrees) {
  return degrees * Math.PI / 180;
}

export function getSpherePos(rad1, rad2, r) {
  var x = Math.cos(rad1) * Math.cos(rad2) * r;
  var z = Math.cos(rad1) * Math.sin(rad2) * r;
  var y = Math.sin(rad1) * r;
  return new Vector3(x, y, z);
}