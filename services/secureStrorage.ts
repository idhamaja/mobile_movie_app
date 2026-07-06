import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store TIDAK punya implementasi native di web,
// jadi kalau dipanggil langsung di browser akan error
// "getValueWithKeyAsync is not a function". Wrapper ini pilih
// storage yang benar sesuai platform secara otomatis.

const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(key);
    }
    return null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = { setItem, getItem, deleteItem };