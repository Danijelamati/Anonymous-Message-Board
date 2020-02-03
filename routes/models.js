const mongoose = require("mongoose");
const {Schema} = mongoose;

module.exports.boardModel = function (board){
  
   const replySchema = new Schema({
     text: String,
     created_on: Date,
     delete_password: String,
     reported: Boolean
  });
    
  
  const boardSchema = new Schema({
    text:String,
    delete_password: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    replies: [replySchema]
  });
  
  return mongoose.model(board, boardSchema);
};





