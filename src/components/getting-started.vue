<template>
  <div>
    <h1>Getting Started</h1>
    <p>
      Getting a vue application up and running with vue-build is extremely simple.
      First we need to globally install vue-build so that way we can easily run
      vue-build commands.
    </p>
    <pre v-highlightjs><code class="bash">
    npm install -g vue-build
    </code></pre>

    <h3>Creating a new application</h3>
    <p>
      Inside the folder that will contain your project, just type:
    </p>
    <pre v-highlightjs><code class="bash">
    vue-build init
    </code></pre>

    <p>vue-build will ask a few questions about your project, and then
    generate some files. Be sure to run <code class="bash">npm install</code>
    afterward.</p>
    <p>
      <strong>Note:</strong> See <router-link to="/structure">folder structure</router-link> for more details
      on the minimum and maximum amount of files and folders needed to create an application.
    </p>

    <p>Now, you're ready to <router-link to="/development">run the app</router-link>.</p>
  </div>
</template>
