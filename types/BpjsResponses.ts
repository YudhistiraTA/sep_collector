export type SepResponse = {
	metaData: {
		code: string
		message: string
	}
	response: {
		noSep: string
		tglSep: string
		jnsPelayanan: string
		kelasRawat: string
		diagnosa: string
		noRujukan: string
		poli: string
		poliEksekutif: string
		catatan: string
		penjamin: string
		peserta: {
			noKartu: string
			nama: string
			tglLahir: string
			noMr: string
			kelamin: string
			jnsPeserta: string
			hakKelas: string
			asuransi: string
		}
		klsRawat: {
			klsRawatHak: string
			klsRawatNaik: string
			pembiayaan: string
			penanggungJawab: string
		}
		informasi: string
		kdStatusKecelakaan: string
		nmstatusKecelakaan: string
		dpjp: {
			kdDPJP: string
			nmDPJP: string
		}
		kontrol: {
			noSurat: string
			kdDokter: string
			nmDokter: string
		}
		lokasiKejadian: {
			tglKejadian: string
			kdProp: string
			kdKab: string
			kdKec: string
			ketKejadian: string
			lokasi: string
		}
		cob: string
		katarak: string
		tujuanKunj: {
			kode: string
			nama: string
		}
		flagProcedure: {
			kode: string
			nama: string
		}
		kdPenunjang: {
			kode: string
			nama: string
		}
		assestmenPel: {
			kode: string
			nama: string
		}
		eSEP: string
	}
}
