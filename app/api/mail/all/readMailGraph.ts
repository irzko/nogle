const readMailGraph = async (accessToken: string) => {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/messages",
    {
      method: "POST",
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

export default readMailGraph;
