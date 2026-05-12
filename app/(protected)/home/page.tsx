"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobStatus = "idle" | "queuing" | "waiting" | "completed" | "failed";

export default function HomePage() {
  const [status, setStatus] = useState<JobStatus>("idle");

  const triggerJob = async () => {
    setStatus("queuing");

    const res = await fetch("/api/jobs", { method: "POST" });
    if (!res.ok) {
      setStatus("failed");
      return;
    }

    const { id } = (await res.json()) as { id: string };
    setStatus("waiting");

    const poll = async () => {
      const r = await fetch(`/api/jobs/${id}`);
      const data = (await r.json()) as { state: string };

      if (data.state === "completed") {
        setStatus("completed");
      } else if (data.state === "failed") {
        setStatus("failed");
      } else {
        setTimeout(poll, 1000);
      }
    };

    setTimeout(poll, 1000);
  };

  const statusMessage: Record<JobStatus, string | null> = {
    idle: null,
    queuing: "Queuing job…",
    waiting: "Job running, waiting for result…",
    completed: "Job completed successfully!",
    failed: "Job failed.",
  };

  const isRunning = status === "queuing" || status === "waiting";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button onClick={triggerJob} disabled={isRunning}>
              {isRunning ? "Running…" : "Trigger Test Job"}
            </Button>
            {statusMessage[status] && (
              <p
                className={`text-sm ${
                  status === "failed"
                    ? "text-destructive"
                    : status === "completed"
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {statusMessage[status]}
              </p>
            )}
          </div>
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
