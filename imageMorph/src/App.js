import {
  Scene,
  PerspectiveCamera,
  // OrthographicCamera,
  WebGLRenderer,
  Vector3,
  AxesHelper,
  Color,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import LoadImage from './js/common/LoadImage.js';
import InitParticle from './js/InitParticle.js';
// import TreeImage from './classes/TreeImage.js';
// import SnowEmitter from './classes/SnowEmitter.js';
// import ShootingStar from './classes/ShootingStar.js';
// import Smoke from './classes/Smoke.js';
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
    // setPixelRatioがいるかも

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
    // if(!this.camera) return
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
  }

  animate() {
    this.stats.begin();
    this.stats.end();
    this.renderer.render(this.scene, this.camera)
  }
}

(() => {
  const loadImages = new LoadImage()
  // const updateFlg = true

  loadImages
    .init([
      // "glow.png",
      "picture-5.png",
      "picture-6.png",
      "picture-7.jpg",
    ])
    .then(images => init(images))
  const init = images => {
    const threeScene = new ThreeScene()
    threeScene.init()
    const initParticle = new InitParticle(threeScene)
    initParticle.init(images)
    // Planeに画像を読み込み（別ファイル化）
      // 透明pngを使う 3つ
      // 座標を取得 配列だったか確認
      //



    // 参照後消す
    // const treeImage = new TreeImage(threeScene)
    // treeImage.init(images)
    // const snowEmitter = new SnowEmitter(threeScene)
    // snowEmitter.init(images)
    // const shootingStar = new ShootingStar(threeScene)
    // shootingStar.init(images)

    window.addEventListener("resize", () => {
      threeScene.resize()
      // treeImage.resize()
    })

    const animate = () => {
      window.requestAnimationFrame(() => {
        threeScene.animate()
        initParticle.animate()
        // snowEmitter.animate()
        // shootingStar.update()
        animate()
      })
    }
    animate()
  }
})()