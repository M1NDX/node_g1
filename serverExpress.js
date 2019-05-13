'use strict'
const express = require('express');
const fs = require('fs');
const chalk = require('chalk');
const bodyParser = require('body-parser')
const cors = require('cors');
let {Alumno} = require('./mongodb/Alumno');
let {User} = require('./mongodb/User');

const app = express();
const port = process.env.PORT || 3000;

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

function autenticar(req,res, next){
    let token = req.get('x-auth');
    if(!token){
        res.status(401).send({error: "no hay token"});
        return;
    }

    User.verificarToken(token).then((user)=>{
        console.log("Token verificado ...");
        req.userid = user._id;
        next();
    }).catch((err)=>{
        res.status(401).send(err);
    });

}

app.route('/api/alumno')
    .get(autenticar, (req, res) => {
        console.log("Se está autenticado por usuario: " + req.userid);
        Alumno.find({},{_id:0,nombre:1},(err,docs)=>{
            if(err){
                res.status(404).send();
                return;
            }

            res.json(docs);
        })
       
    
    })
    .post((req, res) => {
        console.log(chalk.blue(JSON.stringify(req.body)));
        //console.log(chalk.blue(req.body.id));

        if ( req.body.nombre && req.body.carrera && req.body.calificacion) {
            //alumnos.push(req.body);
            //fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
            //console.log(alumnos);
           
            let newAlumno = new Alumno(req.body);

            newAlumno.save((err,doc)=>{
                if(err)
                    console.log(err);

                if(doc){
                    res.status(201).send();
                }else{
                    res.status(400).send({error: "no se guardó"});
                }
               return;
            })

            
        }else{
            res.status(400).send({
                error: "faltan atributos"
            });
        }

        
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


app.route('/api/user/login')
    .post((req, res)=>{
         

         let usr = req.body.email;
         let pwd = req.body.password;
         console.log("usr:"+usr+ " pwd:"+pwd);
        
         User.findOne({email:usr}).then((user)=>{
             console.log(user);
            if(pwd == user.password){
               let token =  user.generateToken();
               user.token = token;
               User.updateOne({email:usr}, user).then((usrUpdated)=>{
                    console.log("actualizado");
                    console.log(usrUpdated);
                    res.set('x-auth',token);
                    res.send();
                    return;
               }).catch((er)=>{
                   console.log(er);
                   res.status(400).send(er);
               })
            }
         }).catch((err)=> {
             console.log(err);
             res.status(400).send(err);
         })
         
    })

app.route('/api/user/logout')    
    .get((req, res)=>{
       let token = req.get('x-auth');
       if(!token){
           console.log("no existe token");
           res.status(400).send({error: "falta header con token"})
           return;
       }    

       // * SE ASUME QUE SI HAY TOKEN
       let datosUsuario = User.verDatosToken(token);
       console.log(datosUsuario);
       if(datosUsuario && datosUsuario._id){
           
           User.updateOne({_id:datosUsuario._id},{token: "123"}).then((doc)=>{
              res.send(doc);
           }).catch((err)=>{
               console.log(err);
               res.status(404).send();
           })
       }
    })


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


