import {
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  Mesh,
  DoubleSide,
  Clock,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  MeshBasicMaterial
} from 'three'
import vertexShader from './shader/tree.vs?raw'
import fragmentShader from './shader/tree.fs?raw'

export default class TreeImage {
  constructor(threeScene) {
    this.threeScene = threeScene
    this.clock = new Clock()
    this.mouse = new Vector2()
    const canvas = document.querySelector("canvas")
    canvas.addEventListener("mousemove", this._mouseAction.bind(this))
    this.plane = null
  }

  init(images) {
    const geometry = new PlaneGeometry(1, 1)
    const material = new ShaderMaterial({
      // wireframe: true,
      side: DoubleSide,
      // color: 0xff0000,
      uniforms: {
        resolution: {value: new Vector2(window.innerWidth, window.innerHeight)},
        imageResolution: { value: new Vector2(7455, 4579)},
        uTex: {value: images[0]},
        uTexDepth: {value: images[1]},
        uMouse: {value: this.mouse},
      },
      vertexShader,
      fragmentShader,
    })
    this.plane = new Mesh( geometry, material )
    this.plane.scale.set(window.innerWidth, window.innerHeight, 1)

    const ambientLight = new AmbientLight(0xffffff, 1)
    const directionalLight = new DirectionalLight(0xff00ff, 1)
    directionalLight.position.set(0, 1, 1)

    this.threeScene.scene.add(
      this.plane,
      ambientLight,
      directionalLight
    )
  }

  resize() {
    this.plane.scale.set(window.innerWidth, window.innerHeight, 1)
    this.plane.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  animate() {
    const delta = this.clock.getDelta()
    this.plane.rotation.x += delta
    this.plane.rotation.y += delta
  }

  _mouseAction(event) {
    const el = event.currentTarget;

    const x = event.clientX;
    const y = event.clientY;
    const w = el.offsetWidth; // canvas width
    const h = el.offsetHeight; // canvas height

    this.mouse.x = x / w; // left to right (0 to 1)
    this.mouse.y = 1 - y / h; // bottom to up (0 to 1)
  }
}
