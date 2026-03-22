import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const insightsRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ai-fluency-check-insights",
});

const trackRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ai-fluency-check-track",
});

export async function proxy(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";

    const limiter = request.nextUrl.pathname === "/api/track"
      ? trackRatelimit
      : insightsRatelimit;
    const { success, limit, remaining, reset } = await limiter.limit(ip);

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
  } catch (error) {
    console.error("Rate limit proxy error", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/insights", "/api/track"],
};
