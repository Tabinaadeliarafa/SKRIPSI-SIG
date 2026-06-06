import { api } from "./api";

export async function getForecastMap(
  tahunAwal: number,
  tahunAkhir: number,
  jenisBencana: string
) {
  const { data } = await api.get("/forecast-map", {
    params: {
      tahun_awal: tahunAwal,
      tahun_akhir: tahunAkhir,
      jenis_bencana: jenisBencana,
    },
  });

  return data;
}