const users = []

//adduser,removeuser,getuser,getuserinroom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser =(id)=>{
    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}
// addUser({
//     id:66,
//     username: 'ravi  ',
//     room:'  chennai'
// })

// addUser({
//     id:33,
//     username: 'rk  ',
//     room:' erode'
// })
// addUser({
//     id:3,
//     username: 'adhi  ',
//     room:'  erode'
// })
// console.log(users)

// const remove = removeUser(66)

// console.log(remove)
// console.log(users)
const getUser = (id)=>{
   return users.find((user) => user.id === id)

}
// const user = getUser(66)
// console.log(user)
const getuserInroom =(room)=>{
    return users.filter((user)=> user.room === room)
}
// const userlist = getuserInroom('erode')
// console.log(userlist)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getuserInroom
}