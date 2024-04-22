
const User = require('./../models/user.js')
const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,generatetoken} = require('./../jwt');

router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal server error'})
    }
})






router .post('/signup',async(req,res)=>{
    try {
        const data = req.body; //Assuming the request body conatians the person data

    //Create a new Person document using the Mongoose model
        const newUser = new User(data);
        const response = await newUser.save()
        console.log('Data saved successfully!!!');
        const payload = {
            id:response.id
        }
        const token = generatetoken(payload);
        console.log('token is : ',token);
        res.status(200).json({response:response,token:token});

    } catch (err) {
        console.log('Something went wrong!!!')
        res.status(500).json({error:'Internal Server Error'})
    }

    
})

router.post('/login',async(req,res)=>{
    try {
        //Extract username and password from request body
    const {aadhaarCardNumber,password} = req.body;
    //Find user by username
    const user = await User.findOne({aadhaarCardNumber:aadhaarCardNumber});
    // If user does not exist or password does not match, return error
    if (!user|| !(await user.comparePassword(password))){
        return res.status(401).json({error:'Invalid aadhaar Card Number or password'})
    }

    // generate token
    const payload ={
        id:user.id,
    }
    const token = generatetoken(payload);

    //return token as response
    res.json({token:token})
    } catch (err) {
      console.error(err);
      res.status(500).json({error:"Internal server error"})  
    }
    
})


router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try {
        const userId = req.user.id;//extract the id from token
        const {currentPassword,newPassword} = req.body; //extract current and new password from request body

        // Find the user by userID
        const user = await User.findById(userId)

        // If user does not exist or password does not match, return error
        if (!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid aadhaar Card Number or password'})
        }

        user.password = newPassword;
        await user.save();


        console.log('Password updated successfully'),
        res.status(200).json({message:'Password updated successfully'})
    } catch (err) {
        console.log("Didn't updated some error occured"),
        res.status(500).json({error:'Internal server error'})
    }
})




module.exports = router