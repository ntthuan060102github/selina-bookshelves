const response_data = require("../helpers/response")
const upload_image = require("../helpers/upload_image_to_storage")
const get_session_data = require("../helpers/get_session_data")
const Product = require('../models/product')

const add_new_product = async (req, res, next) => {
    try {
        const session_data = JSON.parse(await get_session_data(req))
        const seller_id = session_data.user_id
        const body = req.body
        const product_image = req.file

        if (product_image && !product_image.mimetype.includes("image")) {
            return res.json(response_data(
                "image_invalid",
                status_code=4,
                message="Hình ảnh không hợp lệ!",
                role=req?.role
            ))
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
            return res.json(response_data(
                "product_info_invalid",
                status_code=4,
                message="Thêm sản phẩm thất bại!",
                role=req?.role
            ))
        }

        const save_res = Boolean(await new_product.save())

        if (!save_res) {
            return res.json(response_data(
                "add_new_product_fail",
                status_code=4,
                message="Thêm sản phẩm thất bại!",
                role=req?.role
            ))
        }
        
        return res.json(response_data("success", status_code=1, message="Thành công!", role=req?.role))
    }
    catch (err) {
        return res.json(response_data(
            data=err.message, 
            status_code=4, 
            message="Lỗi hệ thống!",
            role=req?.role
        ))
    }
}

const get_product_info = async (req, res) => {
    try {
        const user_role = req?.user_role
        const session_data = JSON.parse(await get_session_data(req))
        const seller_id = session_data?.seller_id
        const product_id = Number(req?.query?.id)

        database_query = { "product_id": product_id }
        switch (user_role) {
            case "admin":
                database_query.status = "pending"
                break
            case "seller":
                database_query.status = "approved"
                database_query.seller_id = seller_id
                break
            case "normal_user":
                database_query.status = "approved"
                break
        }
        // if (Object.keys(database_query).length == 0) {
        //     throw Error("invalid role")
        // }
        let product_info = await Product.findOne(
            database_query,
            'product_id seller_id name desc price image status genres quantity'
        ) || {}

        return res.json(response_data(
            product_info,
            status_code=1,
            message="Thành công",
            role=user_role
        ))
    }
    catch(err) {
        return res.json(response_data(
            data=err.message,
            status_code=4,
            message="Lỗi hệ thống!",
            role=req?.user_role
        ))
    }
}

const find_products = async (req, res) => {
    try {
        const page = Number(req?.query?.page) || 1
        const limit = Number(req?.query?.limit) || 20
        const user_role = req?.user_role // middlewares/get_user_role
        const session_data = JSON.parse(await get_session_data(req))
        const seller_id = Number(session_data?.user_id)

        let database_query = req?.temp_database_query || {}
        switch (user_role) {
            case "admin":
                database_query.status = "pending"
                break
            case "seller":
                database_query.status = "approved"
                database_query.seller_id = seller_id
                break
            case "normal_user":
                database_query.status = "approved"
                break
        }
        // if (Object.keys(database_query).length == 0) {
        //     throw Error("invalid role")
        // }
        const query_options = {
            select: 'product_id seller_id name desc price image status genres quantity',
            page: page,
            limit: limit
        }
        let products = await Product.paginate(database_query, query_options)
        return res.json(response_data(
            data=products,
            status_code=1, 
            message="Thành công",
            role=user_role
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
    add_new_product,
    get_product_info,
    find_products
}