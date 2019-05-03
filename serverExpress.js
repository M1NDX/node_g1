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
    origin: 'http://127.0.0.1:5500',
    optionsSuccessStatus: 200
}


app.use(jsonParser);
app.use(cors(corsOptions));

app.use(express.static(__dirname + '/public'));
//app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.route('/api/alumno')
    .get((req, res) => res.json(alumnos))
    .post((req, res) => {
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id && req.body.nombre && req.body.carrera) {
            alumnos.push(req.body);
            fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
            //console.log(alumnos);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "faltan atributos"
        });
    });
    

app.route('/api/alumno/:id')
    .get(existeId,(req, res) => {
        let id = req.params.id;
        let al = alumnos.find(alu => alu.id == id);
        if (al) {
            if (req.query.name) {
                console.log("nombre: " + req.query.name);
            }
            res.json(al);
        } else
            res.json({
                error: "Id no encontrado"
            });
    })
    .put(existeId,(req, res) => {
        let id = req.params.id;
        if (updateAlumno(id, req.body)) {
            res.send();
        } else {
            res.status(400).send({error: "no se encontró id o faltan datos"});
        }
    })
    .patch(existeId,(req,res)=>{
        let id = req.params.id;
        if (partialUpdateAlumno(id, req.body)) {
            res.send();
        } else {
            res.status(400).send({error: "no se encontró id o faltan datos"});
        }
    })
    .delete(existeId,(req,res)=>{
        let id = req.params.id;
        let pos = alumnos.findIndex(al => al.id == id);
        if(pos==-1) {
            res.status(404).send({error:"no se encontró el id"});
            return;
        }

        alumnos.splice(pos,1);
        fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
        res.send();

    });


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function partialUpdateAlumno(id, alumno){
    let pos = alumnos.findIndex(al => al.id == id);

    if(pos>=0){
        alumnos[pos].nombre = (alumno.nombre)? alumno.nombre: alumnos[pos].nombre;
        alumnos[pos].carrera = (alumno.carrera)? alumno.carrera: alumnos[pos].carrera;
        alumnos[pos].calificacion = (alumno.calificacion)? alumno.calificacion: alumnos[pos].calificacion;
        fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
        return true;
    }
   
    return false;

}

function updateAlumno(id, alumno) {
    let pos = alumnos.findIndex(al => al.id == id);

    if(pos>=0 && id == alumno.id){
        Object.assign(alumnos[pos], alumno);
        fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
        return true;
    }

    return false;
}


function existeId(req, res, next){
   
    let id = req.params.id;
    console.log("verificando id "+id);

    let pos = alumnos.findIndex(al=> al.id == id);
    if(pos==-1){
        res.status(404).send({error:"Id no existe"});
        return;
    }

    next();
}