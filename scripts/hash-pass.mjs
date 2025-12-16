import bcrypt from "bcryptjs";

const password = "";
const hash = await bcrypt.hash(password, 12);
console.log(hash);
