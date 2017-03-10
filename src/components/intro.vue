<script>
  import VueBuildIntro from '../helpers/intro.js'
  export default {
    mounted () {
      /* eslint-disable no-new */
      new VueBuildIntro(this.introCallback)
    },
    methods: {
      introCallback (action) {
        console.log(action)
        if (action === 'getting-started') { this.gettingStarted() }
      },
      gettingStarted () {
        alert('hello')
      }
    }
  }
</script>

<style lang="scss">
  @import "~src/assets/css/_variables.scss";

  .intro {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: $white;

    #canvasIntro {
      height: 100%;
      width: 100%;
    }
  }
</style>

<template>
  <div class="intro">
    <div id="canvasIntro"></div>
  </div>
</template>
