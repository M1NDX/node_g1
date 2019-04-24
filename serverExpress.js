'use strict'
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

let alumnos = JSON.parse(fs.readFileSync('alumnos.json'));

app.use(express.static(__dirname + '/public'));

//app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.route('/home').get((req, res) => res.send('DASWorld HOME1'));
app.route('/alumnos').get((req,res)=>res.json(alumnos));
app.route('/alumnos/:id').get((req,res)=>{
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