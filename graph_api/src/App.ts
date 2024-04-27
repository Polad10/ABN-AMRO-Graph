import express, { Express } from 'express'
import { graphData } from './GraphData'
import { Node } from './Node'
import cors from 'cors'

const app: Express = express()
const port = process.env.PORT || 3000

app.use(cors())

app.get('/graphData', (req, res) => {
  const nameNodeMapping = new Map<string, Node>()
  let root: Node | null = null

  for (const data of graphData) {
    const newNode = new Node(data.name, data.description)

    nameNodeMapping.set(data.name, newNode)
    nameNodeMapping.get(data.parent)?.children.push(newNode)

    if (!data.parent) {
      root = newNode
    }
  }

  res.json(root)
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
