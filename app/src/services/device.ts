import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_KEY = "device_id";

export async function getDeviceName() {
  let deviceId = await SecureStore.getItemAsync(DEVICE_KEY);

  if (!deviceId) {
    const random = Crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    deviceId = `customer-app-${random}`;

    await SecureStore.setItemAsync(DEVICE_KEY, deviceId);
  }

  return deviceId;
}