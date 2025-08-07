const express = require('express');
const app = express();
const userModel = require("./models/user")
const postModel = require("./models/post")
const cookieParser = require('cookie-parser')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const upload = require("./config/multerconfig")
const path = require("path")
const dotenv = require("dotenv")

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))
dotenv.config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ DB Error:", err));

app.get('/profile/upload',(req,res)=>{
    res.render("profileupload")
});

app.post('/upload',isLoggedIn,upload.single("image"),async(req,res)=>{
   let user =  await userModel.findOne({email:req.user.email})
   user.profilepic = req.file.filename
   await user.save()
   res.redirect("/profile")
});


app.get('/',(req,res)=>{
    res.render("index")
});

app.get('/login',(req,res)=>{
    res.render("login")
});



app.get('/profile',isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email: req.user.email}).populate("posts")
    res.render("profile",{user})
});

app.get('/like/:id',isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id.trim()}).populate("user")

    if(post.likes.indexOf(req.user.userid)==-1){
        
        post.likes.push(req.user.userid)
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1)
    }

    await post.save()
    res.redirect("/profile")

     
});

app.get('/edit/:id',isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id.trim()}).populate("user")
    res.render("edit",{post})
     
});

app.post('/update/:id',isLoggedIn, async (req,res)=>{
    let post = await postModel.findOneAndUpdate({_id: req.params.id.trim()},{content :req.body.content})
    res.redirect("/profile")
     
});

app.post('/post',isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email: req.user.email})

    let{content} = req.body

    let post = await postModel.create({
        user : user._id,
        content 
    })

    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
});

app.post('/register', async(req,res)=>{
    let {username,email,password,name,age} = req.body
    let user = await userModel.findOne({email:email})

    if(user) return res.status(500).send("User already registered")
    
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async(err,hash)=>{
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password:hash
            })

            let token = jwt.sign({email:email,userid:user._id},"shhh")
            res.cookie("token",token)
            res.send("registered")
        })
    })
});


app.post('/login', async(req,res)=>{
    let {email,password} = req.body
    let user = await userModel.findOne({email:email})

    if(!user) return res.status(500).send("Something Went Wrong")
    
    bcrypt.compare(password,user.password,function(err,result){
        if(result) {
            let token = jwt.sign({email:email,userid:user._id},"shhh")
            res.cookie("token",token)
            res.status(200).redirect("/profile")
            }
        else res.redirect("/login")
    })
});

app.get('/logout',(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
});

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token) return res.redirect("/login");

    try {
        const data = jwt.verify(token, "shhh");
        req.user = data;
        next();
    } catch (err) {
        console.error("JWT error:", err.message);
        return res.redirect("/login");
    }
}

app.listen(process.env.PORT)