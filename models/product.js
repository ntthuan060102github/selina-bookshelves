const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const Product = new mongoose.Schema(
    {
        product_id: { type: Number },
        seller_id: { type: Number, required: true },
        name: { type: String, required: true, max_length: 100 },
        desc: { type: String, max_length: 500 },
        price: { type: Number, required: true },
        image: { type: String },
        status: { 
            type: String, 
            required: false, 
            enum: ["rejected", "approved", "pending"],
            default: "pending"
        },
        genres: { type: Array, default: []},
        quantity: { type: Number, required: true, default: 0 },
    }, 
    { 
        timestamps: true 
    }
)

Product.plugin(AutoIncrement, { inc_field: "product_id" })

module.exports = mongoose.model("product", Product)