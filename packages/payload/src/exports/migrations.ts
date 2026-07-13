/**
 * Exports for CMS migrations
 *
 * This module provides migration utilities that users can import in their migration files.
 *
 * @example
 * ```ts
 * import { localizeStatus } from '@hanzo/cms/migrations'
 *
 * export async function up({ cms }) {
 *   await localizeStatus.up({
 *     collectionSlug: 'posts',
 *     cms,
 *   })
 * }
 * ```
 */

export { localizeStatus } from '../versions/migrations/localizeStatus/index.js'
