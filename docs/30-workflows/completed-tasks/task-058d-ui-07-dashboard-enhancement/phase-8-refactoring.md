# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                |
| ------------ | ------------------- |
| Phase        | 8                   |
| Phase名      | リファクタリング    |
| 前提Phase    | Phase 1, 2, 5, 6, 7 |
| 後続Phase    | Phase 9             |
| ステータス   | completed           |
| 作成日       | 2026-03-11          |
| 担当SubAgent | SubAgent-B          |

## 目的

ホーム画面向けに追加した component / helper の責務を整理し、
将来の共通化可否を判断できる状態にする。

## 実行タスク

- 境界判定: view-local に留めるべき component と共通化候補を分ける
- helper 整理: 純粋関数化と命名統一を確認する
- style 重複除去: styles / tokens の重複を整理する

## 参照資料

| 参照資料           | パス                                                                   | 内容                          |
| ------------------ | ---------------------------------------------------------------------- | ----------------------------- |
| Phase 1要件        | `phase-1-requirements.md`                                              | view-local 維持条件と UX 要件 |
| Phase 2設計        | `phase-2-design.md`                                                    | component 境界                |
| Phase 5仕様        | `phase-5-implementation.md`                                            | 実装責務と file scope         |
| Phase 6仕様        | `phase-6-test-expansion.md`                                            | 抽出後も維持すべき回帰ケース  |
| コンポーネント設計 | `outputs/phase-2/component-architecture.md`                            | file plan                     |
| Phase 7仕様        | `phase-7-coverage-check.md`                                            | カバレッジ観点                |
| lessons learned    | `.agents/skills/aiworkflow-requirements/references/lessons-learned.md` | 過度な共通化回避              |

## 統合テスト連携

| 観点        | 内容                                                           |
| ----------- | -------------------------------------------------------------- |
| API 互換    | helper / component 抽出後も Phase 4-7 のテスト対象が維持される |
| 回帰        | CTA contract と EmptyState 表示を壊さない                      |
| shared 判定 | local から shared へ昇格させない条件を明記する                 |

## 多角的チェック観点

| 観点               | 適用判断                                      | 仕様参照先                                   |
| ------------------ | --------------------------------------------- | -------------------------------------------- |
| アーキテクチャ     | 責務分離判断のため適用                        | `aiworkflow-requirements: architecture-*.md` |
| UI/UX              | 体験を壊さない最小リファクタ判断で適用        | `aiworkflow-requirements: ui-ux-*.md`        |
| テスタビリティ     | 抽出後のテスト容易性確認で適用                | `aiworkflow-requirements: testing-*.md`      |
| セキュリティ       | Renderer 内に閉じたまま責務整理する確認で適用 | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | fallback を壊さない抽出順序確認で適用         | `aiworkflow-requirements: error-handling.md` |

## 成果物

| 成果物               | パス                                            | 内容                |
| -------------------- | ----------------------------------------------- | ------------------- |
| リファクタリング方針 | `outputs/phase-8/refactoring-plan.md`           | 変更方針            |
| 共通化判定           | `outputs/phase-8/component-extraction-check.md` | local / shared 判断 |

## 完了条件

- [x] view-local を保つ理由が整理されている
- [x] 共有化候補と非候補が分離されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. local/shared 判定
3. helper 整理
4. style 整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase 1 / 5 / 6 依存が参照されている
- [x] 成果物パスが `outputs/phase-8/` に確定している
- [x] `artifacts.json` の Phase 8 記述と整合している

## 次のPhase

Phase 9: 品質保証
