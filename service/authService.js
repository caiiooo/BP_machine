const axios = require('axios');

exports.authMachine = (number, token) => {
    return new Promise((resolve, reject) => {
        console.log('token', token);
        axios
            .post(process.env.MACHINE_SERVICE_URL + '/authMachine', {
                number,
                token,
            })
            .then((response) => {
                return resolve(response.data);
                //console.log(response);
            })
            .catch((err) => {
                //console.log(err.response);
                reject(err);
            });
    });
};

// {
// 	userId:1212
// 	machineId: 123,
// 	mililiters: 470,
// 	beerType: "Pilsen",
// 	totalValue: "752",
// }
exports.addConsume = (data) => {
    axios
        .post(process.env.USER_SERVICE_URL + '/consuption', data)
        .then((response) => {
            console.log(response.data);
        })
        .catch((err) => console.log('ERROR: addConsume'));
};
