<script>
  export default {

  }
</script>

<template>
  <div>
    <h1>Running Your App</h1>
    <p>
      To run your app for development, use
    </p>

    <pre v-highlightjs><code class="bash">
    vue-build dev
    </code></pre>

    <p>This command starts a
    <a href="https://webpack.js.org/configuration/dev-server/">webpack
    development server</a> (on <code>localhost:8080</code> by default). Once you
    load the app in your browser, any changes you make to your code will
    trigger a recompile, and then automatically appear in your app.</p>

    <p>In vue-build applications, the default <a href="https://webpack.js.org/concepts/entry-points/">entry point</a> is <code>src/app.js</code>. When
    your application runs in the browser, the <strong>contents of this file are the
    first thing to run</strong>. In the default project template, <code>src/app.js</code>
    sets up a Vue app for you, and "mounts" it in the page inside of
    <code class="html" v->
      &lt;div id="app"&gt;&lt;/div&gt;
    </code>.</p>

    <h2>Writing components</h2>

    <p>vue-build includes <a href="http://vue-loader.vuejs.org/en/">vue-loader</a>,
    which allows you to load single-file components from <code>.vue</code> files.</p>

    <p>If you haven't used vue-loader before, check out your project's
    <code>app.vue</code> file for an example. For more details on the
    <code>.vue</code> format, see <a href="http://vue-loader.vuejs.org/en/start/spec.html">the official spec</a>.</p>

    <h2>Styling</h2>

    <p>vue-build includes support for CSS and SCSS, though you can add other
    styling languages by <router-link to="/webpack">overriding your webpack config</router-link>. To include a style in your project, just import it
    from a Javascript file like so:</p>

    <pre v-highlightjs><code class="javascript">
    import './relative/path/to/some.scss'
    </code></pre>

    <p>You can use SCSS inside the <code class="html">&lt;style&gt;</code>
    block of a <code>.vue</code> component file like so:</p>

    <pre v-highlightjs><code class="html">
      &lt;style lang="scss"&gt;
        // SCSS will work in here now
      &lt;/style&gt;
    </code></pre>

    <p>Note that styles in components don't share any variables, mixins, or
    placeholders with other SCSS files in your project. If you want to bring
    those things in, you'll need to <code class="scss">@import</code> them.
    <strong>Make sure that you only import partials from your components.
    </strong> If you import full styles, they'll be duplicated in every
    component, bloating your build and slowing down development.</p>

    <h2>Error overlay</h2>
    <p>
      During development if there are any linting, syntax errors or module import issues,
      they will be displayed as an overlay in the current running browser.
    </p>
    <img width="100%" src="../assets/images/screenshots/error_screen.jpg" />
  </div>
</template>
