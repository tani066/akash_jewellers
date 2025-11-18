import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS?.split(",") ?? [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://akash-jewellers.vercel.app",
  "https://akash-jewellers-one.vercel.app",
]);

function corsHeaders(req) {
  const origin = req.headers.get("origin");
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
  if (isAllowed) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export async function OPTIONS(req) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400, headers: corsHeaders(req) });
    }

    const existingUser = await prisma.user.findUnique({ 
        where:{ 
            email: email.toLowerCase()
        } 
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400, headers: corsHeaders(req) });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be atleast 8 characters" }, { status: 400, headers: corsHeaders(req) });
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
    }, { headers: corsHeaders(req) });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders(req) });
  }
}
