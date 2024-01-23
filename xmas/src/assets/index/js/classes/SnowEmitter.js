import { toArray } from 'gsap';
import {
  // Scene,
  // PerspectiveCamera,
  // OrthographicCamera,
  // WebGLRenderer,
  Color,
  Matrix4,
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
  InstancedBufferAttribute,
  InstancedBufferGeometry
} from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const rndFlt = (num = 1) => Math.random() * num;
export const rndRng = (max, min) => Math.random() * (max - min) + min;

// class SnowProps extends Object3D {
//   constructor() {
//     super();
//     this.sclRange = 1000
//     // this.rotRange = 360 * (180 / Math.PI)
//     this.rotSpeed = Math.random() * 0.01 + 0.01
//     this.posSpeed = Math.random() * -2
//     this.opacity = Math.random() * .5 + .5
//     this.color ='0xffffff' // new Color(0xffffff)
//     this.isActive = true
//   }
//   activate() {
//     this.isActive = true;
//   }
//   deactivate() {
//     this.isActive = false;
//   }
//   update(vel) {
//     // 行列の変換はupdateMatrix関数があるので不要
//     // obj3d.position.add(vel)
//     // obj3d.updteMatrix()
//     // XYZを行列に変換
//     // this.velocity.add(this.acceleration)
//   }
// }

export default class SnowEmitter {
  constructor(three) {
    this.three = three
    this.viewWidth = this.three.viewWidth
    this.snowNum = 100000
    this.snowInstance = null
    this.matrixProps = new Matrix4()
    this.otherProps = new Object3D()
    this.snowColor  = 0xffffff
    this.posSpeeds = new Float32Array(this.snowNum)
  }
  // InstancedMesh生成
  init() {
    // テクスチャーを読み込み

    // カスタム属性生成
    for (let i = 0; i < this.snowNum; i++) this.posSpeeds[i] = Math.random() * -.5 - .5
    const posSpeedAttribute = new InstancedBufferAttribute(this.posSpeeds, 1);

    // ジオメトリ
    const snowPlane = new PlaneGeometry(1, 1)//new InstancedBufferGeometry().copy(new PlaneGeometry(1, 1))
    snowPlane.setAttribute('posSpeed', posSpeedAttribute); // カスタム属性追加

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
      // const otherProps = new SnowProps()
      // パーティクル属性生成（position、color etc.）
      this.matrixProps.setPosition(
        Math.random() * this.viewWidth - this.viewWidth / 2,
        Math.random() * this.viewWidth - this.viewWidth / 2,
        Math.random() * this.viewWidth,
      )
      // this.matrixProps.makeRotationFromEuler( // Euler角を行列に変換
      //   new Euler(
      //     Math.random() * Math.PI,
      //     Math.random() * Math.PI,
      //     Math.random() * Math.PI
      //   )
      // );

      // 行列設定・設定
      // this.snowInstance.setColorAt(i, new Color(otherProps.color)); // color instance
      this.snowInstance.setMatrixAt(i, this.matrixProps); // set matrix including pos, rotate, scale
    }
    // インスタンスメッシュをシーンに追加
    this.three.scene.add(this.snowInstance)
  }
  animate() {
    for (let i = 0; i < this.snowNum; i++) {
      // もしパーティクル[i]がアクティブなら
      if(this.snowInstance) {
        this.snowInstance.getMatrixAt(i, this.matrixProps);
        this.matrixProps.decompose(
          this.otherProps.position,
          this.otherProps.quaternion,
          this.otherProps.scale
        );

        // パーティクル[i]を動かす（updateでまとめる）
        this.otherProps.position.y += this.posSpeeds[i]//this.otherPropsArray[i].posSpeed;
        // this.otherProps.rotation.x += 1;
        // this.otherProps.rotation.y += 1;
        // this.otherProps.rotation.z += 1;

        // もしパーティクル[i]が動ききったら（active check関数化）
        if (this.otherProps.position.y < -this.viewWidth / 2) {
          // 座標をリセット
          // this.otherProps.init()でまとめる
          // this.otherProps.position.set(
          //   Math.random() * this.viewWidth - this.viewWidth / 2,
          //   this.viewWidth - this.viewWidth / 2,
          //   Math.random() * this.viewWidth,
          // )
          this.otherProps.position.y = this.viewWidth - this.viewWidth / 2
          // this.otherProps.rotation.set(0, 0, Math.random() * Math.PI)
        }

        // InstancedMeshの行列変換・設定
        this.otherProps.updateMatrix()
        // if(i === 0)console.log('otherProps: ', otherProps);
        this.snowInstance.setMatrixAt(i, this.otherProps.matrix)
      }
      // shader更新
      this.snowInstance.instanceMatrix.needsUpdate = true;
    }
  }
}