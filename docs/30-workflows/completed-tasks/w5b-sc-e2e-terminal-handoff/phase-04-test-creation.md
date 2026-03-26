# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 前提Phase  | Phase 3                     |
| 後続Phase  | Phase 5                     |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

5シナリオのE2Eテストコードを作成する。IPC レスポンス形式は Phase 2 設計書の定義を参照してアサーションを記述する（P60対策）。

## 背景

TDD Red フェーズ。テストを先に書き、実装前に全テストが失敗（Red）することを確認する。Phase 2 で設計した IPC レスポンス形式・テストインフラ構成・テストファイル構成図に基づき、5シナリオの E2E テストコードを作成する。テストは `skill-creator:execute-plan`（`skill-creator:execute` ではない）チャネル名を使用すること。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: シナリオA - 正常フローテスト（AC-1, AC-2）

**目的**: plan → execute-plan の正常フローが動作することを検証するテストを作成する

**実行手順**:

1. `skill-creator:plan` を呼び出し、`{ success: true, data: { steps, estimatedTime } }` が返ることをアサートする
2. `skill-creator:execute-plan` を呼び出し、`{ success: true, data: { skillPath } }` が返ることをアサートする
3. スキルファイルが `skillPath` に実際に作成されていることを確認する

**対応AC**: AC-1（自然言語入力 → LLM がスキル一式を生成）、AC-2（生成スキルが永続化され即座に実行可能）

### タスク2: シナリオB - TerminalHandoff テスト（AC-4）

**目的**: API Key 未設定時の TerminalHandoff 経路を検証するテストを作成する

**実行手順**:

1. `skill-creator:execute-plan` のレスポンスに `terminalHandoff.suggestedCommand` が含まれることをアサートする
2. `suggestedCommand` が空文字列でないことをアサートする
3. `suggestedCommand` が CLI 実行可能な形式（`/^[a-zA-Z]` から始まる文字列）であることをアサートする

**対応AC**: AC-4（API Key 未設定時は TerminalHandoffBundle + CLI コマンド表示）

### タスク3: シナリオC - LLMエラー回復テスト（AC-7, NFR-4）

**目的**: LLMエラー発生時の回復フローを検証するテストを作成する

**実行手順**:

1. LLMがエラーを返した場合に `{ success: false, error: { code: "LLM_ERROR", message: "..." } }` が返ることをアサートする（AC-7）
2. エラー後にアプリがクラッシュしないこと（NFR-4）をアサートする
3. エラー後に再度 `skill-creator:plan` が実行可能（リトライ可能）であることをアサートする

**対応AC**: AC-7（エラー時に適切なメッセージ表示）

### タスク4: シナリオD - improve機能テスト（AC-5）

**目的**: 既存スキルの改善フローを検証するテストを作成する

**実行手順**:

1. 既存スキルのパスを指定して `skill-creator:plan` を呼び出し、改善プランが返ることをアサートする
2. `skill-creator:execute-plan` で改善されたスキルが既存パスに上書き保存されることをアサートする

**対応AC**: AC-5（improve: フィードバック → 差分提案 → 承認で適用）

### タスク5: シナリオE - 後方互換テスト（AC-8）

**目的**: 既存の `skill:create` チャンネルが引き続き動作することを検証するテストを作成する

**実行手順**:

1. 既存の `skill:create` チャンネルが依然として動作することをアサートする
2. 新チャンネル（`skill-creator:plan` / `skill-creator:execute-plan`）と旧チャンネルが共存できることをアサートする

**対応AC**: AC-8（既存 skill:create が破壊されない）

### タスク6: テスト設計注意事項の徹底

**目的**: 既知の落とし穴を回避するテスト設計を徹底する

**実行手順**:

1. **P60対策**: アサーションは `result.error.code`（wrapper形式）で記述する。`result.code` のような直接形式は使用しない
2. **P63対策**: インポートパスは既存テストファイルを参照してから記述する（`grep -n "^import" 既存テスト`）
3. **P40対策**: テストは `cd apps/desktop` から実行する

---

## 参照資料

