const socket = io()

//server (emit) -> client(recieve(on)) ==acknownlegement-->server
//client (emit) -> server(recieve(on)) ==acknownlegement-->client

// socket.on('countUpdated',(count)=>{
//     console.log('the count is updated', count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })

//elements
const $messageform = document.querySelector('#message-form')
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')

const $messages = document.querySelector('#messages')


//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//option
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //new message element
    const $newmessage = $messages.lastElementChild

    //height of the new message
    const newmessagestyles = getComputedStyle($newmessage)
    const newmessagemargin = parseInt(newmessagestyles.marginBottom)
    const newmessageheight = $newmessage.offsetHeight + newmessagemargin
    // console.log(newmessagestyles)
    // console.log(newmessagemargin)
    // console.log(newmessageheight)
    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerheight = $messages.scrollHeight

    //how far have i scrolled?
    const scrolloffset = $messages.scrollTop + visibleHeight

    if(containerheight - newmessageheight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message',(messagedata)=>{
    console.log(messagedata)
    const html = Mustache.render(messageTemplate,{
        username:messagedata.username,
        message: messagedata.text,
        createdAt: moment(messagedata.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationmessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationmessageTemplate,{
        username:message.username,
        url: message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomdata', ({room, users})=>{
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// document.querySelector('#message-form').addEventListener('submit',(e)=>{
$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable form
    $messageformbutton.setAttribute('disabled','disabled')

    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value
    socket.emit('sendmessage', message, (error)=>{
        //enable form
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value = ''
        $messageforminput.focus() 
        // console.log('The message Delivered!', message)
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})
const $sendlocationbutton = document.querySelector('#send-location')
// document.querySelector('#send-location').addEventListener('click', ()=>{
$sendlocationbutton.addEventListener('click', ()=>{
    if(!navigator.geolocation) {
        return alert('Geolocation not support by your browser')
    }
    $sendlocationbutton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            console.log("Location Shared")
            $sendlocationbutton.removeAttribute('disabled')
        })
    })
   
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})