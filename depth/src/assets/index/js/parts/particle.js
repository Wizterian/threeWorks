import {
  Scene,
  PerspectiveCamera,
  // OrthographicCamera,
  WebGLRenderer,
  // Color,
  // BoxGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  Mesh,
  DoubleSide,
  Clock,
  Vector3,
  ShaderMaterial,
  TextureLoader,
  Vector2
} from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class ThreeScene {
  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.cameraParam = {
      fov: 70,
      near: 0.1,
      far: 1000,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 100
    }
    this.scene = null
    this.camera = null
    this.renderer = null
    this.isInitialized = false
  }

  init () {
    this._setScene()
    this._setRenderer()
    this._setCamera()
    // this._setControl()
    this.isInitialized = true
  }

  _setScene() {
    this.scene = new Scene()
  }

  _setCamera() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    if (!this.isInitialized) {
      this.camera = new PerspectiveCamera(
        this.cameraParam.fov,
        this.width / this.height,
        this.cameraParam.near,
        this.cameraParam.far
      )

      // this.camera = new OrthographicCamera(
      //   this.width / - 2,
      //   this.width / 2,
      //   this.height / 2,
      //   this.height / - 2,
      //   1,
      //   1000
      // )
      this.camera.position.set(
        this.cameraParam.x,
        this.cameraParam.y,
        this.cameraParam.z
      )
      this.camera.lookAt(this.cameraParam.lookAt)
    }

    // this.camera.fov = Math.atan(this.height / 2 / this.cameraParam.z) * 2 * (180 / Math.PI)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.width, this.height)
  }

  _setControl() {
    // if(!this.camera) return
    this.orbitcontrols = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    this.orbitcontrols.enableDamping = true
  }

  _setRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true
    })
    this.renderer.setSize( this.width, this.height )
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // this.renderer.setClearColor(new Color(0x000000))
    document.querySelector('.webgl').appendChild(this.renderer.domElement )
  }

  resize() {
    this._setCamera()
  }

  animate() {
    this.renderer.render(this.scene, this.camera)
  }
}

class PlaneObject {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.clock = new Clock()
    this.mouse = new Vector2()
    const canvas = document.querySelector("canvas")
    canvas.addEventListener("mousemove", this._mouseAction.bind(this))
    this.plane = null
  }

  init(images) {
    const meshScale = 100
    const geometry = new PlaneGeometry(2, 2, 10, 10)
    const material = new ShaderMaterial({
      // wireframe: true,
      side: DoubleSide,
      // color: 0xff0000,
      uniforms: {
        resolution: {value: new Vector2(window.innerWidth, window.innerHeight)},
        imageResolution: { value: new Vector2(7455, 4579)},
        uTex: {value: new TextureLoader().load(images[0].src)},
        uTexDepth: {value: new TextureLoader().load(images[1].src)},
        uMouse: {value: this.mouse},
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec2 vUv;
        uniform vec2 resolution;
        uniform vec2 imageResolution;
        uniform sampler2D uTex;
        uniform sampler2D uTexDepth;
        uniform vec2 uMouse;

        void main(){

          // If the UV value is below 1, the texture becomes larger and can cover the window. (The value of 1 fits the window exactly)
          vec2 ratio = vec2(
            min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
            min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
          );

          // When the UV value is below 1, it needs to be centered with the number by subtracting the ratio from 1 (100%)
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );

          vec4 tex = texture2D(uTex, uv);
          vec4 texDepth = texture2D(uTexDepth, uv);
          vec4 color = texture2D(uTex, uv + (uMouse -vec2(0.5)) *0.02 * texDepth.r);
          gl_FragColor = color;
        }
      `,
    })
    this.plane = new Mesh( geometry, material )
    this.plane.scale.set(meshScale*1.6, meshScale, meshScale)

    const ambientLight = new AmbientLight(0xffffff, 1)
    const directionalLight = new DirectionalLight(0xff00ff, 1)
    directionalLight.position.set(0, 1, 1)

    this.threeScene.scene.add(
      this.plane,
      ambientLight,
      directionalLight
    )
  }

  resize() {
    this.plane.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  animate() {
    const delta = this.clock.getDelta()
    this.plane.rotation.x += delta
    this.plane.rotation.y += delta
  }

  _mouseAction(event) {
    const el = event.currentTarget;

    const x = event.clientX;
    const y = event.clientY;
    const w = el.offsetWidth; // canvas width
    const h = el.offsetHeight; // canvas height

    this.mouse.x = x / w; // left to right (0 to 1)
    this.mouse.y = 1 - y / h; // bottom to up (0 to 1)
  }
}

class loadImage {
  constructor() {
    this.imagePaths = []
  }
  init(imgPaths) {
    this.imagePaths = [...imgPaths]
    return Promise.all(this.imagePaths.map(path => this.loadImage(path)));
  }
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
      img.src = url;
    });
  }
}

(() => {
  const loadImages = new loadImage()
  const updateFlg = true
  loadImages
    .init([
      "/assets/index/img/tree.png",
      "/assets/index/img/tree_mask.png"
    ])
    .then(images => init(images))
  const init = images => {
    const threeScene = new ThreeScene()
    threeScene.init()
    const planeObject = new PlaneObject(threeScene)
    planeObject.init(images)

    window.addEventListener("resize", () => {
      threeScene.resize()
      planeObject.resize()
    })

    const animate = () => {
      window.requestAnimationFrame(() => {
        threeScene.animate()
        // planeObject.animate()
        animate()
      })
    }
    animate()
  }
})()