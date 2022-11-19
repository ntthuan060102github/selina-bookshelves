const response_data = require("../helpers/response")

const add_new_product = async (req, res, next) => {
    try {

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