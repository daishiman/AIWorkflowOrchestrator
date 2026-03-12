# Phase 1 SubAgent 責務表

| SubAgent   | 担当関心                                 | 今回の実績                                                                  |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| SubAgent-A | PreviewPanel UI / UX / Phase 11 視覚検証 | Preview 系 component 実装、toolbar 文言統一、Phase 11 Apple 観点レビュー    |
| SubAgent-B | state / IPC / security                   | `file:read` timeout + retry、watcher debounce、sanitize / iframe 制約の確認 |
| SubAgent-C | test / coverage / quality gate           | 52 tests、coverage 計測、timeout/誤マッチ/画像/error boundary テスト補強    |
| SubAgent-D | review gate / doc sync                   | outputs 生成、workflow 状態同期、system spec / LOGS / SKILL 更新            |

## Concern 分離の判断

- UI描画は `components/PreviewPanel/*` へ閉じた
- 検索ロジックは `useQuickFileSearch.ts` に閉じた
- watch / timeout / file read 統合は `WorkspaceView/index.tsx` と `useFileWatcher.ts` に分離した
- Phase 11 / 12 は current build pinning と spec sync を独立成果物として分離した
