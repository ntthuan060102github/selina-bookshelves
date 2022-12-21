const response_data = require("../helpers/response")
const upload_image = require("../helpers/upload_image_to_storage")
const get_session_data = require("../helpers/get_session_data")
const Product = require('../models/product')
const BookInCart = require('../models/book_in_cart')
const BookGroup = require('../models/book_group')
const Order = require('../models/order')

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
        const upload_image_res = await upload_image(product_image)
        const image_url = upload_image_res?.data?.url

        const new_product_data = {
            seller_id: seller_id,
            name: body?.name,
            desc: body?.desc,
            price: body?.price,
            quantity: body?.quantity,
            author: body?.author,
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
        const seller_id = session_data?.user_id
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
        database_query.is_deleted = false
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
        database_query.is_deleted = false
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

const modify_product_info = async (req, res, next) => {
    try {
        const session_data = JSON.parse(await get_session_data(req))
        const seller_id = session_data.user_id
        const body = req.body
        const book_id = body?.book_id
        const product_image = req.file
        let image_url = ""

        if (req?.user_role !== "seller") {
            return res.json(response_data(
                "no_permit",
                4,
                "Bạn không có quyền thực hiện chức năng này!",
                req?.user_role
            ))
        }

        if (product_image) {
            if (!!product_image.mimetype.includes("image")) {
                return res.json(response_data(
                    "image_invalid",
                    status_code=4,
                    message="Hình ảnh không hợp lệ!",
                    role=req?.role
                ))
            }
            else {
                const upload_image_res = await upload_image(product_image)
                image_url = upload_image_res?.data?.url
            }
        }

        const update_res = await Product.updateOne({
                seller_id: seller_id,
                product_id: book_id
            },
            image_url 
            ? {
                name: body?.name,
                desc: body?.desc,
                price: Number(body?.price),
                image: image_url,
                quantity: Number(body?.quantity)
            }
            :{
                name: body?.name,
                desc: body?.desc,
                price: Number(body?.price),
                quantity: Number(body?.quantity)
            }
        )
        if (update_res.matchedCount === 1) {
            return res.json(response_data("modify_success", 1, "Sửa thông tin thành công!", req.user_role))
        }
        else {
            return res.json(response_data("product_not_found", 1, "Không tìm thấy thông tin sản phẩm!", req.user_role))
        }
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

const remove_product = async (req, res) => {
    try {
        const body = req.body
        const session_data = JSON.parse(await get_session_data(req))
        const user_id = session_data.user_id
        const book_id = Number(body.book_id)

        if (req.user_role !== "seller") {
            return res.json(response_data(
                "no_permit",
                4,
                "Bạn không có quyền thực hiện chức năng này!",
                req?.user_role
            ))
        }

        const remove_res = await Product.updateOne({
            seller_id: user_id,
            product_id: book_id
        }, 
        {
            is_deleted: true
        })
        if (remove_res.matchedCount === 1) {
            return res.json(response_data("success", 1, "Thành công!", req.user_role))
        }
        else {
            return res.json(response_data("product_not_found", 4, "", req.user_role))
        }
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

const take_an_order = async (req, res) => {
    try {
        const body = req.body
        const book_group_id = Number(body.book_group_id)
        const user_session = JSON.parse(await get_session_data(req))

        if (req.user_role !== "normal_user") {
            return res.json(response_data(
                "no_permit",
                4,
                "Bạn không có quyền thực hiện chức năng này!",
                req?.user_role
            ))
        }

        const user_id = user_session.user_id
        const user_address = user_session.address
        const user_phone = user_session.phone_num

        if (!user_address) {
            return res.json(response_data(
                "order_info_invalid",
                status_code=4,
                message="Vui lòng thêm địa chỉ để tiến hành đặt hàng!",
                role=req?.role
            ))
        }
        else if (!user_phone) {
            return res.json(response_data(
                "order_info_invalid",
                status_code=4,
                message="Vui lòng thêm số điện thoại để tiến hành đặt hàng!",
                role=req?.role
            ))
        }

        const book_group = await BookGroup.findOne({
            group_id: book_group_id,
            is_deleted: false
        })

        if (!book_group) {
            return res.json(response_data("book_group_not_found", 4, "Đặt hàng không thành công!", req.user_role)) 
        }
        
        const books_in_cart = await BookInCart.find({
            book_group_id: book_group_id,
            is_deleted: false
        })

        if(!books_in_cart) {
            return res.json(response_data("books_in_cart_empty", 4, "Đặt hàng không thành công!", req.user_role))
        }

        let total_price = 0
        books_in_cart.forEach(book => total_price += Number(book.price))

        const new_order_data = {
            buyer_id: user_id,
            seller_id: book_group.seller_id,
            book_group_id: book_group_id,
            delivered_to: user_address,
            phone_number: user_phone,
            total_price: Number(total_price)
        }
        const new_order = new Order(new_order_data)

        if (!!new_order.validateSync()) {
            console.log(new_order.errors)
            return res.json(response_data(
                "order_info_invalid",
                status_code=4,
                message="Đặt hàng không thành công!",
                role=req?.role
            )) 
        }

        if (!Boolean(await new_order.save())) {
            return res.json(response_data(
                "product_info_invalid",
                status_code=4,
                message="Đặt hàng không thành công!",
                role=req?.role
            )) 
        }

        book_group.is_deleted = true
        await book_group.save()
        books_in_cart.forEach(book => {
            book.is_deleted = true
            book.save()
        })
        return res.json(response_data("success", 1, "Đặt hàng thành công!", req.user_role))
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

const get_order_infos = async (req, res, next) => {
    try {
        const user_session = await get_session_data(req)
        const user_role = user_session.user_type
        const query = {}
        const page = Number(req?.query?.page) || 1
        const limit = Number(req?.query?.limit) || 2

        switch (user_role) {
            case "normal_user":
                query.buyer_id = user_session.user_id
                break;
            case "seller":
                query.seller_id = user_session.user_id
                query.status = waiting
                break;
        }

        if (!query) {
            return res.json(response_data(
                "no_permit",
                4,
                "Bạn không có quyền thực hiện chức năng này!",
                req?.user_role
            ))
        }

        const orders_docs = await Order.paginate(
            query,
            {
                page: page,
                limit: limit
            }

        )
        const orders = orders_docs.docs
        const orders_res = []
        
        for (let order of orders) {
            const books_in_cart = await BookInCart.find({
                book_group_id: order.book_group_id
            })
            order_temp = order.toObject()
            order_temp.books = books_in_cart
            orders_res.push(order_temp)
        }

        const res_data = {
            data: orders_res,
            total: orders.total,
            limit: orders.limit,
            page: orders.page,
            pages: orders.pages
        }

        return res.json(response_data(res_data, 1, "", req.user_role))
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
    find_products,
    modify_product_info,
    remove_product,
    take_an_order,
    get_order_infos
}