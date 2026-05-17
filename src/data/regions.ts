import type { Region } from "@/types";

export const REGIONS: Region[] = [
  { id: "us-east-1",      city: "Virginia",  code: "us-east-1",      x: 22, y: 36, latencyMs: 38, health: "healthy" },
  { id: "us-west-2",      city: "Oregon",    code: "us-west-2",      x: 12, y: 32, latencyMs: 46, health: "healthy" },
  { id: "eu-west-1",      city: "Dublin",    code: "eu-west-1",      x: 47, y: 28, latencyMs: 52, health: "healthy" },
  { id: "eu-central-1",   city: "Frankfurt", code: "eu-central-1",   x: 52, y: 32, latencyMs: 58, health: "healthy" },
  { id: "sa-east-1",      city: "São Paulo", code: "sa-east-1",      x: 30, y: 64, latencyMs: 64, health: "healthy" },
  { id: "ap-northeast-1", city: "Tokyo",     code: "ap-northeast-1", x: 84, y: 40, latencyMs: 48, health: "degraded" },
];
