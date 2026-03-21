import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { report: null, error: "Too many requests. Please try again in an hour." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/insights",
};
