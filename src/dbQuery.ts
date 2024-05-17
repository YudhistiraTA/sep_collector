import { Client } from 'pg'
import { SepRecord } from '../types/SepRecord'
import bpjsQuery from './bpjsQuery'

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
        CASE
          p.jenis_kelamin
          WHEN 1 THEN 'Tidak diketahui'
          WHEN 2 THEN 'Laki-laki'
          WHEN 3 THEN 'Perempuan'
          WHEN 4 THEN 'Tidak dapat ditentukan'
          ELSE 'Tidak mengisi'
        END AS "jenisKelamin",
        p.tanggal_lahir AS "tanggalLahir",
        pm.nama AS "namaDokter",
        pm.tanda_tangan AS "tandaTanganDokter",
        CASE
          a.kesadaran
          WHEN 1 THEN 'Sadar Baik/Alert: 0'
          WHEN 2 THEN 'Berespon dengan kata-kata/Voice: 1'
          WHEN 3 THEN 'Hanya berespons jika diransang nyeri/Pain: 2'
          WHEN 4 THEN 'Pasien tidak sadar/unresponsive: 3'
          WHEN 5 THEN 'Gelisah atau bingung: 4'
          ELSE 'Acute Confusuional State: 5'
        END AS "tingkatKesadaran",
        a.berat_badan AS "beratBadan",
        a.tinggi_badan AS "tinggiBadan",
        a.keluhan_utama AS "keluhanUtama",
        a.riwayat_penyakit AS "riwayatPenyakit",
        a.riwayat_pengobatan AS "riwayatPengobatan",
        au.suhu_tubuh AS "suhuTubuh",
        au.denyut_nadi AS "denyutNadi",
        au.pernafasan AS "pernafasan",
        au.tekanan_darah AS "tekananDarah",
        au.saturasi AS "saturasi",
        s.objective AS "pemeriksaan",
        CASE
          sp."statusPulang"
          WHEN '1' THEN 'Sembuh'
          WHEN '2' THEN 'Dirujuk'
          WHEN '3' THEN 'Pulang Paksa'
          WHEN '4' THEN 'Meninggal'
          ELSE 'Lain - lain'
        END AS "kondisiPulang",
        ARRAY_AGG(io.nama) AS "obatArray"
      FROM
        "SuratEligibilitasPeserta" AS sep
        JOIN "Registrasi" AS r ON sep.registrasi_id = r.id
        JOIN "Pasien" AS p ON r.pasien_id = p.id
        JOIN "Paramedic" AS pm ON r.paramedic_id = pm.id
        JOIN "Asesmen" AS a ON r.id = a.registrasi_id
        JOIN "AsesmenUlang" AS au ON r.id = au.registrasi_id
        JOIN "Soap" AS s ON r.id = s.registrasi_id
        JOIN "SuratPemulangan" AS sp ON r.id = sp.registrasi_id
        JOIN "Resep" AS re ON r.id = re.registrasi_id
        JOIN "ItemResep" AS ir ON re.id = ir.resep_id
        JOIN "ItemObat" AS io ON ir.obat_id = io.id
      WHERE
        sep.no_sep = '${record.noSep}'
        AND au.created_at = (
          SELECT
            MAX(created_at)
          FROM
            "AsesmenUlang"
          WHERE
            registrasi_id = r.id
        )
        AND s.created_at = (
          SELECT
            MAX(created_at)
          FROM
            "Soap"
          WHERE
            registrasi_id = r.id
        )
        AND sp.id = (
          SELECT
            id
          FROM
            "SuratPemulangan"
          WHERE
            registrasi_id = r.id
            AND is_deleted = false
          ORDER BY
            created_at DESC
          LIMIT
            1
        )
        AND io.satuan_harga NOT IN ('Alkes', 'Piece')
      GROUP BY
        sep.no_rujukan,
        r.no_rm,
        p.jenis_kelamin,
        p.tanggal_lahir,
        pm.nama,
        pm.tanda_tangan,
        a.kesadaran,
        a.berat_badan,
        a.tinggi_badan,
        a.keluhan_utama,
        a.riwayat_penyakit,
        a.riwayat_pengobatan,
        au.suhu_tubuh,
        au.denyut_nadi,
        au.pernafasan,
        au.tekanan_darah,
        au.saturasi,
        s.objective,
        sp."statusPulang"`,
			)
			const data = res.rows[0] as SepRecord & {
				tingkatKesadaran?: string
				beratBadan?: number
				tinggiBadan?: number
				keluhanUtama?: string
				riwayatPenyakit?: string
				riwayatPengobatan?: string
				suhuTubuh?: number
				denyutNadi?: number
				pernafasan?: number
				tekananDarah?: string
				saturasi?: number
				obatArray?: string[]
			}

			if (!data) return await bpjsQuery(client, record)

			// Build anamnesis field
			data.anamnesis =
				`Kesadaran: ${
					data.tingkatKesadaran ? data.tingkatKesadaran.replace(/\n/g, '') : '-'
				}\\n` +
				`Berat Badan: ${data.beratBadan ? data.beratBadan + ' kg' : '-'}\\n` +
				`Tinggi Badan: ${
					data.tinggiBadan ? data.tinggiBadan + ' cm' : '-'
				}\\n` +
				`Keluhan Utama: ${
					data.keluhanUtama ? data.keluhanUtama.replace(/\n/g, '') : '-'
				}\\n` +
				`Riwayat Penyakit: ${
					data.riwayatPenyakit ? data.riwayatPenyakit.replace(/\n/g, '') : '-'
				}\\n` +
				`Riwayat Pengobatan: ${
					data.riwayatPengobatan
						? data.riwayatPengobatan.replace(/\n/g, '')
						: '-'
				}\\n`
			// Remove unused fields
			delete data.tingkatKesadaran
			delete data.beratBadan
			delete data.tinggiBadan
			delete data.keluhanUtama
			delete data.riwayatPenyakit
			delete data.riwayatPengobatan

			// Build pemeriksaanFisikMasuk field
			let tekananDarah = '-'
			if (data.tekananDarah) {
				const parsedTekananDarah = JSON.parse(data.tekananDarah)
				tekananDarah = `${parsedTekananDarah.atas || '-'}/${
					parsedTekananDarah.bawah || '-'
				} mmHg`
			}
			data.pemeriksaanFisikMasuk =
				`Suhu Tubuh: ${data.suhuTubuh ? data.suhuTubuh + ' Celcius' : '-'}\\n` +
				`Denyut Nadi: ${
					data.denyutNadi ? data.denyutNadi + ' / Menit' : '-'
				}\\n` +
				`Pernafasan: ${
					data.pernafasan ? data.pernafasan + ' / Menit' : '-'
				}\\n` +
				`Tekanan Darah: ${tekananDarah}\\n` +
				`Saturasi: ${data.saturasi ? data.saturasi + '%' : '-'}\\n`
			// Remove unused fields
			delete data.suhuTubuh
			delete data.denyutNadi
			delete data.pernafasan
			delete data.tekananDarah
			delete data.saturasi

			data.obat = data.obatArray ? data.obatArray.join('\\n') : '-'
			delete data.obatArray

			data.pemeriksaan = data.pemeriksaan
				? data.pemeriksaan.replace(/\n/g, '\\n').replace(/;/g, ':')
				: '-'
			data.prognosa = '-'
			data.rencanaPengobatanLanjutan = '-'
			data.pengobatanLanjutan = '-'
			data.footer = '-'
			return { ...record, ...data }
		}),
	)
	return result
}
