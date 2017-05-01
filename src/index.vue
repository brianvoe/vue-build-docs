<script>
  import nav from './components/nav.vue'
  import intro from './components/intro.vue'
  import logo from 'images/logo.png'

  export default {
    components: {
      intro: intro,
      navBar: nav
    },
    data () {
      return {
        logo: logo
      }
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
      },
      didShowIntro () {
        if (localStorage.getItem('didShowIntro') === 'true') { return true }
        return false
      }
    },
    methods: {
      showIntro () {
        localStorage.setItem('didShowIntro', false)
        this.$router.push('/')
        location.reload()
      }
    }
  }
</script>

<template>
  <div class="app">
    <intro v-if="isHome && !didShowIntro" />
    <div class="header" :class="{'large': isHome}">
      <div class="logo" @click="showIntro()"><img :src="logo" />ue Build</div>
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
