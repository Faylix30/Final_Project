const bcrypt = require('bcrypt');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project'
});

// ฟังก์ชันสำหรับ hash รหัสและสร้างผู้ใช้ใน mysql
const createUser = async (username, plainTextPassword, firstName, lastName) => {
  try {
    // hash
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    // สร้างผู้ใช้ใหม่
    const sql = "INSERT INTO users (user_name, user_pwd, first_name, last_name) VALUES (?, ?, ?, ?)";

    // บันทึกข้อมูลผู้ใช้
    connection.query(sql, [username, hashedPassword, firstName, lastName], (error, results) => {
      if (error) {
        console.error('Error creating user:', error.message);
        return;
      }
      console.log('User created successfully!');
    });
  } catch (error) {
    console.error('Error hashing password:', error.message);
  }
};

createUser('PP', '200', 'Somchai', 'Love');