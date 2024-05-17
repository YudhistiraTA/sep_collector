import { Client } from 'pg'
import { SepRecord } from '../types/SepRecord'

export default async function dbQuery(
	client: Client,
	data: SepRecord[],
): Promise<SepRecord[]> {
	const result = await Promise.all(
		data.map(async (record) => {
			const res = await client.query(
				`SELECT
        sep.no_rujukan AS "noRujukan",
        r.no_rm AS "noRm",
        p.tanggal_lahir AS "tanggalLahir",
        pm.nama AS "namaDokter",
        pm.tanda_tangan AS "tandaTanganDokter",
        CASE
          p.jenis_kelamin
          WHEN 1 THEN 'Tidak diketahui'
          WHEN 2 THEN 'Laki-laki'
          WHEN 3 THEN 'Perempuan'
          WHEN 4 THEN 'Tidak dapat ditentukan'
          ELSE 'Tidak mengisi'
        END AS "jenisKelamin"
      FROM
        "SuratEligibilitasPeserta" AS sep
        JOIN "Registrasi" AS r ON sep.registrasi_id = r.id
        JOIN "Pasien" AS p ON r.pasien_id = p.id
        JOIN "Paramedic" as pm ON r.paramedic_id = pm.id
      WHERE
        sep.no_sep = '${record.noSep}'`,
			)
			const data = res.rows[0] as SepRecord
			return { ...record, ...data }
		}),
	)
	return result
}
