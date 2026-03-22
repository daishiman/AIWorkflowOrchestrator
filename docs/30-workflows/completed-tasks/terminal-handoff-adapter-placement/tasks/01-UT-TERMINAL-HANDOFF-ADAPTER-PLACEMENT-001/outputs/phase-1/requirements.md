# Phase 1: 要件定義書

## P50 チェック結果

| 項目                             | 結果                                 |
| -------------------------------- | ------------------------------------ |
| `toHandoffGuidance` 関数         | 未実装（ソースコード内に存在しない） |
| `adapters/handoff/` ディレクトリ | 未作成                               |
| 判定                             | **未実装** → Phase 4-5 で新規実装    |

## Consumer 一覧

| #   | Consumer名       | 入力型                     | 変換実装場所                                                 | 出力型            | 状態      |
| --- | ---------------- | -------------------------- | ------------------------------------------------------------ | ----------------- | --------- |
| C1  | Chat Edit        | `SendWithContextRequest`   | `chat-edit/TerminalHandoffBuilder.ts#build()`                | `HandoffGuidance` | 実装済    |
| C2  | Runtime Agent    | `AgentHandoffBuildRequest` | `runtime/TerminalHandoffBuilder.ts#buildForAgentExecution()` | `HandoffGuidance` | 実装済    |
| C3  | Runtime Skill    | `SkillHandoffBuildRequest` | `runtime/TerminalHandoffBuilder.ts#buildForSkillExecution()` | `HandoffGuidance` | 実装済    |
| C4  | Skill Docs       | （未定義）                 | 未実装                                                       | `HandoffGuidance` | 未実装    |
| C5  | GuidanceBlock UI | `HandoffGuidance`          | `HandoffBlock.tsx`（ローカル型定義）                         | DOM表示           | P23要修正 |

## 機能要件（FR）

| ID    | 要件                                                                                         | 優先度 |
| ----- | -------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `toHandoffGuidance()` adapter 関数を単一箇所に配置する                                       | 必須   |
| FR-02 | `SendWithContextRequest` → `HandoffGuidance` 変換をサポートする（C1）                        | 必須   |
| FR-03 | `AgentHandoffBuildRequest` → `HandoffGuidance` 変換をサポートする（C2）                      | 必須   |
| FR-04 | `SkillHandoffBuildRequest` → `HandoffGuidance` 変換をサポートする（C3）                      | 必須   |
| FR-05 | `TerminalHandoffBundle` → `HandoffGuidance` 変換をサポートする（汎用）                       | 必須   |
| FR-06 | `HandoffBlock.tsx` のローカル `HandoffGuidance` 型を `@repo/shared` の正本 import に置換する | 必須   |
| FR-07 | Skill Docs Consumer 用の変換インターフェースを定義する（C4 スタブ）                          | 推奨   |

## 非機能要件（NFR）

| ID     | 要件                                                                     | 優先度 |
| ------ | ------------------------------------------------------------------------ | ------ |
| NFR-01 | import サイクルが発生しないこと                                          | 必須   |
| NFR-02 | 既存の `TerminalHandoffBuilder` クラスの既存テストが破壊されないこと     | 必須   |
| NFR-03 | adapter 関数のユニットテストカバレッジ 90% 以上                          | 必須   |
| NFR-04 | セキュリティ: `terminalCommand` に API キー・トークンが含まれないこと    | 必須   |
| NFR-05 | 既存 adapter パターン（`adapters/llm/`）と一貫した命名・ディレクトリ構成 | 推奨   |

## 受け入れ基準

- AC-01: `toHandoffGuidance()` が `apps/desktop/src/main/adapters/handoff/` に配置されている
- AC-02: C1-C3 の全 Consumer の変換が adapter 経由で動作する
- AC-03: C5 `HandoffBlock.tsx` が `@repo/shared` の `HandoffGuidance` を import している
- AC-04: `pnpm typecheck` が PASS する（import サイクルなし）
- AC-05: adapter 関数のユニットテストカバレッジが Line 90%+, Branch 60%+, Function 90%+
- AC-06: 既存テスト（`TerminalHandoffBuilder` 関連）が全て PASS する
- AC-07: `terminalCommand` に機密情報が含まれないことをテストで検証している
