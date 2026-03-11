# aiworkflow-requirements Extraction Matrix

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| タスクID | TASK-UI-04C-WORKSPACE-PREVIEW                     |
| 作成日   | 2026-03-11                                        |
| 目的     | system spec 正本から 04C 仕様へ抽出した要件を明示 |

## 抽出手順（Progressive Disclosure）

| 手順 | 参照元                    | 実施内容                                                                             |
| ---- | ------------------------- | ------------------------------------------------------------------------------------ |
| 1    | `indexes/resource-map.md` | UI実装/コンポーネントテスト/IPCセキュリティの必読仕様を選定                          |
| 2    | `scripts/search-spec.js`  | `WorkspaceView` / `file:read` / `Cmd+P` / `focus trap` / `coverage` で該当箇所を検索 |
| 3    | `indexes/topic-map.md`    | 選定した仕様の該当トピックを再確認                                                   |
| 4    | `indexes/keywords.json`   | キーワード漏れ（UI, IPC, a11y, quality）を確認                                       |
| 5    | `references/*.md`         | Phase 1-13 へ必要最小限の要件だけを反映                                              |

## 抽出マトリクス

| 観点               | 正本仕様                                  | 抽出要件                                                               | 反映先                                                                                                                                  |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| UI責務             | `ui-ux-feature-components.md`             | 04A 基盤を再利用し 04C を独立実装する                                  | `phase-1-requirements.md`, `phase-2-design.md`                                                                                          |
| UI語彙             | `ui-ux-components.md`                     | Task 5D 用語（プレビュー/コード表示/ファイルをすばやく探す）を維持する | `phase-1-requirements.md`, `phase-4-test-creation.md`, `phase-9-quality-assurance.md`                                                   |
| UI視覚基準         | `ui-ux-design-system.md`                  | QuickSearch モーダルの寸法/角丸/影を統一する                           | `phase-2-design.md`, `phase-4-test-creation.md`, `phase-11-manual-test.md`                                                              |
| state境界          | `arch-state-management.md`                | `workspaceSlice` 再利用、04C state は local 管理                       | `phase-1-requirements.md`, `phase-2-design.md`                                                                                          |
| IPC契約            | `api-ipc-system.md`                       | `file:read` と watch lifecycle を再利用                                | `phase-1-requirements.md`, `phase-5-implementation.md`                                                                                  |
| IPCチャネル実在    | `rag-desktop-state.md`                    | `file:read` を既存チャネルとして再確認し、新規チャネルを追加しない     | `phase-1-requirements.md`, `phase-2-design.md`                                                                                          |
| IPCセキュリティ    | `security-electron-ipc.md`                | subscribe 専用チャネルと cleanup を維持                                | `phase-2-design.md`, `phase-9-quality-assurance.md`                                                                                     |
| 入力検証           | `security-input-validation.md`            | DOMPurify 相当の sanitize と危険URL除去を維持する                      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-9-quality-assurance.md`                             |
| 実装パターン       | `architecture-implementation-patterns.md` | P5/P31/P39/P40 の再発防止を仕様へ固定する                              | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-6-test-expansion.md`, `phase-9-quality-assurance.md` |
| 検索ショートカット | `ui-ux-search-panel.md`                   | Cmd+P / Escape を標準ショートカットへ一致                              | `phase-1-requirements.md`, `phase-4-test-creation.md`                                                                                   |
| ナビ衝突回避       | `ui-ux-navigation.md`                     | 既存ショートカットと衝突しないキー導線を維持する                       | `phase-2-design.md`, `phase-11-manual-test.md`                                                                                          |
| a11y               | `testing-accessibility.md`                | dialog role / focus trap / aria 属性を検証対象化                       | `phase-4-test-creation.md`, `phase-6-test-expansion.md`                                                                                 |
| テスト規約         | `testing-component-patterns.md`           | happy-dom + fireEvent を固定                                           | `phase-1-requirements.md`, `phase-4-test-creation.md`                                                                                   |
| 品質基準           | `quality-requirements.md`                 | coverage gate を Line80/Branch60/Function80 とする                     | `phase-7-coverage-check.md`                                                                                                             |
| エラー処理         | `error-handling.md`                       | timeout/read error の分類と UI 表示を定義                              | `phase-1-requirements.md`, `phase-9-quality-assurance.md`                                                                               |
| workflow運用       | `task-workflow.md`                        | Phase 11 screenshot source pinning を定義                              | `phase-11-manual-test.md`                                                                                                               |
| 再発防止知見       | `lessons-learned.md`                      | P5/P31/P39/P40 の再発防止観点をテストへ継承する                        | `phase-1-requirements.md`, `phase-6-test-expansion.md`, `phase-12-documentation.md`                                                     |

## 抽出証跡コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "WorkspaceView" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "file:read" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Cmd+P" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "focus trap" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "coverage" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "DOMPurify" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "P5" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "P31" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "P39" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "P40" -C 2
```

## 抽出結果

- 抽出項目 17 件を Phase 仕様へ反映済み
- `resource-map` 起点の段階的読込（Progressive Disclosure）を実施済み
- 仕様更新は Phase 12 Task 12-2 で最終判定する
