import {
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  InstancedMesh,
  InstancedBufferAttribute,
  Object3D,
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
    this.currentIndex = 0;
    this.nextIndex = 1;
    this.material = null;
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

    // パーティクル（タイル）のサイズ
    const size = 10;
    const nx = Math.floor(width / size);
    const ny = Math.floor(height / size);
    const icount = nx * ny;
    const uvScale = new Vector2(1 / nx, 1 / ny); // 分割したテクスチャのUVスケール

    // 各粒子の左下をオフセットとして設定
    const uvOffsets = new Float32Array(icount * 2);
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
    geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsets, 2));

    // Materialの生成
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        // uTexture: new Uniform(images[0]),
        uUvScale: new Uniform(uvScale),
        uTextureFrom: new Uniform(this.images[0]),
        uTextureTo: new Uniform(this.images[1]),
        uProgress: new Uniform(0),
      },
      transparent: true,
    });

    // Meshの生成
    const mesh = new InstancedMesh(geometry, this.material, icount);

    // Instanced Meshは移動、スケーリング、回転を都度指定が必須
    const dummy = new Object3D();
    index = 0;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        dummy.position.set(
          -width / 2 + i * size + size / 2, // 順番に並べて中心を基準にする
          -height / 2 + j * size + size / 2,
          0
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(index++, dummy.matrix);
      }
    }

    this.three.scene.add(mesh);
    this.imesh = mesh;
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

  updateTexture(index) {
    this.nextIndex = index;
    this.material.uniforms.uTextureFrom.value = this.images[this.currentIndex];
    this.material.uniforms.uTextureTo.value = this.images[this.nextIndex];

    gsap.fromTo(
      this.material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 3,
        ease: "power2.inOut",
        onComplete: () => {
          this.currentIndex = this.nextIndex;
          this.material.uniforms.uProgress.value = 0;
          this.material.uniforms.uTextureFrom.value = this.images[this.currentIndex];
        }
      }
    );
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