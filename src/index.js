import Vue from 'vue'
import index from 'src/index.vue'
import router from './router.js'

// we use a custom build of highlightjs to cut down on size
// (and custom builds apparently only export themselves as globals? when I tried
// import hljs from 'path' the ENTIRE APP disappeared with no error messages. so.)
import 'src/vendor/highlight/highlight.pack.js'
import './assets/css/index.scss'
import './google-analytics'

/* global hljs */

Vue.directive('highlightjs', {
  deep: true,
  bind: function (el, binding) {
    // on first bind, highlight all targets
    let targets = el.querySelectorAll('code')
    targets.forEach((target) => {
      // if a value is directly assigned to the directive, use this
      // instead of the element content.
      if (binding.value) {
        target.innerHTML = binding.value
      }
      hljs.highlightBlock(target)
    })
  },
  componentUpdated: function (el, binding) {
    // after an update, re-fill the content and then highlight
    let targets = el.querySelectorAll('code')
    targets.forEach((target) => {
      if (binding.value) {
        target.innerHTML = binding.value
        hljs.highlightBlock(target)
      }
    })
  }
})

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  render: (h) => h(index)
})
