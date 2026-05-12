import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testQueue } from "@/lib/queue";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const job = await testQueue.add("test-job", {});
  return NextResponse.json({ id: job.id }, { status: 201 });
}
