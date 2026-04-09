const textEncoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", textEncoder.encode(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt"]);
}

export async function encryptTransportPayload(payload: unknown): Promise<{ iv: string; data: string }> {
  const keyMaterial = import.meta.env.VITE_ENCRYPTION_KEY as string;
  if (!keyMaterial) {
    throw new Error("VITE_ENCRYPTION_KEY is required for transport encryption.");
  }

  const key = await deriveAesKey(keyMaterial);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = textEncoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  return {
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext))
  };
}
