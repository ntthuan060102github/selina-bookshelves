const response_data = require("../helpers/response")
const { redis_base } = require("../helpers/redis_base")

const auth_user_middleware = (req, res, next) => {
    try {
        const access_token = req.headers.authorization
        if (!access_token) {
            return res.json(response_data(
                    data = "access_token_expired",
                    status_code=2
                )
            )
        }
        next()
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
    auth_user_middleware
}