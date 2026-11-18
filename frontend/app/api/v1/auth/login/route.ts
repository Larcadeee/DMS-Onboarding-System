import { NextRequest, NextResponse } from "next/server";

function getXsrfTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie");
    const xsrfToken = getXsrfTokenFromCookie(cookieHeader);

    const response = await fetch("http://127.0.0.1:8000/api/v1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Forward cookies from Laravel response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Copy set-cookie headers
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Login failed", data: null, meta: null },
      { status: 500 }
    );
  }
}