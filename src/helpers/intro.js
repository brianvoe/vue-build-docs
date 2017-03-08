import 'pixi.js'
import { TweenMax, Power3, Power4, RoughEase, Linear } from 'gsap'
/* globals PIXI */

// Create class - needed something that was effected by vue
export default class VueBuildIntro {
  constructor () {
    this.height = window.innerHeight
    this.width = window.innerWidth
    this.primaryColor = parseInt('41B883', 16) // #41B883
    this.secondaryColor = parseInt('35495E', 16) // #35495E
    this.canvas = document.getElementById('canvasIntro')
    this.app = new PIXI.Application(this.height, this.width, {
      antialias: true,
      backgroundColor: 0xffffff,
      transparent: false,
      resolution: window.devicePixelRatio,
      autoResize: true
    })
    window.addEventListener('resize', this.resize())
    this.canvas.appendChild(this.app.view)
    this.all = new PIXI.Container() // Container for all v's
    this.all.positionX = this.width / 2
    this.all.positionY = this.height / 2
    this.all.positionYStart = -200
    this.all.positionYEnd = 200

    // Make a container to hold all v's
    this.app.stage.addChild(this.all) // Add to state

    // Add v's to container
    for (var i = 0; i < 3; i++) {
      this.all.addChild(this.v())
    }

    // Center and scale
    this.allCenter()

    // Start animations
    setTimeout(() => {
      this.animate()
    }, 500)
  }

