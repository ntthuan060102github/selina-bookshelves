const Product = require('../models/product')
const BookGroup = require('../models/book_group')
const BookInCart = require('../models/book_in_cart')
const response_data = require("../helpers/response")
const get_session_data = require("../helpers/get_session_data")
const { APP_ENV } = require("../configs/app_configs")
const SELINA_API_SERVICE_INFOS = require("../configs/selina_service_infos")
const axios = require("axios")

const add_product_to_cart = async (req, res, next) => {
    try {
        const body = req.body
        const book_id = body?.book_id
        const quantity = body?.quantity
        const session_data = JSON.parse(await get_session_data(req))

        if (req?.user_role !== "normal_user") {
            return res.json(response_data(
                data="no_permit", 
                status_code=4, 
                message="Bạn không có quyền thực hiện chức năng này!",
                role=req?.user_role
            ))
        }

        const product_info = await Product.findOne({
            product_id: book_id,
            status: "approved"
        })

        if(!product_info) {
            return res.json(response_data(
                data="product_invalid", 
                status_code=4, 
                message="Sản phẩm không tồn tại!",
                role=req?.user_role
            ))
        }

        const seller_id = product_info.seller_id
        const book_group_info = await BookGroup.findOne({
            seller_id: seller_id,
            is_deleted: false
        })
        let book_group = null

        if (book_group_info) {
            book_group = book_group_info.group_id
        }
        else {
            const new_book_group = BookGroup({
                buyer_id: session_data.user_id,
                seller_id: seller_id
            })
            
            if (!!new_book_group.validateSync()) {
                return res.json(response_data(
                    data="create_new_book_group_fail", 
                    status_code=4, 
                    message="Thêm vào giỏ hàng không thành công!",
                    role=req?.user_role
                ))
            }

            if (!Boolean(await new_book_group.save())) {
                return res.json(response_data(
                    data="save_book_group_fail", 
                    status_code=4, 
                    message="Thêm vào giỏ hàng không thành công!",
                    role=req?.user_role
                ))
            }
            book_group = new_book_group.group_id
        }

        const new_book_in_cart = new BookInCart({
            book_id: book_id,
            book_group_id: book_group,
            quantity: quantity || 1,
            price: product_info.price,
            name: product_info.name,
            desc: product_info.desc,
            author: product_info.author,
            image: product_info.image,
        })

        if (!!new_book_in_cart.validateSync()) {
            return res.json(response_data(
                data="create_new_book_in_cart_fail", 
                status_code=4, 
                message="Thêm vào giỏ hàng không thành công!",
                role=req?.user_role
            ))
        }

        if (!Boolean(await new_book_in_cart.save())) {
            return res.json(response_data(
                data="save_book_in_cart_fail", 
                status_code=4, 
                message="Thêm vào giỏ hàng không thành công!",
                role=req?.user_role
            ))
        }

        return res.json(response_data(
            data="success", 
            status_code=1, 
            message="Thêm vào giỏ hàng thành công!",
            role=req?.user_role
        ))
    }
    catch (err) {
        return res.json(response_data(
            data=err.message, 
            status_code=4, 
            message="Lỗi hệ thống!",
            role=req?.user_role
        ))
    }
}


module.exports = {
    add_product_to_cart,
}