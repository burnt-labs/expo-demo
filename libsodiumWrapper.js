import sodium, { add } from "react-native-libsodium";

// Fix `crypto_aead_xchacha20poly1305_ietf_encrypt`
const crypto_aead_xchacha20poly1305_ietf_encrypt_fixed = (
  message,
  additionalData,
  secretNonce, // This might be `null` or `undefined`
  publicNonce,
  key
) => {
  return sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    message,
    additionalData ? new TextDecoder().decode(additionalData) : "",
    secretNonce,
    publicNonce,
    key
  );
};

const crypto_aead_xchacha20poly1305_ietf_decrypt_fixed = (
  secretNonce,
  ciphertext,
  additionalData, // Should be `null`
  publicNonce,
  key
) => {
  // 🔍 Debug: Log input types
  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    secretNonce,
    ciphertext ?? new Uint8Array(),
    additionalData ? new TextDecoder().decode(additionalData) : "",
    publicNonce,
    key
  );
};

// Fix `crypto_pwhash` to ensure `algorithm` is always a number
const crypto_pwhash_fixed = (
  outputLength,
  password,
  salt,
  opsLimit,
  memLimit,
  algorithm
) => {
  if (typeof algorithm !== "number") {
    console.warn(
      "[react-native-libsodium] Fixing crypto_pwhash: algorithm was",
      algorithm
    );
    algorithm = sodium.crypto_pwhash_ALG_DEFAULT; // Use the default if invalid
  }
  return sodium.crypto_pwhash(
    outputLength,
    password,
    salt,
    opsLimit,
    memLimit,
    algorithm
  );
};

// Create a wrapper that mimics `libsodium-wrappers-sumo`
const sodiumWrapper = {
  ...sodium,
  crypto_pwhash: crypto_pwhash_fixed, // Override `crypto_pwhash`
  crypto_aead_xchacha20poly1305_ietf_encrypt:
    crypto_aead_xchacha20poly1305_ietf_encrypt_fixed,
  crypto_aead_xchacha20poly1305_ietf_decrypt:
    crypto_aead_xchacha20poly1305_ietf_decrypt_fixed,
  ready: Promise.resolve(), // `libsodium-wrappers-sumo` expects `ready`
  onready: () => {}, // Some libraries check for `onready`
};

export default sodiumWrapper;
