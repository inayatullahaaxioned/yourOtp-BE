const models = `${__dirname}/models`;

const fs = require('fs');

fs.readdirSync(models).forEach(file => {
  require(`${models}/${file}`);
});
