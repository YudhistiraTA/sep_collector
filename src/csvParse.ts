import { parse } from 'csv-parse'
import fs from 'fs'
import { SepRecord } from '../types/SepRecord'

const columns = [
	'noSep',
	'nama',
	'noKartu',
	'noRujukan',
	'diagnosa',
	'pelayanan',
	'poli',
	'tanggalSep',
	'tanggalPulangSep',
	'noRm',
	'jenisKelamin',
	'tanggalLahir',
	'namaDokter',
	'tandaTanganDokter',
	'anamnesis',
	'pemeriksaanFisikMasuk',
	'pemeriksaan',
	'laboratorium',
	'tindakan',
	'obat',
	'prognosa',
	'kondisiPulang',
	'rencanaPengobatanLanjutan',
	'pengobatanLanjutan',
	'footer',
]

export default function csvParse(path: string): Promise<SepRecord[]> {
	return new Promise((resolve, reject) => {
		const parser = fs.createReadStream(path).pipe(
			parse({
				fromLine: 2,
				columns,
			}),
		)
		const records: SepRecord[] = []
		parser.on('data', (chunk: SepRecord) => {
			records.push(chunk)
		})

		parser.on('end', () => {
			console.log('Parsing finished.')
			resolve(records)
		})

		parser.on('error', (err) => {
			console.error('Error while parsing:', err)
			reject(err)
		})
	})
}
