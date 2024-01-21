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
  Matrix4,
  Euler,
} from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const rndFlt = (num = 1) => Math.random() * num;
export const rndRng = (max, min) => Math.random() * (max - min) + min;

class SnowProps extends Object3D {
  constructor() {
    super();
    this.sclRange = 100
    this.rotRange = 360 * (180 / Math.PI)
    this.velocityY = -0.1 * 2
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
  updateVelocity(vel) {
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
    this.snowNum = 10000
    this.snowPropsArray = []
    this.snowInstance = null
    this.wldRange = this.three.worldRange
    this.width = this.three.width
    this.height = this.three.height
    this.snowColor  = 0xffffff
    this.matrix = new Matrix4() // meshの行列を受け渡し用
  }
  // 生成 指定数分生成しsceneにadd
  init() {
    // パーティクルインスタンス生成
    // テクスチャーを読み込み

    // ジオメトリ生成
    const snowPlane = new PlaneGeometry(1, 1)
    // マテリアル生成
    const snowMat = new MeshBasicMaterial({
      color: this.snowColor,
      transparent: true,
      side: DoubleSide
    })
    // インスタンスメッシュ生成（一旦bufferGeometryのようなイメージ）
    this.snowInstance = new InstancedMesh(
      snowPlane,
      snowMat,
      this.snowNum
    )
    // パーティクル属性管理配列を生成
    for (let i = 0; i < this.snowNum; i++) {
      // パーティクル属性管理インスタンス生成
      const snowProps = new SnowProps()
      // パーティクル属性生成（position、color etc.）
      snowProps.position.set(
        Math.random() * this.width - this.width / 2,
        // Math.random() * this.height * 2,
        Math.random() * this.wldRange * 20,
        Math.random() * this.wldRange,
      )
      // 行列設定
      // this.snowInstance.setColorAt(i, new Color(snowProps.color)); // color instance

      // 属性管理配列に追加
      this.snowPropsArray.push(snowProps)
    }
    // インスタンスメッシュをシーンに追加
    this.three.scene.add(this.snowInstance)
  }
  animate() {
    // パーティクルの数
    for (let i = 0; i < this.snowNum; i++) {
      // もしパーティクル[i]がアクティブなら
      if(this.snowPropsArray[i].isActive) {
        const snowProps = this.snowPropsArray[i]
        // if(i === 0) console.log(snowProps);
        // パーティクル[i]を下に落とす（updateVelocity）
        snowProps.position.y += snowProps.velocityY;
        // パーティクル[i]を回転させる

        // もしパーティクル[i]が落ちきったら
        if (snowProps.position.y < -this.wldRange) {
          // 座標をリセット（yを上に戻す、x、zをランダムに）
          // snowProps.init()
          snowProps.position.set(
            Math.random() * this.width - this.width / 2,
            this.wldRange * 10,
            Math.random() * this.wldRange,
          )
        } else {
          snowProps.position.y += snowProps.velocityY;
        }

        // InstancedMeshのmatrixを更新
        snowProps.updateMatrix()
        // if(i===0) console.log(snowProps.matrix);
        this.snowInstance.setMatrixAt(i, snowProps.matrix)

        // 行列変換
        // this.matrix.setPosition(
        //   snowProps.position.x,
        //   snowProps.position.y,
        //   snowProps.position.z,
        // )
        // this.snowInstance.setMatrixAt(i, this.matrix)
      }
      this.snowInstance.instanceMatrix.needsUpdate = true;
    }
    // メッシュのneedsUpdate = true;はinstancedMeshのところだとおもう
    // renderer.render(scene, camera);
    // App.jsのupdateで呼び出す
  }
}