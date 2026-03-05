# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 6                              |
| Phase名      | テスト拡充                     |
| 前提Phase    | Phase 5                        |
| 後続Phase    | Phase 7                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-B                     |

## 目的

Phase 4で作成した基本ケースを拡張し、分岐境界、ショートカット衝突、導線差分を網羅する回帰計画を定義する。

## 実行タスク

- 回帰観点拡張: 分岐追加時の破壊的影響を洗い出す。
- 競合ケース追加: ショートカットとナビ同期の競合ケースを追加する。
- 実行順序定義: テスト実行順を定義して失敗切り分けを容易にする。

## 参照資料

| 参照資料           | パス                                                                        | 内容           |
| ------------------ | --------------------------------------------------------------------------- | -------------- |
| Phase 4仕様        | `phase-4-test-creation.md`                                                  | 基本ケース     |
| Phase 5仕様        | `phase-5-implementation.md`                                                 | 実装計画       |
| テストケース一覧   | `outputs/phase-4/test-cases.md`                                             | 拡張元         |
| ルーティングマップ | `outputs/phase-5/viewtype-routing-map.md`                                   | 分岐対象       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| ナビ正本           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`     | 導線期待値     |

## システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                         | 内容       |
| ---------- | ---------------------------------------------------------------------------- | ---------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 回帰基準   |
| UIナビ     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 遷移期待値 |
| 状態管理   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 型境界     |
| エラー仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 異常系分類 |

## 実行手順

### ステップ1: 拡張対象抽出

Phase 4ケースから不足観点を抽出する。

### ステップ2: 回帰ケース追加

競合ケース、境界ケース、異常系ケースを追加する。

### ステップ3: 実行順序設計

切り分け優先度でテスト実行順を定義する。

## 統合テスト連携

| 観点     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 統合観点 | ViewType変更が AppDock 表示と一致することを回帰観点へ固定 |
| 競合観点 | ショートカット割当の重複を検知対象へ固定                  |
| 後続観点 | Phase 7で測定するカバレッジ目標を紐付ける                 |

## 成果物

| 成果物         | パス                                     | 内容         |
| -------------- | ---------------------------------------- | ------------ |
| テスト拡充計画 | `outputs/phase-6/test-expansion-plan.md` | 追加観点     |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`   | 実行順と観点 |

## 完了条件

- [x] 境界/競合/異常の3カテゴリ拡張ケースが定義されている
- [x] 回帰マトリクスに実行順と期待結果が記載されている
- [x] Phase 7のカバレッジ測定対象が固定されている
- [x] 不採用ケースの理由が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: テストカバレッジ確認

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                         |
| ------------------ | -------------------------- | -------------------------------------------------- |
| テスタビリティ     | 回帰計画が主目的のため適用 | `aiworkflow-requirements: quality-requirements.md` |
| UI/UX              | ナビ遷移検証を扱うため適用 | `aiworkflow-requirements: ui-ux-*.md`              |
| エラーハンドリング | 異常系分類を扱うため適用   | `aiworkflow-requirements: error-handling.md`       |

## サブタスク管理

1. 参照資料の確認
2. 拡張対象抽出
3. 回帰ケース追加
4. 実行順序設計
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
