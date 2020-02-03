/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require("mongoose");
const {boardModel} = require("./models");
const crypt = require("./crypt");

const replyFunction = (x, sort = false, slice = false) =>{
  
      let res = x.map( x => { return {_id: x._id, text: x.text, created_on: x.created_on} });
      
      if(sort !== false) res.sort((x,y) => y.created_on - x.created_on);
      
      if(slice !== false) res = res.slice(0,slice);
          
      return res;
      };

module.exports = function (app) {
  
  mongoose.connect(process.env.MONGO_DB,{ useNewUrlParser: true , useUnifiedTopology: true }, (err)=> {if (err) return(err); console.log("Connected")});
  
  app.post("/api/threads/:board",async (req,res)=>{
    try{      
      
      const {text} = req.body;
      let {delete_password} = req.body;
      const board = req.body.board || req.params.board; 
      
      if([board,text,delete_password].includes(undefined)) return res.send("Invalid input");    
      
      const boardy = mongoose.models[board] || boardModel(board);
      
      delete_password = await crypt.hash(delete_password);
      
      if(delete_password === "error") return res.send("error");
            
      const thread = new boardy({
        text,
        delete_password,
        created_on: new Date,
        bumped_on: new Date,
        reported: false,
      });      
      
      thread.save((err)=>{if (err) return res.send(err)});      
    
      res.redirect("/b/" + board);
    }catch(err){
      return res.send(err);
    }
    
  });
  
  app.get("/api/threads/:board", async (req,res)=>{
    try{
      
      const {board} = req.params;    
      
      const boardy = mongoose.models[board] || boardModel(board);
    
      let threads = await boardy.find({});   
    
      threads = threads.map((x) =>{ return {_id: x._id, text: x.text, created_on: x.created_on, bumped_on: x.bumped_on, replies: replyFunction(x.replies,true,3),replycount:x.replies.length}})
                       .sort((x,y) =>  y.bumped_on - x.bumped_on)
                       .slice(0,10);
      
      res.send(threads);
      }catch(err){
        res.send(err);
      }
  });
  app.delete("/api/threads/:board", async (req,res)=>{
    try{
      const board = req.body.board || req.params.board;
      const {thread_id,delete_password} = req.body;
      const boardy = mongoose.models[board] || boardModel(board);
    
      if(![board,thread_id,delete_password].every(x=> !x !== true)) return res.send("Invalid input");
    
      if(!mongoose.Types.ObjectId.isValid(thread_id)) return res.send("Invalid Object Id");     
        
      let thread = await boardy.findById(thread_id);
    
      if(!thread) return res.send("Cant find thread with given id");  
    
      const pass = await crypt.compare(delete_password, thread.delete_password);
    
      if(!pass) return res.send("incorrect password");
    
      const del = await thread.delete();    
        
    
      res.send("success"); 
    }catch(err){
      return res.send(err);
    }    
    
  });
  app.put("/api/threads/:board", async (req,res) => {
    try{
      const board = req.body.board || req.params.board;
      const{thread_id} = req.body;
      const boardy = mongoose.models[board] || boardModel(board);  
    
      if(![board,thread_id].every(x=> !x !== true)) return res.send("Invalid input");
    
      if(!mongoose.Types.ObjectId.isValid(thread_id)) return res.send("Invalid Object Id"); 
      
      let thread = await boardy.findById(thread_id);
      
      if(!thread) return res.send("Cant find thread");
      
      thread.reported = true;
      
      await thread.save();
      
      res.send("reported");
    }catch(err){
      return res.send(err);
    }    
    
   });
  
  app.post("/api/replies/:board", async (req,res)=>{
    try{
      
      const board = req.body.board || req.params.board; 
      const {thread_id,text} = req.body;
      let {delete_password} = req.body;
      const boardy = mongoose.models[board] || boardModel(board);      
       
      if(![board,thread_id,text].every(x=> !x !== true)) return res.send("Invalid input");
      
      const find = await boardy.findOne({});
      
      if(!find) return res.send("Invalid board");
      
      if(!mongoose.Types.ObjectId.isValid(thread_id)) return res.send("Invalid Object Id"); 
      
      let thread = await boardy.findById(thread_id);      
           
      if(!thread) return res.send("Cant find thread with given id");            
      
      delete_password = await crypt.hash(delete_password);
      
      thread.bumped_on = new Date;
      thread.replies.push({
        delete_password,
        text,
        created_on: new Date,
        reported: false
      });
      
      await thread.save();      
    
      res.redirect("/b/" + board + "/" + thread_id);
    }catch(err){
      return res.send(err);
    } 
    
  });    
  
  app.get("/api/replies/:board", async (req,res)=>{
    
    try{
      
      const{board} = req.params;
      const{thread_id} = req.query;
      
      if(![board,thread_id].every( x => !x !==true)) return res.send("Invalid input");
    
      if(!mongoose.Types.ObjectId.isValid(thread_id)) return res.send("Invalid Object Id"); 
      
      const boardy = mongoose.models[board] || boardModel(board);
      
      let thread = await boardy.findById(thread_id);
      
      if(!thread) return res.send("Cant find thread with given id");        
      
      res.send({_id: thread._id, text: thread.text, created_on: thread.created_on,created_on: thread.created_on, bumped_on: thread.bumped_on, replies: replyFunction(thread.replies)});
                       
    }catch(err){
      return res.send(err);
    }
  });
  
  app.delete("/api/replies/:board", async (req,res)=>{
    try{
      const board = req.body.board || req.params.board;
      const {thread_id,reply_id,delete_password} = req.body;
      const boardy = mongoose.models[board] || boardModel(board);      
    
      if(![board,thread_id,reply_id,delete_password].every(x=> !x !== true)) return res.send("Invalid input");
    
      if(!mongoose.Types.ObjectId.isValid(thread_id) && !mongoose.Types.ObjectId.isValid(reply_id)) return res.send("Invalid Object Id");     
        
      let thread = await boardy.findById(thread_id);
        
      if(!thread) return res.send("Cant find thread with given id");  
      
      const index = thread.replies.findIndex(x => x._id == reply_id);
      
      if(index === -1) return res.send("Cant find reply");          
    
      const pass = await crypt.compare(delete_password, thread.replies[index].delete_password);   
      
      if(!pass) return res.send("incorrect password");
      
      thread.replies[index].text = "[deleted]";
      
      await thread.save();  
      
      res.send("success"); 
    }catch(err){
      return res.send(err);
    }
  });
   app.put("/api/replies/:board", async (req,res) => {
    try{
      const board = req.body.board || req.params.board;
      const{thread_id,reply_id} = req.body;
      const boardy = mongoose.models[board] || boardModel(board);  
    
      if(![board,thread_id].every(x=> !x !== true)) return res.send("Invalid input");
    
      if(!mongoose.Types.ObjectId.isValid(thread_id) || !mongoose.Types.ObjectId.isValid(thread_id)) return res.send("Invalid Object Id"); 
      
      let thread = await boardy.findById(thread_id);
      
      if(!thread) return res.send("Cant find thread");
      
      const index = thread.replies.findIndex(x => x._id == reply_id);
      
      if(index === -1) return res.send("Cant find reply");   
      
      thread.replies[index].reported = true;
      
      await thread.save();
      
      res.send("reported");
    }catch(err){
      return res.send(err);
    }    
    
   });
};
