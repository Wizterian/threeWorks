export default class DomLoaded {
  constructor(Entry) {
    if (document.readyState === 'complete') {
      setTimeout(() => new Entry(), 1);
    } else {
      document.addEventListener('DOMContentLoaded', () => new Entry());
    }
  }
}