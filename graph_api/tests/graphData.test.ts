import request from 'supertest'
import { server } from '../src/App'

afterAll(() => {
  server.close()
})

describe('GET /graphData', () => {
  it('should return not empty json of nodes', async () => {
    const res = await request(server).get('/graphData')

    const resBody = JSON.parse(res.text)

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    expect(Object.keys(resBody).length).toBeGreaterThan(0)
  })
})
