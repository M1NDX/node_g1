'use strict'
const express = require('express');
const fs = require('fs');
const chalk = require('chalk');
const bodyParser = require('body-parser')
const cors = require('cors');

const app = express();
const port = 3000;

let alumnos = JSON.parse(fs.readFileSync('alumnos.json'));

let jsonParser = bodyParser.json();
let corsOptions = {
    origin:'http://127.0.0.1:5500',
    optionsSuccessStatus: 200
}


app.use(jsonParser);
app.use(cors(corsOptions));

app.use(express.static(__dirname + '/public'));
//app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.route('/api/alumno')
    .get((req,res)=>res.json(alumnos))
    .post((req,res)=>{
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));
        alumnos.push(req.body);
        console.log(alumnos);
        res.status(201).send();
    });

app.route('/alumno/:id').get((req,res)=>{
    let id = req.params.id;
    let al = alumnos.find(alu=> alu.id==id);
    if(al){
        if(req.query.name){
            console.log("nombre: " + req.query.name);
        }    
        res.json(al);
    }
    
    else
        res.json({error:"Id no encontrado"});
    }
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));