const { check } = require('express-validator');

const create_account_validator = () => {
    return [
        check("title").isString().isLength({ max: 50, min: 1 }),
        check("desc").isString().isLength({ max: 200, min: 0 }),
        check("quantity").isInt()
    ]
}