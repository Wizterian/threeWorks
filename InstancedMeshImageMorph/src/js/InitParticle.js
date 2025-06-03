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
  lerp,
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

    this.images = null;
    this.material = null; // transition & tilt
    this.allPositions = []; // 3 positions for each image

    // for tilt
    this.targetMouse = new Vector2();
    this.easedMouse = new Vector2();

    // --- 管理用インデックス ---
    this.imageIndex = 0; // 現在表示中の画像インデックス
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
        uHalfHeight: new Uniform(window.innerHeight * .5),
        uHalfWidth: new Uniform(window.innerWidth * .5),
        uMouse: new Uniform(new Vector2(0, 0)), // Tilt
      },
      transparent: true,
      side: DoubleSide,
    });

    // Meshの生成
    const mesh = new InstancedMesh(geometry, this.material, this.icount);

    // Instanced Meshを配置する座標生成
    const allPositions = []; // すべての画像の座標配列

    this.images.forEach((image, imageIndex) => {

      const position = new Float32Array(this.icount * 3); // 個別の画像の座標配列

      let offsetX = 0; // 左右に配置
      const mod = imageIndex % 3;
      if (mod === 1) offsetX = +300;
      else if (mod === 2) offsetX = -300;

      let index = 0;
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const x = -width / 2 + i * size + size / 2 + offsetX;
            // ワールド座乗の中心を左下へ（-width / 2）
            // 1分割を左から並べる（+ i * size）
            // 1分割の中心を左下へ（+ size / 2）
          const y = -height / 2 + j * size + size / 2;
          const z = 0;

          position[index * 3 + 0] = x;
          position[index * 3 + 1] = y;
          position[index * 3 + 2] = z;

          index++;
        }
      }

      allPositions.push(position);
    });
    this.allPositions = allPositions;

    // シーンに追加
    this.three.scene.add(mesh);
    this.imesh = mesh;

    this.applyTransition(0, 1, 0, true);
    this.mouseAction();
  }

  mouseAction() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
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

  applyTransition(fromIndex, toIndex, intervalTime, skipAnimation = false) {
    // リセット
    this.material.uniforms.uProgress.value = 0; // 進行度

    // フェードの設定
    this.material.uniforms.uTextureFrom.value = this.images[fromIndex];
    this.material.uniforms.uTextureTo.value = this.images[toIndex];

    this.imesh.geometry.setAttribute(
      'aFromPosition',
      new InstancedBufferAttribute(this.allPositions[fromIndex], 3)
    );
    this.imesh.geometry.setAttribute(
      'aToPosition',
      new InstancedBufferAttribute(this.allPositions[toIndex], 3)
    );

    // init直後はtransitionしない
    if (skipAnimation) {
      this.material.uniforms.uProgress.value = 0;
      this.imageIndex = toIndex; // 初期化時にもインデックス更新
      return;
    }

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
        onComplete: () => {
          // フェードの設定
          this.material.uniforms.uTextureFrom.value = this.images[toIndex];
          this.imageIndex = toIndex; // 完了時に次の画像インデックスを保持
        }
      }
    );
  }

  animate(time) {
    this.easedMouse.lerp(this.targetMouse, 0.1);
    this.material.uniforms.uMouse.value.copy(this.easedMouse);
  }
}
