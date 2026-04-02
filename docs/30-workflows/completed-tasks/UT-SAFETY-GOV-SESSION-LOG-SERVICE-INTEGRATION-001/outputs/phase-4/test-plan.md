# Phase 4 テスト計画

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| Phase      | 4 (TDD Red)                                       |
| ステータス | spec_created                                      |
| 前提成果物 | `phase-3-design-review.md`                        |
| 後続Phase  | Phase 5 (実装)                                    |

## 目的

実セッションログ取得の Red ケースを先に固定し、`getTerminalLog()` / `getCopyCommand()` / `getClaudeCliManager()` の未実装部分を
後続実装で埋めるための検証基準を作る。

## テスト戦略

| レーン     | 対象           | 判定                                                                  |
| ---------- | -------------- | --------------------------------------------------------------------- |
| Regression | ADV-12〜ADV-15 | 既存 PASS を維持する                                                  |
| Red 1      | ADV-16         | `getTerminalLog()` が実セッションの `output` を返すことを確認する     |
| Red 2      | ADV-17         | `getCopyCommand()` が `node + scriptPath + args` を返すことを確認する |
| Red 3      | ADV-18         | セッション未存在時に `SESSION_NOT_FOUND` が伝播することを確認する     |
| Red 4      | ADV-19         | `getClaudeCliManager()` の公開有無を確認する                          |

## テストケース一覧

### ADV-16: `getTerminalLog()` が実セッションの output を返す

| 観点           | 内容                                                             |
| -------------- | ---------------------------------------------------------------- |
| 現在の失敗理由 | callback が `[]` を返すため、実ログが見えない                    |
| 期待値         | `SessionManager.getSession(sessionId).output` と同じ配列を返す   |
| 判定条件       | `result.data` に `sk-` 形式の値が残らず、`output` がそのまま返る |

### ADV-17: `getCopyCommand()` が `node + scriptPath + args` を返す

| 観点           | 内容                                                      |
| -------------- | --------------------------------------------------------- |
| 現在の失敗理由 | callback が `null` を返すため、コピー用コマンドが空になる |
| 期待値         | `scriptPath` と `args` を 1 本の文字列にまとめる          |
| 判定条件       | `"/path/to/skill.js --flag value"` のような文字列が返る   |

### ADV-18: セッション未存在時に `SESSION_NOT_FOUND` を返す

| 観点           | 内容                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| 現在の失敗理由 | `getSession()` の未存在ケースに対する明示的なエラーコードがない                  |
| 期待値         | `SESSION_NOT_FOUND` を `.code` に持つ Error を throw する                        |
| 判定条件       | handler の catch 経由で `TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` に変換される |

### ADV-19: `getClaudeCliManager()` が利用可能になる

| 観点           | 内容                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| 現在の失敗理由 | `manager` がモジュールスコープに閉じていて外部から取得できない                                             |
| 期待値         | `registerClaudeCliHandlers()` 後に non-null の manager を取得できる                                        |
| 判定条件       | `registerClaudeCliHandlers()` → `getClaudeCliManager()` → `unregisterClaudeCliHandlers()` の順で確認できる |

## 完了条件

- [ ] ADV-16〜ADV-19 の Red ケースが定義されている
- [ ] 既存 ADV-12〜ADV-15 が引き続き PASS であることを前提にしている
- [ ] `outputs/phase-4/test-plan.md` に成果物が出力されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 実行タスク

- ADV-16〜ADV-19 の失敗条件を固定する。
- 既存 ADV-12〜ADV-15 の regression 影響を確認する。

## 参照資料

- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `outputs/phase-4/test-plan.md`

## 成果物/実行手順

- `outputs/phase-4/test-plan.md`
- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`
