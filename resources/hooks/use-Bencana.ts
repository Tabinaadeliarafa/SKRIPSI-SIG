import { useQuery } from "@tanstack/react-query";
import { BencanaService } from "@/services/bencana.service";
import type { DisasterFilter } from "@/services/types";

const FIVE_MIN = 5 * 60 * 1000;

export function useKecamatan() {
  return useQuery({
    queryKey: ["kecamatan"],
    queryFn: BencanaService.kecamatan,
    staleTime: FIVE_MIN,
  });
}

export function useJenisBencana() {
  return useQuery({
    queryKey: ["jenis-bencana"],
    queryFn: BencanaService.jenis,
    staleTime: FIVE_MIN,
  });
}

export function useRingkasan(tahun?: number) {
  return useQuery({
    queryKey: ["ringkasan", tahun ?? "all"],
    queryFn: () => BencanaService.ringkasan(tahun),
    staleTime: FIVE_MIN,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: BencanaService.stats,
    staleTime: FIVE_MIN,
  });
}

export function useKejadian(filter: {
  tahun?: number;
  jenis?: DisasterFilter;
  kecamatan_id?: number;
}) {
  return useQuery({
    queryKey: ["kejadian", filter],
    queryFn: () =>
      BencanaService.kejadian({
        tahun: filter.tahun,
        jenis: filter.jenis === "all" ? undefined : filter.jenis,
        kecamatan_id: filter.kecamatan_id,
      }),
    staleTime: FIVE_MIN,
  });
}
