# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 3                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を多角的に検証し、Phase 4 へ進めるかを判定する。

## レビュー観点

### 1. 要件と設計の整合性

| 受入基準                                | 設計での対応                                                                            | 判定               |
| --------------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| AC-1: IPC handler 登録                  | Wave A-2: `registerAllIpcHandlers()` に追加                                             | PASS               |
| AC-2: 12チャネル統一                    | Wave A-1: `SLIDE_INVOKE_CHANNELS` + `SLIDE_PUSH_CHANNELS` 定義                          | PASS               |
| AC-3: RuntimeResolver + handoff         | Wave B-1: `SkillExecutionResult` に `isHandoff` + `guidance` 追加                       | PASS               |
| AC-4: modifier 統合                     | Wave B-2: `skill-executor.ts` 内で `phase === "modifier"` 処理                          | PASS               |
| AC-5: validateIpcSender                 | Wave A-3: 全 invoke ハンドラに適用                                                      | PASS               |
| AC-6: P42 + path guard                  | Wave A-3: 3段バリデーション + `detectPathTraversal`                                     | PASS               |
| AC-7: SDK 直接利用除去                  | Wave C-2: `agent-client.ts` 廃止                                                        | PASS               |
| AC-8: エラーサニタイズ                  | Wave A-3: `sanitizeError()` 適用                                                        | PASS               |
| AC-9: typecheck PASS                    | 各 Wave 完了時に確認                                                                    | 設計時点では未検証 |
| AC-10: テスト PASS                      | Phase 4-7 で実施                                                                        | 設計時点では未検証 |
| AC-11: slideSlice 7 fields              | Wave C-1: 正本 7 fields 追加                                                            | PASS               |
| AC-12: Renderer slideApi メソッド名同期 | Wave A: preload/channels.ts + preload/index.ts の同時更新で Renderer 側も新名称に揃える | PASS               |

### 2. セキュリティ観点

| チェック項目                                      | 結果             |
| ------------------------------------------------- | ---------------- |
| validateIpcSender が全 invoke に適用              | PASS（Wave A-3） |
| P42 3段バリデーション（型 → 空文字 → trim空文字） | PASS             |
| detectPathTraversal が全 projectPath に適用       | PASS             |
| エラーサニタイズ（内部パス・スタック非露出）      | PASS             |
| SDK 直接利用の除去                                | PASS（Wave C-2） |
| env fallback の除去                               | PASS（Wave C-2） |

### 3. アーキテクチャ観点

| チェック項目                          | 結果 | 備考                                |
| ------------------------------------- | ---- | ----------------------------------- |
| 依存方向: Renderer → Preload → Main   | PASS | IPC 契約で分離                      |
| DIP: handler が Port/Interface に依存 | PASS | `SkillExecutor` interface 経由      |
| SRP: 1ファイル1責務                   | PASS | modifier-skill.ts は utility に縮退 |
| Wave 間の依存が単方向                 | PASS | A → B → C                           |

### 4. 既知 Pitfall 照合

| Pitfall                         | 対策の有無 | 備考                                                            |
| ------------------------------- | ---------- | --------------------------------------------------------------- |
| P5: リスナー二重登録            | PASS       | `unregisterSlideIpcHandlers()` で解除後に再登録                 |
| P42: .trim() バリデーション漏れ | PASS       | 全文字列引数に3段バリデーション                                 |
| P44: IPC インターフェース不整合 | PASS       | Preload/Main/Shared 3層同期を Wave A で同時更新                 |
| P48: useShallow 未適用          | PASS       | Wave C-1 で object selector に適用                              |
| P60: レスポンス形式不一致       | PASS       | `{ success, data/error }` wrapper 統一                          |
| P65: dead-end namespace         | PASS       | 既存 `slide:*` namespace を正本に rename、新規 namespace 不追加 |

### 5. 懸念事項

| #   | 懸念                                                                    | 重要度 | 対応                                          |
| --- | ----------------------------------------------------------------------- | ------ | --------------------------------------------- |
| C1  | `RuntimeResolver` が slide surface で未テストの可能性                   | MEDIUM | Phase 4 で targeted test を先行追加           |
| C2  | `agent-client.ts` 廃止時に他の呼び出し元がないか                        | LOW    | grep 確認済み（ipc-handlers.ts からのみ参照） |
| C3  | push チャネル 3 本（sync-progress, sync-error, watch-status）が新規追加 | LOW    | Renderer 側は受信のみで副作用なし             |

### 6. セキュリティ Gate

D3（SDK 直接利用）と D5（validateIpcSender 未実装）は CRITICAL セキュリティ問題であり、
機能要件（D1, D2, D4, D6）とは分離して評価する。

**セキュリティ Gate 条件**: Wave A（D5 解消）と Wave B（D3 解消）が完了するまで、
slide 機能の本番デプロイは禁止する。

## 判定

**PASS** — Phase 4（テスト作成）へ進む。

### 判定理由

- 全 11 受入基準に対する設計上の対応が確認できた
- セキュリティ要件（validateIpcSender, P42, path guard）が全ハンドラに適用される設計
- 3 ウェーブ戦略により各段階で typecheck・テスト可能
- 既知 Pitfall（P5, P42, P44, P48, P60, P65）への対策が明示されている

## 完了条件

- [ ] 全受入基準（AC-1〜AC-12）に対する設計上の対応が確認できた
- [ ] セキュリティ要件（D3/D5）が CRITICAL として特別評価されている
- [ ] 既知 Pitfall（P5, P42, P44, P48, P60, P65）への対策が明示されている
- [ ] 判定が PASS/MINOR/MAJOR/CRITICAL のいずれかで記録されている

## 次のPhase

Phase 4（テスト作成）へ進む。
