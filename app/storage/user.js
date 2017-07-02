let userOnline = []

const addUserOnline = (socket) => {
    const sessionTemp = socket.request.session
    const user = { name: sessionTemp.name, socketId: socket.id, online: true }
    userOnline.push(user)
}

const updateUser = (socket) => {
    const sessionTemp = socket.request.session
    const indexUpdate = userOnline.findIndex((user) => {
        return user.name == sessionTemp.name
    })
    userOnline[indexUpdate].socketId = socket.id
}

const removeUserOnline = (socket) => {
    const sessionTemp = socket.request.session
    const indexRemove = userOnline.findIndex((user) => {
        return user.name == sessionTemp.name
    })
    if(indexRemove > -1 && userOnline[indexRemove].socketId == socket.id){
        userOnline.splice(indexRemove, 1)
        return true
    }else{
        return false
    }
}

const isConnect = (name) => {
    return userOnline.some((user) => {
        return user.name == name
    })
}

const findUser = (name) => {
    return userOnline.find((user) => {
        return user.name == name
    })
}

const getUserOnline = (name) => {
    return userOnline.filter((user) => {
        return user.name != name
    })
}

export { addUserOnline, updateUser, removeUserOnline, isConnect, getUserOnline, findUser }