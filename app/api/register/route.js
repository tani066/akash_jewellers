import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ 
        where:{ 
            email: email.toLowerCase()
        } 
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    if (password.length < 8) {
  return NextResponse.json({ error: "Password must be atleast 8 characters" }, { status: 400 });
}

    const hashedPassword = hashPassword(password);

    const newUser = await prisma.user.create({
      data:{
        name,
        email, 
        password: hashedPassword 
    }
    });

    return NextResponse.json({
      message: "User registered successfully",
      user: { id: newUser.id, 
        name: newUser.name, 
        email: newUser.email 
    },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
