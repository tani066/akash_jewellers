import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders(req) });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        name: true, 
        email: true 
      }
    });

    return NextResponse.json({ user }, { headers: corsHeaders(req) });
    
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403, headers: corsHeaders(req) });
  }
}
