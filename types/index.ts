// File: src/types/index.ts

export type Role = 'admin' | 'staff';

export interface UserSession {
  id: number;
  username: string;
  role: Role;
  storeId: number | null;
  storeName: string;
  loginTime: number;
}

export interface Member {
  id: number;
  created_at: string;
  nama: string;
  no_hp: string;
  pin: string;
  total_poin: number;
  stores?: { nama_toko: string }; // Relasi
}

export interface Voucher {
  id: number;
  code: string; // Kode Unik (V2.0)
  status: 'active' | 'used' | 'expired';
  created_at: string;
  reward_id: number;
  rewards?: {
    nama_hadiah: string;
    nilai_voucher: number;
  };
}

export interface Transaction {
  id: number;
  created_at: string;
  type: 'earning' | 'redeem';
  amount: number;
  description: string;
  store_id: number | null;
  stores?: { nama_toko: string };
  members?: { nama: string; no_hp: string };
}

export interface Store {
  id: number;
  nama_toko: string;
  alamat: string | null;
}