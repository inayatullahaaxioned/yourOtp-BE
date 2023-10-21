const models = `${__dirname}/models`;

const fs = require('fs');

fs.readdirSync(models).forEach(file => {
  console.log(`${models}/${file}`);
  require(`${models}/${file}`);
});