  // When window resizes resize renderer
  resize () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.app.renderer.resize(this.width, this.height)
  }

  allCenter () {
    // Set pivot location
    this.all.pivot.x = this.width / 2
    this.all.pivot.y = this.height / 2

    // Set x and y
    this.all.x = this.all.positionX
    this.all.y = this.all.positionYStart

    // Scale to size - must be dont after setting pivot
    this.all.scale.set(0.4)
  }

  // Create V container and center
  v (info = {}) {
    var v = new PIXI.Container()
    let vTop = this.vTop()
    let vBottom = this.vBottom()
    v.addChild(vTop)
    v.addChild(vBottom)

    // Set pivot and position
    v.x += info.x ? info.x : this.width / 2
    v.y += info.y ? info.y : this.height / 2
    if (info.pivotX && info.pivotX === 'center') { info.pivotX = v.width / 2 }
    if (info.pivotY && info.pivotY === 'center') { info.pivotY = v.height / 2 }
    v.pivot.x = info.pivotX ? info.pivotX : v.width / 2
    v.pivot.y = info.pivotY ? info.pivotY : -115

    if (info.scale) { v.scale.set(info.scale) }
    if (info.rotation) { v.rotation = info.rotation }
    if (info.alpha) { v.alpha = info.alpha }

    return v
  }

  // Create top #35495E of V
  vTop () {
    var v = new PIXI.Graphics()

    v.beginFill(this.secondaryColor)
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

  // Create bottom #41B883 of V
  vBottom () {
    var v = new PIXI.Graphics()

    v.beginFill(this.primaryColor)
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

  // Animate is responsible for calling animations in order and timing
  animate () {
    // Zoom v in
    this.zoomIn()
    .then(() => {
      this.shakeAll(0.3, 2)
      this.minisIn() // Send out the minis

      return this.spreadOut(0.5, 1)
    })
    .then(() => {
      this.spin(1)
      this.scaleOutAll(0.7)
      .then(() => {
        return this.scaleInAll(0.3)
      })

      return this.openV(0.7)
      .then(() => {
        return this.closeV(0.3)
        .then(() => {
          this.minisOut()
          return this.shakeAll(0.3, 5)
        })
      })
    })
  }

  // Take all container and zoom into positionY
  // Also create
  zoomIn (timing = 0.75) {
    return new Promise((resolve, reject) => {
      TweenMax.fromTo(this.all, timing,
        {y: -200},
        {y: this.all.positionY,
          ease: Power4.easeIn,
          onComplete: () => {
            resolve()
          }
        })

      // Create trailing zoom
      var rect = new PIXI.Graphics()
      rect.beginFill(this.primaryColor, 1)
      rect.drawRect(0, 0, 1, 2)
      rect.endFill()
      this.app.stage.addChild(rect)

      rect.pivot.x = rect.width / 2
      rect.pivot.y = 0
      rect.x = this.width / 2
      rect.y = 0

      TweenMax.to(rect, timing,
        {
          delay: 0.1,
          height: this.height,
          ease: Power4.easeOut,
          onComplete: () => {
            TweenMax.to(rect, 0.3, {
              alpha: 0,
              width: this.width,
              ease: Power4.easeIn,
              onComplete: () => {
                setTimeout(() => {
                  rect.destroy()
                }, 1000)
              }
            })
          }
        }
      )
    })
  }

  // Load a bunch mini v's and animate them in the center
  minisIn () {
    // Load a bunch of mini v's
    for (var iMini = 0; iMini < 100; iMini++) {
      let x = this.getRandomNum(-600, this.width + 600)
      let y = -200
      let toX = this.width / 2
      let toY = this.height / 2

      let vMini = this.v({
        scale: 0.3,
        x: x,
        y: y,
        pivotX: 'center',
        pivotY: 'center'
      })
      this.app.stage.addChild(vMini)
      TweenMax.to(vMini, 0.6, {
        delay: this.getRandomNum(0, 2),
        ease: Power3.easeIn,
        x: toX,
        y: toY,
        alpha: 0.3,
        height: 5,
        width: 5,
        onComplete () {
          vMini.destroy()
        }
      })
    }
  }

  // Load a bunch mini v's and animate them in the center
  minisOut () {
    // Load a bunch of mini v's
    for (var iMini = 0; iMini < 100; iMini++) {
      let x = this.width / 2
      let y = this.height / 2
      let toX = this.getRandomNum(0, this.width)
      let toY = this.getRandomNum(0, this.height)

      let vMini = this.v({
        alpha: 0,
        scale: 0.1,
        x: x,
        y: y,
        pivotX: 'center',
        pivotY: 'center'
      })
      this.app.stage.addChildAt(vMini, this.app.stage.length - 1) // Add to front
      TweenMax.to(vMini, 1, {
        delay: this.getRandomNum(0, 0.2),
        ease: Power4.easeOut,
        alpha: 0.1,
        x: toX,
        y: toY,
        onComplete: () => {
          // vMini.destroy()
          TweenMax.to(vMini, 1, {
            alpha: 0,
            x: this.getRandomNum(toX - 150, toX + 150),
            y: this.height,
            onComplete: () => {

            }
          })
        }
      })
    }
  }

  // Animate v letters spreading out
  spreadOut (timing, delay = 0.5) {
    return new Promise((resolve, reject) => {
      // Rotate top left
      TweenMax.to(this.all.children[1], timing, {
        delay: delay,
        rotation: 120 * PIXI.DEG_TO_RAD,
        ease: Power3.easeIn,
        onComplete: () => {
          this.shakeAll(0.3)
        }
      })

      // Rotate top right
      TweenMax.to(this.all.children[2], timing, {
        delay: delay * 1.5,
        rotation: 240 * PIXI.DEG_TO_RAD,
        ease: Power3.easeIn,
        onComplete: () => {
          this.shakeAll(0.3)
          resolve()
        }
      })
    })
  }

  // Animate a sweet spin
  spin (timing) {
    return new Promise((resolve, reject) => {
      // Rotate top left
      TweenMax.to(this.all, timing, {
        rotation: 720 * PIXI.DEG_TO_RAD,
        ease: Power3.easeInOut,
        onComplete: () => {
          TweenMax.to(this.all, 0, {rotation: 0})
          resolve()
        }
      })
    })
  }

  // Open all the V's
  openV (timing) {
    return new Promise((resolve, reject) => {
      // Open v and slam sh
      for (let v of this.all.children) {
        TweenMax.to(v.children[1], timing, {
          y: 100,
          onComplete: function () {
            resolve()
          }
        })
      }
    })
  }

  // Close all V's
  closeV (timing) {
    return new Promise((resolve, reject) => {
      // Open v and slam sh
      for (let v of this.all.children) {
        TweenMax.to(v.children[1], timing, {
          y: 0,
          ease: Power3.easeIn,
          onComplete: function () {
            resolve()
          }
        })
      }
    })
  }

  // Scale all container out as if its rising
  scaleOutAll (timing) {
    return new Promise((resolve, reject) => {
      // Open v and slam sh
      TweenMax.to(this.all.scale, timing, {
        x: 2,
        y: 2,
        // this.all.scale.set(0.4),
        ease: Power3.easeIn,
        onComplete: function () {
          resolve()
        }
      })
    })
  }

  // Slam down v's
  scaleInAll (timing) {
    return new Promise((resolve, reject) => {
      TweenMax.to(this.all.scale, timing, {
        x: 0.5,
        y: 0.5,
        ease: Power3.easeIn,
        onComplete: function () {
          resolve()
        }
      })
    })
  }

  // Shake all container
  shakeAll (timing = 0.3, shake = 4) {
    TweenMax.fromTo(this.all, timing,
      { x: this.all.positionX, y: this.all.positionY },
      { x: '+=' + shake,
        y: '+=' + shake,
        ease: RoughEase.ease.config({
          strength: 8, points: 20, template: Linear.easeNone, randomize: false
        })
      }
    )

    // Make sure you are back to center again
    TweenMax.to(this.all, 0, {delay: timing, x: this.all.positionX, y: this.all.positionY})
  }

  getRandomNum (min, max) {
    return Math.random() * (max - min) + min
  }
}
