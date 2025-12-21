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
