import type { Mock, VersionEntry } from './types'

// VersionEntry から表示する mock 一覧を解決する。
// mocks 指定があればそれを、なければ view を単一 mock（要件は version 側の requirements）として扱う。
export function resolveMocks(e: VersionEntry | undefined): Mock[] {
  if (!e) return []
  if (e.mocks?.length) return e.mocks
  if (e.view !== undefined) {
    return [{ id: 'default', label: 'default', view: e.view, requirements: e.requirements ?? '' }]
  }
  return []
}
