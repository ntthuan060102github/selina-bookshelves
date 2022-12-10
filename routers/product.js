const router = require('express').Router()
const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage()
})

const {
    add_new_product,
    get_product_info,
    find_products
} = require("../controllers/product_handler")

const { 
    add_new_product_validator
} = require('../validation/add_product_validate')

const {
    search_term_validator
} = require('../validation/search_term_validate')

const {
    page_and_limit_validator
} = require('../validation/page_and_limit_validate')

const {
    product_id_validator
} = require('../validation/product_id_validate')

const { 
    auth_user_middleware
} = require('../middlewares/auth_user')

const {
    validate_request_middleware
} = require('../middlewares/validate_request')

const {
    process_search_term_middleware
} = require('../middlewares/process_search_term')

const {
    get_user_role_middleware
} = require('../middlewares/get_user_role')

router.post(
    "/add-new-product", 
    auth_user_middleware,
    get_user_role_middleware,
    upload.single('image'),
    add_new_product_validator(),
    validate_request_middleware, 
    add_new_product
)

router.get(
    "/get-product-info",
    auth_user_middleware,
    get_user_role_middleware,
    product_id_validator(),
    validate_request_middleware,
    get_product_info
)

router.get(
    "/search",
    auth_user_middleware,
    get_user_role_middleware,
    page_and_limit_validator(),
    search_term_validator(),
    validate_request_middleware,
    process_search_term_middleware,
    find_products
)

router.get(
    "/get-products-at-home",
    auth_user_middleware,
    get_user_role_middleware,
    page_and_limit_validator(),
    validate_request_middleware,
    find_products
)

module.exports = router