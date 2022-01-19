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
    describe('GET: Happy path', () => {
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
    
        describe('GET : Error handling', () => {
            test('400: Bad request', () => {
                return request(app)
                .get("/api/articles/notAnId")
                .expect(400)
                .then((res) => {
                    expect(res.body.message).toBe('Bad Request')
                })
            })
        
            test('404: Not Found', () => {
                return request(app)
                .get("/api/articles/999999")
                .expect(404)
                .then((res) => {
                    expect(res.body.message).toBe("No article found for article_id: 999999")
                })
            })
        })
    })
    describe('PATCH: Happy path', () => {
        test('Status 201 and updates specified object', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({
                inc_votes: 3
            })
            .expect(201)
            .then((res) => {
                expect(res.body.article).toEqual({
                    article_id: 1,
                    title: 'Living in the shadow of a great man',
                    body: 'I find this existence challenging',
                    votes: 103,
                    topic: 'mitch',
                    author: 'butter_bridge',
                    created_at: '2020-07-09T20:11:00.000Z'
                })
            })
        })
    })
    describe('PATCH: Error handling', () => {
        test.only('400: Bad request for malformed body/missing required fields', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({})
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe("Bad Request")
            })
        })
        
        test.only('400: Bad request when incorrect data type entered', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({inc_votes: "notANumber"})
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Bad Request')
            })

        })
    })
})
