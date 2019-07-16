<template>
  <div class="links">
    <div class="link-target" @click="toggleLinks">
      Links
      <strong>v</strong>
      <div v-if="active" ref="dropdown" class="links-dropdown">
        <NuxtLink to="/first">
          First
        </NuxtLink>
        <NuxtLink to="/second">
          Second
        </NuxtLink>
        <NuxtLink to="/third">
          Third
        </NuxtLink>
        <NuxtLink to="/fourth">
          Fourth
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Links',
  data () {
    return {
      active: false
    }
  },
  methods: {
    toggleLinks () {
      this.active = !this.active
    }
  }
}
</script>

<style>
.link-target {
  position: relative;
  display: inline-block;
  border: solid 1px lightgrey;
  padding: 4px 8px;
  font-size: 14px;
}
.links-dropdown a:hover,
.link-target:hover {
  cursor: pointer;
  background: #eee;
}
.links-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  border: solid 1px lightgrey;
}
.links-dropdown a {
  display: block;
  padding: 4px 8px;
  border-bottom: solid 1px lightgrey;
  text-align: left;
}
.links-dropdown a:last-child {
  border-bottom: solid 0px transparent;
}
</style>
