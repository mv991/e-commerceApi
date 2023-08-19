const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Refers to the "Product" collection
        },
        quantity: Number,
        price: Number,
      },
    ],
    cartTotal: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Refers to the "User" collection
    },
  },

);

// Export the model
module.exports = mongoose.model('Cart', cartSchema);
