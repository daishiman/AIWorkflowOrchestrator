# Phase 10: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | ドキュメント更新                |
| 前提Phase  | Phase 9                         |
| 後続Phase  | Phase 11                        |
| ステータス | 完了                            |
| 作成日     | 2026-01-04                      |
| 機能名     | frontend-testing-best-practices |

---

## 目的

実装した内容をドキュメントに反映する。

## 背景

新しく導入したテストインフラの使用方法を文書化し、チーム全体で活用できるようにする。

---

## 使用エージェント

| エージェント  | パス                              | 選定理由             |
| ------------- | --------------------------------- | -------------------- |
| manual-writer | `.claude/agents/manual-writer.md` | ドキュメント作成特化 |

**代替候補**: `.claude/agents/spec-writer.md`

---

## 使用スキル

| スキル名                 | パス                                               | 活用方法         | 選定理由     |
| ------------------------ | -------------------------------------------------- | ---------------- | ------------ |
| markdown-advanced-syntax | `.claude/skills/markdown-advanced-syntax/SKILL.md` | ドキュメント作成 | 可読性向上   |
| tutorial-design          | `.claude/skills/tutorial-design/SKILL.md`          | ガイド作成       | 学習効率向上 |

---

## 参照資料

| 参照資料       | パス                                    | 内容          |
| -------------- | --------------------------------------- | ------------- |
| 手動テスト結果 | `outputs/phase-9/manual-test-result.md` | Phase 9成果物 |

---

## 実行手順

### ステップ1: TESTING.md 作成

```markdown
# テスト実行ガイド

## クイックスタート

### ユニットテスト実行

pnpm test:run

### ウォッチモード

pnpm test

### UI モード（推奨）

pnpm test:ui

## カバレッジ確認

pnpm test:coverage
```

### ステップ2: E2E.md 作成

```markdown
# E2Eテストガイド

## 実行方法

pnpm --filter @repo/desktop test:e2e

## 新規テスト追加方法

1. apps/desktop/e2e/ にファイル作成
2. Playwright APIを使用してテスト記述
3. テスト実行確認
```

### ステップ3: MSW.md 作成

```markdown
# MSW使用ガイド

## モックハンドラー追加方法

apps/desktop/src/test/mocks/handlers.ts に追加

## サーバー設定

apps/desktop/src/test/mocks/server.ts
```

---

## 成果物

| 成果物           | パス                                           | 内容             |
| ---------------- | ---------------------------------------------- | ---------------- |
| テスト実行ガイド | `docs/testing/TESTING.md`                      | テスト実行方法   |
| E2Eガイド        | `docs/testing/E2E.md`                          | E2Eテスト方法    |
| MSWガイド        | `docs/testing/MSW.md`                          | MSW使用方法      |
| 更新履歴         | `outputs/phase-10/documentation-update-log.md` | ドキュメント更新 |

---

## 完了条件

- [x] TESTING.md 相当の情報が作成されている（implementation-guide.md Part 1）
- [x] E2E.md 相当の情報が作成されている（implementation-guide.md Part 2）
- [x] MSW.md 相当の情報が作成されている（implementation-guide.md Part 2）
- [x] 新規開発者がドキュメントだけでテスト実行できる
- [x] 使用スキルのskill-creator準拠を確認済み
- [x] 未タスク仕様書が作成されている（4件）

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む

---

## スキルフィードバック記録

| スキル                   | 結果 | 備考                    |
| ------------------------ | ---- | ----------------------- |
| markdown-advanced-syntax | 成功 | 2部構成ガイドに活用     |
| tutorial-design          | 成功 | Part1の概念的説明に活用 |

---

## 次のPhase

`docs/30-workflows/frontend-testing-best-practices/phase-11-pr-creation.md`
