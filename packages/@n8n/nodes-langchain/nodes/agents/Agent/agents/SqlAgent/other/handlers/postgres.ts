import { DataSource } from '@n8n/typeorm';
import type {
	PostgresNodeCredentials,
	PostgresNodeSSLOptions,
} from 'n8n-nodes-base/dist/nodes/Postgres/v2/helpers/interfaces';
import { type IExecuteFunctions } from 'n8n-workflow';
import type { TlsOptions } from 'tls';

export async function getPostgresDataSource(this: IExecuteFunctions): Promise<DataSource> {
	const credentials = await this.getCredentials<PostgresNodeCredentials>('postgres');

	let ssl: TlsOptions | boolean = !['disable', undefined].includes(credentials.ssl);
	if (ssl) {
		ssl = {};

		const { caCert, clientCert, clientKey, allowUnauthorizedCerts, servername } =
			credentials as PostgresNodeSSLOptions;
		if (caCert) {
			ssl.ca = caCert;
		}
		if (clientCert) {
			ssl.cert = clientCert;
		}
		if (clientKey) {
			ssl.key = clientKey;
		}
		if (allowUnauthorizedCerts === true) {
			ssl.rejectUnauthorized = false;
		}
		if (servername) {
			// @ts-expect-error this option is available for tls.connect but not on the TLSSocket constructor. typeorm has incorrectly typed as options for the latter.
			ssl.servername = servername;
		}
	}

	return new DataSource({
		type: 'postgres',
		host: credentials.host,
		port: credentials.port,
		username: credentials.user,
		password: credentials.password,
		database: credentials.database,
		ssl,
	});
}
