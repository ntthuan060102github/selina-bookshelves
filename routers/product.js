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
    add_new_product_validator
} = require('../validation/add_product_validate')

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

module.exports = router