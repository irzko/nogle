const getAccessToken = async (refreshToken: string, clientId: string) => {
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      body: new URLSearchParams({
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    }
  );
  const data = await response.json();
  return data.access_token;
};

export default getAccessToken;