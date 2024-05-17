import { writeFile } from 'fs'
import { SepRecord } from '../types/SepRecord'

export default function csvWrite(path: string, data: SepRecord[]) {
	const header = `NO SEP,NAMA,NO KARTU,NO RUJUKAN,DIAGNOSA,PELAYANAN,POLI,TGL.SEP,TGL.PULANG SEP,No RM,Jenis Kelamin,Tgl Lahir,Nama Dokter,URL ttd Dokter,Anamnesis,Pemeriksaan Fisik (Waktu Masuk),Pemeriksaan,Laboratiorium,Tindakan/Operasi,Obat yang diberikan,Prognosa,Kondisi Saat Pulang,Rencana Pengobatan lanjutan,Pengobatan Lanjutan,Footer\n`
	const csv = data.reduce((acc, record) => {
		const row = Object.values(record).join(',')
		return `${acc}${row}\n`
	}, header)
	writeFile(path, csv, console.log)
}
