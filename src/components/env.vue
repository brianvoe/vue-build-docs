<template>
  <div>
    <h1>Environment Config</h1>

    <p>If your app needs to behave differently depending on its deployment
    environment, you can create environment variables using the optional
    <code>[project root]/env.js</code> file. Every property you export from
    <code>[project root]/env.js</code> will be replaced by its value in the
    application before compilation.</p>

    <p>Here's a typical use case:</p>

    <pre v-highlightjs><code class="javascript">
    // env.js
    module.exports = {
      API_HOSTNAME: process.env.API_HOSTNAME || 'http://localhost:1000',
      THIRD_PARTY_API_KEY: process.env.THIRD_PARTY_KEY || 'my_development_key'
    }
    </code></pre>

    <p>In your app, you could access these variables like so:</p>
    <pre v-highlightjs><code class="javascript">
    // the line below prevents eslint from freaking out about your global
    // variables (you only need to specify the ones you use in this file):

    /* global API_HOSTNAME, THIRD_PARTY_API_KEY */

    function getData () {
      return fetch(API_HOSTNAME + '/my-endpoint')
    }

    function queryThirdPartyService () {
      return fetch(`http://api.some-service.com/?key=${THIRD_PARTY_API_KEY}&query=${query}`)
    }
    </code></pre>

    <p>The end result will be a file that looks like this:</p>
    <pre v-highlightjs><code class="javascript">
    // the line below prevents eslint from freaking out about your global
    // variables (you only need to specify the ones you use in this file):

    /* global API_HOSTNAME, THIRD_PARTY_API_KEY */

    function getData () {
      return fetch("localhost:1000" + '/my-endpoint')
    }

    function queryThirdPartyService () {
      return fetch(`http://api.some-service.com/?key=${"my_development_key"}&query=${query}`)
    }
    </code></pre>

    <p>Note that both environment variables have a default set -- say, for the
    sake of argument, that these defaults are used in development environments.
    when deploying for production, you could override them like so:</p>

    <pre v-highlightjs><code class="bash">
      API_HOSTNAME='http://my.api.com' THIRD_PARTY_API_KEY='production_key' vue-build prod
    </code></pre>

    <p>This replacement is performed by using webpack's DefinePlugin, which has a few
    gotchas. If your environment variables don't work the way you expect them to,
    check out <a href="https://webpack.js.org/plugins/define-plugin/">documentation
    on the DefinePlugin</a>.</p>
  </div>
</template>
