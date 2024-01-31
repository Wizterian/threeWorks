import {
  Color,
  Matrix4,
  Object3D,
  PlaneGeometry,
  MeshBasicMaterial,
  AdditiveBlending,
  // MeshStandardMaterial,
  // AmbientLight,
  // DirectionalLight,
  // Mesh,
  // Clock,
  Vector3,
  ShaderMaterial,
  // TextureLoader,
  // Vector2,
  DoubleSide,
  InstancedMesh,
  Euler,
  InstancedBufferAttribute,
  // InstancedBufferGeometry,
  // Quaternion,
  // MathUtils,
  TextureLoader,
  BufferGeometry,
  BufferAttribute,
  Points,
} from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from './shader/star.vs?raw'
import fragmentShader from './shader/star.fs?raw'

export default class ShootingStar { // Emitter
  constructor(three) {
    this.three = three
    this.viewWidth = this.three.viewWidth
    this.starNum = 10
    this.starParticle = null
  }
  // ICS Mediaのemitterとparticleを参考にclass化のコンテクスト
  init(images) {
    // EmitterはPrtcileのUpdateと自身の移動だけ
    const starParticle = new StarParticle(this.starNum)
    this.starParticle = starParticle.init(images)
    this.three.scene.add(this.starParticle)
  }
  update() {
    // 各particle
      // もしpartcle.isAlive
        // particle.update（life、Op--、pos）
      // そうでない
        // particle.init（半径、排出角度）
    // Emitterを移動
  }
}

class StarParticle { // instancedMesh
  constructor(starNum) {
    this.starNum = starNum
    this.matrixProps = new Matrix4() // 行列計算用Matrix4
    this.particleProps = new Object3D() // 属性管理Object3D
    this.bufferGeo = new BufferGeometry() // ジオメトリ

    this.positionArr = new Float32Array(this.starNum * 3) // 座標
    this.opacityArr = new Float32Array(this.starNum) // 透明度
    this.pVectorArr = new Float32Array(this.starNum * 3)
    this.isAliveArr = new Uint8Array(this.starNum) // 生死
    this.colorArr = new Float32Array(this.starNum * 3) // 色;
    this.scaleArr = new Float32Array(this.starNum) // スケール;
  }
  init(images) {
    const rnd = Math.random()
    const rad = (Math.random() * Math.PI) / 180;

    // カスタム属性値作成
    for (let i = 0; i < this.starNum; i++) {
      // カスタム属性
      // this.isAliveArr[i] = 0
      // this.opacityArr[i] = rnd * .5 + .5

      // this.pVectorArr[i * 3 + 0] = rnd * (-.06 - .06) + .06
      // this.pVectorArr[i * 3 + 1] = rnd * (.03 - .06) + .06
      // this.pVectorArr[i * 3 + 2] = rnd * (-.06 - .06) + .06

      this.positionArr[i * 3 + 0] = 5 * Math.sin(rad * .3)
      this.positionArr[i * 3 + 1] = rnd * Math.sin(rad)
      this.positionArr[i * 3 + 2] = rnd * Math.sin(rad)
      const color = new Color(
        'hsl(' + Math.random() * 45 + ',' + Math.random() * (60 + 30) + '%, 75%)'
      )
      color.toArray(this.colorArr, i * 3)
    }

    // マテリアル作成
    const starwMat = new ShaderMaterial({
      side: DoubleSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: images[2] }
      },
    })
    // shader属性追加
    this.bufferGeo.setAttribute('position', new BufferAttribute(this.positionArr, 3));

    this.bufferGeo.setAttribute('color', new BufferAttribute(this.colorArr, 3))
    // this.bufferGeo.setAttribute('opacity', new BufferAttribute(this.opacityArr, 1))
    // this.bufferGeo.setAttribute('scale', new BufferAttribute(this.scaleArr, 1))

    return new Points(this.bufferGeo, starwMat)
  }
  update() {
    // 方向・速度算出
    // opacityをデクリメント
    // position.add(方向・速度)
    // もしlife (or opacity) <= 0
      // isAliveをfalse
  }
}

// InstancedMeshの挙動を入れ込んで確認 fireなどでも