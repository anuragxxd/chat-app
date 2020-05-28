const socket = io()

const $messageForm = document.querySelector("#chat-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const $location = document.querySelector('#location')
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoScroll = ()=>{
    const $newMessage= $messages.lastElementChild
    const margin = parseInt(getComputedStyle($newMessage).marginBottom)
    const height = $newMessage.offsetHeight + margin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - height<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("hh:mm A")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate , {
        username:message.username,
        location : message.message,
        createdAt : moment(message.createdAt).format("hh:mm A")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room , users})=>{
    console.log(room,users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    socket.emit("sendMessage",e.target.children[0].value , (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log("Delivered")
    })
})

$locationButton.addEventListener("click",()=>{
    $locationButton.setAttribute('disabled','disabled')
    $messageFormInput.focus()
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your Browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",position.coords.latitude, position.coords.longitude,(message)=>{
            $locationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit("join", {username , room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})