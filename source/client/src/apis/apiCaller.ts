const apiCaller = async (url: string, method: string, data: any | null) => {
  try {
    const options: any = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (method !== "GET") {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    
    // Don't treat 304 as an error
    if (!response.ok && response.status !== 304) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // For 304 responses, return a success response
    if (response.status === 304) {
      return { success: false, error: "User already exists" };
    }

    return response.json();
  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
};

const apiCallerBlob = async (url: string, method: string, data: any) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    // Don't treat 304 as an error
    if (!response.ok && response.status !== 304) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // For 304 responses, return a success response
    if (response.status === 304) {
      return { success: false, error: "User already exists" };
    }

    return response.blob();
  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
};

export { apiCaller, apiCallerBlob };
