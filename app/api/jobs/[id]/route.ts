import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testQueue } from "@/lib/queue";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const job = await testQueue.getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const state = await job.getState();
  const result = job.returnvalue as unknown;

  return NextResponse.json({ id: job.id, state, result });
}
