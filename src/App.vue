<template>
  <div>
    <Display></Display>
  </div>
</template>

<script>
import Display from 'components/Display.vue'
import store from './vuex/store'
/*
<Getnumber></Getnumber>
<Increment></Increment>
<Discrement></Discrement>
*/
export default {
  components: {
    Display: Display
  },
  store: store
}
</script>
