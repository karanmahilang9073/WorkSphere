import request from 'supertest'
import app from '../app.js'


describe('backend API', () => {
    test('GET / should return backend running successfully', async() => {
        const res = await request(app).get('/')

        expect(res.statusCode).toBe(200)
        expect(res.text).toBe('backend running successfully')
    })
})