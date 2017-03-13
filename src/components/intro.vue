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
      },
      gettingStarted () {
        TweenMax.to(document.getElementById('intro'), 1, {
          top: -window.innerHeight,
          ease: Power3.easeInOut,
          onComplete: () => {
            // document.getElementById('intro').style.display = 'none'
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
    left: 0;
    background-color: $white;

    #canvasIntro {
      height: 100%;
      width: 100%;
    }
  }
</style>

<template>
  <div id="intro">
    <div id="canvasIntro"></div>
  </div>
</template>
