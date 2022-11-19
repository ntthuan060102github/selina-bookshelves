const router = require('express').Router()

const {
    add_new_product
} = require("../controllers/product_handler")

const { 
    add_new_product_validator
} = require('../validation/add_product_validate')

const { 
    auth_user_middleware
} = require('../middlewares/auth_user')

router.post(
    "/add-new-product", 
    auth_user_middleware, 
    add_new_product_validator(), 
    add_new_product
)

module.exports = router