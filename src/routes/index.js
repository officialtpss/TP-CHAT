'use strict';

module.exports = (app, io) => {

    require('./messages')(app, io);
    require('./users')(app);
    
    app.use((req, res) => {
        res.sendStatus(404);
    });
};
