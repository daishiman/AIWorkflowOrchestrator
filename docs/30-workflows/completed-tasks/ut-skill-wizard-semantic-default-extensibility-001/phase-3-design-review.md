# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 3                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 2（設計）                                       |
| 後続Phase  | Phase 4                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

Phase 2 の設計成果物を多角的に検証し、Phase 4（TDD）へ進んでよいかをゲート判定する。
MAJOR 問題があれば Phase 2 に戻す。MINOR 問題は未タスクとして記録し Phase 4 へ進む。

---

## 実行タスク

### Task 1: 設計の整合性チェック

**チェックリスト:**

| チェック項目                                                               | 判定 | 備考 |
| -------------------------------------------------------------------------- | ---- | ---- |
| `QuestionSemanticLabelMap` 型が AC-1 を満たす設計か                        |      |      |
| subpath export 方針が既存 barrel と衝突しないか（Feedback W0-01）          |      |      |
| `resolveSemanticLabel()` の新シグネチャが既存呼び出し箇所と後方互換か      |      |      |
| デフォルト引数で `SEMANTIC_LABEL_MAP` を注入できるか                       |      |      |
| テストマトリクス TC-01〜TC-10 が AC-3（10件以上）を満たすか                |      |      |
| private method テスト方針が明記されているか                                |      |      |
| Phase 1 インベントリで確認した q1〜q6 全エントリが型設計に反映されているか |      |      |

### Task 2: 矛盾チェック

| 確認観点                           | 確認方法                                               |
| ---------------------------------- | ------------------------------------------------------ |
| 型定義と変換テーブルの整合         | Phase 1 インベントリ vs Phase 2 型ドラフト             |
| shared 配置と desktop ビルドの整合 | package.json exports 設計を確認                        |
| 命名規則の一貫性                   | `skill-wizard-label-map.ts` が kebab-case 規則に従うか |
| IPC 影響なし確認                   | 変更がプロセス間通信に影響しないか確認                 |

> **[FB-SDK-07-4 適用]** 命名パターンの確認漏れは MINOR 指摘の主要因。
> `QuestionSemanticLabelMap` が既存型名（例: `ConversationAnswer` 等）と整合するか確認する。

### Task 3: ゲート判定

**判定基準:**

| 判定     | 条件                                                              | 対応                   |
| -------- | ----------------------------------------------------------------- | ---------------------- |
| **PASS** | MAJOR 問題なし（MINOR は未タスク化して記録）                      | Phase 4 へ進む         |
| **FAIL** | MAJOR 問題あり（型設計の根本的矛盾、後方互換破壊、AC 未達成など） | Phase 2 に戻り設計修正 |

**MAJOR 問題の例:**

- 型定義が `@repo/shared` からインポートできない構造になっている
- `resolveSemanticLabel()` の改修が既存の他コンポーネントを壊す
- テストマトリクスが AC-3（10件以上）を満たせない設計

**MINOR 問題の例（未タスク化して進む）:**

- 型の命名が既存規則と微妙にずれている
- JSDoc コメントが不足している
- テストカテゴリの粒度が粗い

---

## 参照資料

| 資料名             | パス                                         | 用途           |
| ------------------ | -------------------------------------------- | -------------- |
| Phase 1 成果物     | `outputs/phase-1/requirements-definition.md` | 要件確認       |
| Phase 2 成果物     | `outputs/phase-2/architecture-design.md`     | 設計確認       |
| Phase 2 型設計     | `outputs/phase-2/type-design.md`             | 型定義確認     |
| Phase 2 テスト戦略 | `outputs/phase-2/test-strategy.md`           | テスト計画確認 |

---

## 統合テスト連携

- ゲート PASS 後、Phase 4 で `resolveSemanticLabel()` の新シグネチャを使ってテストを作成する
- MINOR 指摘は `outputs/phase-3/contradiction-checklist.md` に記録し、Phase 12 未タスク検出に引き継ぐ

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| 論点思考     | 設計の真の論点（変換テーブルの管理責務）が型設計に正しく反映されているか |
| システム思考 | shared → desktop の依存方向が正しく、逆依存が生じていないか              |
| 価値提案思考 | この設計で将来の入力元拡張が本当に容易になるか                           |
| 整合性確認   | AC-1〜AC-5 が現在の設計で全て満たせるか                                  |

---

## 成果物

| 成果物名         | パス                                         | 必須 |
| ---------------- | -------------------------------------------- | ---- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | ✅   |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | ✅   |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | ✅   |

---

## 完了条件

- [ ] Task 1 の全チェック項目に判定結果が記入されている
- [ ] Task 2 の矛盾チェックが完了している
- [ ] ゲート判定（PASS / FAIL）が `gate-decision.md` に記録されている
- [ ] MINOR 指摘が `contradiction-checklist.md` に記録されている
- [ ] PASS の場合、Phase 4 への引き継ぎ事項が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1: 設計の整合性チェック ✅
- [ ] Task 2: 矛盾チェック ✅
- [ ] Task 3: ゲート判定 ✅
- [ ] 全成果物が `outputs/phase-3/` に保存されていること ✅

---

## 次Phase

**PASS** の場合 → **Phase 4: テスト作成**（`phase-4-test-creation.md`）へ進む。
**FAIL** の場合 → **Phase 2** に戻り設計を修正する。
