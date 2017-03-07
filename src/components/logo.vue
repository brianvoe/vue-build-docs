<script>
  import VueBuildLogo from '../helpers/logo.js'
  export default {
    mounted () {
      /* eslint-disable no-new */
      new VueBuildLogo()
    }
  }
</script>

<template>
  <div class="logo">
    <div id="canvasLogo" style="border: solid 1px #cccccc; margin: 0 auto;"></div>
  </div>
</template>
