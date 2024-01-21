import {
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  Mesh,
  DoubleSide,
  Clock,
  ShaderMaterial,
  TextureLoader,
  Vector2
} from 'three'

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
    const meshScale = 100
    const geometry = new PlaneGeometry(2, 2, 10, 10)
    const material = new ShaderMaterial({
      // wireframe: true,
      side: DoubleSide,
      // color: 0xff0000,
      uniforms: {
        resolution: {value: new Vector2(window.innerWidth, window.innerHeight)},
        imageResolution: { value: new Vector2(7455, 4579)},
        uTex: {value: new TextureLoader().load(images[0].src)},
        uTexDepth: {value: new TextureLoader().load(images[1].src)},
        uMouse: {value: this.mouse},
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec2 vUv;
        uniform vec2 resolution;
        uniform vec2 imageResolution;
        uniform sampler2D uTex;
        uniform sampler2D uTexDepth;
        uniform vec2 uMouse;

        void main(){

          // If the UV value is below 1, the texture becomes larger and can cover the window. (The value of 1 fits the window exactly)
          vec2 ratio = vec2(
            min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
            min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
          );

          // When the UV value is below 1, it needs to be centered with the number by subtracting the ratio from 1 (100%)
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );

          vec4 tex = texture2D(uTex, uv);
          vec4 texDepth = texture2D(uTexDepth, uv);
          vec4 color = texture2D(uTex, uv + (uMouse -vec2(0.5)) *0.02 * texDepth.r);
          gl_FragColor = color;
        }
      `,
    })
    this.plane = new Mesh( geometry, material )
    this.plane.scale.set(meshScale*1.6, meshScale, meshScale)

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
