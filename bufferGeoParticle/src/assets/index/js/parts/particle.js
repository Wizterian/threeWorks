import {
  Scene,
  PerspectiveCamera,
  // OrthographicCamera,
  WebGLRenderer,
  // Color,
  BoxGeometry,
  PlaneGeometry,
  // MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  AmbientLight,
  DirectionalLight,
  Mesh,
  DoubleSide,
  Clock,
  Vector3,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

class ThreeScene {
  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.cameraParam = {
      fov: 75,
      near: 0.1,
      far: 500,
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

    if('OrthographicCamera' === this.camera.type) {
      this.camera.left = this.width / - 2
      this.camera.right = this.width / 2
      this.camera.top = this.height / 2
      this.camera.bottom = this.height / - 2
    }

    // this.camera.fov = Math.atan(this.height / 2 / this.cameraParam.z) * 2 * (180 / Math.PI)
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

class MeshObject {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.clock = new Clock()
  }

  init() {
    const meshScale = 50
    const geometry = new BoxGeometry( 1, 1, 1 )
    // const geometry = new PlaneGeometry(1, 1, 100, 100)
    const material = new MeshStandardMaterial({
      side: DoubleSide,
      color: 0xff0000
    })
    this.cube = new Mesh( geometry, material )
    this.cube.scale.set(meshScale, meshScale, meshScale)

    const ambientLight = new AmbientLight(0xffffff, 1)
    const directionalLight = new DirectionalLight(0xff00ff, 1)
    directionalLight.position.set(0, 1, 1)

    this.threeScene.scene.add(
      this.cube,
      ambientLight,
      directionalLight
    )
  }

  animate() {
    const delta = this.clock.getDelta()

    this.cube.rotation.x += delta
    this.cube.rotation.y += delta
  }
}

class ParticleBufferGeo {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.clock = new Clock()
  }

  init() {
    const SIZE = 100; // 範囲
    const LENGTH = 1000; // 個数
    const vertices = [];
    for (let i = 0; i < LENGTH; i++) {
      const x = SIZE * (Math.random() - 0.5);
      const y = SIZE * (Math.random() - 0.5);
      const z = SIZE * (Math.random() - 0.5);
      vertices.push(x, y, z);
    }

    const geometry = new BufferGeometry();
    // 透明度、サイズなども追加する
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

    // 画像に変えられるようにする
    const material = new PointsMaterial({
      size: 3,
      color: 0xffffff,
    });

    const mesh = new Points(geometry, material);
    this.threeScene.scene.add(mesh);


    // const meshScale = 50
    // const geometry = new BoxGeometry( 1, 1, 1 )
    // // const geometry = new PlaneGeometry(1, 1, 100, 100)
    // const material = new MeshStandardMaterial({
    //   side: DoubleSide,
    //   color: 0xff0000
    // })
    // this.cube = new Mesh( geometry, material )
    // this.cube.scale.set(meshScale, meshScale, meshScale)

    // const ambientLight = new AmbientLight(0xffffff, 1)
    // const directionalLight = new DirectionalLight(0xff00ff, 1)
    // directionalLight.position.set(0, 1, 1)

    // this.threeScene.scene.add(
    //   this.cube,
    //   ambientLight,
    //   directionalLight
    // )
  }

  animate() {
    const delta = this.clock.getDelta()

    this.cube.rotation.x += delta
    this.cube.rotation.y += delta
  }
}

(() => {
  const threeScene = new ThreeScene()
  threeScene.init()
  // const meshObject = new MeshObject(threeScene)
  // meshObject.init()
  const particleGeo = new ParticleBufferGeo(threeScene)
  particleGeo.init()

  window.addEventListener("resize", () => {
    threeScene.resize()
  })

  const animate = () => {
    window.requestAnimationFrame(() => {
      threeScene.animate()
      // meshObject.animate()

      animate()
    })
  }
  animate()
})()


// 非同期で画像読み込む
// ロード完了後emitでload完了を通知
// three.jsのinitを実行