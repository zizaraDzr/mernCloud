const express = require('express')
const mongoose = require('mongoose')
const config = require('config')


const app = express()
const PORT = config.get('serverPort')
const DBURL = config.get('dbURL')
console.log(DBURL)

const start = async () => {
    try {
        await mongoose.connect(DBURL)
        app.listen(PORT, () => {
            console.log(`Сервер запущен ${PORT}--- бд подлючено ${DBURL}`)
        })
    } catch (error) {
        console.log('Ошибка', error)
    }
}

start()