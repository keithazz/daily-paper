import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "test",
  async (job) => {
    console.log(`[worker] processing job ${job.id}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return { success: true, message: "Job completed after 3s" };
  },
  { connection }
);

worker.on("completed", (job, result) => {
  console.log(`[worker] job ${job.id} completed:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});

console.log("[worker] BullMQ worker started, listening on queue: test");
