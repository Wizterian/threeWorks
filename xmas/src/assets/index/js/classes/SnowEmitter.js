import { toArray } from 'gsap';
import {
  // Scene,
  // PerspectiveCamera,
  // OrthographicCamera,
  // WebGLRenderer,
  Color,
  // Matrix4,
  Object3D,
  PlaneGeometry,
  MeshBasicMaterial,
  // MeshStandardMaterial,
  // AmbientLight,
  // DirectionalLight,
  // Mesh,
  // DoubleSide,
  // Clock,
  Vector3,
  // ShaderMaterial,
  // TextureLoader,
  // Vector2,
  DoubleSide,
  InstancedMesh,
  Euler,
} from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const rndFlt = (num = 1) => Math.random() * num;
export const rndRng = (max, min) => Math.random() * (max - min) + min;

class SnowProps extends Object3D {
  constructor() {
    super();
    this.sclRange = 100
    // this.rotRange = 360 * (180 / Math.PI)
    this.rotSpeed = Math.random() * 0.01 + 0.01
    this.posSpeed = (Math.random() * 0.2 + .1) * -1
    this.opacity = Math.random() * .5 + .5;
    this.color ='0xffffff' // new Color(0xffffff)
    this.isActive = true;
  }
  activate() {
    this.isActive = true;
  }
  deactivate() {
    this.isActive = false;
  }
  update(vel) {
    // 行列の変換はupdateMatrix関数があるので不要
    // obj3d.position.add(vel)
    // obj3d.updteMatrix()
    // XYZを行列に変換
    // this.velocity.add(this.acceleration)
  }
}

export default class SnowEmitter {
  constructor(three) {
    this.three = three
    this.snowNum = 1000
    this.snowPropsArray = []
    this.snowInstance = null
    this.viewWidth = this.three.viewWidth
    this.snowColor  = 0xffffff
  }
  // 生成 指定数分生成しsceneにadd
  init() {
    // パーティクルインスタンス生成
    // テクスチャーを読み込み

    // ジオメトリ
    const snowPlane = new PlaneGeometry(10, 10)
    // マテリアル
    const snowMat = new MeshBasicMaterial({
      color: this.snowColor,
      transparent: true,
      side: DoubleSide,
      // uTex: {value: new TextureLoader().load(images[2].src)},
    })
    // インスタンスメッシュ（bufferGeometryのようなイメージ）
    this.snowInstance = new InstancedMesh(
      snowPlane,
      snowMat,
      this.snowNum
    )
    // パーティクル属性管理配列
    for (let i = 0; i < this.snowNum; i++) {
      // パーティクル属性管理インスタンス
      const snowProps = new SnowProps()
      // パーティクル属性生成（position、color etc.）
      snowProps.position.set(
        Math.random() * this.viewWidth - this.viewWidth / 2,
        Math.random() * this.viewWidth - this.viewWidth / 2,
        Math.random() * this.viewWidth,
      )
      // snowProps.position.set(0, 0, 0)
      snowProps.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      )
      // 行列設定・設定
      // this.snowInstance.setColorAt(i, new Color(snowProps.color)); // color instance

      // 属性管理配列に追加
      this.snowPropsArray.push(snowProps)
    }
    // インスタンスメッシュをシーンに追加
    this.three.scene.add(this.snowInstance)
  }
  animate() {
    for (let i = 0; i < this.snowNum; i++) {
      // もしパーティクル[i]がアクティブなら
      if(this.snowPropsArray[i].isActive) {

        // パーティクル[i]を動かす（updateでまとめる）
        const snowProps = this.snowPropsArray[i]
        snowProps.position.y += snowProps.posSpeed;
        snowProps.rotation.x += (snowProps.rotSpeed);
        snowProps.rotation.y += (snowProps.rotSpeed);
        snowProps.rotation.z += (snowProps.rotSpeed);

        // もしパーティクル[i]が動ききったら（active check関数化）
        if (snowProps.position.y < -this.viewWidth / 2) {
          // 座標をリセット
          // snowProps.init()でまとめる
          snowProps.position.set(
            Math.random() * this.viewWidth - this.viewWidth / 2,
            this.viewWidth - this.viewWidth / 2,
            Math.random() * this.viewWidth,
          )
          snowProps.rotation.set(0, 0, Math.random() * Math.PI)
        }

        // InstancedMeshの行列変換・設定
        snowProps.updateMatrix()
        // if(i === 0)console.log('snowProps: ', snowProps);
        this.snowInstance.setMatrixAt(i, snowProps.matrix)
      }
      // shader更新
      this.snowInstance.instanceMatrix.needsUpdate = true;
    }
  }
}