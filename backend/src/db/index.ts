import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

export type DatabaseInstance = ReturnType<typeof drizzle>;

export async function createDatabase(connectionString: string): Promise<{
	db: DatabaseInstance;
	client: postgres.Sql;
}> {
	const databaseUrl = connectionString;

	const migrationClient = postgres(databaseUrl, { max: 1 });
	const queryClient = postgres(databaseUrl);

	const db = drizzle(queryClient, { schema });

	try {
		await migrate(drizzle(migrationClient), {
			migrationsFolder: './src/db/migrations',
		});
	} catch (error) {
		console.warn('Migration error (this is normal for first run):', error);
	} finally {
		await migrationClient.end();
	}

	return { db, client: queryClient };
}

export { schema };
export type Database = DatabaseInstance;
