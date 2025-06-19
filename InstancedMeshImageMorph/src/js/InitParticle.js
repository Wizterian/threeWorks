// ver.2 scrollTrigger
import {
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  InstancedMesh,
  InstancedBufferAttribute,
  DoubleSide,
} from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default class InitParticle {
  constructor(three) {
    this.three = three
    this.imesh = null;
    this.icount = 0; // 分割数

    this.images = null;
    this.material = null; // transition & tilt
    this.allPositions = []; // 3 positions for each image

    // for tilt
    this.targetMouse = new Vector2();
    this.easedMouse = new Vector2();

    // for transition
    this.imageIndex = 0;
    this.intervalTime = 3;
    this.scrollTrigger = null;
  }

  init(images) {
    this.images = images;

    /**************************
     * Canvasのフィット
     */

    const texAspect = images[0].image.width / images[0].image.height;

    // カメラのFOVとZ位置から縦方向のworld空間での高さを計算
    const halfFovRad = (this.three.camera.fov * Math.PI) / 180 / 2;
    const visibleHeight = 2 * Math.tan(halfFovRad) * this.three.camera.position.z;

    // CSSのCoverと同様の挙動：縦にfit、横は見切れてOK
    const height = visibleHeight;
    const width = height * texAspect;

    /**************************
     * パーティクル（タイル）設定
     */

    // サイズ、分割数、UVのスケールを設定
    const targetTilesY = 200; // タイル分割数
    const size = visibleHeight / targetTilesY; // 縦方向にfit

    const nx = Math.ceil(width / size); // 横の分割数
    const ny = Math.ceil(height / size); // 縦の分割数
    this.icount = nx * ny; // 全分割数

    // 分割に合わせて画像サイズをスケーリング
    const uvScale = new Vector2(1 / nx, 1 / ny);
    // uvの理解（https://chatgpt.com/share/682ad72e-1db0-8010-b2c1-66063b09be3c）

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

    const geometry = new PlaneGeometry(size, size);
    geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsets, 2)); // オフセットは固有なので属性に

    // Meshの生成
    const mesh = new InstancedMesh(geometry, null, this.icount);

    // Instanced Meshを配置する座標生成
    const allPositions = []; // すべての画像の座標配列

    this.images.forEach((image, imageIndex) => {

      const position = new Float32Array(this.icount * 3); // 個別の画像の座標配列

      // cover fit した plane の幅 (width) はすでに計算済み
      const width = height * texAspect; // cover fit 挙動に基づいた plane 幅（world unit）

      // cover fit に使っている画像のピクセル幅
      const textureWidthPx = images[imageIndex].image.width;

      // ピクセル → world unit 換算 (画像基準)
      const pixelToWorldUnit = width / textureWidthPx;

      // デザイナー指定ピクセル（画像基準でのオフセット）
      const designerOffsetX_px = 300;
      const offsetX_world = designerOffsetX_px * pixelToWorldUnit;

      // imageIndex に応じた配置
      let offsetX = 0;
      const mod = imageIndex % 3;
      if (mod === 1) offsetX = +offsetX_world;
      else if (mod === 2) offsetX = -offsetX_world;

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

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uUvScale: new Uniform(uvScale),
        uTextureFrom: new Uniform(this.images[this.imageIndex]),
        uTextureTo: new Uniform(this.images[(this.imageIndex + 1) % this.images.length]),
        uProgress: new Uniform(0),
        uHalfHeight: new Uniform(window.innerHeight * .5),
        uHalfWidth: new Uniform(window.innerWidth * .5),
        uMouse: new Uniform(new Vector2(0, 0)),
      },
      transparent: true,
      side: DoubleSide,
    });

    mesh.material = this.material; // マテリアル適用
    this.imesh = mesh;
    this.three.scene.add(mesh); // シーンに追加

    this.mouseAction();
    // this.countUpIndex();

    this.setScrollTrigger(); // ★ ScrollTrigger を追加

    this.updateTextures(0, 1);
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

    if (this.scrollTriggers) {
      this.scrollTriggers.forEach(t => t.kill());
      this.scrollTriggers = [];
    }

    this.init(this.images);
  }

  setScrollTrigger() {
    // ScrollTrigger 再設定時の cleanup
    if (this.scrollTriggers) this.scrollTriggers.forEach(t => t.kill())
    this.scrollTriggers = [];

    const sections = document.querySelectorAll('.section');
    const maxIndex = this.images.length - 1;
    this.imageIndex = 0;
    let fromIndex = 0;
    let toIndex = 1;

    sections.forEach((section, index) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top+=5% top',
        end: 'bottom-=5% top',
        scrub: true,
        onEnter: () => {
          console.log("onEnter:", index);
          fromIndex = index === maxIndex ? index - 1 : index;
          toIndex = Math.min(index + 1, maxIndex);
          this.updateTextures(fromIndex, toIndex);
        },
        onEnterBack: () => {
          console.log("onEnterBack:", index);
          if (index + 1 === maxIndex) return;
          fromIndex = index;
          toIndex = index === 0 ? index + 1 : index - 1;
          this.updateTextures(fromIndex, toIndex);
        },
        onUpdate: (self) => {
          this.material.uniforms.uProgress.value = self.progress;
        },
        markers: true,
      });

      this.scrollTriggers.push(trigger);
    });
  }

  updateTextures(fromIndex, toIndex) {
    this.imageIndex = fromIndex;
    const nextIndex = toIndex;

    this.material.uniforms.uTextureFrom.value = this.images[fromIndex];
    this.material.uniforms.uTextureTo.value = this.images[nextIndex];

    this.imesh.geometry.setAttribute(
      'aFromPosition',
      new InstancedBufferAttribute(this.allPositions[fromIndex], 3)
    );
    this.imesh.geometry.setAttribute(
      'aToPosition',
      new InstancedBufferAttribute(this.allPositions[nextIndex], 3)
    );
  }

  animate(time) {
    this.easedMouse.lerp(this.targetMouse, 0.1);
    this.material.uniforms.uMouse.value.copy(this.easedMouse);
  }
}