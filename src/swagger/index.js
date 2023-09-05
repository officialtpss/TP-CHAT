const express = require('express');
const path = require('path');
const router = express.Router();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Tp-chat API",
            version: "1.0.0",
            description: "A simple Express Library API",
        },
        servers: [
            {
                url: "https://tp-chat-backend.techpss.com",
            },
            {
                url: "http://localhost:4033",
            },
        ],
    },
    apis: [path.join(__dirname, './../', 'controller/*js')],
};

// tslint:disable-next-line: no-var-requires
const swaggerJSDoc = require('swagger-jsdoc');

// tslint:disable-next-line: no-var-requires
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = swaggerJSDoc(options);

// tslint:disable-next-line: no-var-requires
require('swagger-model-validator')(swaggerSpec);

router.get('/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function validateModel(name, model) {
    const responseValidation = swaggerSpec.validateModel(name, model, false, true);
    if (!responseValidation.valid) {
        console.error(responseValidation.errors);
        throw new Error('Model doesn\'t match Swagger contract');
    }
}

function getdata(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
}

module.exports = {
    router,
    validateModel,
    getdata,
};
