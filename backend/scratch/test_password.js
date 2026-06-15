const bcrypt = require('bcryptjs');
const hash = "$2b$10$My9O4pjrQ/gYs/Otq5AhgOZQ8MOIbOdeSEMJzNj7nPsD6Yf.VpXSq";

async function main() {
  console.log('Is phone number:', await bcrypt.compare('7812860791', hash));
  console.log('Is 123456:', await bcrypt.compare('123456', hash));
  console.log('Is admin123:', await bcrypt.compare('admin123', hash));
}
main();
