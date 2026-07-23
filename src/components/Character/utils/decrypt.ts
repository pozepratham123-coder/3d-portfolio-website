// decrypt.ts — AES-CBC decryption for the encrypted 3D model file.
//
// The character.glb model is stored as character.enc on the server to prevent
// direct downloading and extraction of the 3D asset.
//
// Encryption scheme (performed offline by encrypt.cjs in /public/models/):
//   1. A random 16-byte IV (initialisation vector) is prepended to the file.
//   2. The rest of the file is the AES-CBC encrypted GLB data.
//
// Decryption scheme (this file):
//   1. Fetch the .enc file as an ArrayBuffer.
//   2. Slice the first 16 bytes as the IV.
//   3. Derive a 32-byte AES key from the password string using SHA-256.
//   4. Decrypt the remainder with Web Crypto API (AES-CBC).
//   5. Return the decrypted ArrayBuffer — passed to GLTFLoader as a Blob URL.
//
// The Web Crypto API (crypto.subtle) is used because it runs natively in the
// browser with no external library dependency, and it's significantly faster
// than a JS-only AES implementation.

// Derives a 32-byte AES-CBC CryptoKey from a plain-text password string.
// Uses SHA-256 to hash the password so any length input maps to exactly 32 bytes.
async function generateAESKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password); // UTF-8 bytes
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer); // 32-byte hash

  return crypto.subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32), // Use the full 32 bytes as the AES-256 key
    { name: "AES-CBC" },
    false,        // Non-extractable — key cannot be exported from the browser
    ["encrypt", "decrypt"]
  );
}

// Fetches the encrypted file from `url`, decrypts it with `password`,
// and returns the plain-text ArrayBuffer (the original GLB file).
export const decryptFile = async (
  url: string,
  password: string
): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  const encryptedData = await response.arrayBuffer();

  // The first 16 bytes are the IV stored prepended during encryption
  const iv = new Uint8Array(encryptedData.slice(0, 16));

  // Everything after the IV is the actual encrypted GLB data
  const data = encryptedData.slice(16);

  const key = await generateAESKey(password);

  // Decrypt using the same algorithm and IV used during encryption
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
};
