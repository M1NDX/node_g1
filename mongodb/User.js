let {mongoose} = require('./mongodb-connect')

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
    acceso:{
        type: String,
        enum: ["guest", "registrado", "admin"],
        required: true,
    }  
});


userSchema.methods.generateToken = function() {
    let user = this;
    let token =  jwt.sign({
	_id: user._id.toHexString(),
	acceso:	user.acceso},
	'claveSecreta',
	{expiresIn: 60*60}).toString();
    return token;
}

let User = mongoose.model('user', userSchema);

module.exports = {User}