export class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize() {
        let len = this.length()
        if (len > 0) {
        this.x = this.x / len
        this.y = this.y / len
        }
        return this
    }

    scale(val) {
        this.x = this.x * val
        this.y = this.y * val
        return this
    }

    diff(other) {
        let x = other.x - this.x
        let y = other.y - this.x
        return new Vector(x, y)
    }

    add(other) {
        let x = other.x + this.x
        let y = other.y + this.y
        return new Vector(x, y)
    }

    copy() {
        return new Vector(this.x, this.y)
    }

    neg() {
        return new Vector(-this.x, -this.y)
    }
}