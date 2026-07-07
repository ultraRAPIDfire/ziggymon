import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  // Pass the incoming request headers to let NextAuth decode the browser cookie
  const session = await getServerSession(authOptions);
  
  // If fallback occurs, let's grab the user profile session data dynamically
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized Session" }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const res = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?user_email=eq.${encodeURIComponent(session.user.email)}&select=*`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json"
      },
      cache: "no-store" // Stop Next.js from caching an empty array permanently
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}