import {
  TextureLoader
} from 'three'

export default class LoadTextures {
  constructor() {
    this.textureLoader = new TextureLoader();
    this.textures = [];
  }

  init(texturePaths) {
    this.texturePaths = [...texturePaths];
    return Promise.all(this.texturePaths.map(path => this.loadTexture(path)));
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, 
        // onLoad callback
        texture => resolve(texture),
        // onProgress callback
        undefined,
        // onError callback
        error => reject(new Error(`Failed to load texture at ${url}: ${error}`))
      );
    });
  }
}


// export default class LoadImage {
//   constructor() {
//     this.imagePaths = []
//   }
//   init(imgPaths) {
//     this.imagePaths = [...imgPaths]
//     return Promise.all(this.imagePaths.map(path => this.loadImage(path)));
//   }
//   loadImage(url) {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.onload = () => resolve(img);
//       img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
//       img.src = url;
//     });
//   }
// }