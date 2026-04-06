# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 4                                                                  |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 3                                                            |
| 後続Phase  | Phase 5                                                            |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

問題を再現する失敗テストを作成し（TDD Red 状態）、修正後のゴールを明確なテストケースとして定義する。

## 背景

TDD アプローチを採用し、先にテストを書くことで修正の目標を明確化する。このフェーズで作成したテストが Phase 5 の実装後に全て PASS になることが目標。

## 実行タスク

### タスク1: 既存テストの確認

**目的**: 既存のテストケースを把握し、追加すべきケースを特定する

**実行手順**:

1. `.claude/skills/task-specification-creator/scripts/__tests__/validate-phase12-implementation-guide.test.*` を確認する
2. `extractSection()` 関連のテストケースが存在するか確認する
3. `### 使用例` 見出し検査のテストが存在するか確認する

**期待される成果物**:

- テスト確認結果を設計書に記録（`outputs/phase-4/test-design.md`）

---

### タスク2: 失敗テストの作成

**目的**: 問題を再現する失敗テストを作成する（Red 状態）

**実行手順**:

1. 以下のテストケースを追加する:
   - **TC-01**: `### 使用例` が `## Part 2` 内の内部 `##` セクションの後ろにある場合でも、validator が OK を報告する
   - **TC-02**: `### 使用例` 見出しが完全に欠落している実装ガイドに対して validator がエラーを報告する
   - **TC-03**: `### 使用例` が正しい位置に存在する場合、validator が OK を報告する
2. テストが現状で FAIL することを確認する（問題の再現）
3. テストファイルパス: `.claude/skills/task-specification-creator/scripts/__tests__/validate-phase12-implementation-guide.test.*`

**実行コマンド**:

```bash
pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide
```

**期待される成果物**:

- 失敗テストコード（Red 状態の確認）
- `outputs/phase-4/test-design.md`
- `outputs/phase-4/red-test-result.md`（テスト失敗ログ）

---

## 参照資料

| 参照資料           | パス                                                                                                       | 用途                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| 設計書             | `outputs/phase-2/design-document.md`                                                                       | テスト設計の根拠       |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                                                   | テストケースの網羅確認 |
| validator          | `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js`               | テスト対象             |
| 既存テストファイル | `.claude/skills/task-specification-creator/scripts/__tests__/validate-phase12-implementation-guide.test.*` | 追加対象               |

## 統合テスト連携

- validator の入力 Markdown とチェック結果 JSON を統合テスト観点で設計する

## TDD 検証（Phase 4）

### TDD サイクル確認

```bash
pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide
```

**確認項目**:

- [ ] 新規テストが FAIL することを確認（Red 状態 - 問題の再現に成功）
- [ ] 既存テストが PASS していることを確認

## 成果物

| 成果物         | パス                                 | 内容                       |
| -------------- | ------------------------------------ | -------------------------- |
| テスト設計書   | `outputs/phase-4/test-design.md`     | テストケース設計           |
| Red テスト結果 | `outputs/phase-4/red-test-result.md` | テスト失敗ログ（Red 確認） |

## 完了条件

- [ ] 新規テストが FAIL することを確認（問題の再現に成功）
- [ ] 既存テストが PASS していることを確認
- [ ] テストケースが受け入れ基準を全て網羅している
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
