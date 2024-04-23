<script setup lang="ts">
import { onMounted, ref } from 'vue'

let graphData = ref({})

onMounted(async () => {
  const response = await fetch('http://localhost:3000')
  graphData.value = await response.json()
})
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <pre>{{ graphData }}</pre>
  </main>
</template>

<style scoped></style>
