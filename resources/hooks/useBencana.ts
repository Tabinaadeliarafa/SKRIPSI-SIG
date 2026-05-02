import { useState, useEffect } from 'react';
import api from '../lib/axios';
import type { KejadianBencana, RingkasanKecamatan, ApiResponse } from '../js/bencana';

// Hook: ambil semua data bencana
export function useBencana(tahun?: number, jenis?: string) {
    const [data,    setData]    = useState<KejadianBencana[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string | number> = {};
        if (tahun) params.tahun = tahun;
        if (jenis) params.jenis = jenis;

        api.get<ApiResponse<KejadianBencana[]>>('/bencana', { params })
            .then((res) => setData(res.data.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [tahun, jenis]);

    return { data, loading, error };
}

// Hook: ambil ringkasan per kecamatan
export function useRingkasan() {
    const [data,    setData]    = useState<RingkasanKecamatan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        api.get<ApiResponse<RingkasanKecamatan[]>>('/bencana/ringkasan')
            .then((res) => setData(res.data.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}