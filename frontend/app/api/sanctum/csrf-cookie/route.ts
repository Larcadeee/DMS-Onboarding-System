import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");

    const response = await fetch("http://127.0.0.1:8000/sanctum/csrf-cookie", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    // 204 No Content - return empty response with cookies
    if (response.status === 204) {
      const nextResponse = new NextResponse(null, { status: 204 });
      const setCookieHeaders = response.headers.getSetCookie();
      if (setCookieHeaders.length > 0) {
        setCookieHeaders.forEach((cookie) => {
          nextResponse.headers.append("Set-Cookie", cookie);
        });
      }
      return nextResponse;
    }

    // For other status codes, parse JSON and forward
    const data = await response.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: response.status });

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to get CSRF cookie", data: null, meta: null },
      { status: 500 }
    );
  }
}