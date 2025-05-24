import {
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  InstancedMesh,
  InstancedBufferAttribute,
  Vector3,
  Matrix4,
  Quaternion,
  Clock,
  DoubleSide,
} from 'three'
import {
  pseudoRandom2D,
  smoothstep,
} from './common/Utils.js';
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default class InitParticle {
  constructor(three) {
    this.three = three
    this.clock = new Clock()
    this.imesh = null;
    this.icount = 0; // 分割数
    // 切り替え用
    this.images = null;
    this.material = null;
    this.allPositions = [];
    // 座標・回転・スケールを管理
    this.tempMatrix = new Matrix4(); // 座標・回転・スケールを管理
    this.tempPos = new Vector3(); // 座標移動用
    this.tempQuat = new Quaternion(); // 回転なし
    this.tempScale = new Vector3(1, 1, 1); // スケールなし
    this.imageCenters = []; // 画像の中心座標を格納
  }

  init(images) {
    this.images = images;

    /**************************
     * Canvasのフィット
     */

    // 画像とウィンドウのアスペクト比を求める
    const texAspect = images[0].image.width / images[0].image.height;
    const screenAspect = window.innerWidth / window.innerHeight;

    // CSSのContainと同様の挙動
    let width, height;
    if (screenAspect > texAspect) { // ウィンドウが横長な場合
      height = this.three.shortEdge; // 高さを基準にする
      width = height * texAspect;
    } else { // ウィンドウが縦長な場合
      width = this.three.shortEdge; // 画像の横を基準にする
      height = width / texAspect;
    }

    /**************************
     * パーティクル（タイル）設定
     */

    // サイズ、分割数、UVのスケールを設定
    const size = 5; // 一辺のサイズ
    const nx = Math.floor(width / size); // 横の分割数
    const ny = Math.floor(height / size); // 縦の分割数
    this.icount = nx * ny; // 全分割数

    // 分割に合わせて画像サイズをスケーリング
    const uvScale = new Vector2(1 / nx, 1 / ny);
      // 1分割内の1枚の画像の表示範囲（左下基準）
      // uvの理解について https://chatgpt.com/share/682ad72e-1db0-8010-b2c1-66063b09be3c

    // パーティクル（タイル）の位置に合わせてオフセット
    const uvOffsets = new Float32Array(this.icount * 2);
    // 1分割内の1枚の画像の表示位置をずらす（左下基準）
    let index = 0;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        uvOffsets[index * 2 + 0] = i / nx; // 正規化されているのでn/nxで計算可
        uvOffsets[index * 2 + 1] = j / ny;
        index++;
      }
    }

    /**************************
     * Instanced Meshの生成
     */

    // PlaneGeometryの生成
    const geometry = new PlaneGeometry(size, size);
    geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsets, 2)); // オフセットは固有なので属性に追加

    // Materialの生成
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uUvScale: new Uniform(uvScale),
        uTextureFrom: new Uniform(this.images[0]),
        uTextureTo: new Uniform(this.images[1]),
        uProgress: new Uniform(0),
      },
      transparent: true,
      side: DoubleSide,
    });

    // Meshの生成
    const mesh = new InstancedMesh(geometry, this.material, this.icount);

    // Instanced Meshを配置する座標生成
    const allPositions = []; // すべての画像の座標配列

    this.images.forEach((image, imageIndex) => {

      const position = []; // 個別の画像の座標配列

      let offsetX = 0; // 左右に配置
      const mod = imageIndex % 3;
      if (mod === 1) offsetX = +300;
      else if (mod === 2) offsetX = -300;

      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const x = -width / 2 + i * size + size / 2 + offsetX;
          // ワールド座乗の中心を左下へ（-width / 2）
          // 1分割を左から並べる（+ i * size）
          // 1分割の中心を左下へ（+ size / 2）
          const y = -height / 2 + j * size + size / 2;
          const z = 0;

          position.push(new Vector3(x, y, z));
        }
      }
      allPositions.push(position);

      this.imageCenters.push(new Vector3(offsetX, 0, 0));
    });
    this.allPositions = allPositions;

    // シーンに追加
    this.three.scene.add(mesh);
    this.imesh = mesh;

    // Instanced Meshを配置
    for (let i = 0; i < this.icount; i++) {
      const pos = this.allPositions[0][i];
      this.tempMatrix.compose(pos, this.tempQuat, this.tempScale);
      this.imesh.setMatrixAt(i, this.tempMatrix);
    }
    this.imesh.instanceMatrix.needsUpdate = true;
  }

  resize() {
    // 旧インスタンスを削除（Instanced Meshは都度初期化が必須）
    if (this.imesh) {
      this.three.scene.remove(this.imesh);
      this.imesh.geometry.dispose();
      this.imesh.material.dispose();
      this.imesh = null;
    }

    // 再生成
    this.init(this.images);
  }

  applyTransition(fromIndex, toIndex, intervalTime) {

    // フェードの設定
    this.material.uniforms.uTextureFrom.value = this.images[fromIndex];
    this.material.uniforms.uTextureTo.value = this.images[toIndex];

    // トランジション座標の更新
    const positionsFrom = this.allPositions[fromIndex];
    const positionsTo = this.allPositions[toIndex];
    const angleMax = Math.PI * 2; // 最大ねじれ角度（360度）

    gsap.fromTo(
      this.material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: intervalTime / 1000,
        ease: "power4.inOut",
        onUpdate: () => {
          const t = this.material.uniforms.uProgress.value;
          const duration = 0.3; // 全体の長さ1に対するDelayの長さ

          for (let i = 0; i < this.icount; i++) {

            // Y軸を正規化
            const fromY = positionsFrom[i].y; // Delay開始時のY座標
            const halfHeight = this.three.shortEdge / 2;
            const normalizedY = (fromY + halfHeight) / (2 * halfHeight); // Y座標を正規化
            const centerWeight = 3.0;
            // let delay = (1.0 - duration) * (1.0 - normalizedY); // 上からdelay
            let delay = (1.0 - duration) * Math.pow(1.0 - normalizedY, centerWeight);
            delay = Math.min(Math.max(delay, 0), 1 - duration);

            const end = delay + duration;
            const localProgress = smoothstep(delay, end, t); // 個別進行度
            const visibility = Math.sin(localProgress * Math.PI); // ばらけに使用

            // 基本の線形補間（遷移中の基準になる座標）
            this.tempPos.lerpVectors(positionsFrom[i], positionsTo[i], localProgress);

            // ねじれの進行度に応じた回転角
            const angle = localProgress * angleMax;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const center = this.imageCenters[fromIndex]; // 回転の中心座標

            // 2D回転行列はグローバルの原点を元に計算されるので原点に移動
            const relativeX = this.tempPos.x - center.x;
            const relativeZ = this.tempPos.z - center.z;

            // 中心を基準に回転（Y軸周り、時計回りの2D回転行列野の公式）
            const rotatedX = relativeX * cosA - relativeZ * sinA;
            const rotatedZ = relativeX * sinA + relativeZ * cosA;

            // ばらけさせる
            const randX = pseudoRandom2D(this.tempPos.x, this.tempPos.y);
            const randY = pseudoRandom2D(this.tempPos.y, this.tempPos.x);
            const randZ = pseudoRandom2D(this.tempPos.z, this.tempPos.y);
            const strength = 300.0;
            const offsetX = (randX - 0.5) * 2 * strength * visibility;
            const offsetY = (randY - 0.5) * 2 * strength * visibility;
            const offsetZ = (randZ - 0.5) * 2 * strength * visibility;

            // 元の中心に戻す
            this.tempPos.x = rotatedX + center.x + offsetX;
            this.tempPos.y = this.tempPos.y + offsetY;
            this.tempPos.z = rotatedZ + center.z + offsetZ;

            this.tempMatrix.compose(this.tempPos, this.tempQuat, this.tempScale);
            this.imesh.setMatrixAt(i, this.tempMatrix);
          }

          this.imesh.instanceMatrix.needsUpdate = true;
        },
        onComplete: () => {
          // フェードの設定
          this.material.uniforms.uTextureFrom.value = this.images[toIndex];

          // 進行度をリセット
          this.material.uniforms.uProgress.value = 0;
        }
      }
    );
  }

  animate(time) {
    // const elapsedTime = this.clock.getElapsedTime();
    // particles.material.uniforms.uTime.value = elapsedTime;
  }
}