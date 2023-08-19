const mongoose  = require ("mongoose");

const ProductSchema = new mongoose.Schema(
  {
   title:{
    type:String,
    min:3,
    max:30,
   },
   price:Number,
   description:{
    type:String,
    min:10,
    max:100
   },
   availability:Boolean,
    categoryId: Number,
   
  }
  )  
const Product = mongoose.model("Product", ProductSchema);
module.exports =  Product;