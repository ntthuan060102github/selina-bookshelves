const { query } = require('express-validator')

const add_search_term_validator = () => {
    return [
        query('searchterm')
            .isString()
            .trim()
            .isLength({ max: 50, min: 1 })
    ]
}

module.exports = {
    add_search_term_validator
}