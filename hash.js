const bcrypt = require('bcrypt'); // o 'bcryptjs', según cuál use tu equipo
bcrypt.hash('admin123', 10).then(console.log);