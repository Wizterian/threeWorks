import {
  Color,
  Matrix4,
  Object3D,
  PlaneGeometry,
  MeshBasicMaterial,
  AdditiveBlending,
  Vector3,
  ShaderMaterial,
  DoubleSide,
  InstancedMesh,
  Euler,
  InstancedBufferAttribute,
  TextureLoader,
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
} from 'three'
import vertexShader from './shader/star.vs?raw'
import fragmentShader from './shader/star.fs?raw'

class particleProps extends Object3D{
  constructor(three) {
    super()
    this.three = three
    this.velocity = new Vector3()
    this.opacity = 1 // 0にする
  }
  init(three) {
    this.velocity = new Vector3(
      Math.random() * this.three.width - this.three.width / 2,
      0,
      1
    )
    this.opacity = 1 // 0にする
  }
  updateVelocity() {
    this.velocity.y += 1
  }
}

class StarParticle { // BufferGeometry
  constructor() {
    this.bufferGeo = new BufferGeometry() // ジオメトリ
    this.pointsObj = null // パーティクル
  }
  init(param) {
    if(!param) return
    // マテリアル作成
    // const starMat = new ShaderMaterial({
    //   blending: AdditiveBlending,
    //   transparent: true,
    //   depthWrite: false,
    //   vertexShader: param.vertexShader,
    //   fragmentShader: param.fragmentShader,
    //   uniforms: {
    //     uTexture: { value: param.texture }
    //   },
    // })
    const starMat = new PointsMaterial({
      sizeAttenuation: true,
      color: 0x00ff00,
      size: 50,
    })
    // shader属性追加
    this.bufferGeo.setAttribute('position', new BufferAttribute(param.positions, 3));
    this.bufferGeo.setAttribute('color', new BufferAttribute(param.colors, 3))
    // this.bufferGeo.setAttribute('opacity', new BufferAttribute(this.opacityArr, 1))
    // this.bufferGeo.setAttribute('scale', new BufferAttribute(this.scaleArr, 1))

    this.pointsObj = new Points(this.bufferGeo, starMat)
    param.scene.add(this.pointsObj)
  }
  update() {
    this.pointsObj.position.set(0, 0, 0)
    this.pointsObj.geometry.attributes.position.needsUpdate = true
  }
}

export default class ShootingStar { // Emitter
  constructor(three) {
    this.three = three
    // this.viewWidth = this.three.viewWidth

    this.starNum = 3
    this.starParticle = new StarParticle()

    this.pPropsArr = []
    this.positionArr = new Float32Array(this.starNum * 3) // 座標
    this.colorArr = new Float32Array(this.starNum * 3) // 色;
    // this.scaleArr = new Float32Array(this.starNum) // スケール;
    // this.opacityArr = new Float32Array(this.starNum) // 透明度
    // this.velocityArr = new Float32Array(this.starNum * 3)
    // this.isAliveArr = new Uint8Array(this.starNum) // 生死
  }
  init(images) {
    // カスタム属性値作成
    for (let i = 0; i < this.starNum; i++) {
      // カスタム属性
      const pProps = new particleProps(this.three) // 属性管理Object3D
      pProps.init(this.three)
      this.pPropsArr.push(pProps)

      this.positionArr[i*3+0] = pProps.velocity.x
      this.positionArr[i*3+1] = pProps.velocity.y
      this.positionArr[i*3+2] = pProps.velocity.z
      const color = new Color('hsl(' + Math.random() * 45 + ',' + Math.random() * (60 + 30) + '%, 75%)')
      color.toArray(this.colorArr, i * 3)
    }
    // particle作成
    this.starParticle.init({
      scene: this.three.scene,
      vertexShader,
      fragmentShader,
      positions: this.positionArr,
      colors: this.colorArr,
      // opacities: this.opacities,
      // sizes: this.sizes,
      texture: images[2].clone(),
    })
  }
  update() {
    // 各particleの管理属性を更新
    for (let i = 0; i < this.starNum; i++) {
      const pProp = this.pPropsArr[i]
      if(pProp.velocity.y <= 250 ) { // もしpartcle.isAlive
        pProp.updateVelocity() // particle.update（life、Op--、pos）
      } else { // そうでない
        pProp.init() // particle.init（半径、排出角度）
      }

      this.positionArr[i*3+0] = pProp.velocity.x
      this.positionArr[i*3+1] = pProp.velocity.y
      this.positionArr[i*3+2] = pProp.velocity.z
    }
    this.starParticle.update()

    // Emitterを移動
  }
}