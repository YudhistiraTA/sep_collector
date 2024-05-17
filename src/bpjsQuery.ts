import { Client } from 'pg'
import { SepRecord } from '../types/SepRecord'
import axios from 'axios'
import { SepResponse } from '../types/BpjsResponses'

export default async function bpjsQuery(
	client: Client,
	data: SepRecord,
): Promise<SepRecord> {
	if (!process.env.BPJS_URL || !process.env.BPJS_TOKEN) {
		return data
	}
  await new Promise(resolve => setTimeout(resolve, 60000));
	const bpjsResponse = await axios.get<SepResponse>(
		process.env.BPJS_URL + '/bpjs/vclaim/sep',
		{
			data: { no_sep: data.noSep },
			headers: { Authorization: `Bearer ${process.env.BPJS_TOKEN}` },
		},
	)
	if (!bpjsResponse.data.response) return data

	const paramedicQuery = await client.query(
		`SELECT pm.tanda_tangan FROM "Paramedic" AS pm WHERE pm.kode_bpjs = '${bpjsResponse.data.response.dpjp.kdDPJP}'`,
	)
	const tandaTanganDokter = paramedicQuery.rows[0]?.tanda_tangan

	const bpjsData = bpjsResponse.data.response
	data.noRujukan = bpjsData.noRujukan
	data.noRm = bpjsData.peserta.noMr
	data.jenisKelamin =
		bpjsData.peserta.kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
	data.tanggalLahir = bpjsData.peserta.tglLahir
		? new Date(bpjsData.peserta.tglLahir).toString()
		: '-'
	data.namaDokter = bpjsData.dpjp.nmDPJP
	data.tandaTanganDokter = tandaTanganDokter

	return data
}
