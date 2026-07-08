import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force Next.js to skip pre-rendering this endpoint during the build phase
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Extract the sessionId parameter from the query string url
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    // Safely pull keys within the runtime context with fallbacks to protect the build phase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";
    
    // Initialize inside the request boundary
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query your messages table for entries matching this session
    // Ordered oldest to newest so they append down your terminal screen chronologically
    const { data: messages, error } = await supabase
      .from("chat_messages") 
      .select("role, text")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(messages || []);
  } catch (error) {
    console.error("Database fetch error inside api/messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}