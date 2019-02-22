<template>
  <div>
    <h1>
      Nuxt.js is alive!
    </h1>
    <div>
      Current path: {{ path }}
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    path() {
      return this.$route.params.pathMatch
    }
  }
}
</script>
