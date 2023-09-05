'use strict';

module.exports = (mongoose) => {
    require('./messages')(mongoose);
    require('./users')(mongoose);
    require('./rooms')(mongoose);
    require('./room_users')(mongoose);
    require('./notifications')(mongoose);
};
