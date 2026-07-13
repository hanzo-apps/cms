import type { MigrationTemplateArgs } from '@hanzo/cms'

export const indent = (text: string) =>
  text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')

export const getMigrationTemplate = ({
  downSQL,
  imports,
  packageName,
  upSQL,
}: MigrationTemplateArgs): string => `import { MigrateUpArgs, MigrateDownArgs, sql } from '${packageName}'
${imports ? `${imports}\n` : ''}
export async function up({ db, cms, req }: MigrateUpArgs): Promise<void> {
${indent(upSQL)}
}

export async function down({ db, cms, req }: MigrateDownArgs): Promise<void> {
${indent(downSQL)}
}
`
