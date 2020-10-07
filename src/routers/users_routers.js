const express = require('express')
const userController = require('../controllers/users_controllers')

const router = express.Router()

router
    .post('/register', userController.register)
    .get('/active/:token', userController.active)
    .post('/login', userController.login)
    .patch('/update/:id', userController.update)
    .get('/getAll', userController.getAll)

module.exports = router