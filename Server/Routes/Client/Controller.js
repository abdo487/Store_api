import { response } from "../../utils.js"
import Client from '../../Models/Client.js'
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.resolve(),'Public/Profile-images'));
    },
    filename: function (req, file, cb) {
        // get the file extension
        const ext = file.originalname.split('.')[1];
        const fileName = Date.now() + '.' + ext;
        if (fileName) req.body.image = fileName;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

const clientById = async (req, res, next, clientId)=>{
    const client = await Client.findById(clientId);
    if (!client) return res.status(400).json(response('error', 'Client not found'))
    client.password = null;
    client.salt = null;
    req.client = client;
    next();
}

const all = async (req, res)=>{
    console.log(path.join(path.resolve(),'Public/Profile-images'))
    try {
        const clients = await Client.find({});
        res.status(200).json(response('success', 'All client are fetched!', clients))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later'
            )
        )
    }
}

function isEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

const verifyInputs = async (req, res, next)=>{
    const { fullname, email, phone, password, re_password } = req.body;
    if (!fullname || !email || !phone || !password) return res.status(400).json(response('input', 'This field is required'))
    if(fullname.length < 3 || fullname.length > 20) return res.status(400).json(response('fullname', 'Fullname must be between 3 and 20 characters'))
    if(phone.length < 9 || phone.length > 15) return res.status(400).json(response('phone', 'Please enter a valid phone number'))
    if(password !== re_password) return res.status(400).json(response('re_password', 'Password does not match'))
    if(password.length < 6 || password.length > 20) return res.status(400).json(response('password', 'Password must be between 6 and 20 characters'))
    if (!isEmail(email)) return res.status(400).json(response('email', 'Invalid email address'))
    const client = await Client.findOne({ email });
    if (client) return res.status(400).json(response('email', 'Email already exists'))
    next();
}
const create = async (req, res)=>{
    try {
        const client = await new Client(req.body);
        await client.save();
        res.status(200).json(response('success', 'New Account created', client))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while creating account. Try agin later. ' + err.message
            )
        )
    }
}
const verifyUPdateInputs = async (req, res, next)=>{
    const { fullname, email, phone } = req.body;
    if (!fullname || !email || !phone) return res.status(400).json(response('input', 'This field is required'))
    if(fullname.length < 3 || fullname.length > 20) return res.status(400).json(response('fullname', 'Fullname must be between 3 and 20 characters'))
    if(phone.length < 9 || phone.length > 15) return res.status(400).json(response('phone', 'Please enter a valid phone number'))
    if (!isEmail(email)) return res.status(400).json(response('email', 'Invalid email address'))
    if(req.client.email != email){
        const client = await Client.findOne({ email });
        if (client) return res.status(400).json(response('email', 'This email already taken'))
    }
    next();
};
const update = async (req, res)=>{
    if (req.body.image == 'null') delete req.body.image;
    try {
        const client = await Client.findOneAndUpdate({ _id: req.client._id }, req.body, { new: true });
        res.status(200).json(response('success', 'Your Account updated', client))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while creating account. Try agin later. ' + err.message
            )
        )
    }
}

const client = async (req, res)=>{
    try {
        res.status(200).json(response('success', 'Client fetched!', req.client))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later'
            )
        )
    }
}

export { 
    clientById,
    all, 
    create, 
    verifyInputs, 
    upload, 
    update, 
    verifyUPdateInputs,
    client
}