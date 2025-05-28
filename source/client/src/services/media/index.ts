export const requestPermissionMicro = async (
  permission: String
): Promise<any> => {
  try {
    const status: any = await navigator.permissions.query({
      name: permission as PermissionName,
    });
    console.log("requestPermissionMicro", status.state);

    switch (status.state) {
      case "granted":
      case "prompt":
        break;
      case "denied": {
        alert("Microphone permission denied");
        return status.state;
      }
    }

    return status.state;
  } catch (error) {
    console.error("Error requesting permission:", error);
  }
};
