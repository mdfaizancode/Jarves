import express from "express";
import Thread from "../models/Thread.js";
import GoogleAiApi from "../utils/GoogleApi.js";

const router = express.Router();

router.post('/test' , async(req , res )=>{
    try{
        const thread  = Thread({
        threadId: "dyz2",
        title: "budbak",
    })

    const response = await thread.save();
    res.send(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error: "some error in saving"});
    }
})

router.get("/thread", async(req,res)=>{
    try{
        const threads = await Thread.find({}).sort({updateAt: -1});
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "failed to fetch threads"});
    } 
});

router.get("/thread/:threadId", async(req,res)=>{
        const {threadId} = req.params;
        try{
            const thread = await Thread.findOne({threadId});
            if(!thread){
                res.status(500).json({error:"thread not found"});
            }
            res.json(thread.messages);

        }catch(err){
            console.log(err);
            res.status(500).json({error: "thread not found"});
        }
    })

router.delete("/thread/:threadId", async(req,res)=>{
        const {threadId} = req.params;
        try{
            const deletedThread= await Thread.findOneAndDelete({threadId});

            if(!deletedThread){
                res.status(500).json({error: "thread not found"});
            }
            res.status(200).json({success: "Thread delete Successfully"}); 

        }catch(err){
            console.log(err);
            res.status(500).json({error: "thread not delete"});
        }
    })

router.post("/chat", async(req,res)=>{
        const {threadId , message} = req.body;
        
        if(!threadId || !message){
            res.status(400).json({error: " missing required fields"});
        }

        try{
            let thread  = await Thread.findOne({threadId});
            
            if(!thread){
                thread = new Thread({
                    threadId,
                    title: message,
                    messages: [{role: "user", content: message}]
                });
            }else{
                thread.messages.push({role:"user", content: message});
            }
          const assistantReply = await  GoogleAiApi(message);
          
          thread.messages.push({role: "assistant", content: assistantReply});
          thread.updatedAt = new Date();

          await thread.save();
          res.json({reply: assistantReply});

        }catch(err){
            console.log(err);
            res.status(500).json({error:"Some error "});
        }
    })

export default router; 