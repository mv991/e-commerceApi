const mongoose  = require("mongoose");
require('dotenv').config()
const Product  =  require("./models/Product") ;
const express = require("express");
const Cart  = require("./models/Cart");   
const  Category  = require("./models/Category");

const app = express();
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => console.log(`Server Port: ${process.env.PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));

  const seedDB = async() => {
    const categories = ["Electronics","SkinCare", "Personal", "Games","Makeup","Furniture","Grocerries","Home Decor","Fashion","Cleaning","Health"];
    const max=10;
    const min = 0;

    for(i=0;i<=10;i++)
    {
     const category = new Category ({
       id:i,
       type:categories[i]
    })
      await category.save();
    }
  
   
   
  } 
  seedDB();
