import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client on the server side using local environment keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request) {
  try {
    // Extract the sessionId parameter from the query string url
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    // Query your messages table for entries matching this session
    // Ordered oldest to newest so they append down your terminal screen chronologically
    const { data: messages, error } = await supabase
      .from("chat_messages") // Ensure this matches your actual messages table name in Supabase
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