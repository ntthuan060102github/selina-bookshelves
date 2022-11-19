const response_data = require("../helpers/response")
const { validationResult } = require('express-validator');

const add_new_product = async (req, res, next) => {
    try {
        const input_validate = validationResult(req)
        if (!input_validate.isEmpty()) {
            return res.json(response_data(input_validate.array(), status_code=4))
        }

    }
    catch (err) {
        return res.json(response_data(
            data=err.message, 
            status_code=4, 
            message="Lỗi hệ thống!"
            )
        )
    }
}

module.exports = {
    add_new_product
}