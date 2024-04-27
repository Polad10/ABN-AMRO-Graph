<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { Position, useVueFlow, VueFlow } from '@vue-flow/core'
import type { Edge, GraphNode, Node, NodeMouseEvent } from '@vue-flow/core'
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

const showDescription = ref(false)
const selectedNode = ref({} as GraphNode)
const selectedNodeName = ref('')
const selectedNodeDescription = ref('')

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
      // "process" node type has input and output
      let nodeType = 'process'

      // set node type "input" for root
      // set node type "output" for leaf nodes
      if (!rootProcessed) {
        nodeType = 'input'
        rootProcessed = true
      } else if (nodeData.children.length === 0) {
        nodeType = 'output'
      }

      nodes.value.push({
        id: nodeData.name,
        label: nodeData.name,
        data: { description: nodeData.description },
        position: { x: 0, y: 0 },
        type: nodeType,
      })

      // create an edge from current node to its children
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

function handleNodeClick(event: NodeMouseEvent) {
  selectedNode.value = event.node
  selectedNodeName.value = selectedNode.value.id
  selectedNodeDescription.value = selectedNode.value.data.description

  showDescription.value = true
}

function closeDescription() {
  selectedNode.value.selected = false
  showDescription.value = false
}
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <div style="width: 100%; height: 100%">
    <div class="h-48">
      <div v-if="showDescription" class="card w-96 h-48 shadow-xl">
        <div class="card-body">
          <div class="card-actions justify-end">
            <button class="btn btn-square btn-sm" @click="closeDescription">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-lg">{{ selectedNodeName }}</p>
          <p>{{ selectedNodeDescription }}</p>
        </div>
      </div>
    </div>
    <VueFlow :nodes="nodes" :edges="edges" @nodes-initialized="handleLayout" @node-click="handleNodeClick"></VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
