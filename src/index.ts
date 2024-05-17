import 'dotenv/config'
import { Client } from 'pg'
import csvParse from './csvParse'
import dbQuery from './dbQuery'
import csvWrite from './csvWrite'

const client = new Client({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	database: process.env.DB_NAME,
})
client.connect()

async function main() {
	try {
		let data = await csvParse('./data/input/fromResult.csv')
		data = await dbQuery(client, data)
		csvWrite('./data/output/result2.csv', data)
	} catch (error) {
		console.error('Error:', error)
	} finally {
		await client.end()
	}
}

main()
