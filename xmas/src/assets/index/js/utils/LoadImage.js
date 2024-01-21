export default class LoadImage {
  constructor() {
    this.imagePaths = []
  }
  init(imgPaths) {
    this.imagePaths = [...imgPaths]
    return Promise.all(this.imagePaths.map(path => this.loadImage(path)));
  }
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
      img.src = url;
    });
  }
}