<script>
  export default {
    data () {
      return {
        canvas: null
      }
    },
    mounted () {
      this.canvas = document.getElementById('canvasLogo')

      let v = this.v()
      let angle = 0
      console.log(v)
      // v.scale(0.2, 0.2)

      window.setInterval(() => {
        v.vTop.save()
        angle = (angle + 1) % 360
        v.vTop.rotate(angle * Math.PI / 180)
        v.vTop.restore()
        // console.log('hello')
      }, 5)
    },
    methods: {
      v () {
        var vTop = this.canvas.getContext('2d')
        vTop.beginPath()
        vTop.fillStyle = '#35495E'
        vTop.moveTo(80, 0)
        vTop.lineTo(200, 205)
        vTop.lineTo(320, 0)
        vTop.lineTo(250, 0)
        vTop.lineTo(200, 80)
        vTop.lineTo(155, 0)
        vTop.lineTo(80, 0)
        vTop.fill()

        var vBottom = this.canvas.getContext('2d')
        vBottom.beginPath()
        vBottom.fillStyle = '#41B883'
        vBottom.moveTo(0, 0)
        vBottom.lineTo(200, 345)
        vBottom.lineTo(400, 0)
        vBottom.lineTo(320, 0)
        vBottom.lineTo(200, 205)
        vBottom.lineTo(80, 0)
        vBottom.lineTo(0, 0)
        vBottom.fill()

        return { vTop, vBottom }
      }
    }
  }
</script>

<template>
  <div class="logo">
    <canvas id="canvasLogo" width="500" height="500" style="border: solid 1px #cccccc;"></canvas>ue-build
  </div>
</template>
