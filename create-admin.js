const bcrypt = require('bcrypt');
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter admin username: ', (username) => {
  rl.question('Enter admin password: ', (password) => {
    if (!username || !password) {
      console.log('Username and password required');
      rl.close();
      return;
    }
    bcrypt.hash(password, 12).then((hash) => {
      console.log('\nAdd this to your .env file:');
      console.log(`ADMIN_USERNAME=${username}`);
      console.log(`ADMIN_PASSWORD_HASH=${hash}`);
      rl.close();
    });
  });
});
