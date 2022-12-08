const response_data = require("../helpers/response")
const get_session_data = require("../helpers/get_session_data")
const {
    get_unaccented_text_vn,
    get_accent_insensitive_regex_vn
} = require("../helpers/vn_text")
const { validationResult } = require('express-validator');
const Product = require('../models/product')

const search_product = async (req, res, next) => {
    try {
        const input_validate = validationResult(req)
        if (!input_validate.isEmpty()) {
            return res.json(response_data(input_validate.array(), status_code=4))
        }

        const search_term = req.query.searchterm
        const keyword = get_unaccented_text_vn(search_term)

        query = {
            name: {
                $regex: get_accent_insensitive_regex_vn(keyword),
                $options: 'i'
            }
        }

        const session_data = JSON.parse(await get_session_data(req))

        if (session_data.user_type === "admin") {
            query['status'] = "pending"
        }
        else {
            query['status'] = "approved"
            if (session_data.user_type === "seller") {
                query['seller_id'] = session_data.user_id
            }
        }

        const search_results = await Product.find(query)

        result_list = []

        for (i in search_results) {
            result_list.push({
                "product_id": search_results[i].product_id,
                "seller_id": search_results[i].seller_id,
                "name": search_results[i].name,
                "desc": search_results[i].desc,
                "price": search_results[i].price,
                "image": search_results[i].image,
                "status": search_results[i].status,
                "genres": search_results[i].genres,
                "quantity": search_results[i].quantity
            })
        }

        if (result_list.length > 0) {
            message = "Thành công"
        }
        else {
            message = "Không có kết quả"
        }

        return res.json(response_data(
            data=result_list,
            status_code=1,
            message=message
        ))
    }
    catch(err) {
        return res.json(response_data(
            data=err.message,
            status_code=4,
            message="Lỗi hệ thống!"
        ))
    }
}

module.exports = {
    search_product
}