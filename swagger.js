// swagger.js
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: ' API Documentation',
      version: '1.0.0',
      description: 'API documentation for  application',
    },
  },
  apis: ['./index.js'], // Point to your route files
};

const specs = swaggerJsDoc(options);

module.exports = specs;
