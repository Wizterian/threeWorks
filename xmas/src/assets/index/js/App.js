import {
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  Vector3,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import LoadImage from './utils/LoadImage.js';
import TreeImage from './classes/TreeImage.js';
import SnowEmitter from './classes/SnowEmitter.js';
// import Smoke from './classes/Smoke.js';


export default class ThreeScene {
  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.worldRange = 100
    this.cameraParam = {
      fov: 70,
      near: 0.1,
      far: this.worldRange * 10,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 10//this.worldRange
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
    this._setControl()
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

(() => {
  const loadImages = new LoadImage()
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
    const treeImage = new TreeImage(threeScene)
    // treeImage.init(images)
    const snowEmitter = new SnowEmitter(threeScene)
    snowEmitter.init()
    // const smoke = new Smoke(threeScene)
    // smoke.init()

    window.addEventListener("resize", () => {
      threeScene.resize()
      // treeImage.resize()
    })

    const animate = () => {
      window.requestAnimationFrame(() => {
        threeScene.animate()
        snowEmitter.animate()
        // treeImage.animate()
        animate()
      })
    }
    animate()
  }
})()