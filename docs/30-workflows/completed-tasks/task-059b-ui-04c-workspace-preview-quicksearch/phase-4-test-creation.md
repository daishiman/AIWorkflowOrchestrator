# Phase 4: テスト作成

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 4                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-C                                     |

## 目的

Phase 5 実装前に Red テストを定義し、PreviewPanel と QuickFileSearch の仕様を先に固定する。表示分岐、キーボード操作、IPC 連携、セキュリティ挙動をテストで拘束する。

## 実行タスク

- コンポーネントテスト定義: PreviewPanel と QuickFileSearch の UI 仕様を Red 化する
- Hookテスト定義: `useQuickFileSearch` の検索ロジックを Red 化する
- セキュリティテスト定義: sanitize と iframe 制約の確認ケースを定義する
- アクセシビリティテスト定義: dialog role と keyboard 操作ケースを定義する
- 回帰テスト定義: 04A レイアウト連携の回帰ケースを定義する

## 参照資料

| 参照資料       | パス                                                                                                       | 説明               |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1        | `phase-1-requirements.md`                                                                                  | FR/NFR             |
| Phase 2        | `phase-2-design.md`                                                                                        | 実装設計           |
| Phase 3        | `phase-3-design-review.md`                                                                                 | ゲート観点         |
| 04A テスト設計 | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-4-test-creation.md` | watcher 連携の前提 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 本Phaseで使う理由                |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| UI語彙仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Task 5D 用語の文言検証           |
| UIデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | モーダル視覚仕様の検証基準       |
| テスト規約         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | happy-dom + fireEvent の基準適用 |
| アクセシビリティ   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | dialog / focus trap / aria 検証  |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P31/P39/P40 のテスト運用基準     |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | coverage gate の基準適用         |
| IPC セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | watch cleanup と allowlist 前提  |

## 実行手順

### ステップ1: テスト対象を固定

| テストファイル               | 対象                                          |
| ---------------------------- | --------------------------------------------- |
| `PreviewPanel.test.tsx`      | Source/Preview 切替、拡張子分岐、ゼロステート |
| `QuickFileSearch.test.tsx`   | Cmd+P 開閉、結果描画、キー操作                |
| `useQuickFileSearch.test.ts` | スコアリング、ソート、上位10件制限            |

### ステップ2: 主要テストケースを定義

| ケースID | ケース                                                             |
| -------- | ------------------------------------------------------------------ |
| TC-04-01 | file 未選択時に PreviewEmptyState が表示される                     |
| TC-04-02 | Preview 対応拡張子で Preview タブが有効になる                      |
| TC-04-03 | 非対応拡張子で Preview タブが無効になる                            |
| TC-04-04 | Cmd+P でモーダルが開く                                             |
| TC-04-05 | ArrowDown で選択 index が進む                                      |
| TC-04-06 | Enter で `setSelectedFilePath` が呼ばれる                          |
| TC-04-07 | Escape でモーダルが閉じる                                          |
| TC-04-08 | sanitize で script タグが除去される                                |
| TC-04-09 | JSON/YAML で StructuredPreview が表示される                        |
| TC-04-10 | PreviewToolbar の Refresh/Wrap トグルが動作する                    |
| TC-04-11 | watcher 通知時に 300ms デバウンスで再読込される                    |
| TC-04-12 | timeout(5秒) + retry(1秒間隔3回) 後に復帰導線付きエラー表示になる  |
| TC-04-13 | Task 5D 用語に一致した UI 文言を表示する                           |
| TC-04-14 | iframe に sandbox/CSP 制約が適用され script 実行されない           |
| TC-04-15 | SourceView が read-only でダブルクリック時に Editor 遷移導線を呼ぶ |
| TC-04-16 | SourceView の行番号ガター幅が 40px で表示される                    |

### ステップ3: 実行コマンドを固定

```bash
cd apps/desktop && pnpm vitest run
```

## 統合テスト連携

| 観点         | Phase 5 へ引き継ぐ内容                                 |
| ------------ | ------------------------------------------------------ |
| Renderer連携 | file 選択から Preview 更新までの一連動作               |
| IPC連携      | `file:read` 成功/失敗での UI 遷移                      |
| watch連携    | 04A watcher event での再描画                           |
| keyboard連携 | Cmd+P と Escape の全体ショートカット整合               |
| UX語彙連携   | Task 5D の用語が PreviewPanel/QuickSearch で維持される |

## 成果物

| 成果物         | パス                                         | 説明             |
| -------------- | -------------------------------------------- | ---------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      | ケース一覧       |
| テストケース表 | `outputs/phase-4/test-cases.md`              | TC-04-01..16     |
| 統合観点表     | `outputs/phase-4/integration-test-design.md` | 04A/04C 接続観点 |

## 完了条件

- [ ] PreviewPanel と QuickFileSearch の主要テストケースを定義している
- [ ] hook テストケースを定義している
- [ ] セキュリティと a11y のテストケースを定義している
- [ ] 実行コマンドを固定している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. コンポーネントテスト定義
2. hook テスト定義
3. セキュリティ/a11y テスト定義
4. 統合観点の整理
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-4/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
