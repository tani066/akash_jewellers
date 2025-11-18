import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth"; 

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
    const { email, password } = await req.json();

    if (!email || !password){
      return NextResponse.json({ error: "All fields required" }, { status: 400, headers: corsHeaders(req) });
    }

    const user = await prisma.user.findUnique(
      { 
        where: { 
          email: email.toLowerCase()
        } 
      });
      
    if (!user){
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders(req) });
    }

    const valid = comparePassword(password, user.password);
    if (!valid){
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers: corsHeaders(req) });
    }

    const token = generateToken(user);

    return NextResponse.json({
      message: "Login successful",
      token,
      user: { id: user.id, 
        name: user.name, 
        email: user.email 
      }
    }, { headers: corsHeaders(req) });
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders(req) });
  }
}
