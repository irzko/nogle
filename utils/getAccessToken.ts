import axios from "axios";

const getAccessToken = async (refreshToken: string, clientId: string) => {
  const response = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    new URLSearchParams({
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  );
  return response.data.access_token;
};

export default getAccessToken;