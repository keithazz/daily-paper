import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const testQueue = new Queue("test", { connection: redis });
