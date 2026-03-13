# aiworkflow-requirements Extraction Matrix

## メタ情報

| 項目     | 値                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------ |
| タスクID | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001                                             |
| workflow | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/`                   |
| 作成日   | 2026-03-13                                                                                       |
| 目的     | `aiworkflow-requirements` 正本から今回の仕様書に必要な情報を抽出できているかを監査し、不足を補う |

## 抽出手順（Progressive Disclosure）

| 手順 | 参照元                       | 実施内容                                                                                  |
| ---- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| 1    | `indexes/resource-map.md`    | UI実装、Preload invoke hang、component test、a11y、docs sync に必要な正本候補を絞り込んだ |
| 2    | `indexes/quick-reference.md` | 1概念1クエリ原則と broad query 0件時の再入場ルールを確認した                              |
| 3    | `scripts/search-spec.js`     | broad query と split query を使い、必要な `references/*.md` を最小集合で特定した          |
| 4    | `references/*.md`            | state / IPC / UI / taxonomy / docs sync / test / quality の実体仕様を読んだ               |
| 5    | current workflow             | Phase 1, 2, 4, 11, 12 と root index / spec map へ反映した                                 |
| 6    | root audit files             | 抽出完全性、traceability、branch diff 反映を root 監査台帳へ固定した                      |

## 検索フォールバック証跡

| 種別         | クエリ                         | 結果 | 次アクション                                        |
| ------------ | ------------------------------ | ---- | --------------------------------------------------- |
| broad query  | `renderer timeout retry`       | 0件  | `QuickFileSearch`, `PreviewPanel`, `timeout` に分割 |
| broad query  | `parse failure crash no-match` | 0件  | `parse failure`, `no-match` に分割                  |
| narrow query | `QuickFileSearch`              | hit  | search / navigation / workflow / UI spec を抽出     |
| narrow query | `PreviewPanel`                 | hit  | preview / state / workflow / UI spec を抽出         |
| narrow query | `score=0`                      | hit  | no-match / stable sort の search contract を抽出    |
| narrow query | `parse failure`                | hit  | recoverable fallback と error taxonomy を抽出       |
| narrow query | `no-match`                     | hit  | empty result rule と related UT 導線を抽出          |
| narrow query | `exact count`                  | hit  | Phase 12 stale count 防止ルールを抽出               |

## 抽出マトリクス

| 観点                    | 正本仕様                                                    | 抽出契約                                                         | 既存反映先                                                                              | 今回の補強                                                                                   |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| state ownership         | `arch-state-management.md`                                  | preview / query / selectedIndex は local state                   | `phase-1-requirements.md`, `phase-2-design.md`, `outputs/phase-1/spec-reference-map.md` | 維持                                                                                         |
| IPC reuse               | `api-ipc-system.md`                                         | 新規 IPC なし、`file:read` 再利用、5秒 timeout、1秒間隔3回 retry | `phase-1-requirements.md`, `phase-2-design.md`, `outputs/phase-1/spec-reference-map.md` | 維持                                                                                         |
| security boundary       | `security-electron-ipc.md`                                  | timeout 制御は renderer local に閉じる                           | `phase-1-requirements.md`, `phase-2-design.md`, `outputs/phase-1/spec-reference-map.md` | 維持                                                                                         |
| preview safety          | `security-input-validation.md`                              | sanitize / dangerous URL / CSP / iframe safety を崩さない        | `outputs/phase-1/spec-reference-map.md`                                                 | `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md` に追加             |
| implementation pattern  | `architecture-implementation-patterns.md`                   | match gate、recoverable parse fallback、transport only retry     | `outputs/phase-1/spec-reference-map.md`                                                 | `index.md`, `phase-1-requirements.md`, `phase-2-design.md` に追加                            |
| UI catalog / vocabulary | `ui-ux-components.md`                                       | 04C UI語彙、catalog 上の位置、Apple review continuity            | `outputs/phase-1/spec-reference-map.md`                                                 | `phase-1-requirements.md`, `phase-11-manual-test.md`, `phase-12-documentation.md` に追加     |
| search UI contract      | `ui-ux-search-panel.md`                                     | `score=0` 除外、stable sort、top 10                              | `index.md`, `phase-1-requirements.md`, `phase-4-test-creation.md`                       | 維持                                                                                         |
| navigation contract     | `ui-ux-navigation.md`                                       | `Cmd/Ctrl+P`、Arrow/Enter/Escape、focus trap、preview auto-open  | `outputs/phase-1/spec-reference-map.md`                                                 | `index.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md` に追加 |
| preview / fallback UI   | `ui-ux-feature-components.md`                               | `PreviewPanel` / `QuickFileSearch` と 04C follow-up 導線         | `index.md`, `phase-1-requirements.md`, `phase-11-manual-test.md`                        | 維持                                                                                         |
| modal token             | `ui-ux-design-system.md`                                    | QuickFileSearch dialog token                                     | `index.md`, `phase-1-requirements.md`, `phase-11-manual-test.md`                        | 維持                                                                                         |
| error taxonomy          | `error-handling.md`                                         | transport / parse / crash / no-match を混ぜない                  | `index.md`, `phase-1-requirements.md`, `phase-9-quality-assurance.md`                   | 維持                                                                                         |
| docs sync ledger        | `task-workflow.md`                                          | related UT、Phase 12 exact count / ID / path sync                | `index.md`, `phase-12-documentation.md`, `outputs/phase-1/spec-reference-map.md`        | 維持                                                                                         |
| lessons                 | `lessons-learned.md`                                        | 5ステップ解決手順、stale exact count 再取得ルール                | `index.md`, `phase-1-requirements.md`, `outputs/phase-1/spec-reference-map.md`          | 維持                                                                                         |
| test pattern            | `testing-component-patterns.md`, `testing-accessibility.md` | hook / component / dialog / focus / banner 検証                  | `phase-2-design.md`, `phase-4-test-creation.md`                                         | `outputs/phase-1/spec-reference-map.md` に追記                                               |
| quality gate            | `quality-requirements.md`                                   | future coverage / QA gate                                        | `phase-2-design.md`, `phase-4-test-creation.md`, `phase-9-quality-assurance.md`         | `outputs/phase-1/spec-reference-map.md` に追記                                               |

## 抽出証跡コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "renderer timeout retry" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "parse failure crash no-match" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "QuickFileSearch" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "PreviewPanel" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "score=0" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "parse failure" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "no-match" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "stable sort" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "exact count" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "DOMPurify" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Workspace Preview / Quick Search" -C 2
```

## 抽出結果

- broad query 0件のまま終わらせず、`quick-reference.md` の分割ルールに従って必要 spec を再収集した。
- 不足していた `architecture-implementation-patterns.md`、`ui-ux-navigation.md`、`security-input-validation.md`、`ui-ux-components.md` を current workflow 本文へ追加した。
- 今回の branch は spec-only なので、必要 system spec は current workflow 内で完結して参照できる状態になっている。
