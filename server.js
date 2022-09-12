
// All of the Node.js APIs are available in the preload process.
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
let cors = require('cors');
const path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4200'] }))

const userBaseUrl = `/kalantak/users`
const employeBaseUrl = `/kalantak/employes`

const userRoutes = (app, fs) => {
    // variables
    const dataPath = "db.json";
    // 'resources/app/assets/server/db.json';
    // helper methods
    const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }
            callback(returnJson ? JSON.parse(data) : data);
        });
    };

    const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {
        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                throw err;
            }
            callback();
        });
    };

    // READ
    app.get(`${employeBaseUrl}`, (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            res.send(JSON.parse(data).Employes);
        });
    });

    // CREATE
    app.post(`${employeBaseUrl}`, (req, res) => {
        readFile(data => {
            // Note: this isn't ideal for production use. 
            // ideally, use something like a UUID or other GUID for a unique ID value
            const newUserId = Date.now().toString();
            // add the new user
            req.body["id"] = newUserId;
            data.Employes.push(req.body)

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(req.body);
            });
        },
            true);
    });

    // UPDATE
    app.put(`${employeBaseUrl}/:id`, (req, res) => {
        readFile(data => {
            const employesId = req.params.id;
            let newData = []
            for (let record of data.Employes) {
                if (record.id === employesId) {
                    record = { ...req.body }
                }
                newData.push(record)
            }
            data.Employes = newData;
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(newData);
            });
        },
            true);
    });


    // DELETE
    app.delete(`${employeBaseUrl}/:id`, (req, res) => {
        readFile(data => {
            // delete the user
            const employesId = req.params["id"];
            data.Employes.forEach((element, index) => {
                if (element.id === employesId) {
                    data.Employes.splice(index, 1)
                }
            });
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send();
            });
        },
            true);
    });


    // User Crud Operation//

    // READ
    app.get(`${userBaseUrl}`, (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            res.send(JSON.parse(data).users);
        });
    });

    // CREATE
    app.post(`${userBaseUrl}`, (req, res) => {
        readFile(data => {
            // Note: this isn't ideal for production use. 
            // ideally, use something like a UUID or other GUID for a unique ID value
            const newUserId = Date.now().toString();
            // add the new user
            req.body["id"] = newUserId;
            data.users.push(req.body)

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(data);
            });
        },
            true);
    });


    // UPDATE
    app.put(`${userBaseUrl}/:id`, (req, res) => {
        readFile(data => {
            const userId = req.params.id;
            let newData = []
            for (let record of data.users) {
                if (record.id === userId) {
                    record = { ...req.body }
                }
                newData.push(record)
            }
            data.users = newData;
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`users id:${userId} updated`);
            });
        },
            true);
    });


    // DELETE
    app.delete(`${userBaseUrl}/:id`, (req, res) => {
        readFile(data => {
            // delete the user
            const userId = req.params["id"];
            data.users.forEach((element, index) => {
                if (element.id === userId) {
                    data.users.splice(index, 1)
                }
            });
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`users id:${userId} removed`);
            });
        },
            true);
    });
};

const appRouter = (app, fs) => {
    // default route
    app.get('/', (req, res) => {
        res.send('welcome to the development api-server');
    });
    // // other routes
    userRoutes(app, fs);

};
appRouter(app, fs)

server = app.listen(3000, () => {
    console.log('listening on port %s...', server.address().port);
});



