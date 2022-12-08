const router = require('express').Router()
const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage()
})

const {
    add_new_product,
    get_product_info
} = require("../controllers/product_handler")

const {
    search_product
} = require('../controllers/search_handler')

const { 
    add_new_product_validator
} = require('../validation/add_product_validate')

const {
    add_search_term_validator
} = require('../validation/add_search_validate')

const { 
    auth_user_middleware
} = require('../middlewares/auth_user')

router.post(
    "/add-new-product", 
    auth_user_middleware, 
    upload.single('image'),
    add_new_product_validator(), 
    add_new_product
)

router.get(
    "/get-product-info",
    auth_user_middleware,
    get_product_info
)

router.get(
    "/search",
    auth_user_middleware,
    add_search_term_validator(),
    search_product
)

module.exports = router