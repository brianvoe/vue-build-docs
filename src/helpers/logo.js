import 'pixi.js'
import 'tween.js'
/* globals PIXI,TWEEN */

// Create class - needed something that was effected by vue
export default class VueBuildLogo {
  constructor (height, width) {
    this.height = height
    this.width = width
    this.canvas = document.getElementById('canvasLogo')

    var app = new PIXI.Application(height, width, {
      antialias: true,
      backgroundColor: 0xffffff
    })
    this.canvas.appendChild(app.view) // Add to div

    // Make a container to hold all v's
    var all = new PIXI.Container()
    app.stage.addChild(all) // Add to state

    // Add top and bottom v to container
    var v = new PIXI.Container()
    let vTop = this.vTop()
    let vBottom = this.vBottom()
    v.addChild(vTop)
    v.addChild(vBottom)

    all.addChild(v)

    // Set pivot location
    all.pivot.x = all.width / 2
    all.pivot.y = 0

    // Scale to size - must be dont after settin pivot
    all.scale.set(0.4)

    all.x = app.screen.width / 2
    all.y = app.screen.height / 2

    setInterval(() => {
      this.animateVLock(v)
    }, 2000)

    // Listen for animate update
    app.ticker.add(function (delta) {
      // rotate the container!
      // use delta to create frame-independent tranform
      all.rotation += 0.01 * delta
    })
  }

  vTop () {
    var v = new PIXI.Graphics()

    v.beginFill(parseInt('35495E', 16)) // #35495E
    v.moveTo(80, 0)
    v.lineTo(200, 205)
    v.lineTo(320, 0)
    v.lineTo(250, 0)
    v.lineTo(200, 80)
    v.lineTo(155, 0)
    v.lineTo(80, 0)
    v.endFill()

    return v
  }

  vBottom () {
    var v = new PIXI.Graphics()

    v.beginFill(parseInt('41B883', 16)) // #41B883
    v.moveTo(0, 0)
    v.lineTo(200, 345)
    v.lineTo(400, 0)
    v.lineTo(320, 0)
    v.lineTo(200, 205)
    v.lineTo(80, 0)
    v.lineTo(0, 0)
    v.endFill()

    return v
  }

  animateVLock (v) {

  }

  render () {
    this.v1Angle = (this.v1Angle + 1) % 360
    this.v1Context.translate(this.height / 2, this.width / 2)
    this.v1Context.rotate(this.v1Angle * Math.PI / 180)
    this.v(this.v1Context)
    // this.v1Context.drawImage(this.v(this.v1Context), 2, 2, 50, 50)

    requestAnimationFrame(() => { this.render() })
  }
}
