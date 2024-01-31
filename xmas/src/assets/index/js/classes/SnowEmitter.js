import {
  Color,
  Matrix4,
  Object3D,
  PlaneGeometry,
  MeshBasicMaterial,
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
  BufferAttribute,
  // InstancedBufferGeometry,
  // Quaternion,
  // MathUtils,
  TextureLoader
} from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class SnowEmitter {
  constructor(three) {
    this.three = three
    this.viewWidth = this.three.viewWidth
    this.snowNum = 10000
    this.snowInstance = null
    this.matrixProps = new Matrix4()
    this.otherProps = new Object3D()
    this.snowColor  = 0xffffff
    this.posSpeeds = new Float32Array(this.snowNum)
  }
  // InstancedMesh
  init(images) {
    // Custom Property（https://chat.openai.com/share/c39ee55b-0975-41f1-9273-c08f2eab0e72）
    for (let i = 0; i < this.snowNum; i++) this.posSpeeds[i] = Math.random() * -.2 - .2
    const snowPlane = new PlaneGeometry(1, 1)
    snowPlane.setAttribute( // カスタム属性追加
      'posSpeed',
      new BufferAttribute(this.posSpeeds, 1)
    )
    // Material
    const snowMat = new MeshBasicMaterial({
      // color: this.snowColor,
      side: DoubleSide,
      transparent: true,
      map: images[2],
    })
    // InstancedMesh
    this.snowInstance = new InstancedMesh(
      snowPlane,
      snowMat,
      this.snowNum
    )

    // Particle Property
    for (let i = 0; i < this.snowNum; i++) {
      // position、color etc.
      // makeRotationFromEuler should be written at first
      this.matrixProps.makeRotationFromEuler(
        new Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      );

      this.matrixProps.setPosition(
        Math.random() * this.viewWidth - this.viewWidth / 2,
        Math.random() * this.viewWidth - this.viewWidth / 2,
        Math.random() * this.viewWidth / 2 + this.viewWidth / 2,
      )

      // const rotationMatrix = new Matrix4();
      // rotationMatrix.makeRotationX(Math.random() * Math.PI);
      // this.matrixProps.multiply(rotationMatrix);

      // rotationMatrix.makeRotationY(Math.random() * Math.PI);
      // this.matrixProps.multiply(rotationMatrix);

      // rotationMatrix.makeRotationZ(Math.random() * Math.PI);
      // this.matrixProps.multiply(rotationMatrix);

      // Matririx Calculation to InstanceMesh
      // this.snowInstance.setColorAt(i, new Color(otherProps.color)); // color instance
      this.snowInstance.setMatrixAt(i, this.matrixProps); // set matrix including pos, rotate, scale
    }
    this.three.scene.add(this.snowInstance)
  }
  animate() {
    if(this.snowInstance) {
      for (let i = 0; i < this.snowNum; i++) {
        this.snowInstance.getMatrixAt(i, this.matrixProps);
        this.matrixProps.decompose(
          this.otherProps.position,
          this.otherProps.quaternion,
          this.otherProps.scale
        );

        // パーティクル[i]を動かす（updateでまとめる）
        this.otherProps.position.y += this.posSpeeds[i]
        this.otherProps.rotation.x += this.posSpeeds[i] * .05;

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
        this.snowInstance.setMatrixAt(i, this.otherProps.matrix)
      }
      // shader更新
      this.snowInstance.instanceMatrix.needsUpdate = true;
    }
  }
}

// DepthとBloomをつける