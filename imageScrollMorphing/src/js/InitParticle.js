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
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { max } from 'three/tsl'
import { update } from 'three/examples/jsm/libs/tween.module.js'
gsap.registerPlugin(ScrollTrigger)

export default class InitParticle {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.particles = {
      positions: [],
      maxCount: 0,
      images: [],
      geometry: null,
      material: null,
      points: null,
      morph: null,
      currentIndex: 0,
      nextIndex: 1,
      maxIndex: null,
      updateTextures: (fromIndex, toIndex) => {
        const { images, positions, material, geometry } = this.particles;

        material.uniforms.uTextureFrom.value = images[fromIndex];
        material.uniforms.uTextureTo.value = images[toIndex];

        geometry.attributes.position = positions[fromIndex];
        geometry.attributes.aPositionTarget = positions[toIndex];
      },
    }
    this.clock = new Clock()
  }

  init(images) {

    this.particles.images = [...images]
    this.particles.maxIndex = this.particles.images.length - 1;

    // Geometryを作成
    this.particles.geometry = new PlaneGeometry(750, 750, 128, 128)
    this.particles.geometry
      .setIndex(null)
      .deleteAttribute('normal')

    // 最大頂点数を取得・設定
    const position = this.particles.geometry.attributes.position
    this.particles.maxCount = position.count;

    const planePoints = this.particles.images.map((iamge, index) => {

      // 移動するボジションを作る（この場合3つ）
      const originalPosArray = position.array;
      const newPosArray = new Float32Array(this.particles.maxCount * 3);
      const offset = 1//index * 100

      for(let i = 0; i < this.particles.maxCount; i++) {
        const i3 = i * 3

        // 頂点数を超えた場合はランダムに所得した既存の頂点に設定
        // const srcIndex = (i3 < originalPosArray.length)
        //   ? i3
        //   : Math.floor(position.count * Math.random()) * 3;

        newPosArray[i3 + 0] = originalPosArray[i3 + 0] + offset;
        newPosArray[i3 + 1] = originalPosArray[i3 + 1] + offset;
        newPosArray[i3 + 2] = originalPosArray[i3 + 2] + offset;
      }

      this.particles.positions.push(new Float32BufferAttribute(newPosArray, 3))
    })

    // Attriuteを作成
    const sizesArray = new Float32Array(this.particles.maxCount)
    for(let i = 0; i < this.particles.maxCount; i++)
	    sizesArray[i] = Math.random()

    this.particles.geometry.setAttribute('aPositionTarget', this.particles.positions[1])
    this.particles.geometry.setAttribute('aSize', new Float32BufferAttribute(sizesArray, 1))

    // Materialを作成
    this.particles.material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms:
      {
          uSize: new Uniform(10),
          uResolution: new Uniform(new Vector2(
            this.threeScene.width * this.threeScene.pixelRatio,
            this.threeScene.height * this.threeScene.pixelRatio
          )),
          // 画像を設定
          uTextureFrom: new Uniform(this.particles.images[this.particles.currentIndex]),
          uTextureTo: new Uniform(this.particles.images[this.particles.nextIndex]),
          uProgress: new Uniform(0),
          uTime: new Uniform(0),
      },
      depthWrite: false,
    })

    // Pointsを作成、シーンに追加
    this.particles.points = new Points(
      this.particles.geometry,
      this.particles.material
    )
    this.particles.points.frustumCulled = false
    this.threeScene.scene.add(this.particles.points)

    // モーフィング
    // this.particles.morph = (index) => {

    //   // 次の座標を設定
    //   this.particles.nextIndex = index;

    //   // Shaderに現在の座標と次の座標を設定
    //   this.particles.geometry.attributes.position = this.particles.positions[this.particles.currentIndex]
    //   this.particles.geometry.attributes.aPositionTarget = this.particles.positions[this.particles.nextIndex]

    //   // Shaderに現在の画像と次の画像を設定
    //   this.particles.material.uniforms.uTexture.value = this.particles.images[this.particles.currentIndex];
    //   this.particles.material.uniforms.uTextureTarget.value = this.particles.images[this.particles.nextIndex];

    //   // トランジションのアニメーション（進捗度）設定
    //   gsap.fromTo(
    //       this.particles.material.uniforms.uProgress,
    //       { value: 0 },
    //       { value: 1,
    //         duration: 2,
    //         ease: "power2.inOut",
    //       },
    //   )

    //   // 次の座標を現在の座標に設定
    //   this.particles.currentIndex = this.particles.nextIndex;
    // }

    this.particles.updateTextures = (fromIndex, toIndex) => {
      console.log('fromIndex: ', fromIndex);
      console.log('toIndex: ', toIndex);
      const { images, positions, material, geometry } = this.particles;

      material.uniforms.uTextureFrom.value = images[fromIndex];
      material.uniforms.uTextureTo.value = images[toIndex];

      geometry.attributes.position = positions[fromIndex];
      geometry.attributes.aPositionTarget = positions[toIndex];
    }

    document.querySelectorAll('.section').forEach((section, index) => {

      let {
        maxIndex,
        currentIndex,
        nextIndex,
      } = this.particles

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onEnter: () => {
          console.log("onEnter");
          currentIndex = index;
          nextIndex = Math.min(index + 1, maxIndex);
          this.particles.updateTextures(currentIndex, nextIndex);
        },
        onEnterBack: () => {
          console.log("back");

          if (index + 1 === maxIndex) return;
          currentIndex = index;
          nextIndex = index === 0 ? index + 1 : index - 1;
          this.particles.updateTextures(currentIndex, nextIndex);
        },
        onUpdate: (self) => {
          const progress = self.progress;
          this.particles.material.uniforms.uProgress.value = progress;

          // 回転
          const ease = gsap.parseEase("power2.inOut");
          const easedProgress = ease(progress);
          this.particles.points.rotation.y = easedProgress * Math.PI * 2;
        },
        markers: true
      });
    });

    // this._debug()
  }

  animate(time) {
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