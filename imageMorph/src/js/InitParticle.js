import {
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  AdditiveBlending,
  Points,
  Float32BufferAttribute,
  Clock,
} from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import GUI from 'lil-gui'
import gsap from 'gsap'
export default class InitParticle {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.particles = {
      positions: [], // Positionを上書きした配列
      maxCount: 0,
      images: [],
      geometry: null,
      material: null,
      points: null,
      morph: null,
      currentIndex: 0,
      nextIndex: 1,
    }
    this.clock = new Clock()
  }

  init(images) {

    this.particles.images = [...images]

    // Geometryを作成
    this.particles.geometry = new PlaneGeometry(500, 500, 256, 256)
    this.particles.geometry
      .setIndex(null)
      .deleteAttribute('normal')
    // 最大頂点数を設定
    const position = this.particles.geometry.attributes.position
    this.particles.maxCount = position.count;

    const planePoints = this.particles.images.map((iamge, index) => {

      // 3津ボジションを作る
      const originalPosArray = position.array;
      const newPosArray = new Float32Array(this.particles.maxCount * 3);
      const offset = index * 100

      for(let i = 0; i < this.particles.maxCount; i++) {
        const i3 = i * 3

        const srcIndex = (i3 < originalPosArray.length)
          ? i3
          : Math.floor(position.count * Math.random()) * 3;

        newPosArray[i3 + 0] = originalPosArray[srcIndex + 0] + offset;
        newPosArray[i3 + 1] = originalPosArray[srcIndex + 1] + offset;
        newPosArray[i3 + 2] = originalPosArray[srcIndex + 2] + offset;
      }

      this.particles.positions.push(new Float32BufferAttribute(newPosArray, 3))
    })

    // Geometryを作成
    const sizesArray = new Float32Array(this.particles.maxCount)
    for(let i = 0; i < this.particles.maxCount; i++)
	    sizesArray[i] = Math.random()

    // this.particles.geometry = new BufferGeometry()
    // this.particles.geometry.setAttribute('position', this.particles.positions[this.particles.index])
    this.particles.geometry.setAttribute('aPositionTarget', this.particles.positions[1])
    this.particles.geometry.setAttribute('aSize', new Float32BufferAttribute(sizesArray, 1))

    // Materialを作成
    this.particles.images

    this.particles.material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms:
      {
          uSize: new Uniform(7),
          uResolution: new Uniform(new Vector2(
            this.threeScene.width * this.threeScene.pixelRatio,
            this.threeScene.height * this.threeScene.pixelRatio
          )),
          // 画像を設定
          uTexture: new Uniform(this.particles.images[this.particles.currentIndex]),
          uTextureTarget: new Uniform(this.particles.images[this.particles.nextIndex]),
          uProgress: new Uniform(0),
          uTime: new Uniform(0),
      },
      // blending: AdditiveBlending,
      depthWrite: false,
    })

    // Planeを作成、シーンに追加
    this.particles.points = new Points(
      this.particles.geometry,
      this.particles.material
    )
    this.particles.points.frustumCulled = false

    // planePoint.position.x = this.threeScene.height * index
    this.threeScene.scene.add(this.particles.points)

    this.particles.morph = (index) => {

      this.particles.nextIndex = index;

      // Update attributes
      this.particles.geometry.attributes.position = this.particles.positions[this.particles.currentIndex]
      this.particles.geometry.attributes.aPositionTarget = this.particles.positions[this.particles.nextIndex]

      this.particles.material.uniforms.uTexture.value = this.particles.images[this.particles.currentIndex];
      this.particles.material.uniforms.uTextureTarget.value = this.particles.images[this.particles.nextIndex];

      // Animate uProgress
      gsap.fromTo(
          this.particles.material.uniforms.uProgress,
          { value: 0 },
          { value: 1,
            duration: 2,
            ease: "power2.inOut",
          },
      )

      // Save index
      this.particles.currentIndex = this.particles.nextIndex;
    }

    this._debug()
  }

  animate() {
    // console.log(this.clock.getElapsedTime());
    const elapsedTime = this.clock.getElapsedTime();
    this.particles.material.uniforms.uTime.value = elapsedTime;
  }

  _debug() {

    const gui = new GUI({ width: 340 })
    gui
      .add(this.particles.material.uniforms.uProgress, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uProgress')

    this.particles.morph0 = () => { this.particles.morph(0) }
    this.particles.morph1 = () => { this.particles.morph(1) }
    this.particles.morph2 = () => { this.particles.morph(2) }
    gui.add(this.particles, 'morph0')
    gui.add(this.particles, 'morph1')
    gui.add(this.particles, 'morph2')
  }

}