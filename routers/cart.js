const router = require('express').Router()

const { 
    auth_user_middleware
} = require('../middlewares/auth_user')

const {
    validate_request_middleware
} = require('../middlewares/validate_request')

const {
    get_user_role_middleware
} = require('../middlewares/get_user_role')

const {
    add_product_to_cart,
    get_cart_info
} = require("../controllers/cart_handler")

const {
    add_product_to_cart_validator
} = require("../validation/add_product_to_cart")

router.post(
    "/add-product-to-cart",
    auth_user_middleware,
    get_user_role_middleware,
    add_product_to_cart_validator(),
    validate_request_middleware,
    add_product_to_cart
)

router.get(
    "/get-cart-info",
    auth_user_middleware,
    get_user_role_middleware,
    get_cart_info
)

module.exports = router