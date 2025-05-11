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
    this.texture = null;
  }

  init(images) {
    const texture = this.texture = images[0];
    const size = 10;
  
    // アスペクト比
    const texAspect = texture.image.width / texture.image.height;
    const screenAspect = window.innerWidth / window.innerHeight;
  
    // shortEdge は短辺として渡ってきている前提
    let width, height;
    if (screenAspect > texAspect) { // 画面のほうが横長な場合
      height = this.three.shortEdge; // 高さを基準にする
      width = height * texAspect;
    } else { // 画面のほうが縦長な場合
      width = this.three.shortEdge; // 画像の横を基準にする
      height = width / texAspect;
    }
  
    const nx = Math.floor(width / size);
    const ny = Math.floor(height / size);
    const icount = nx * ny;
  
    const uvScale = new Vector2(1 / nx, 1 / ny); // 各粒子が表示すべき領域サイズ

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
  
    const geometry = new PlaneGeometry(size, size);
    geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsets, 2));
  
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: new Uniform(texture),
        uUvScale: new Uniform(uvScale),
      },
      transparent: true,
    });
  
    const mesh = new InstancedMesh(geometry, material, icount);
  
    const dummy = new Object3D();
    index = 0;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        dummy.position.set(
          -width / 2 + i * size + size / 2,
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
    console.log("resize");
    // 旧インスタンスを削除
    if (this.imesh) {
      this.three.scene.remove(this.imesh);
      this.imesh.geometry.dispose();
      this.imesh.material.dispose();
      this.imesh = null;
    }

    // 再生成
    this.init([this.texture]);
  }

  animate(time) {
    // const particles = this.particles

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