<template>
  <section class="container">
    <div>
      <logo />
      <h1 class="title">
        Admin Nested Route
      </h1>
      <h2 class="subtitle">
        Trying to be sure our routes SSR in app & admin.
      </h2>
      <NuxtLink to="/">
        back to admin home
      </NuxtLink>
    </div>
  </section>
</template>

<script>
import Logo from '~shared/components/Logo.vue'

export default {
  components: { Logo }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
