<script>
  /* globals TweenMax, Power3 */
  import VueBuildIntro from '../helpers/intro.js'
  export default {
    mounted () {
      /* eslint-disable no-new */
      new VueBuildIntro(this.introCallback)
    },
    methods: {
      introCallback (action) {
        if (action === 'getting-started') { this.gettingStarted() }
        if (action === 'features') { this.features() }
      },
      gettingStarted () {
        this.$router.push('getting-started')
        TweenMax.to(document.getElementById('intro'), 1, {
          top: -window.innerHeight,
          ease: Power3.easeInOut,
          onComplete: () => {
            document.getElementById('intro').style.display = 'none'
          }
        })
      },
      features () {
        this.$router.push('/')
        TweenMax.to(document.getElementById('intro'), 1, {
          top: -window.innerHeight,
          ease: Power3.easeInOut,
          onComplete: () => {
            document.getElementById('intro').style.display = 'none'
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  @import "~src/assets/css/_variables.scss";

  #intro {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: $white;
    z-index: 1000;

    #canvasIntro {
      height: 100%;
      width: 100%;
      background-color: $white;

      canvas {
        background: $white;
      }
    }
  }
</style>

<template>
  <div id="intro">
    <div id="canvasIntro"></div>
  </div>
</template>
