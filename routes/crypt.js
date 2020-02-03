const bcrypt = require("bcrypt");

module.exports.hash = async (password, intensity = 13) => {
  try{
    const hash = await bcrypt.hash(password,intensity);    
    if(!hash) return "error";    
    return hash;
  }
  catch(err){
    return err;
  }  
};

module.exports.compare = async (password,hash)=>{
  try{
    return bcrypt.compare(password,hash); 
  }catch(err){
    return err;
  }  
};

