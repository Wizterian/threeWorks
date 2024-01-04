import {
  Scene,
  // PerspectiveCamera,
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
import { getRandomInt, getRad, getDeg, getSpherePos } from '../../../common/js/libs/Utils'

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
    this._setCamera()
    this._setClock()
    this._setRenderer()
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
      // this.camera = new OrthographicCamera(
      //   0,
      //   0,
      //   this.cameraParam.near,
      //   this.cameraParam.far
      // )
      this.camera = new OrthographicCamera(
        this.width / - 2,
        this.width / 2,
        this.height / 2,
        this.height / - 2,
        0.1,
        1000
      )
      this.camera.position.set(
        this.cameraParam.x,
        this.cameraParam.y,
        this.cameraParam.z
      )
      this.camera.lookAt(this.cameraParam.lookAt)
    }

    if('OrthographicCamera' === this.camera.type) {
      // console.log('this.camera.type: ', this.camera.type);
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
    this.clock = new Clock()
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

  _setControl() {
    // if(!this.camera) return
    this.orbitcontrols = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    this.orbitcontrols.enableDamping = true
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
    this.size = 0;
    this.time = 0;
    this.opacity = 0;
    this.isActive = false;
    this.velocity = new Vector3(); // 速度・距離
    this.acceleration = new Vector3(); // 加速度
    this.flg = false
  }
  init(vector) {
    this.velocity = vector.clone(); // 独立したランダム初期値
    // this.anchor = vector.clone();
    this.acceleration.set(0, 0, 0);
    this.time = 0;
    this.opacity = 0;
  }
  activate() {
    this.isActive = true;
  }
  inactive() {
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
        uColor: { value: new Color(0xff0000) },
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
    this.obj.position.copy(this.velocity)

    this.obj.geometry.attributes.position.needsUpdate = true
    this.obj.geometry.attributes.color.needsUpdate = true
    this.obj.geometry.attributes.opacity.needsUpdate = true
    this.obj.geometry.attributes.size.needsUpdate = true
  }
}

class Particles {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.pNum = 10
    this.pPropsArr = [] // props for each particle
    this.positions = new Float32Array(this.pNum * 3) // for BufferGeometry
    // this.colors = new Float32Array(this.pNum * 3)
    this.opacities = new Float32Array(this.pNum)
    this.sizes = new Float32Array(this.pNum)
    // this.gravity = new Vector3(0, 0.1, 0)
    // this.lastUpdatedTime = Date.now()
    this.pGeo = new ParticleBufferGeo()
  }
  init(images) {
    const texture = new Texture(images[0])
    // BufferGeometryで使う各particleの属性を用意
    for (var i = 0; i < this.pNum; i++) {
      // パーティクル固有の値生成
      const pProps = new ParticleProps() // 個々の属性管理
      const r = getRandomInt // 関数のエイリアス
      var color = new Color('hsl('+r(0, 45) +','+r(60, 90)+'%, 50%)')
      // pProps.init(new Vector3(getRandomInt(-100, 100), 0, 0))
      pProps.init(new Vector3(
        getRandomInt(-3, 3),
        getRandomInt(-3, 3),
        getRandomInt(-3, 3))
      )
      this.pPropsArr.push(pProps)

      // BufferGeometry用の配列に値を格納
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
      pProp.time++ // = pProp.time + this.clock.getDelta()
      // console.log('pProp.time: ', pProp.time);
      pProp.applyForce(this.gravity)
      pProp.updateVelocity()
      // if(pProp.isActive) {
      // }
      if(!this.flg) {
        // console.log(this.pPropsArr[i])
        // const delta = this.clock.getDelta()
        // console.log('delta: ', delta);
        if(i > 0) this.flg = !this.flg
      };

      // 全体の属性を更新、shader用
      this.positions[i * 3 + 0] = pProp.velocity.x
      this.positions[i * 3 + 1] = pProp.velocity.y
      this.positions[i * 3 + 2] = pProp.velocity.z

      this.opacities[i] = pProp.opacity
      this.sizes[i] = pProp.size
      this.pGeo.update()
    }
  }
  // パーティクルが非活動中なら活動させる
  activate() {
    let pCount = 0
    const currentTime = Date.now()
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
        const range = Math.random() * 2 // 円周上のランダムな位置
        const force = getSpherePos(radA, radB, range)

        // 初期位置を生成（円周上のランダムな位置・サイズ・透明度）
        const vector = new Vector3()
        vector.add(this.pGeo.velocity)
        pProp.activate()
        pProp.init(vector)
        pProp.applyForce(force)
        pProp.opacity = 0.2
        // 中心から遠いほど小さい値
        // powで2乗で顕著化
        // 12はサイズ
        // 3は半径

        // パーティクルをカウント
        pProp.size = Math.pow(12 - range, 2) * getRandomInt(1, 3)
        pCount++
        if (pCount >= 6) break // 6づつ活性化
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
  loadImages
    .init(["/assets/index/img/particle.png"])
    .then((images) => {
      const threeScene = new ThreeScene()
      threeScene.init()
      // const meshObject = new MeshObject(threeScene)
      // meshObject.init()
      const particles = new Particles(threeScene)
      particles.init(images)


      window.addEventListener("resize", () => {
        threeScene.resize()
      })

      const render = () => {
        window.requestAnimationFrame(() => {
          threeScene.update()
          // meshObject.animate()
          // particles.update()
          // particles.activate()
          render()
        })
      }
      render()
    })
})()
