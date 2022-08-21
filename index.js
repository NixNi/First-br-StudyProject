const axios = require("axios");
const express = require("express");
const { readFile, writeFile, stat, unlink } = require("fs").promises;  


const port = 5000;

const app = express();
app.use(express.json())

const saveUsers = (data) => {
    return writeFile('users.json', JSON.stringify(data), {encoding: "utf-8"}).then(() => data)
}

const  getUsers = ()=> {
     return readFile('users.json', {encoding: "utf-8"})
    .then(text => JSON.parse(text))
    .catch(err => {
       return axios('https://jsonplaceholder.typicode.com/users')
       .then(({data}) => saveUsers(data))
    })
} 

const deleteUsers = () => {
    unlink("users.json").catch(err => {})
}

app.get("/", (req,res) => {
    res.status(200).json('server working')
})

app.get('/api/v1/users', async (req, res)=>{
    const data = await getUsers()
    res.json(data)
})

app.post('/api/v1/users', async (req,res)=>{
    const data = await getUsers()
    const id = data[data.length-1].id + 1
    await saveUsers([...data, {...(req.body), id}])
    res.json({status:"success", id })
//
})

app.patch('/api/v1/users/:userId', async (req,res)=>{
    const data = await getUsers()
    const {userId} = req.params
    await saveUsers(data.map(it => {
            if (it.id == userId) 
            return {...it, ...(req.body)}
            return it
        }))
    res.json({status:"success", id:userId })
})

app.delete('/api/v1/users/:userId', async (req,res)=>{
    const data = await getUsers()
    const {userId} = req.params
    await saveUsers(data.filter(it => it.id !== userId))
    res.json({status:"success", id:userId })
})

app.delete('/api/v1/users', async (req,res)=>{
    await deleteUsers()
    res.json({status:"success"})
})

app.listen(port, ()=>{console.log(`Server working on http://localhost:${port}`)})