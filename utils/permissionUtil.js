import { Platform } from "react-native";
import { check, PERMISSIONS, RESULTS, request } from "react-native-permissions";

export const checkBluetoothConnectPermission = async () => {
  const targetPermission =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
      : PERMISSIONS.ANDROID.BLUETOOTH_CONNECT;
  let status = await check(targetPermission);

  if (status === RESULTS.DENIED) {
    status = await request(targetPermission);
    return status === RESULTS.GRANTED;
  } else {
    if (status === RESULTS.UNAVAILABLE) return true;
    return status === RESULTS.GRANTED;
  }
};
