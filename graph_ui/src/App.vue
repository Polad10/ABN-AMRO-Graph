<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Elements } from '@vue-flow/core'
import { VueFlow } from '@vue-flow/core'

let graphData = ref({})

const elements = ref<Elements>([
  { id: '1', type: 'input', label: 'Node 1', position: { x: 250, y: 5 } },
  { id: '2', label: 'Node 2', position: { x: 100, y: 100 } },
  { id: '3', type: 'output', label: 'Node 3', position: { x: 400, y: 200 } },

  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-2', source: '1', target: '2', animated: true },
])

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

  <div style="width: 100%; height: 100%">
    <VueFlow v-model="elements"></VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
