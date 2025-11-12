import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth"; 

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password){
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique(
      { 
        where: { 
          email: email.toLowerCase()
        } 
      });
      
    if (!user){
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = comparePassword(password, user.password);
    if (!valid){
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(user);

    return NextResponse.json({
      message: "Login successful",
      token,
      user: { id: user.id, 
        name: user.name, 
        email: user.email 
      }
    });
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
