"use client";

import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { useCallback } from "react";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY!; // must be prefixed with NEXT_PUBLIC

export function encrypt(value: string) {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
}

export function decrypt(encrypted: string) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

export default function useSecureCookie() {
  const setCookie = useCallback(
    (key: string, value: string, options?: Cookies.CookieAttributes) => {
      const encryptedValue = encrypt(value);
      Cookies.set(key, encryptedValue, {
        secure: true,
        sameSite: "strict",
        ...options,
      });
    },
    []
  );

  const getCookie = useCallback((key: string): string | null => {
    const cookie = Cookies.get(key);
    return cookie ? decrypt(cookie) : null;
  }, []);

  const removeCookie = useCallback((key: string) => {
    Cookies.remove(key);
  }, []);

  return { setCookie, getCookie, removeCookie };
}
