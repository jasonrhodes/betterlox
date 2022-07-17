import { hash, getSalt } from "./src/lib/hashPassword";

let [pw, salt] = process.argv.slice(2);

if (!salt) {
  salt = getSalt();
}

const hashed = hash(pw, salt);

console.log(`
  password: ${pw}
  salt: ${salt}
  hashed password: ${hashed}
`);