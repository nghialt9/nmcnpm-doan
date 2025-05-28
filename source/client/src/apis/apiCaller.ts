const apiCaller = async (url: string, method: string, data: any | null) => {
  try {
    const options: any = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
    };
    if (method !== "GET") {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    console.error("Error calling API:", error);
    return null;
  }
};
const apiCallerBlob = async (url: string, method: string, data: any) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(data),
    });
    return response.blob();
  } catch (error) {
    console.error("Error calling API:", error);
    return null;
  }
};

export { apiCaller, apiCallerBlob };
