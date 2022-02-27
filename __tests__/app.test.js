const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed  = require('../db/seeds/seed.js');
const app = require('../app')
const request = require('supertest');
const { response } = require('../app');
const endpoints = require('../endpoints.json')


beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/api/invalid_endpoint', () => {
    test('404 : responds with error message', () => {
        return request(app)
        .get('/api/invalid_endpoint')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('404: Not found, Please check URL!')
        })
    })
})

describe('/api/topics', () => {
    test(' GET 200: responds with array of topics', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((res) => {
            expect(res.body.topics).toBeInstanceOf(Array);
            expect(res.body.topics.length).toBe(3)
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
                expect(res.body.article).toEqual({
                author: 'rogersop',
                title: 'UNCOVERED: catspiracy to bring down democracy',
                article_id: 5,
                 body: 'Bastet walks amongst us, and the cats are taking arms!',
                 topic: 'cats',
                 created_at: '2020-08-03T13:14:00.000Z',
                 votes: 0,
                 comment_count: 2
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
        test('Status 200 and updates specified object', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({
                inc_votes: 3
            })
            .expect(200)
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
        test('400: Bad request for malformed body/missing required fields', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({})
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe("Bad Request")
            })
        })

        test('400: Bad request when invalid article id entered', () => {
            return request(app)
            .patch('/api/articles/notAnId')
            .send({
                inc_votes: 1
            })
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Bad Request')
            })
        });

        test('404: Not Found', () => {
            return request(app)
            .get("/api/articles/999999")
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe("No article found for article_id: 999999")
            })
        })
        
        test('400: Bad request when incorrect data type entered', () => {
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

describe('/api/articles', () => {
    describe('GET: Happy Paths', () => {
        test('returns an array of articles', () => {
            return request(app)
            .get('/api/articles')
            .expect(200)
            .then((res) => {
                expect(res.body.articles).toBeInstanceOf(Array);
                expect(res.body.articles.length).toBe(12);
                res.body.articles.forEach((article) => {
                    expect(article).toMatchObject({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number)
                    })
                })

            })
        })

        test('returns an array of articles sorted by created_at and ordered by DESC by default', () => {
            return request(app)
            .get('/api/articles')
            .expect(200)
            .then((res) => {
                expect(res.body.articles).toBeSortedBy('created_at', { descending: true })
            })
        });

        test('returns an array of articles sorted by a query', () => {
            return request(app)
            .get('/api/articles?sort_by=article_id')
            .expect(200)
            .then((res) => {
                expect(res.body.articles).toBeSortedBy('article_id', { descending: true })
            })
        })

        test('returns an array of articles ordered by inputted query', () => {
            return request(app)
            .get('/api/articles?order=asc')
            .expect(200)
            .then((res) => {
                expect(res.body.articles).toBeSorted({ coerce: true} )
            })
        })

        test('returns an array of articles filtered by inputted query', () => {
            return request(app)
            .get('/api/articles?topic=mitch')
            .expect(200)
            .then((res) => {
                expect(res.body.articles.length).toBe(11)
                expect(res.body.articles.every((article) => article.topic === "mitch")).toBe(true)

            })
        })

        test('returns an empty array with valid topic query which has no articles', () => {
            return request(app)
            .get('/api/articles?topic=paper')
            .expect(200)
            .then((res) => {
                expect(res.body.articles.length).toBe(0)
            })
        });
    })
    describe('GET: Error handling', () => {
        test('400: invalid sort query', () => {
            return request(app)
            .get('/api/articles?sort_by=chicken')
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Invalid sort query')
            })
        })

        test('400: invalid order query', () => {
            return request(app)
            .get('/api/articles?order=invalid')
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Invalid order query')
            })
        })

        test('404: Invalid topic query', () => {
            return request(app)
            .get('/api/articles?topic=chickenburger')
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('Topic not found')
            })
        })
    })
})

