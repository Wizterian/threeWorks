import {
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  NormalBlending,
  Points,
  Float32BufferAttribute,
  Clock,
} from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default class InitParticle {
  constructor(three) {
    this.three = three
    this.particles = {
      positions: [],
      maxCount: 0,
      images: [],
      geometry: null,
      material: null,
      points: null,
      morph: null,
      fromIndex: 0,
      toIndex: 1,
      maxIndex: null,
      updateTextures: null,
    }
    this.clock = new Clock()
  }

  init(images) {
    const particles = this.particles
    const scene = this.three.scene
    particles.images = [...images]
    particles.maxIndex = particles.images.length - 1;

    // Geometryを作成
    const enlargeRatio = 2
    particles.geometry = new PlaneGeometry(750, 750, 128 * enlargeRatio, 128 * enlargeRatio)
    particles.geometry
      // .setIndex(null)
      .deleteAttribute('normal')

    // 最大頂点数を取得・設定
    const position = particles.geometry.attributes.position
    particles.maxCount = position.count;

    particles.images.map((iamge, index) => {

      // 画像ジオメトリの座標（ボジション）を生成
      const originalPosArray = position.array;
      const newPosArray = new Float32Array(particles.maxCount * 3);
      const offset = index * 100

      for(let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3

        // 頂点数を超えた場合はランダムに所得した既存の頂点に設定
        const srcIndex = (i3 < originalPosArray.length)
          ? i3
          : Math.floor(position.count * Math.random()) * 3;

        newPosArray[i3 + 0] = originalPosArray[i3 + 0] + offset;
        newPosArray[i3 + 1] = originalPosArray[i3 + 1] + offset;
        newPosArray[i3 + 2] = originalPosArray[i3 + 2] + offset;
      }

      particles.positions.push(new Float32BufferAttribute(newPosArray, 3))

      // ゆらぎ
      // const particleMotionArr = new Float32Array(particles.maxCount)
      // for(let i = 0; i < particles.maxCount; i++) {
      //   particleMotionArr[i] = i;
      // }
      // particleMotionArr.push(new Float32BufferAttribute(particleMotionArr, 1))

    })

    // Attriuteを作成
    const sizesArray = new Float32Array(particles.maxCount)
    for(let i = 0; i < particles.maxCount; i++)
	    sizesArray[i] = Math.random()

    particles.geometry.setAttribute('position', particles.positions[particles.fromIndex])
    particles.geometry.setAttribute('aPositionTarget', particles.positions[particles.toIndex])
    particles.geometry.setAttribute('aSize', new Float32BufferAttribute(sizesArray, 1))

    // Materialを作成
    particles.material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms:
      {
          uSize: new Uniform(5),
          uResolution: new Uniform(new Vector2(
            this.three.width * this.three.pixelRatio,
            this.three.height * this.three.pixelRatio
          )),
          // 画像を設定
          uTextureFrom: new Uniform(particles.images[particles.fromIndex]),
          uTextureTo: new Uniform(particles.images[particles.toIndex]),
          uProgress: new Uniform(0),
          uTime: new Uniform(0),
          uHeight: new Uniform(this.three.height),
      },
      transparent: true,      // ← これが超重要！
      depthWrite: false,      // ← 重なりを正しく描画したいときは false
      blending: NormalBlending, // または AdditiveBlending も可
    })

    // Pointsを作成、シーンに追加
    particles.points = new Points(
      particles.geometry,
      particles.material
    )
    particles.points.frustumCulled = false
    this.three.scene.add(particles.points)

    // モーフィング
    particles.morph = (index) => {

      // 次の座標を設定
      particles.toIndex = index;

      // Shaderに現在の座標と次の座標を設定
      particles.geometry.attributes.position = particles.positions[particles.fromIndex]
      particles.geometry.attributes.aPositionTarget = particles.positions[particles.toIndex]

      // Shaderに現在の画像と次の画像を設定
      particles.material.uniforms.uTextureFrom.value = particles.images[particles.fromIndex];
      particles.material.uniforms.uTextureTo.value = particles.images[particles.toIndex];

      // トランジションのアニメーション（進捗度）設定
      gsap.fromTo(
          particles.material.uniforms.uProgress,
          { value: 0 },
          { value: 1,
            duration: 2,
            ease: "power2.inOut",
          },
      )

      // 次の座標を現在の座標に設定
      particles.fromIndex = particles.toIndex;
    }

    particles.updateTextures = (fromIndex, toIndex) => {
      const { images, positions, material, geometry } = particles;
      particles.fromIndex = fromIndex;
      particles.toIndex = toIndex;

      material.uniforms.uTextureFrom.value = images[particles.fromIndex];
      material.uniforms.uTextureTo.value = images[particles.toIndex];

      geometry.attributes.position = positions[particles.fromIndex];
      geometry.attributes.aPositionTarget = positions[particles.toIndex];
    }

    document.querySelectorAll('.section').forEach((section, index) => {

      let {
        maxIndex,
        fromIndex,
        toIndex,
      } = particles

      ScrollTrigger.create({
        trigger: section,
        start: 'top+=5% top',
        end: 'bottom-=5% top',
        scrub: true,
        onEnter: () => {
          console.log("onEnter: ", index);
          fromIndex = index === maxIndex ? index - 1 : index;
          toIndex = Math.min(index + 1, maxIndex);
          particles.updateTextures(fromIndex, toIndex);
        },
        onEnterBack: () => {
          console.log("onEnterBack: ", index);
          if (index + 1 === maxIndex) return;
          fromIndex = index;
          toIndex = index === 0 ? index + 1 : index - 1;
          particles.updateTextures(fromIndex, toIndex);
        },
        onUpdate: (self) => {
          const progress = self.progress;
          particles.material.uniforms.uProgress.value = progress;
        },
        markers: true
      });
    });

    // this._debug()
  }

  animate(time) {
    const particles = this.particles

    const elapsedTime = this.clock.getElapsedTime();
    particles.material.uniforms.uTime.value = elapsedTime;
  }

  _debug() {
    const particles = this.particles

    const gui = new GUI({ width: 340 })
    gui
      .add(particles.material.uniforms.uProgress, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uProgress')

    particles.morph0 = () => { particles.morph(0) }
    particles.morph1 = () => { particles.morph(1) }
    particles.morph2 = () => { particles.morph(2) }
    gui.add(particles, 'morph0')
    gui.add(particles, 'morph1')
    gui.add(particles, 'morph2')
  }

}