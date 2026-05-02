export interface JenisBencana {
    id:          number;
    nama_jenis:  string;
    kode_jenis:  string;
    warna_peta:  string;
}

export interface KejadianBencana {
    id:                     number;
    kecamatan:              string;
    jenis_bencana:          string;
    kode_jenis:             string;
    warna_peta:             string;
    jumlah_desa_terdampak:  number;
    tahun:                  number;
}

export interface RingkasanKecamatan {
    kecamatan:     string;
    total_desa:    number;
    jenis_bencana: { jenis: string; jumlah: number }[];
}

export interface ApiResponse<T> {
    status: string;
    total?: number;
    data:   T;
}