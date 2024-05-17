const readOnlyColumns = [
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
] as const

export type SepRecord = Record<(typeof readOnlyColumns)[number], string>