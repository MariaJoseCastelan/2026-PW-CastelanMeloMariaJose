const mysql = require('mysql2/promise');

const pool = mysql.createPool(
    {
        host: 'local host',
        port: 3306,
        user: 'root',
        password: '',
        database: 'cecyt9_local',
        dateStrings: true,
        
    }
);