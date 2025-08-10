import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  TextureLoader,
  ShaderMaterial,
  PlaneGeometry,
  InstancedMesh,
  DoubleSide,
  Vector2,
  InstancedBufferAttribute,
} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

class ImageTransition {
  constructor({ canvas, textureSources, sections }) {
    this.canvas = canvas;
    this.textureSources = textureSources;
    this.sections = sections;
    this.renderer = new WebGLRenderer({ canvas, alpha: true });
    this.renderer.setClearColor(0x000000);
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    this.camera.position.z = 2;
    this.loader = new TextureLoader();
    this.textures = [];
    this.currentIndex = 0;
    this.mesh = null;
    this.vertexShader = null;
    this.fragmentShader = null;
    this.uniforms = this.initUniforms();
    this.transitionTimeline = gsap.timeline({ paused: true });
    this.transitionTimeline.play();
    this.transitionQueue = [];
    this.isTransitioning = false;
    this.init();
  }

  initUniforms() {
    return {
      uTexture1: { value: null },
      uTexture2: { value: null },
      uProgress: { value: 0.0 },
      uResolution: { value: new Vector2() },
      uImageResolution: { value: new Vector2() },
      uUvScale: { value: new Vector2(1, 1) },
      uHalfWidth: { value: 0 },
      uHalfHeight: { value: 0 },
    };
  }

  updateImgSize(imgW, imgH) {
    this.uniforms.uImageResolution.value.set(imgW, imgH);
  }

  async loadShader(url) {
    const response = await fetch(url);
    return await response.text();
  }

  async init() {
    const results = await Promise.all(this.textureSources.map(src => this.loadTexture(src)));

    // Shaderのプリロード
    this.vertexShader = await this.loadShader('vertex.glsl');
    this.fragmentShader = await this.loadShader('fragment.glsl');
    // this.vertexShader = document.getElementById('vertexShader').textContent;
    // this.fragmentShader = document.getElementById('fragmentShader').textContent;

    // テクスチャの設定
    this.textures = results.map(r => r.texture);
    this.uniforms.uTexture1.value = this.textures[0];
    this.uniforms.uTexture2.value = this.textures[1];
    this.updateImgSize(results[0].width, results[0].height);

    this.setupCameraAndRenderer();
    this.createInstancedMesh();
    this.setupObserver(results);
    this.setupResizeHandler();
    this.startRenderLoop();
  }

  loadTexture(src) {
    return new Promise(resolve => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        const texture = this.loader.load(src, () => resolve({ texture, width: img.naturalWidth, height: img.naturalHeight }));
      };
    });
  }

  setupCameraAndRenderer() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.uniforms.uResolution.value.set(innerWidth, innerHeight);
  }

  setupObserver(results) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const newIndex = [...this.sections].indexOf(entry.target);
          if (newIndex !== this.currentIndex) {
            this.transitionTo(newIndex, results[newIndex].width, results[newIndex].height);
          }
        }
      });
    }, { threshold: 0.5 });

    this.sections.forEach(section => observer.observe(section));
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.setupCameraAndRenderer();

      if (this.mesh) {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
      }

      this.createInstancedMesh();
    });
  }

  startRenderLoop() {
    const render = () => {
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
    render();
  }

  createInstancedMesh() {
    const ny = 100; // 縦分割数
    const distance = this.camera.position.z;
    const fov = this.camera.fov * Math.PI / 180; // カメラのFOVとZ位置から縦方向のworld空間の高さ
    const height = 2 * Math.tan(fov / 2) * distance;
    const width = height * this.camera.aspect;

    // タイルの一辺を正方形に
    const sizeY = height / ny;
    const sizeX = sizeY;
    const nx = Math.ceil(width / sizeX); // 横分割数を再計算
    const pCount = nx * ny;

    // CSS coaver挙動にあうようにUVをスケーリング
    const uvScale = new Vector2(1 / nx, 1 / ny);
    this.uniforms.uUvScale.value.copy(uvScale);

    // ウィンドウサイズ（解像度）
    this.uniforms.uHalfWidth.value = width / 2;
    this.uniforms.uHalfHeight.value = height / 2;

    const uvOffsets = new Float32Array(pCount * 2); // 適切な画像範囲を指定するUVオフセット
    const instanceOffsets = new Float32Array(pCount * 3); // インスタンスを配置する中心座標

    let index = 0;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const x = -width / 2 + i * sizeX + sizeX / 2;
        const y = -height / 2 + j * sizeY + sizeY / 2;
        instanceOffsets.set([x, y, 0], index * 3);
        uvOffsets.set([i / nx, j / ny], index * 2);
        index++;
      }
    }

    const geometry = new PlaneGeometry(sizeX, sizeY);
    geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsets, 2));
    geometry.setAttribute('instanceOffset', new InstancedBufferAttribute(instanceOffsets, 3));

    const material = new ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uUvScale: { value: uvScale },
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: false,
      side: DoubleSide
    });

    this.mesh = new InstancedMesh(geometry, material, pCount);
    this.scene.add(this.mesh);
  }

  transitionTo(newIndex, width, height) {
    if (newIndex === this.currentIndex) return;
    // キューをクリアして最新だけ追加
    this.transitionQueue = [{ newIndex, width, height }];
    this.runTransitionQueue();
  }

  runTransitionQueue() {
    console.log('this.isTransitioning: ', this.isTransitioning);
    if (this.isTransitioning || this.transitionQueue.length === 0) return;

    const { newIndex, width, height } = this.transitionQueue.shift();
    this.isTransitioning = true;

    this.transitionTimeline = gsap.timeline();
    this.transitionTimeline.to(this.uniforms.uProgress, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
      onStart: () => {
        this.uniforms.uTexture1.value = this.textures[this.currentIndex];
        this.uniforms.uTexture2.value = this.textures[newIndex];
        this.updateImgSize(width, height);
        this.currentIndex = newIndex;
      },
      onComplete: () => {
        this.uniforms.uProgress.value = 0.0;
        this.uniforms.uTexture1.value = this.textures[this.currentIndex];
        this.isTransitioning = false;
        // 次のリクエストがあれば再生
        this.runTransitionQueue();
      }
    });
  }

}

const canvas = document.querySelector('#webgl');
const sections = document.querySelectorAll('section');
const textureSources = [
  // 'https://picsum.photos/id/1015/512/512',
  // 'https://picsum.photos/id/1020/512/512',
  // 'https://picsum.photos/id/1035/512/512'

  // 'https://picsum.photos/id/20/1024/1024',
  // 'https://picsum.photos/id/237/1024/1024',
  // 'https://picsum.photos/id/270/1024/1024'

  './images/p01.jpg',
  './images/p02.jpg',
  './images/p03.jpg'
];

new ImageTransition({ canvas, textureSources, sections });