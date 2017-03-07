<script>
  import Vue from 'vue'
  import VueBuildIntro from '../helpers/intro.js'
  export default {
    mounted () {
      Vue.nextTick(function () {
        /* eslint-disable no-new */
        new VueBuildIntro()
      })
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
    <div id="canvasIntro" style="border: solid 1px #cccccc;"></div>
  </div>
</template>
