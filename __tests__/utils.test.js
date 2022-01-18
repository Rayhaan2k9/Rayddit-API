const getCount = require('../utils/utils')

describe('getCount', () => {
    test('returns a number', () => {
        expect(typeof getCount(1)).toBe('number')
    })
    test('returns the count of comments on an article', () => {
        expect(getCount(1)).toBe(11)
    })
})