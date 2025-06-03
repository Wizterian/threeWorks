import {
  Scene,
  PerspectiveCamera,
  // OrthographicCamera,
  WebGLRenderer,
  Vector3,
  AxesHelper,
  Color,
  LinearFilter,
  ClampToEdgeWrapping,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import LoadImage from './js/common/LoadImage.js';
// import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
// import Lenis from 'lenis'
import InitParticle from './js/InitParticle.js';
// gsap.registerPlugin(ScrollTrigger)

export default class ThreeScene {
  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)
    this.viewWidth = 1280
    this.cameraParam = {
      fov: 45,
      near: 0.1,
      far: this.viewWidth * 3,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: this.viewWidth * 1,
    }
    this.scene = null
    this.camera = null
    this.renderer = null
    this.stats = null
    this.isInitialized = false

    this.shortEdge = Math.min(window.innerWidth, window.innerHeight);
  }

  init () {
    this._setScene()
    this._setRenderer()
    this._setCamera()
    this._setControl()
    this._setStats()
    this.isInitialized = true
  }
  _setStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
  }
  _setScene() {
    this.scene = new Scene()
  }

  _setCamera() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

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

    this.camera.fov = Math.atan(this.height / 2 / this.cameraParam.z) * 2 * (180 / Math.PI)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.width, this.height)
  }

  _setControl() {
    this.orbitcontrols = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    this.orbitcontrols.enableDamping = true

    const axesHelper = new AxesHelper( 500 );
    this.scene.add( axesHelper );
  }

  _setRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true
    })
    this.renderer.setSize( this.width, this.height )
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(new Color(0x000000))
    document.querySelector('.webgl').appendChild(this.renderer.domElement )
  }

  resize() {
    this._setCamera()
    this.shortEdge = Math.min(this.width, this.height);
  }

  animate() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera)
    this.stats.end();
  }
}

(() => {
  const loadImages = new LoadImage()

  loadImages
    .init([
      // "glow.png",
      // "picture-5.png",
      // "picture-6.png",
      // "picture-7.jpg",
      "picture-8.png",
      "picture-9.png",
      "picture-10.png",
    ])
    .then(images => {
      images.forEach(tex => {
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.wrapS = ClampToEdgeWrapping;
        tex.wrapT = ClampToEdgeWrapping;
      });
      init(images)
    })
  const init = images => {

    // Initilization
    const threeScene = new ThreeScene()
    threeScene.init()
    const initParticle = new InitParticle(threeScene)
    initParticle.init(images)

    // 一定時間でフェード切り替え
    let index = 0;
    const intervalTime = 5000;
    setInterval(() => {
      const from = index;
      const to = (index + 1) % images.length;
      initParticle.applyTransition(from, to, intervalTime);
      index = to;
    }, intervalTime);

    // Resize
    window.addEventListener("resize", () => {
      threeScene.resize()
      initParticle.resize();
    })

    // Animation
    // const lenis = new Lenis()
    const animate = () => {
      window.requestAnimationFrame(time => {
        // lenis.raf(time)
        // ScrollTrigger.update()

        threeScene.animate()
        initParticle.animate()
        animate()
      })
    }
    animate()
  }
})()