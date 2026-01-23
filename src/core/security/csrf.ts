import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/src/core/config";

export const enforceSameOrigin = (request: Request) => {
  const baseUrl = getAppBaseUrl();
  const baseOrigin = new URL(baseUrl).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const parseOrigin = (value: string) => {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  };

  if (origin) {
    const parsedOrigin = parseOrigin(origin);
    if (!parsedOrigin || parsedOrigin !== baseOrigin) {
      return NextResponse.json(
        { error: { code: "INVALID_ORIGIN", message: "Invalid origin." } },
        { status: 403 }
      );
    }
  }

  if (!origin && referer) {
    const parsedReferer = parseOrigin(referer);
    if (!parsedReferer || parsedReferer !== baseOrigin) {
      return NextResponse.json(
        { error: { code: "INVALID_ORIGIN", message: "Invalid origin." } },
        { status: 403 }
      );
    }
  }

  return null;
};
