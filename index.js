const express = require("express");
const app = express();
const mongoose  = require("mongoose");
require('dotenv').config();
const bodyParser = require("body-parser");
const Product = require("./models/Product.js")
const Cart = require("./models/Cart.js");
const User = require("./models/User.js");
const Order = require("./models/Order.js")
const Category = require("./models/Category.js")
const{authorizeUser} = require("./middleware/authorizeUser.js")
const {generateToken} = require("./config/genToken.js");
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const bcrypt = require('bcrypt');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all the available categories for products
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
app.get("/api/category",async(req,res) => {
  try {
      const allCategories = await Category.find().select("type");
      res.status(200).send(allCategories)
  }
  catch(e) {
    res.status(500).json(e)
  }
})

/**
 * @swagger
 * /api/getProducts/{categoryId}:
 *   get:
 *     summary: Get products according to category id. Category Id ranges from 0 to 10
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID
 *         schema:
 *            type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Product with given category id not found
 *       500:
 *         description: Server error
 */
app.get("/api/getProducts/:categoryId",async(req,res) => {
  try {
      const allProducts = await Product.find({categoryId:req.params.categoryId});
      if(allProducts.length===0) {
         res.status(404).json("No product with given Category id found")
      }
      res.status(200).send(allProducts)
  }
  catch(e) {
    res.status(500).json(e)
  }
})
/**
 * @swagger
 * /api/getSingle/{productId}:
 *   get:
 *     summary: Get details of a single product. some productIds 64e0d903f9a98eefbb3e4e3b 64e0d906f9a98eefbb3e4e3e
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: No product with given id found
 *       500:
 *         description: Server error
 */
app.get("/api/getSingle/:productId",async(req,res) => {
  try {
      const allProducts = await Product.findById(req.params.productId);
      if(!allProducts) {
         res.status(404).json("No product with given Id found")
      }
      res.status(200).send(allProducts)

  }
  catch(e) {
    res.status(500).json(e)
  }
})
/**
 * @swagger
 * /api/addToCart:
 *   post:
 *     summary: Used to add/remove items from cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item Added/Removed
 *       500:
 *         description: Server error
 *       403:
 *         description: UnAuthorized Access
 */ 
app.post("/api/addToCart",authorizeUser,async (req,res) => {
  try{
    let message;
  const {productId,quantity,price} = req.body; 
  const userId = req.user.id;
  const cart = await Cart.findOne({user:userId})
  if(!cart) {
   const newCart = new Cart({user:userId});
  newCart.products.push({product:productId,quantity:quantity});
  newCart.cartTotal = newCart.cartTotal +( price * quantity);
  await newCart.save();
   res.status(200).json( `Item added to cart. Cart Total ${newCart.cartTotal}` );
   }
   const existingProductIndex = cart.products.findIndex(
   (product) => product.product.equals(productId));

  if(existingProductIndex!== -1) {
     cart.products.splice(existingProductIndex)
     message = "removed"
     cart.cartTotal = cart.cartTotal - ( price * quantity);
    }
   else {
       cart.products.push({product:productId,quantity:quantity});
        cart.cartTotal = cart.cartTotal + ( price * quantity);
       message="added"
   } 
   await cart.save();
     res.status(200).json( `Item ${message}. Cart Total ${cart.cartTotal} `);
  } catch(e) {
    res.status(500).json(e.message)
   }
})
/**
 * @swagger
 * /api/getCart:
 *   get:
 *     summary: get all the items from the cart
 *     parameters:
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item Added/Removed
 *       500:
 *         description: Server error
 *  *    403:
 *         description: UnAuthorized Access
 */
app.get("/api/getCart" ,authorizeUser, async (req,res) => {
  try{
  const userId = req.user.id; 
  const cart = await Cart.find({user:userId}).populate({
        path: 'products.product', 
        model:"Product"
      }).exec();
   if(cart.length===0) {
    res.status(400).json("No items in the Cart")
   }
   else if( cart[0].products?.length===0) 
   {
       res.status(400).json("No items in the Cart")
   }
   else if(cart && cart[0].products?.length>0) {
    res.status(200).send(`Here are the products in your cart ${cart[0].products} and the total amuont is ${cart[0].cartTotal}`)
     }
   }catch(e) {
    res.status(500).json(e.message)
   }
})
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a user
 *     parameters:
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       400:
 *         description: Email or password not given
 *       409:
 *          description: Email already exists
 *       201:
 *           description: User Created
 *       500:
 *         description: Server error
 */

