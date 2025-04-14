import {
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  AdditiveBlending,
  Points,
  Float32BufferAttribute
} from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'

export default class InitParticle {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.images = []
    this.particles = {
      positions: [], // Positionを上書きした配列
      maxCount: 0,
    }
  }

  init(images) {
    this.images = [...images]

    // sphereを再現する planeを作って画像を設定するクラスを後で分ける

    const planePoints = this.images.map((iamge, index) => {

      // PlaneGeometryを作成
      const planeGeo = new PlaneGeometry(500, 500, 128, 128)
      planeGeo.setIndex(null)

      // Materialを作成
      const planeMat = new ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms:
        {
            uSize: new Uniform(0.4),
            uResolution: new Uniform(new Vector2(
              this.threeScene.width * this.threeScene.pixelRatio,
              this.threeScene.height * this.threeScene.pixelRatio
            )),
            // 画像を設定
            uTexture: new Uniform(this.images[index]),
        },
        // blending: AdditiveBlending,
        depthWrite: false,
      })

      // Planeを作成、シーンに追加
      const planePoint = new Points(planeGeo, planeMat)
      planePoint.position.x = this.threeScene.height * index
      this.threeScene.scene.add(planePoint)
      return planePoint
    })

    // PlaneGeometryの頂点をすべて取得
    const planePositions = planePoints.map(planePoint => planePoint.geometry.attributes.position)

    // PlaneGeometryの中で頂点数が最大のものを取得
    for(const position of planePositions) {
      if (position.count > this.particles.maxCount) {
        this.particles.maxCount = position.count;
      }
    }

    // planePositionsをShaderで扱えるようにFLoat32Arrayに変換
    for(const position of planePositions) {
      const originalPosArray = position.array;
      const newPosArray = new Float32Array(this.particles.maxCount * 3);

      for(let i = 0; i < this.particles.maxCount; i++) {
        const i3 = i * 3

        if(i3 < originalPosArray.length) {
            newPosArray[i3 + 0] = originalPosArray[i3 + 0]
            newPosArray[i3 + 1] = originalPosArray[i3 + 1]
            newPosArray[i3 + 2] = originalPosArray[i3 + 2]
        } else {
            const randomIndex = Math.floor(position.count * Math.random()) * 3
            newPosArray[i3 + 0] = originalPosArray[randomIndex + 0]
            newPosArray[i3 + 1] = originalPosArray[randomIndex + 1]
            newPosArray[i3 + 2] = originalPosArray[randomIndex + 2]
        }
      }

      this.particles.positions.push(new Float32BufferAttribute(newPosArray, 3))
    }
    console.log(this.particles.positions);

  }

}