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
] as const

export type SepRecord = Record<(typeof readOnlyColumns)[number], string>
