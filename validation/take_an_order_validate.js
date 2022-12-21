const { check } = require('express-validator')

const take_an_order_validate = () => {
    return [
        check("book_group_id").isNumeric().isInt()
    ]
}

module.exports = {
    take_an_order_validate
}