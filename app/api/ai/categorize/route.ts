import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categorizeTransaction } from "@/lib/claude";

// Course req: fetch API endpoint, async/await, error handling
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { description, categories } = await request.json() as {
      description: string;
      categories: { id: string; name: string; type: string }[];
    };

    if (!description || !categories?.length) {
      return NextResponse.json({ category_id: null, confidence: 0 });
    }

    const result = await categorizeTransaction(description, categories);
    if (!result) return NextResponse.json({ category_id: null, confidence: 0 });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ category_id: null, confidence: 0 });
  }
}
