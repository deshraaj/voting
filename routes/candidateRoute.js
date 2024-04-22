const User = require('./../models/user.js')
const Candidate = require('./../models/candidate.js')
const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,generatetoken} = require('./../jwt');









const checkAdminRole = async (userId)=>{
    try {
        const user = await User.findById(userId);

        if (user.role=='admin'){
            return true;
        }
    } catch (err) {
        return false;
    }
}



//post route to add a candidate
router .post('/',jwtAuthMiddleware,async(req,res)=>{
    try {
        if (! await checkAdminRole(req.user.id)) return res.status(403).json({message:'user does not have admin role'})
        
        const data = req.body; //Assuming the request body conatians the candidate data
        
    //Create a new Person document using the Mongoose model
        const newCandidate = new Candidate(data);
        
        //save a new User document using the Mongoose model
        const response = await newCandidate.save()
    
        console.log('data saved');
        
    
        res.status(200).json({response:response});

    } catch (err) {
        console.log('Something went wrong!!!')
        res.status(500).json({error:'Internal Server Error'})
    }


})




router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try {
        if (! await checkAdminRole(req.user.id)) return res.status(403).json({message:'user does not have admin role'})
        


        const candidateID = req.params.candidateID;//extract the id from the URL parameter
        const updatedCandidateData = req.body;//updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true,//return the updated document
            runValidators:true,//run mongoose validation
        })

        if (!response){
            return res.status(404).json({erro:'Candidate not found'})
        }
        console.log('Candidate Data updated successfully'),
        res.status(200).json(response)
    } catch (err) {
        console.log("Didn't updated some error occured"),
        res.status(500).json({error:'Internal server error'})
    }
})


router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try {
        if (! await checkAdminRole(req.user.id)) return res.status(403).json({message:'user does not have admin role'})
        


        const candidateID = req.params.candidateID;
        
        const response = await Candidate.findByIdAndDelete(candidateID);
        if (!response){
            return res.status(404).json({erro:'Candidate not found'})
        }
        console.log('Candidate Deleted'),
        res.status(200).json(response)
    } catch (err) {
        console.log("Didn't updated some error occured"),
        res.status(500).json({error:'Internal server error'})
    }
})


router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote once
    candidateID = req.params.candidateID;
    userID = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateID);


        if(!candidate){
            return res.status(404).json({message:"Candidate not found"});
        }

        const user = await User.findById(userID);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(user.isVoted){
            return res.status(404).json({message:"You have already voted"});
        }
        if(user.role=="admin"){
            return res.status(404).json({message:"Admin cann't vote"});
        }

        //Update candidate document to record the vote
        candidate.votes.push({user:userID})
        candidate.voteCount++;
        await candidate.save();
        

        // Update user document 
        user.isVoted = true;
        await user.save()

        res.status(200).json({message:"voted successfully"})
    } catch (err) {
        
        console.log(err),
        res.status(500).json({error:'Internal server error'})

    }


    
})


router.get('/vote/count',async(req,res)=>{
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({voteCount:'desc'});

        // Map the candidates to only return  their name and voteCount
        const voteRecord = candidates.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }

        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err),
        res.status(500).json({error:'Internal server error'})
    }
})


router.get('/allCandidate',async(req,res)=>{
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({voteCount:'desc'});

        // Map the candidates to only return  their name and voteCount
        const voteRecord = candidates.map((data)=>{
            return data.name;

        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err),
        res.status(500).json({error:'Internal server error'})
    }
})




module.exports = router