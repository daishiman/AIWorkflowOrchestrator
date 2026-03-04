# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 11                                                 |
| 機能名     | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 |
| タスク名   | SkillCenter UI の欠損メタデータ耐性強化            |
| 前提Phase  | Phase 10                                           |
| 後続Phase  | ドキュメント更新                                   |
| 作成日     | 2026-03-04                                         |
| ステータス | completed                                          |

## 目的

実機で主要シナリオを検証し、画面証跡を取得する。

## 背景

実データに型期待を満たさない項目が混在し、undefined.length と toLowerCase 例外で画面全体が落ちる事象が発生した。

## SubAgent分担

| SubAgent | 担当                                               |
| -------- | -------------------------------------------------- |
| A        | Hook防御（`useSkillCenter` / `useFeaturedSkills`） |
| B        | Component防御（`SkillCard` / `SkillDetailPanel`）  |
| C        | 欠損入力テスト・Phase 12仕様同期                   |

## 実行タスク

- 手動シナリオ実行: 主要ユーザーフローを実機検証する
- 画面証跡取得: 検証目的付きスクリーンショットを保存する
- 差分確認: 想定外挙動の有無を記録する

## 参照資料

| 参照資料           | パス                                      | 説明               |
| ------------------ | ----------------------------------------- | ------------------ |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md` | Phase 10 成果物    |
| 修正指示           | `outputs/phase-10/fix-instructions.md`    | Phase 10 成果物    |
| 依存Phase 2 成果物 | `outputs/phase-2/`                        | Phase 2 依存成果物 |
| 依存Phase 5 成果物 | `outputs/phase-5/`                        | Phase 5 依存成果物 |
| 依存Phase 6 成果物 | `outputs/phase-6/`                        | Phase 6 依存成果物 |
| 依存Phase 7 成果物 | `outputs/phase-7/`                        | Phase 7 依存成果物 |
| 依存Phase 8 成果物 | `outputs/phase-8/`                        | Phase 8 依存成果物 |
| 依存Phase 9 成果物 | `outputs/phase-9/`                        | Phase 9 依存成果物 |

## テストケース

| TC-ID | 観点     | 手順                               | 期待結果                                          |
| ----- | -------- | ---------------------------------- | ------------------------------------------------- |
| TC-01 | 初期表示 | SkillCenterを開く                  | 欠損メタデータ混在でも一覧表示が崩れない          |
| TC-02 | 検索     | `healthy`で検索する                | description欠落データがあってもフィルタが正常動作 |
| TC-03 | 詳細表示 | 欠損メタデータスキルのカードを開く | DetailPanelがクラッシュせず表示される             |
| TC-04 | 導線整合 | Featured/Category表示を確認する    | 主要導線が視覚的に維持される                      |

## 画面カバレッジマトリクス

| TC    | 画面              | 証跡                                                                     |
| ----- | ----------------- | ------------------------------------------------------------------------ |
| TC-01 | 初期一覧          | `outputs/phase-11/screenshots/TC-01-skill-center-initial.png`            |
| TC-02 | 検索結果          | `outputs/phase-11/screenshots/TC-02-search-with-missing-description.png` |
| TC-03 | 詳細パネル        | `outputs/phase-11/screenshots/TC-03-detail-panel-malformed-metadata.png` |
| TC-04 | Featured/Category | `outputs/phase-11/screenshots/TC-04-featured-and-category.png`           |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に処理し、成果物へ反映する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | シナリオ結果     |
| 画面証跡一覧   | `outputs/phase-11/screenshot-index.md`   | 検証目的付き証跡 |

## 完了条件

- [x] 実行タスクの成果物が定義されている
- [x] 参照仕様との整合根拠を記録した
- [x] 次Phaseへの引き継ぎ事項を記録した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ事項を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
```

## Phase実行記録

| 項目         | 記録                               |
| ------------ | ---------------------------------- |
| 実行タスク   | 完了                               |
| 発見事項     | 主要課題は仕様化済み・追加阻害なし |
| 引き継ぎ事項 | 次Phaseへ成果物を引き継ぎ済み      |

## 次のPhase

Phase 12 ドキュメント更新
