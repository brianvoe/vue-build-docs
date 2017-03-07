import 'pixi.js'
import { TweenMax, Power3, RoughEase, Linear } from 'gsap'
/* globals PIXI */

// Create class - needed something that was effected by vue
export default class VueBuildIntro {
  constructor () {
    this.height = window.innerHeight
    this.width = window.innerWidth
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

    // Make a container to hold all v's
    this.app.stage.addChild(this.all) // Add to state

    // Add v's to container
    for (var i = 0; i < 3; i++) {
      this.all.addChild(this.v())
    }

    // Center and scale
    this.allCenter()

    // Animate minis
    this.animateMinis()

    // Animate
    this.spreadOut(0.5, 1)
    .then(() => {
      this.animate()
    })
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
    this.all.x = this.width / 2
    this.all.y = this.height / 2

    // Scale to size - must be dont after setting pivot
    this.all.scale.set(0.3)
  }

  // Create V container and center
  v (info = {}) {
    var v = new PIXI.Container()
    let vTop = this.vTop()
    let vBottom = this.vBottom()
    v.addChild(vTop)
    v.addChild(vBottom)

    // Set pivot and position
    v.pivot.x = info.pivotX ? info.pivotX : v.width / 2
    v.pivot.y = info.pivotY ? info.pivotY : -115
    v.x += info.x ? info.x : this.width / 2
    v.y += info.y ? info.y : this.height / 2

    if (info.scale) {
      v.scale.set(info.scale)
    }

    return v
  }

  // Create top #35495E of V
  vTop () {
    var v = new PIXI.Graphics()

    v.beginFill(parseInt('35495E', 16))
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

    v.beginFill(parseInt('41B883', 16))
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

  animateMinis () {
    // Load a bunch of mini v's
    for (var iMini = 0; iMini < 100; iMini++) {
      let vMini = this.v({
        scale: 0.3,
        x: this.getRandomNum(-600, this.width + 600),
        y: -200
      })
      this.app.stage.addChild(vMini)
      TweenMax.to(vMini, 0.6, {
        delay: this.getRandomNum(0, 2),
        ease: Power3.easeIn,
        x: this.width / 2,
        y: this.height / 2,
        height: 0,
        width: 0,
        onComplete () {
          vMini.destroy()
        }
      })
    }
  }

  // Animate is responsible for calling animations in order and timing
  animate () {
    this.spin(1)
    this.scaleOutAll(0.7)
    .then(() => {
      this.scaleInAll(0.3)
    })
    this.openV(0.7)
    .then(() => {
      this.closeV(0.3)
      .then(() => {
        this.shakeAll(0.3)
      })
    })
  }

  // Animate v letters spreading out
  spreadOut (timing, delay = 0.5) {
    return new Promise((resolve, reject) => {
      // Rotate top left
      TweenMax.to(this.all.children[1], timing, {
        delay: delay,
        rotation: 120 * PIXI.DEG_TO_RAD,
        ease: Power3.easeIn
      })

      // Rotate top right
      TweenMax.to(this.all.children[2], timing, {
        delay: delay * 1.5,
        rotation: 240 * PIXI.DEG_TO_RAD,
        ease: Power3.easeIn,
        onComplete: function () {
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

  scaleInAll (timing) {
    return new Promise((resolve, reject) => {
      // Open v and slam sh
      TweenMax.to(this.all.scale, timing, {
        x: 0.5,
        y: 0.5,
        // this.all.scale.set(0.4),
        ease: Power3.easeIn,
        onComplete: function () {
          resolve()
        }
      })
    })
  }

  // Shake all container
  shakeAll (timing) {
    TweenMax.fromTo(this.all, timing,
      { x: this.width / 2, y: this.height / 2 },
      { x: '+=3',
        y: '+=3',
        ease: RoughEase.ease.config({
          strength: 8, points: 20, template: Linear.easeNone, randomize: false
        })
      }
    )

    // Make sure you are back to center again
    TweenMax.to(this.all, 0, {delay: timing, x: this.width / 2, y: this.height / 2})
  }

  getRandomNum (min, max) {
    return Math.random() * (max - min) + min
  }
}
