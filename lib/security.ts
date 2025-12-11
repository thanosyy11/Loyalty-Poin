import bcrypt from "bcryptjs";

// 1. Fungsi untuk Mengacak (Hash) Password/PIN sebelum disimpan
export const hashData = async (plainText: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainText, salt);
};

// 2. Fungsi untuk Memeriksa Password/PIN saat Login
// Membandingkan input user (plain) dengan data di database (hash)
export const verifyData = async (plainText: string, hashedText: string) => {
  return await bcrypt.compare(plainText, hashedText);
};