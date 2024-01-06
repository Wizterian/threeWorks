import {
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  Color,
  BoxGeometry,
  PlaneGeometry,
  BufferGeometry,
  BufferAttribute,
  MeshBasicMaterial,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  Mesh,
  DoubleSide,
  Clock,
  Vector3,
  ShaderMaterial,
  Texture,
  AdditiveBlending,
  Points
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './points.vs?raw'
import fragmentShader from './points.fs?raw'
import { getRandomInt, getRad, getDeg, getSpherePos, randomRange } from '../../../common/js/libs/Utils'

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
      z: 300
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
    this._setClock()
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
      this.camera = new PerspectiveCamera(70, this.width / this.height, .1, 1000)
      // this.camera = new OrthographicCamera(
      //   this.width / - 2,
      //   this.width / 2,
      //   this.height / 2,
      //   this.height / - 2,
      //   0.1,
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

    this.camera.fov = Math.atan(this.height / 2 / this.cameraParam.z) * 2 * (180 / Math.PI)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.width, this.height)
  }

  _setClock() {
    this.clock = new Clock();
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

  update() {
    this.renderer.render(this.scene, this.camera)
  }
}

class ParticleProps {
  constructor() {
    this.size = 0
    this.time = 0
    this.opacity = 0
    this.isActive = false
    this.velocity = new Vector3() // 速度・距離
    this.acceleration = new Vector3() // 加速度
  }
  init(vec) {
    this.velocity = vec.clone() // 独立したランダム初期値
    // this.anchor = vector.clone()
    this.acceleration.set(0, 0, 0)
    this.time = 0
    this.opacity = 0
    this.size = 0
  }
  activate() {
    this.isActive = true;
  }
  inactivate() {
    this.isActive = false;
  }
  updateVelocity() {
    this.velocity.add(this.acceleration);
  }
  applyForce(force) {
    this.acceleration.add(force);
  }
}

class ParticleBufferGeo {
  constructor() {
    this.geo = new BufferGeometry()
    this.mat = null
    this.obj = null
    this.velocity = new Vector3()
  }
  init(param) {
    this.mat = new ShaderMaterial({
      blending: param.blending,
      transparent: true,
      depthWrite: false,
      vertexShader: param.vertexShader,
      fragmentShader: param.fragmentShader,
      uniforms: {
        // uColor: { value: new Color(0xffff00) },
        uTexture: { value: param.texture }
      },
    })
    // this.mat = new MeshBasicMaterial({color: 0xffff00})
    this.geo.setAttribute('position', new BufferAttribute(param.positions, 3))
    this.geo.setAttribute('color', new BufferAttribute(param.colors, 3))
    this.geo.setAttribute('opacity', new BufferAttribute(param.opacities, 1))
    this.geo.setAttribute('size', new BufferAttribute(param.sizes, 1))

    this.obj = new Points(this.geo, this.mat)
    param.scene.add(this.obj)
  }
  update() {
    this.obj.position.copy(this.velocity) // 特に動かない（と思う）

    this.obj.geometry.attributes.position.needsUpdate = true
    this.obj.geometry.attributes.color.needsUpdate = true
    this.obj.geometry.attributes.opacity.needsUpdate = true
    this.obj.geometry.attributes.size.needsUpdate = true
  }
}

