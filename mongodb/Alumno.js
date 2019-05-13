//import {mongoose} from './mongodb-connect';
let {mongoose} = require('./mongodb-connect');


let alumnoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    edad: {
        type: Number,
        min: 17,
        max: 80,
        required: true
    },
    carrera: {
        type: String,
        enum: ['IE', 'ISC', 'IES', 'ISI'],
        required: true
    },
    calificacion: {
        type: Number,
        min: 50,
        max: 100,
        required: true
    }
});

let Alumno = mongoose.model('alumnos', alumnoSchema);

let newAlumno = {
    nombre: 'Juan',
    edad: 28,
    carrera: 'IES',
    calificacion: 80
};
let alumnoModelo = Alumno(newAlumno);
// alumnoModelo.save()
//     .then((doc) => console.log(doc))
//     .catch((err) => console.log(err))

Alumno.find({
    $and: [{
        calificacion: {
            $gte: 60
        }
    }, {
        carrera: "IES"
    }]
}, (err, documentos) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(documentos);
})

module.exports = {Alumno}