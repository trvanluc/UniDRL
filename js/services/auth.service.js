//login function
import { Storage } from "../utils/storage.js";

export function login(email, password, role) {
  const users = Storage.getUsers();

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.role !== role) {
    throw new Error(
      `This account is registered as ${user.role.toUpperCase()}`
    );
  }

  Storage.setCurrentUser(user);
  return user;
}

//signup function
import { Storage } from "../utils/storage.js";
import { ROLES } from "../config/constants.js";

export function signup({ name, email, password, role }) {
  const users = Storage.getUsers();

  if (users.some(u => u.email === email)) {
    throw new Error("Email already exists");
  }

  const newUser = {
    name,
    email,
    password,
    role,
    studentId:
      role === ROLES.STUDENT
        ? "SV" + Math.floor(100000 + Math.random() * 900000)
        : null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  Storage.saveUsers(users);

  return newUser;
}
