const http=require("http")
const express=require("express")
const cors=require("cors")
const socketIO=require("socket.io")


const app = express()
const port = process.env.PORT

app.use(cors());
const users = [{}];


app.get("/", (req, res) => {
    res.send("working")
})

const server = http.createServer(app)


const io = socketIO(server)

io.on("connection", (socket) => {

    // console.log("new connection")

    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        // console.log(`${user} has joined`)
        socket.emit('welcome', {user:"admin", message:`Welcome to the chat ${users[socket.id]}`})
        socket.broadcast.emit('userJoined',{user:"admin", message:`${users[socket.id]} has joined`})
    })


    socket.on('message', ({message,id}) => {
        io.emit('sendMessage',{user:users[id], message,id})
       
    })

    
    socket.on("left", () => {
        // console.log("disconnect testing"); 
        socket.broadcast.emit('leave',{user:"admin",message:`${users[socket.id]} has left`})
    });
    
})


server.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
})