const chalk = require('chalk');
const whatsapp = require('./whatsapp.js');
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(
    express.json()
);
app.use(
    express.urlencoded()
)

// Viene un parametro ?key=texto (se lee req.query.key)
app.get('/', (req, res) => {
    whatsapp.generateSession().subscribe(qr=> {
        res.send({
            data: qr
        });
    });
});
// Viene un parametro ?key=texto (se lee req.query.key)
app.get('/allclients', (req, res) => {
    whatsapp.getAllClients().subscribe(cli => {
        res.send({
            data: cli
        });
    });
});

app.delete('/clearallsessions', (req, res) => {
    whatsapp.deleteAllSession().subscribe(rta => {
        res.send({
            data: rta
        });
    });
});

// Notificacion de app ready en el puerto
const port = 3001;
app.listen(port, ()=> {
    console.info(chalk.blue('La aplicación esta en linea!'));
});

// Iniciamos whatasapp
whatsapp.init();