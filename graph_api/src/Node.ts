export class Node {
  name: string
  description: string
  children: Node[]

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
    this.children = []
  }
}
