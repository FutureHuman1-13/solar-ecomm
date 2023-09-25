const express = require("express");
const app = express();
const cookieParser = require('cookie-parser'); 
const PORT = process.env.PORT || 6000;
const cors = require('cors');
// const bodyParser = require('body-parser')
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
app.use("/admin",require("./routes/employeeLoginRoute.js"))
app.use("/product",require("./routes/productRoute"));
app.use("/categories",require("./routes/categoriesRoute"));
app.use("/seller",require("./routes/sellerRoute"));
app.use("/seller",require("./routes/sellerLoginRoute"))

app.listen(PORT,()=>{
    console.log(`server is listening on Port : ${PORT}`);
})