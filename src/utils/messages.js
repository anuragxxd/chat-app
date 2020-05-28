const generateMessage = (username, text)=>{
    return{
        username,
        text,
        createdAt:new Date().getTime()
    }
}
const generateLocationMessage = (username , text)=>{
    return{
        username,
        message:text,
        createdAt:new Date().getTime()
    }
}
module.exports ={ 
    generateMessage,
    generateLocationMessage
}