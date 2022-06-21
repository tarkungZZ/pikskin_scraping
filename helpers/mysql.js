const mysql = require('mysql2')
const {
    MYSQL_IP,
    MYSQL_PORT,
    MYSQL_USER,
    MYSQL_PASS,
    MYSQL_DB,
} = require('../helpers/config')

module.exports = (command, values = null) => {

    return new Promise((resolv, reject) => {

        const pool = mysql.createPool({
            host: MYSQL_IP,
            port: MYSQL_PORT,
            user: MYSQL_USER,
            password: MYSQL_PASS,
            database: MYSQL_DB,
        })

        pool.getConnection((err, connection) => {
            if (err) {
                return reject({ error: err })
            }

            connection.query(command, values, (error, result) => {

                if (error) {
                    return reject({ error })
                }

                pool.end()

                resolv(result)

            })
        })
    })

}