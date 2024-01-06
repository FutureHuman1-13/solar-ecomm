const express = require("express");
const app = express();
const cookieParser = require('cookie-parser'); 
const cors = require('cors');
const PORT = process.env.PORT || 6000;
require('dotenv').config();
// const bodyParser = require('body-parser');
// const multer = require('multer')
const corsOption = require('./config/corsOption');
// require('express-async-errors');

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use("/admin",require("./routes/adminRoute"));
app.use("/admin",require("./routes/employeeRoute"));
app.use("/admin",require("./routes/authRoute/employeeLoginRoute.js"))
app.use("/product",require("./routes/productRoute"));
app.use("/categories",require("./routes/categoriesRoute"));
app.use("/seller",require("./routes/sellerRoute"));
app.use("/seller",require("./routes/authRoute/sellerLoginRoute"))
app.use("/customer",require("./routes/customerRoute"))
app.use("/customer",require("./routes/authRoute/customerLoginRoute"))
app.use("/customer",require("./routes/cartRoute"))

app.listen(PORT,()=>{
    console.log(`server is listening on Port : ${PORT}`);
})