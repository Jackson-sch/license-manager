import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const email = "admin@licensemanager.com";
  const password = "admin123"; // Change this in production!
  const nombre = "Administrador";

  // Check if admin exists
  const existing = await prisma.usuarioAdmin.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Admin user already exists:", email);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin
  const admin = await prisma.usuarioAdmin.create({
    data: {
      email,
      password: hashedPassword,
      nombre,
      activo: true,
    },
  });

  console.log("Admin user created:", admin.email);
  console.log("Password:", password);
  console.log("⚠️  Change this password in production!");
}

seedAdmin()
  .catch(console.error)
  .finally(() => process.exit());
