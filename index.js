const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const path = require('path')
const cors = require('cors');

const { 
    ROUTES_PREFIX,
    APP_ENV,
    MONGO_DB_URL
} = require('./configs/app_configs')

const product_router = require('./routers/product')

const app = express()

dotenv.config()

mongoose.connect(
    MONGO_DB_URL || "mongodb+srv://Zeta:thuan2002@cluster0.pmjo1.mongodb.net/Selina-Staging?retryWrites=true&w=majority",
    { 
        useNewUrlParser: true 
    },
    () => {
        console.log('Connected to MongoDB...')
    }
)

app.use(express.json())
app.use(helmet())
app.use(morgan("common"))
app.use(cors());

app.get("/", (req, res) => {
    res.send(`Selina - Bookshelves Service (${APP_ENV})`)
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(ROUTES_PREFIX + "", product_router)

app.listen(process.env.PORT || 8800 , () => {
    console.log("Bookshelves service is running...")
})