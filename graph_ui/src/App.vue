<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { Position, useVueFlow, VueFlow } from '@vue-flow/core'
import type { Edge, Node } from '@vue-flow/core'
import dagre from '@dagrejs/dagre'

type NodeData = {
  name: string
  description: string
  children: NodeData[]
}

const { findNode, fitView } = useVueFlow()

const dagreGraph = ref(new dagre.graphlib.Graph())
const nodes = ref([] as Node[])
const edges = ref([] as Edge[])

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

function handleLayout() {
  dagreGraph.value = new dagre.graphlib.Graph()
  dagreGraph.value.setDefaultEdgeLabel(() => ({}))

  dagreGraph.value.setGraph({ rankdir: 'TB' })

  for (const node of nodes.value) {
    const graphNode = findNode(node.id)!

    dagreGraph.value.setNode(node.id, {
      width: graphNode.dimensions.width || 150,
      height: graphNode.dimensions.height || 50,
    })
  }

  for (const edge of edges.value) {
    dagreGraph.value.setEdge(edge.source, edge.target)
  }

  dagre.layout(dagreGraph.value)

  nodes.value = nodes.value.map((node) => {
    const nodeWithPosition = dagreGraph.value.node(node.id)

    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
    }
  })

  nextTick(() => {
    fitView()
  })
}
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <div style="width: 100%; height: 100%">
    <VueFlow :nodes="nodes" :edges="edges" @nodes-initialized="handleLayout"></VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
