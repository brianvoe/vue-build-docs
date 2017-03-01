<template>
  <div>
    <h1>Creating a Library</h1>
    <p>If you want to create a reusable library suitable for use in other Javascript
    projects (Vue or otherwise), you can use vue-build's library project template.
    Just run</p>

    <pre v-highlightjs><code class="bash">
      vue-build init -s library
    </code></pre>

    <p>or run <code>vue-build init</code> and select "Library" from the menu.</p>

    <p>Like other projects, library projects support vue-build commands including:</p>

    <ul>
      <li><code>vue-build dev</code>,</li>
      <li><code>vue-build unit</code>, and</li>
      <li><code>vue-build prod</code></li>
    </ul>

    <p>(we didn't include e2e tests in the library template, but you can add them
    if you wish.)</p>

    <p>There's one particularly important difference between libraries and other
    projects, however: the configuration of their entry points.</p>

    <h3>Entry points (<code>dev</code> vs. <code>index</code>)</h3>

    <p>In order to develop your library, you'll want to use it inside of a running
    sample application -- but you won't want to distribute that application or
    its code with the finished, compiled version of your library. This doesn't
    line up well with other vue-build templates, which assume your project
    has a <strong>single entry point</strong> (i.e., <code>src/index.js</code>).
    To that end, the <code>webpack.conf.js</code> file in library projects is
    configured to use two separate entry points: <code>src/dev.js</code> in
    development, and <code>src/index.js</code> when building for production.</p>

    <ul>
      <li>
        <code>src/index.js</code> is your library as your users will see it --
        whatever you <code>export</code> from <code>index.js</code> is what you'll
        get when you <code>import</code> library from another application. <strong>Everything
        you <code>import</code></strong> inside of <code>index.js</code> will be bundled with
        your library when it's compiled, unless you <a href="https://webpack.js.org/configuration/externals/">
        mark those dependencies as externals</a> in your <code>webpack.conf.js</code>.
      </li>

      <li>
        <code>src/dev.js</code> is what runs when you do <code>vue-build dev</code>.
        It can <code>import</code> your library code and use it as a normal application
        would. <strong>Nothing you import</strong> from <code>dev.js</code>
        (except for <code>index.js</code>) will be bundled with your library when
        it's compiled.
      </li>
    </ul>
  </div>
</template>
