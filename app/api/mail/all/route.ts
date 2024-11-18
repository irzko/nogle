import { NextRequest, NextResponse } from "next/server";

import getAllMailImap from "./getAllMailImap";
import getAccessToken from "@/utils/getAccessToken";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const password = searchParams.get("pwd");
  const refreshToken = searchParams.get("rt");
  const clientId = searchParams.get("client_id");

  if (!email || !password || !refreshToken || !clientId) {
    return NextResponse.json({
      error: "Missing required parameters",
    });
  }
  const accessToken = await getAccessToken(refreshToken, clientId);

    const mail = await getAllMailImap(email, password, accessToken);
    return NextResponse.json({ mail });
}
