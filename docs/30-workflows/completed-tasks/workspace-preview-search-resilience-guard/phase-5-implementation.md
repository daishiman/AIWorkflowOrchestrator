# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 5                                                    |
| Phase名    | 実装                                                 |
| ステータス | completed                                            |

## 目的

Phase 4 の testcase を満たす形で Quick Search / preview resilience / taxonomy を実コードへ反映する。

## 実行内容

- `quickFileSearchResilience.ts` を新設し、search match gate / stable sort / view state を pure utility 化した
- `previewResilience.ts` を新設し、timeout / retry / taxonomy helper を UI から分離した
- `WorkspaceView`, `QuickFileSearch`, `PreviewPanel`, `PreviewErrorBoundary` に typed error surface を適用した
- 新規 IPC を追加せず `file.read` を再利用した

## 実行タスク

- タスク1: search resilience utility を抽出する
- タスク2: preview timeout / retry helper を抽出する
- タスク3: taxonomy を UI surface に適用する
- タスク4: Phase 12 更新先を固定する

## 参照資料

- `outputs/phase-4/test-specification.md`
- `outputs/phase-2/resilience-guard-design.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`

## 統合テスト連携

- utility 抽出後も unit / hook / component / integration の既存 green を維持した
- 実装後の品質判定は targeted vitest / typecheck / eslint で確認した

## 成果物

| 成果物              | パス                                     |
| ------------------- | ---------------------------------------- |
| implementation-plan | `outputs/phase-5/implementation-plan.md` |
| spec-update-targets | `outputs/phase-5/spec-update-targets.md` |

## 完了条件

- [x] search / preview / taxonomy を concern 単位で分離した
- [x] docs sync 更新先を Phase 5 時点で固定した
