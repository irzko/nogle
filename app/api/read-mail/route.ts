import { NextRequest, NextResponse } from "next/server";
import imaps, { ImapSimpleOptions } from "imap-simple";
import axios from "axios";
import { find } from "lodash-es";

const getAccessToken = (refreshToken: string) => {
  const response = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    new URLSearchParams({
      client_id: "b1062a92-931a-4d71-beb6-7741d2f4b743",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
  return response.data.access_token;
};

const readMailGraph = async (accessToken: string) => {
  const response = await axios.get(
    "https://graph.microsoft.com/v1.0/me/messages",
    {
      headers: {
        Authorization: accessToken,
      },
    },
  );

  if (response.status >= 200 && response.status < 300) {
    // Handle the response
  } else {
    throw new Error("Failed to read mail");
  }
};

const readMailImap = async (
  email: string,
  password: string,
  accessToken: string,
) => {
  const config: ImapSimpleOptions = {
    imap: {
      user: email,
      password: password,
      host: "outlook.office365.com",
      port: 993,
      tls: true,
      xoauth2: accessToken,
    },
  };

  imaps.connect(config).then(async (connection) => {
    return connection.openBox("INBOX").then(async () => {
      const searchCriteria = ["1:5"];
      const fetchOptions = {
        bodies: ["HEADER", "TEXT"],
      };
      return connection
        .search(searchCriteria, fetchOptions)
        .then(function (messages) {
          messages.forEach(function (item) {
            const all = find(item.parts, { which: "TEXT" });
            if (all) {
              return Buffer.from(all.body, "base64").toString("ascii");
            } else {
              return "No TEXT part found in message";
            }
          });
        });
    });
  });
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const password = searchParams.get("pwd");
  const refreshToken = searchParams.get("refreshToken");
  const scopeType = searchParams.get("scopeType") || "IMAP";

  if (!email || !password || !refreshToken) {
    return NextResponse.json({
      error: "Missing email, password, or refreshToken",
    });
  }
  const accessToken = await getAccessToken(refreshToken);

  if (scopeType == "GRAPH") {
    await readMailGraph(accessToken);
  } else {
    const mail = await readMailImap(email, password, accessToken);
    return NextResponse.json({ mail });
  }
}
