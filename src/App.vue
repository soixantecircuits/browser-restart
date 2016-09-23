<template>
  <head>
  </head>
  <div>
    <Display></Display>
  </div>
</template>

<script>
import Display from 'components/Display.vue'
import store from './vuex/store'

export default {
  components: {
    Display: Display
  },
  store: store
}
</script>
