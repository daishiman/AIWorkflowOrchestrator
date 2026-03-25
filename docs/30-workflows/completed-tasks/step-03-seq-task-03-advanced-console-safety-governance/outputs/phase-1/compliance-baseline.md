# Phase 1 Compliance Baseline

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase    | 1                                               |
| 作成日   | 2026-03-24                                      |

## 規約前提

### 準拠対象

| 規約                   | URL                                                         | 適用範囲                     |
| ---------------------- | ----------------------------------------------------------- | ---------------------------- |
| Anthropic Usage Policy | `https://www.anthropic.com/legal/aup`                       | AI 利用全般の acceptable use |
| Commercial Terms       | `https://www.anthropic.com/legal/commercial-terms`          | API / commercial 利用条件    |
| Claude Code Data Usage | `https://code.claude.com/docs/en/data-usage`                | データ取り扱い               |
| Agent SDK Permissions  | `https://platform.claude.com/docs/en/agent-sdk/permissions` | approval / permissions       |

### 既存 Safety 基盤との整合

| 基盤                      | 実装                                                  | Task03 での扱い                                     |
| ------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| RuntimePolicyResolver     | 3パターン分岐（integrated_api / terminal_handoff x2） | authority として維持。approval trigger を上層に追加 |
| safeInvoke ホワイトリスト | ALLOWED_INVOKE_CHANNELS                               | 新規 channel 追加時はホワイトリストに登録必須       |
| validateIpcSender         | 全 handler 先頭で sender 検証                         | 新規 handler にも適用必須                           |
| sanitizeErrorMessage      | 内部パス / トークンのマスク                           | approval / disclosure のエラー表示にも適用          |
| P42 3段バリデーション     | 型チェック → 空文字列 → trim空                        | 新規 IPC 引数にも適用必須                           |

## 禁止事項

### MUST NOT（絶対禁止）

| ID      | 禁止事項                                                              | 根拠                          |
| ------- | --------------------------------------------------------------------- | ----------------------------- |
| DENY-1  | claude.ai consumer 認証をアプリの統合実行レーンに流用する             | 親パック index.md 明示禁止    |
| DENY-2  | transcript を自動で message 化する（auto-send）                       | manual boundary 違反          |
| DENY-3  | ユーザーに見えない形でデータを解析する（hidden parsing）              | manual boundary 違反          |
| DENY-4  | ユーザーに見えない形でプロンプトを注入する（hidden prompt injection） | ui-ux-realization.md 明示禁止 |
| DENY-5  | API key / token を Renderer に直接渡す                                | security-electron-ipc-core    |
| DENY-6  | terminal command に API key を含める                                  | secret 非中継原則             |
| DENY-7  | advanced console を front default surface に配置する                  | design-audit-matrix 棄却済み  |
| DENY-8  | `terminal を開く` を front 主導線のラベルにする                       | ui-ux-realization.md CTA 契約 |
| DENY-9  | 承認なしで危険操作・外部送信を実行する                                | Agent SDK permissions         |
| DENY-10 | DEFAULT_CONFIG への暗黙 fallback（P62 準拠）                          | P62: 未選択時はエラー表示     |

### MUST（必須遵守）

| ID      | 遵守事項                                                          | 根拠                          |
| ------- | ----------------------------------------------------------------- | ----------------------------- |
| MUST-1  | セッション開始時に AI 利用を明示開示する                          | ui-ux-realization.md          |
| MUST-2  | 外部送信は approval sheet で明示承認を取る                        | ui-ux-realization.md          |
| MUST-3  | 危険操作は approval sheet で明示承認を取る                        | Agent SDK permissions         |
| MUST-4  | transcript 共有は 3 操作（選択 → 確認 → 送信）で明示的に行う      | Task02 Manual Share Rail      |
| MUST-5  | advanced console は opt-in（ユーザー明示選択）でのみ表示する      | design-audit-matrix           |
| MUST-6  | primary CTA は常に1個に絞る                                       | ui-ux-realization.md CTA 契約 |
| MUST-7  | `端末で続ける` は handoff state の primary CTA としてのみ表示する | ui-ux-realization.md          |
| MUST-8  | `高度な表示` は secondary/tertiary CTA として配置する             | ui-ux-realization.md          |
| MUST-9  | エラーメッセージは sanitizeErrorMessage() でサニタイズする        | P55 準拠                      |
| MUST-10 | 新規 IPC 引数は P42 準拠 3 段バリデーションを適用する             | P42 準拠                      |

## Enforcement Point マッピング

approval / disclosure / manual boundary の enforcement がどのレイヤーで行われるかの定義:

| Enforcement           | Layer    | 責務                                         |
| --------------------- | -------- | -------------------------------------------- |
| Approval gate         | Renderer | approval sheet UI を表示し、承認を待つ       |
| Approval enforcement  | Main     | 承認済みフラグなしでは実行を拒否する         |
| Disclosure display    | Renderer | session start で disclosure banner を表示    |
| No auto-send          | Main     | transcript 自動送信の IPC を提供しない       |
| No hidden parsing     | Main     | 非明示のデータ解析エンドポイントを作成しない |
| Secret non-relay      | Main     | API key を terminal command に含めない       |
| Advanced console gate | Renderer | opt-in フラグなしでは detail layer を非表示  |
| Consumer auth guard   | Main     | claude.ai 認証トークンを受け入れない         |

## Compliance チェックリスト

Phase 3（設計レビュー）で使用する検証チェックリスト:

- [ ] DENY-1〜DENY-10 の全項目が設計で明示的に防止されている
- [ ] MUST-1〜MUST-10 の全項目が設計で明示的に満たされている
- [ ] Enforcement Point が Main / Renderer の両レイヤーで定義されている
- [ ] 既存 safety 基盤（RuntimePolicyResolver, safeInvoke 等）との整合が取れている
- [ ] AC-1〜AC-4 が検証可能な形で定義されている
