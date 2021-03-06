const userModel = require('../models/users_models')
const { success, failed, tokenResult } = require('../helpers/response')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PRIVATEKEY } = require('../helpers/env')
const fs = require('fs')
const upload = require('../helpers/uploads')
const {confirmEmail} = require('../helpers/sendEmail')

const users = {
    register: async (req, res) => {
        try {
            const body = req.body
            const password = body.password
            const salt = await bcrypt.genSalt(5)
            const hashing = await bcrypt.hash(password, salt)
            const img = "default.jpg"

            const dataUser = {
                name: body.name,
                email: body.email,
                password: hashing
            }

            userModel.register(dataUser, img).then((result) => {
                success(res, result, 'Register success')
                confirmEmail(dataUser.email)
            }).catch((err) => {
                if (err.message = 'Dupicate entry') {
                    failed(res, [], 'Email already exist')
                } else {
                    failed(res, [], err.message)
                }
            })
        } catch (error) {
            failed(res, [], error.message)
        }
    },

    verify: (req, res) => {
        try {
            const token = req.params.token
            jwt.verify(token, PRIVATEKEY, (err, decode) => {
                if (err) {
                    failed(res, [], 'Failed authorization!')
                } else {
                    const email = decode.email
                    
                    userModel.updateStatus(email).then((result) => {
                        res.render('index', { email })
                    }).catch((err) => {
                        failed(res, [], err.message)
                    })
                }
            })
        } catch (error) {
            failed(res, [], error.message)
        }
    },

    login: async (req, res) => {
        try {
            const body = req.body

            userModel.login(body).then(async (result) => {
                const results = result[0]

                if (!results) {
                    failed(res, [], 'Email is not registered, please register!')
                } else {
                    const id = results.id
                    const name = results.name
                    const email = results.email
                    const password = results.password

                    const isMatch = await bcrypt.compare(body.password, password)

                    if (isMatch) {
                        if (results.status === 1) {
                            jwt.sign({
                                email: results.email
                            }, PRIVATEKEY, (err, token) => {
                                if (err) {
                                    failed(res, [], err.message)
                                } else {
                                    const data = {
                                        id: id,
                                        name: name,
                                        email: email,
                                        token: token
                                    }
                                    tokenResult(res, data, 'Login successful')
                                }
                            })
                        } else {
                            failed(res, [], 'Activation needed!')
                        }
                    } else {
                            failed(res, [], 'Password is wrong!')
                        }
                    }
                }).catch((err) => {
                    failed(res, [], err.message)
                })
        } catch (error) {
            failed(res, [], error.message)
        }
    },

    update: (req, res) => {
        try {
            upload.single('image')(req, res, (err) => {
                if (err) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        failed(res, [], 'File size max 2Mb')
                    } else {
                        failed(res, [], err)
                    }
                } else {
                    const id = req.params.id
                    const body = req.body
    
                    userModel.getDetail(id).then((result) => {
                        const imgOld = result[0].image
                        body.image = !req.file ? imgOld : req.file.filename
    
                        if (body.image !== imgOld) {
                            if (imgOld !== 'default.jpg') {
                                fs.unlink(`src/uploads/${imgOld}`, (err) => {
                                    if (err) {
                                        failed(res, [], err.message)
                                    } else {
                                        userModel.updateData(body, id).then((result) => {
                                            success(res, result, 'Update success')
                                        }).catch((err) => {
                                            failed(res, [], err.message)
                                        })
                                    }
                                })
                            } else {
                                userModel.updateData(body, id).then((result) => {
                                    success(res, result, 'Update sucess')
                                }).catch((err) => {
                                    failed(res, [], err.message)
                                })
                            }
                        } else {
                            userModel.updateData(body, id).then((result) => {
                                success(res, result, 'Update success')
                            }).catch((err) => {
                                failed(res, [], err.message)
                            })
                        }
                    }).catch((err) => {
                        failed(res, [], err.message)
                    })
                }
            })
        } catch (error) {
            failed(res, [], error.message)
        }
    },

    getAll: (req, res) => {
        try {
            userModel.getAll().then((result) => {
                success(res, result, 'Get all user success')
            }).catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], error.message)
        }
    },

    getDetail: (req, res) => {
        const id = req.params.id
        try {
            userModel.getDetail(id).then((result) => {
                success(res, result, 'Get detail user success')
            }).catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], error.message)
        }
    }
}

module.exports = users