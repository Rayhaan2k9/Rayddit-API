const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed  = require('../db/seeds/seed.js');
const app = require('../app')
const request = require('supertest');
const { response } = require('../app');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/api/invalid_endpoint', () => {
    test('404 : responds with error message', () => {
        return request(app)
        .get('/api/invalid_endpoint')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Not found!')
        })
    })
})

describe('/api/topics', () => {
    test('200: responds with array of topics', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((res) => {
            expect(res.body.topics).toBeInstanceOf(Array);
            res.body.topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String)
                })
            })
        })
    })
    
})

describe('/api/articles/:article_id', () => {
    test('200: responds with specified object', () => {
        return request(app)
        .get('/api/articles/5')
        .expect(200)
        .then((res) => {
            expect(res.body.article).toMatchObject({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                body: expect.any(String),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(Number)
            })
        })
    })
})