class ParticleEmitter {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.pNum = 1000
    this.pPropsArr = [] // props for each particle
    this.positions = new Float32Array(this.pNum * 3) // for BufferGeometry
    this.colors = new Float32Array(this.pNum * 3)
    this.opacities = new Float32Array(this.pNum)
    this.sizes = new Float32Array(this.pNum)
    this.gravity = new Vector3(0, 0.1, 0)
    // this.clock = new Clock()
    this.lastUpdatedTime = Date.now()
    this.pGeo = new ParticleBufferGeo()
  }
  init(images) {
    const texture = new Texture(images[0])
    // BufferGeometryで使う各particleを用意
    for (var i = 0; i < this.pNum; i++) {
      // パーティクル固有の属性生成
      const pProps = new ParticleProps() // 属性管理インスタンス
      const r = getRandomInt // 関数エイリアス
      const color = new Color('hsl('+r(0, 45) +','+r(60, 90)+'%, 75%)')
      pProps.init(new Vector3())

      // 属性管理インスタンス配列に追加
      this.pPropsArr.push(pProps)

      // BufferGeometry用配列を初期化（にのみ使用）
      this.positions[i * 3 + 0] = pProps.velocity.x
      this.positions[i * 3 + 1] = pProps.velocity.y
      this.positions[i * 3 + 2] = pProps.velocity.z
      color.toArray(this.colors, i * 3)
      this.opacities[i] = pProps.opacity
      this.sizes[i] = pProps.size
    }

    // BufferGeometry生成関数にパラメータを渡して初期化
    this.pGeo = new ParticleBufferGeo()
    this.pGeo.init({
      scene: this.threeScene.scene,
      vertexShader,
      fragmentShader,
      positions: this.positions,
      colors: this.colors,
      opacities: this.opacities,
      sizes: this.sizes,
      texture: texture.clone(),
      blending: AdditiveBlending
    })
  }
  update() {
    for (var i = 0; i < this.pPropsArr.length; i++) {
      const pProp = this.pPropsArr[i]
      if(pProp.isActive) {
        // 動きを更新
        pProp.time++ // = pProp.time + this.clock.getDelta()
        pProp.applyForce(this.gravity)
        pProp.updateVelocity()

        // 非活性処理
        if (pProp.time > 50) { // 50フレーム経ったら
          pProp.size -= 0.7; // サイズを減らす
          pProp.opacity -= 0.009; // 透明度を減らす
        }
        if (pProp.opacity <= 0) { // 完全に透明になったら初期化
          pProp.init(new Vector3()); // 中心に戻す
          pProp.inactivate();
        }
      }
      // 全体の属性を更新、shader用
      this.positions[i * 3 + 0] = pProp.velocity.x
      this.positions[i * 3 + 1] = pProp.velocity.y
      this.positions[i * 3 + 2] = pProp.velocity.z

      this.opacities[i] = pProp.opacity
      this.sizes[i] = pProp.size
    }
    this.pGeo.update()
  }
  // パーティクルが非活性なら初期値の設定・生成する
  activate() {
    let pCount = 0
    const currentTime = Date.now()
    const sphereR = 1
    const limitAtFrame = 6
    const baseSize = 20
    // 10ミリ秒ごとに6つづつ活性化
    if(currentTime - this.lastUpdatedTime > 10) {
      for (var i = 0; i < this.pPropsArr.length; i++) {
        const pProp = this.pPropsArr[i]

        if(pProp.isActive) continue // 活動中なら次のループ
        // 加速度を生成（球体座標系でランダム生成）
        // log（対数関数）
        // 小さい入力値に対しては大きな変化、大きい入力値に対しては小さな変化
        // 中心に偏差
        const radA = getRad(getRandomInt(0, 360))
        const radB = getRad(getRandomInt(0, 360))
        const range = Math.random() * 2 // 球状のランダムな位置
        const force = getSpherePos(radA, radB, range)

        // 初期位置を生成（円周上のランダムな位置・サイズ・透明度）
        // vector.add(this.pGeo.velocity) // bufGeo位置
        pProp.activate()
        pProp.init(new Vector3())
        pProp.applyForce(force)
        pProp.opacity = 0.2
        // https://chat.openai.com/share/fcde732c-4857-4d67-9bcd-55329836d611
        pProp.size = Math.pow(7 - range, 2) * getRandomInt(1, 3)
        // pProp.size = Math.random() + baseSize
        pProp.velocity.x = force.x * sphereR
        pProp.velocity.y = force.y * sphereR
        pProp.velocity.z = force.z * sphereR

        pCount++
        if (pCount >= limitAtFrame) break // 任意の数活性化
      }
      this.lastUpdatedTime = Date.now()
    }
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
    .init(["/assets/index/img/particle.png"])
    .then(images => init(images))
  const init = images => {
    const threeScene = new ThreeScene()
    threeScene.init()
    const particles = new ParticleEmitter(threeScene)
    particles.init(images)

    window.addEventListener("resize", () => {
      threeScene.resize()
    })

    const render = () => {
      window.requestAnimationFrame(() => {
        threeScene.update()
        particles.activate()
        particles.update()
        render()
      })
    }
    render()
  }
})()