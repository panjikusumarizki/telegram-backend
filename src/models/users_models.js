const db = require('../configs/db')

const users = {
    register: (data, img) => {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO users (email, password, name, image) VALUES ('${data.email}','${data.password}','${data.name}','${img}')`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },

    updateStatus: (email) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET status=1 WHERE email='${email}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },

    login: (data) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE email='${data.email}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },

    getDetail: (id) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE id='${id}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },

    updateData: (data, id) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET ? WHERE id=?`, [data, id], (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },

    deleteMsg: (id) => {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM message WHERE id='${id}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    }
}

module.exports = users