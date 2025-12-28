import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ⚠️ DELETE THIS FILE AFTER CREATING THE ADMIN USER!
// This is a one-time setup endpoint

export async function GET() {
  const email = "admin@licensemanager.com";
  const password = "admin123"; // Change after first login!
  const nombre = "Administrador";

  try {
    // Check if admin exists
    const existing = await prisma.usuarioAdmin.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
        email,
      });
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

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      email: admin.email,
      temporaryPassword: password,
      warning: "⚠️ Delete this file (src/app/api/setup-admin/route.ts) and change the password after login!",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