app.post("/api/register", async (req, res) => {
   const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ 'message': 'Email and password are required.' });
    // check for duplicate email in the db
    const duplicate = await User.find({email});
    console.log(duplicate.length>0)
    if (duplicate.length>0) return res.status(409).json({'message': 'Email already exists' }); //Conflict 
    try {
        //encrypt the password
         const salt =  bcrypt.genSaltSync(10);
        const hashedPwd = await bcrypt.hash(password, salt);
        //store the new user
        const newUser = new User({ email:email,password:hashedPwd });
        await newUser.save();
        res.status(201).json({ 'success': `New user ${email} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
})
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user. Try with c@gmail.com and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       401:
 *         description: Email or password incorrect
 *       200:
 *         description: Successfull Login
 *       500:
 *         description: Server error
 */
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
  // check if user exists or not
  try {
  const findUser = await User.findOne({ email });
  const encyptedPass = await bcrypt.compare(password, findUser.password)
 if (findUser && (await bcrypt.compare(password, findUser.password))) {
    res.status(200).json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    res.status(401).json( "Invalid Crdentials" );
  }
  }catch(e) {
    res.status(500).json(e);
  }
})
/**
 * @swagger
 * /api/placeOrder:
 *   post:
 *     summary: Place an Order
 *     responses:
 *       400:
 *         description: trying to place order without any items in the cart
 *       200:
 *         description: Successfully Placed order
 *  *    403:
 *         description: UnAuthorized Access
 *       500:
 *         description: Server error
 */
app.post("/api/placeOrder",authorizeUser, async(req,res) => {
  try {
     const userId = req.user.id;
     const userCart = await Cart.findOne({user:userId}).populate({
        path: 'products.product', 
        model:"Product"
      }).exec();
      if(userCart) {
        if(userCart.products.length>0)
        {
          const newOrder = new Order({products:userCart.products,user:userCart.user});
          res.status(200).send({message:`Your Order Has been placed and items have been removed from the cart. Your total amount was ${userCart.cartTotal}`})
          await newOrder.save();
              userCart.products = [];
              userCart.cartTotal = 0;
              await userCart.save();
        }
        else {
           res.status(400).send({message:"You do not have any items in the cart to place an order"})
        }
}
  else {
     res.status(400).send({message:"You do not have any items in the cart to place an order"})
  }
 
} catch(e) {
       res.status(500).send(e)
  }
})
/**
 * @swagger
 * /api/placeOrder:
 *   get:
 *     summary: get summary of a particular Order
 *     responses:
 *       200:
 *         description: summary of an order
 *       500:
 *         description: Server error
 */
app.get("/api/getOrderHistory",async(req,res) => {
  try{
         const user = req.body.user;
         const orderHistory = await Order.find({user:user}) 
         if(!orderHistory || orderHistory.length===0) {
            res.status(200).json("The user has not ordered anything yet")
         }
         else  {
          res.status(200).json(orderHistory)
         }
  }catch(e) {
     res.status(500).json(e)
  }
})
/**
 * @swagger
 * /api/getOrderDetails/:id:
 *   get:
 *     parameters:
 *     -id
 *     summary: get all Order deails of a particular user
 *     responses:
 *       200:
 *         description: get order details
 *       500:
 *         description: Server error
 */
app.get("/api/getOrderDetails/:id",async(req,res) => {
  try{
      const orderId = req.params.id;
       const order = await Order.findById(orderId).populate({
        path: 'products.product', 
        model:"Product"
      }).populate('user')
      .exec();

   res.status(200).json(order)
  }catch(e) {
     res.status(500).json(e)
  }
})
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => console.log(`Server Port: ${process.env.PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));

   