| 参照資料              | パス                                                       | 内容                              |
| --------------------- | ---------------------------------------------------------- | --------------------------------- |
| Phase 2 設計書        | `phase-02-design.md`                                       | IPC レスポンス形式定義            |
| Phase 3 レビュー結果  | `phase-03-design-review.md`                                | 設計レビュー判定結果              |
| 正本（全体仕様）      | `docs/30-workflows/skill-creator-llm-integration/index.md` | AC/FR定義・アーキテクチャ・型設計 |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                       | P40, P60, P63                     |
| 既存IPCテストパターン | `apps/desktop/src/test/`                                   | テスト構成の参考                  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                                        |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | TerminalHandoff経路・承認フロー・進捗UI仕様 |

---

## 成果物

| 成果物                        | パス                                                          | 内容                                   |
| ----------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| 本ドキュメント                | `phase-04-test-creation.md`                                   | Phase 4 テスト作成仕様書               |
| 統合テストファイル            | `apps/desktop/src/test/e2e/skill-creator-integration.test.ts` | シナリオA, C, D, E のE2Eテスト（新規） |
| TerminalHandoffテストファイル | `apps/desktop/src/test/e2e/terminal-handoff.test.ts`          | シナリオB のE2Eテスト（新規）          |
| テストヘルパー                | `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts` | 共通ヘルパー関数（新規）               |

---

## 統合テスト連携

本Phase では以下の統合テスト連携アクションを実施する:

- IPC チャネル（`skill-creator:plan` / `skill-creator:execute-plan`）の統合テストを作成する
- Main Process ↔ Renderer 間の IPC 統合テストパターンを Phase 2 設計に基づき実装する
- TerminalHandoff 統合フロー（API Key チェック → フォールバック → suggestedCommand）のテストを作成する
- 前提タスク（w3a: SkillFileWriter, w3b: improve, w4: UI-Runtime）の統合ポイントをテストに含める

---

## TDD検証

### Red フェーズ確認

テストが Red 状態（実装前は全テスト失敗）であることを確認するコマンド:

```bash
cd apps/desktop && pnpm vitest run src/test/e2e/
```

**期待される結果**: 5シナリオ全てが FAIL（Red）であること。テスト自体のコンパイルエラーは許容しない（型エラーなしで FAIL すること）。

### 確認チェックリスト

- [ ] 全テストファイルが `tsc` でコンパイル可能であること
- [ ] `pnpm vitest run src/test/e2e/` で全テストが FAIL（Red）であること
- [ ] FAIL の理由がアサーション失敗であること（インポートエラー等ではないこと）

---

## 完了条件

- [ ] シナリオA（正常フロー）テストが作成されている
- [ ] シナリオB（TerminalHandoff）テストが作成されている
- [ ] シナリオC（LLMエラー回復）テストが作成されている
- [ ] シナリオD（improve機能）テストが作成されている
- [ ] シナリオE（後方互換）テストが作成されている
- [ ] P60対策（IPC レスポンスのwrapper形式でアサーション）が徹底されている
- [ ] P63対策（インポートパスを既存テストから参照）が徹底されている
- [ ] P40対策（`cd apps/desktop` から実行）が徹底されている
- [ ] 全テストが Red（実装前は失敗）であることが確認されている

---

## Phase末端アクション

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] TDD Red 状態が確認されていること

---

## 依存関係

- **前提**: Phase 3 が完了していること（PASS / MINOR 判定）
- **後続**: Phase 5 へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク1（シナリオA: 正常フローテスト）:
- タスク2（シナリオB: TerminalHandoffテスト）:
- タスク3（シナリオC: LLMエラー回復テスト）:
- タスク4（シナリオD: improve機能テスト）:
- タスク5（シナリオE: 後方互換テスト）:
- タスク6（テスト設計注意事項の徹底）:

### TDD Red 確認結果

- テスト実行コマンド: `cd apps/desktop && pnpm vitest run src/test/e2e/`
- 結果: FAIL / PASS
- 失敗テスト数: X / 5

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/w5b-sc-e2e-terminal-handoff/phase-05-implementation.md`