describe('/api/articles/:article_id/comments', () => {
    describe('GET Happy paths', () => {
        test('returns an array of comments', () => {
            return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then((res) => {
               expect(res.body.comments).toBeInstanceOf(Array)
               res.body.comments.forEach((comment) => {
                   expect(comment).toMatchObject({
                       comment_id: expect.any(Number),
                       votes: expect.any(Number),
                       created_at: expect.any(String),
                       author: expect.any(String),
                       body: expect.any(String)
                   })
               })
            })
        })

        test('returns an empty array if article exists but has no comments', () => {
            return request(app)
            .get('/api/articles/8/comments')
            .expect(200)
            .then((res) => {
                expect(res.body.comments).toBeInstanceOf(Array)
            })

        })
    })
    describe('GET: Error handling', () => {
        test('400: Bad request', () => {
            return request(app)
            .get("/api/articles/notAnId/comments")
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Bad request, please enter a valid number' )
            })
        })

        test('404: article not found', () => {
            return request(app)
            .get('/api/articles/99999/comments')
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('No article found for article_id: 99999')
            })
        })
    })
    describe('POST: Happy path', () => {
        test('201: returns posted comment', () => {
            return request(app)
            .post('/api/articles/8/comments')
            .send({
                username: "butter_bridge",
                body: "When we going Phillies boys?"
            })
            .expect(201)
            .then((res) => {
                expect(res.body.newComment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String)
                })
            })
        })
    })
    describe('POST: Error handling', () => {
        test('400: Bad request when invalid article ID entered', () => {
            return request(app)
            .post('/api/articles/notanID/comments')
            .send({
                username: "butter_bridge",
                body: "Hello!"
            })
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Please enter a valid article_id')
            })
        })

        test('400: Bad request when wrong datatype entered in post request', () => {
            return request(app)
            .post('/api/articles/8/comments')
            .send({
                username: 2222,
                body: 2345
            })
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Incorrect datatype for post request')
            })
        })
        test('404: article does not exist, when article does not exists under specified id', () => {
            return request(app)
            .post('/api/articles/1234/comments')
            .send({
                username: "butter_bridge",
                body: "Hello!"
            })
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('No article found for article_id: 1234')
            })
        })

        test('404: username does not exist, when username that is not in database is entered', () => {
            return request(app)
            .post('/api/articles/8/comments')
            .send({
                username: "Rayhaan2k9",
                body: "Hello!"
            })
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('User does not exist')
            })
        })
    })
})

describe('/api/comments/:comment_id', () => {
    describe('DELETE: Happy path', () => {
        test('status 204: deletes a comment by id', () => {
            return request(app)
            .delete('/api/comments/2')
            .expect(204)
        });
    });

    describe('DELETE: Error handling', () => {
        test('400: Bad request when invalid comment id entered', () => {
            return request(app)
            .delete('/api/comments/notAComment')
            .expect(400)
            .then((res) => {
                expect(res.body.message).toBe('Please enter a valid comment_id')
            })
        });

        test('404: comment does not exist under specified id when number is entered but no comment with that id', () => {
            return request(app)
            .delete('/api/comments/1000')
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('No comment found for comment_id: 1000')
            })
        });
    });
});

describe('/api', () => {
    describe('GET Happy path', () => {
        test('returns a JSON describing available endpoints on api', () => {
            return request(app)
            .get('/api')
            .expect(200)
            .then((res) => {
                expect(res.body).toEqual(endpoints)
            })
        });
    });
    
});

describe('/api/users', () => {
    describe('GET: Happy path', () => {
        test('Returns an array of objects containing a data of users', () => {
            return request(app)
            .get('/api/users')
            .expect(200)
            .then((res) => {
                expect(res.body.users).toBeInstanceOf(Array)
                res.body.users.forEach((user) => {
                    expect(user).toMatchObject({
                       username: expect.any(String), 
                       avatar_url: expect.any(String),
                       name: expect.any(String)
                    })
                })
            })
        });
    });

    describe('GET: Error handling', () => {
        test('404: Not found when invalid URL entered', () => {
            return request(app)
            .get('/api/user')
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('404: Not found, Please check URL!')
            })
        });
    });
});

describe('/api/users/:username', () => {
    describe('GET: Happy path', () => {
        test('returns specified username object', () => {
            return request(app)
            .get('/api/users/butter_bridge')
            .expect(200)
            .then((res) => {
                expect(res.body.user).toEqual({
                    username: "butter_bridge",
                    avatar_url: "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                    name: "jonny"
                })
            })
        });
    });

    describe('GET: Error handling', () => {
        test('Status 404: When username that does not exist is entered', () => {
            return request(app)
            .get('/api/users/Rayhaan2k9')
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe("User does not exist")
            })
        });
    });
});

