import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = req.headers.get("x-api-key");
  
  const platform = searchParams.get("platform"); 
  const subcategory = searchParams.get("subcategory"); 

  if (!apiKey) {
    return NextResponse.json({ error: "API Key is required" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ apiKey });
    if (!user) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    // Since we do not have firebase-admin initialized in the user repo with credentials,
    // we use the public Firestore REST API to match what the admin panel uses.
    const projectId = "sociallogs-973c5";
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/uploads`;
    
    const response = await fetch(url);
    if (!response.ok) {
       return NextResponse.json({ error: "Failed to fetch logs from upstream" }, { status: 500 });
    }
    
    const rawData = await response.json();
    let logs = (rawData.documents || []).map((doc: any) => {
      const data = doc.fields;
      const parsed: any = { id: doc.name.split("/").pop() };
      for (const [key, value] of Object.entries(data)) {
         parsed[key] = (value as any).stringValue || (value as any).integerValue || (value as any).timestampValue || null;
      }
      return parsed;
    });

    // Apply filtering
    if (platform) {
      logs = logs.filter((log: any) => log.category === platform);
    }
    if (subcategory) {
      logs = logs.filter((log: any) => log.subcategory === subcategory);
    }

    return NextResponse.json(logs, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
