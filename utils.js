export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    let len = this.length();
    if (len > 0) {
      this.x = this.x / len;
      this.y = this.y / len;
    }
    return this;
  }

  scale(val) {
    this.x = this.x * val;
    this.y = this.y * val;
    return this;
  }

  diff(other) {
    let x = other.x - this.x;
    let y = other.y - this.y;
    return new Vector(x, y);
  }

  add(other) {
    let x = other.x + this.x;
    let y = other.y + this.y;
    return new Vector(x, y);
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  neg() {
    return new Vector(-this.x, -this.y);
  }
}

export class Input {
  constructor() {
    this.left = 0;
    this.right = 0;
    this.up = 0;
    this.down = 0;
  }

  getDirection() {
    return new Vector(this.right - this.left, this.down - this.up);
  }
}

export class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export function checkIntersection(rect1, rect2) {
  if (rect2.x - rect1.x < rect1.width && rect2.x + rect2.width - rect1.x > 0) {
    if (
      rect2.y - rect1.y < rect1.height &&
      rect2.y + rect2.height - rect1.y > 0
    ) {
      return true;
    }
  }
  return false;
}


export function intervalForN(callback, duration, times, obj) {
  let counter = 0
  let id = setInterval((obj) => {
      callback(obj)
      counter++
      if (counter >= times) clearInterval(id)
  }, duration, obj)
}

export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}
