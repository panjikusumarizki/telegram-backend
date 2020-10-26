const express = require('express')
const userController = require('../controllers/users_controllers')

const router = express.Router()

router
    .post('/register', userController.register)
    .get('/verify/:token', userController.verify)
    .post('/login', userController.login)
    .patch('/update/:id', userController.update)
    .get('/getAll', userController.getAll)
    .get('/detail/:id', userController.getDetail)

module.exports = router