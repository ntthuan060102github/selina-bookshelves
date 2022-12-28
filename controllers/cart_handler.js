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
        const quantity = Number(body?.quantity)
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

        const check_book_in_cart = await BookInCart.findOne({
            book_group_id: book_group,
            book_id: product_info.product_id
        })
        if (check_book_in_cart) {
            check_book_in_cart.quantity += quantity
            check_book_in_cart.save()
            return res.json(response_data())
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

const get_cart_info = async (req, res, next) => {
    try {
        const session_data = JSON.parse(await get_session_data(req))
        const user_id = session_data.user_id
        const user_role = session_data.user_type

        if (user_role !== "normal_user") {
            return res.json(response_data(
                data="no_permit", 
                status_code=4, 
                message="Bạn không có quyền thực hiện chức năng này!",
                role=req?.user_role
            ))
        }

        const book_group = await BookGroup.find({
            buyer_id: user_id,
            is_deleted: false
        })

        const book_group_infos = book_group.map(book_group_info => ({
            "group_id": book_group_info.group_id,
            "seller_id": book_group_info.seller_id
        }))
        const list_seller_id = book_group_infos.map(b => b.seller_id)
        const list_book_group_id = book_group_infos.map(b => b.group_id)
        
        const seller_infos_res = await axios.post(
            `${SELINA_API_SERVICE_INFOS.profile[APP_ENV].domain}/get-list-user-info-by-id`,
            {
                list_user_id: list_seller_id
            }
        ).then(function (response) {
            return response.data
        })
        const seller_infos = seller_infos_res.data
        let res_data = []

        const list_book_in_cart = await BookInCart.find({
            book_group_id: {
                $in: list_book_group_id
            },
            is_deleted: false
        })

        for (const seller_info of seller_infos) {
            for (const book_group_info of book_group_infos) {
                if (Number(seller_info.user_id) === Number(book_group_info.seller_id)) {
                    res_data.push({
                        ...book_group_info,
                        seller_name: seller_info.full_name,
                        seller_avt: seller_info.avatar_url || "",
                        books: []
                    })
                }
            }
        }

        for (const res of res_data) {
            for(const book_in_cart of list_book_in_cart) {
                if (Number(res.group_id) === Number(book_in_cart.book_group_id)) {
                    res.books.push({
                        book_id: book_in_cart.book_id,
                        image: book_in_cart.image,
                        name: book_in_cart.name,
                        desc: book_in_cart.desc,
                        quantity: book_in_cart.quantity,
                        price: book_in_cart.price,
                        total_price: book_in_cart.quantity*book_in_cart.price,
                        book_in_cart_id: book_in_cart.book_in_cart_id
                    })
                    let total_price = 0
                    for (const book of res.books) {
                        total_price += book.total_price
                    }
                    res.total_price = total_price
                }
            }
        }

        return res.json(response_data(res_data))
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

const modify_quantity_book_in_cart = async (req, res) => {
    try {
        const body = req.body
        const quantity = Number(body?.quantity)
        const book_in_cart_id = body.book_in_cart_id

        const update = await BookInCart.updateOne(
            {
                book_in_cart_id: book_in_cart_id,
            },
            {
                $set: {
                    quantity: quantity
                }
            }
        )
        console.log(update)
        return res.json(response_data(update))
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
    get_cart_info,
    modify_quantity_book_in_cart
}