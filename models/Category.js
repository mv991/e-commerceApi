const mongoose  = require("mongoose") ;

const CategorySchema = new mongoose.Schema({
   type:String,
   id:Number
})  
const Category = mongoose.model("Category", CategorySchema);
module.exports =  Category;