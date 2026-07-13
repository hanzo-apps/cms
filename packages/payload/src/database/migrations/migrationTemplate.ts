export const migrationTemplate = `
import {
  MigrateUpArgs,
  MigrateDownArgs,
} from "@hanzo/cms-db-mongodb";

export async function up({ cms, req }: MigrateUpArgs): Promise<void> {
  // Migration code
};

export async function down({ cms, req }: MigrateDownArgs): Promise<void> {
  // Migration code
};
`
