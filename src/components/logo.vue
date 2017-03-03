<script>
  import VueBuildLogo from '../helpers/logo.js'
  export default {
    props: {
      height: { type: Number, required: true },
      width: { type: Number, required: true }
    },
    mounted () {
      /* eslint-disable no-new */
      new VueBuildLogo(this.height, this.width)
    }
  }
</script>

<template>
  <div class="logo">
    <div id="canvasLogo" style="border: solid 1px #cccccc;"></div>
  </div>
</template>
