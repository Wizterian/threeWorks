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
} from 'three'
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
    // 切り替え用
    this.images = null;
    this.material = null;
    this.allPositions = [];
    this.tempMatrix = new Matrix4(); // 座標・回転・スケールを管理
    this.tempPos = new Vector3(); // 座標移動用
    this.tempQuat = new Quaternion(); // 回転なし
    this.tempScale = new Vector3(1, 1, 1); // スケールなし
    this.icount = 0;
  }

  init(images) {
    this.images = images;

    /**************************
     * Canvasのフィット
     */

    // アスペクト比
    const texAspect = images[0].image.width / images[0].image.height;
    const screenAspect = window.innerWidth / window.innerHeight;

    // Containの挙動
    let width, height;
    if (screenAspect > texAspect) { // 画面のほうが横長な場合
      height = this.three.shortEdge; // 高さを基準にする
      width = height * texAspect;
    } else { // 画面のほうが縦長な場合
      width = this.three.shortEdge; // 画像の横を基準にする
      height = width / texAspect;
    }

    // パーティクル（タイル）のサイズ、分割数、UVのスケールを設定
    const size = 10;
    const nx = Math.floor(width / size);
    const ny = Math.floor(height / size);
    this.icount = nx * ny;
    const uvScale = new Vector2(1 / nx, 1 / ny); // 分割したテクスチャのUVスケール

    // 各粒子の左下をオフセットとして設定
    const uvOffsets = new Float32Array(this.icount * 2);
    let index = 0;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        uvOffsets[index * 2 + 0] = i / nx;
        uvOffsets[index * 2 + 1] = j / ny;
        index++;
      }
    }

    /**************************
     * Instanced Meshの生成
     */

    // PlaneGeometryの生成
    const geometry = new PlaneGeometry(size, size);

    // 属性を追加
    geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsets, 2));

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
    });

    // Meshの生成
    const mesh = new InstancedMesh(geometry, this.material, this.icount);

    /**************************
     * Instanced Meshの移動座標生成
     */

    const allPositions = [];

    this.images.forEach((image, imageIndex) => {
      const position = [];

      let offsetX = 0;
      const mod = imageIndex % 3;
      if (mod === 1) offsetX = +300;
      else if (mod === 2) offsetX = -300;

      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const x = -width / 2 + i * size + size / 2 + offsetX;
          const y = -height / 2 + j * size + size / 2;
          const z = 0;

          position.push(new Vector3(x, y, z));
        }
      }

      allPositions.push(position);
    });
    this.allPositions = allPositions;

    this.three.scene.add(mesh);
    this.imesh = mesh;

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

  updateTexture(fromIndex, toIndex) {
    this.material.uniforms.uTextureFrom.value = this.images[fromIndex];
    this.material.uniforms.uTextureTo.value = this.images[toIndex];

    gsap.fromTo(
      this.material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 3,
        ease: "power2.inOut",
        onComplete: () => {
          this.material.uniforms.uProgress.value = 0;
          this.material.uniforms.uTextureFrom.value = this.images[toIndex];
        }
      }
    );
  }

  // 座標管理
  updateTransition(fromIndex, toIndex) {
    const positionsFrom = this.allPositions[fromIndex];
    const positionsTo = this.allPositions[toIndex];

    const progressObj = { progress: 0 };

    gsap.to(progressObj, {
      progress: 1,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = progressObj.progress;

        for (let i = 0; i < this.icount; i++) {
          this.tempPos.lerpVectors(positionsFrom[i], positionsTo[i], t);
          this.tempMatrix.compose(this.tempPos, this.tempQuat, this.tempScale);
          this.imesh.setMatrixAt(i, this.tempMatrix);
        }

        this.imesh.instanceMatrix.needsUpdate = true;
      }
    });
  }

  applyTransition(fromIndex, toIndex) {
    this.updateTexture(fromIndex, toIndex);
    this.updateTransition(fromIndex, toIndex);
  }

  animate(time) {
    // const elapsedTime = this.clock.getElapsedTime();
    // particles.material.uniforms.uTime.value = elapsedTime;
  }

  _debug() {
    const particles = this.particles

    const gui = new GUI({ width: 340 })
    gui
      .add(particles.material.uniforms.uProgress, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uProgress')

    particles.morph0 = () => { particles.morph(0) }
    particles.morph1 = () => { particles.morph(1) }
    particles.morph2 = () => { particles.morph(2) }
    gui.add(particles, 'morph0')
    gui.add(particles, 'morph1')
    gui.add(particles, 'morph2')
  }

}