import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

// Existing GET Handler
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized Session" }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?user_email=eq.${encodeURIComponent(session.user.email)}&select=*&order=created_at.desc`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// Brand New PUT Handler for Z-engine Rename Operations
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  
  // Security guard check
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized Session" }, { status: 401 });
  }

  try {
    const { sessionId, title } = await request.json();

    if (!sessionId || !title) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Use PostgREST standard PATCH operation mapping to safely modify row indices
    const res = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?session_id=eq.${encodeURIComponent(sessionId)}&user_email=eq.${encodeURIComponent(session.user.email)}`, {
      method: "PATCH",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ title: title })
    });

    if (!res.ok) {
      throw new Error(`Supabase request failure code: ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session rename API failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}