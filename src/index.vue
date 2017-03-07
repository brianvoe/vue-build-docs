<script>
  import nav from './components/nav.vue'
  import intro from './components/intro.vue'

  export default {
    components: {
      intro,
      navBar: nav
    },
    mounted () {
      // Lets redirect to path
      if (this.$route.query.p) {
        this.$router.push({ path: this.$route.query.p })
      }
    },
    computed: {
      isHome () {
        return this.$route.path === '/'
      }
    }
  }
</script>

<template>
  <div class="app">
    <intro />
    <div class="header" :class="{'large': isHome}">
      <div class="tagline">Taking the frustrating build process and clutter out of your application</div>
    </div>
    <div class="container">
      <navBar />
      <div class="main">
        <transition name="fade" mode="out-in" appear>
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </div>
</template>
