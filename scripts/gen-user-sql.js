const bcrypt = require('bcrypt');

const password = 'password'; 
const username = 'admin';      
const role = 'admin';                  

bcrypt.hash(password, 10).then(hash => {
  const sql = `
INSERT INTO users (username, passwordHash, role)
VALUES ('${username}', '${hash}', '${role}');
  `;
  console.log(sql);
});