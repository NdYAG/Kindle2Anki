
const { Transform } = require('stream')

class Separator extends Transform {
  constructor({separator}) {
    super()
    this.buffer = ''
    this.separator = separator
  }
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString()
    let pos
    while((pos = this.buffer.indexOf(this.separator)) !== -1) {
      this.push(this.buffer.substring(0, pos))
      this.buffer = this.buffer.substring(pos + this.separator.length)
    }
    callback()
  }
}

module.exports = {
  Separator
}
