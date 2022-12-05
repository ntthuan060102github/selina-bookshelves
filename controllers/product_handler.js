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

const get_product_info = async (req, res, next) => {
    try {
        const body = req.body
        const product_id = Number(body.product_id)

        if (!Number.isInteger(product_id)) {
            return res.json(response_data(
                    data="data_invalid",
                    status_code=4,
                    message='Mã sản phẩm không hợp lệ'
                )
            )
        }

        const session_data = JSON.parse(await get_session_data(req))
        query = { "product_id": product_id }

        if (session_data.user_type === "seller") {
            query['seller_id'] = session_data.user_id
        }
        else if (session_data.user_type == "admin") {
            query['status'] = "pending"
        }

        product_info = await Product.findOne(query)

        if (Boolean(product_info)) {
            product_data = product_info?._doc
            product_data = {
                "product_id": product_data.product_id,
                "seller_id": product_data.seller_id,
                "name": product_data.name,
                "desc": product_data.desc,
                "price": product_data.price,
                "image": product_data.image,
                "status": product_data.status,
                "genres": product_data.genres,
                "quantity": product_data.quantity
            }
        }
        else {
            product_data = "no_data"
        }

        return res.json(response_data(product_data))
    }
    catch(err) {
        return res.json(response_data(
                data=err.message,
                status_code=4,
                message="Lỗi hệ thống!"
            )
        )
    }
}

module.exports = {
    add_new_product,
    get_product_info
}