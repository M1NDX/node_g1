let {
    mongoose
} = require('./mongodb-connect')
const jwt = require('jsonwebtoken')

let userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    token: {
        type: String,
        required: true
    },
    acceso: {
        type: String,
        enum: ["guest", "registrado", "admin"],
        required: true,
    }
});



let secret = "claveSecreta"; //debería ser también una variable de entorno

userSchema.methods.generateToken = function () {
    let user = this;
    let token = jwt.sign({
            _id: user._id.toHexString(),
            acceso: user.acceso
        },
        'claveSecreta', //debería ser tambien una variable de entorno
        {
            expiresIn: 60 * 60
        }).toString();
    return token;
}

userSchema.statics.verificarToken = function (token) {
    
    let usr = jwt.decode(token);
    console.log(usr);
    
    return new Promise( (resolve,reject)=> {
        User.findById(usr._id).then((user)=>{
            if(token == user.token){
                jwt.verify(token, 'claveSecreta', (err, decoded) => {
                    if (err) {
                        if (err.name == "TokenExpiredError") {
                            console.log("token expirado");
                        } else {
                            console.log("error al verificar token");
                        }
                        return reject(err);
                    }else{
                        return resolve(decoded);
                    }
                })
            }else{
                return reject({error: "token no es igual al de la base de datos"});
            }
            
        })



    })
     


    
}

userSchema.statics.verDatosToken = function(token){
    return jwt.decode(token);
}


let User = mongoose.model('users', userSchema);

module.exports = {User}