<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { Edge, Node } from '@vue-flow/core'

type NodeData = {
  name: string
  description: string
  children: NodeData[]
}

let nodes = ref([] as Node[])
let edges = ref([] as Edge[])

onMounted(async () => {
  const response = await fetch('http://localhost:3000')
  let nodesData: NodeData = await response.json()

  extractNodesAndEdges(nodesData)
})

function extractNodesAndEdges(nodesData: NodeData) {
  let nodesToProcess = [nodesData]
  let rootProcessed = false

  while (nodesToProcess.length > 0) {
    let children = [] as NodeData[]

    for (const nodeData of nodesToProcess) {
      let nodeType = 'process'

      if (!rootProcessed) {
        nodeType = 'input'
        rootProcessed = true
      } else if (nodeData.children.length === 0) {
        nodeType = 'output'
      }

      nodes.value.push({ id: nodeData.name, label: nodeData.name, position: { x: 0, y: 0 }, type: nodeType })

      const newEdges = nodeData.children.map((child) => ({
        id: `${nodeData.name}-${child.name}`,
        source: nodeData.name,
        target: child.name,
      }))

      edges.value.push(...newEdges)

      children.push(...nodeData.children)
    }

    nodesToProcess = children
  }
}
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <div style="width: 100%; height: 100%">
    <VueFlow :nodes="nodes" :edges="edges"></VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
