const response_data = require("../helpers/response")
const upload_image = require("../helpers/upload_image_to_storage")
const get_session_data = require("../helpers/get_session_data")
const { validationResult } = require('express-validator');
const Product = require('../models/product')

const add_new_product = async (req, res, next) => {
    try {
        const input_validate = validationResult(req)

        if (!input_validate.isEmpty()) {
            return res.json(response_data(input_validate.array(), status_code=4))
        }
        const session_data = JSON.parse(await get_session_data(req))
        const seller_id = session_data.user_id
        const body = req.body
        const product_image = req.file

        if (product_image && !product_image.mimetype.includes("image")) {
            return res.json(response_data("image_invalid", status_code=4, message="Hình ảnh không hợp lệ!"))
        }
        console.log(product_image)
        const upload_image_res = await upload_image(product_image)
        console.log(upload_image_res)
        const image_url = upload_image_res?.data?.url
        console.log(image_url)

        const new_product_data = {
            seller_id: seller_id,
            name: body?.name,
            desc: body?.desc,
            price: body?.price,
            quantity: body?.quantity,
            image: image_url
        }

        const new_product = new Product(new_product_data)
        const new_product_validate = new_product.validateSync()

        if (!!new_product_validate) {
            return res.json(response_data("product_info_invalid", status_code=4, message="Thêm sản phẩm thất bại!"))
        }

        const save_res = Boolean(await new_product.save())

        if (!save_res) {
            return res.json(response_data("add_new_product_fail", status_code=4, message="Thêm sản phẩm thất bại!"))
        }
        
        return res.json(response_data("success", status_code=1, message="Thành công!"))
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