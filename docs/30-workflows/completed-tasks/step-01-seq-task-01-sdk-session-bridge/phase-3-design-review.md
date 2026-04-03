# Phase 3: 設計レビュー -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase番号  | 3                  |
| 機能名     | sdk-session-bridge |
| タスクID   | TASK-SDK-SC-01     |
| 作成日     | 2026-04-02         |
| 依存 Phase | Phase 2（設計）    |

## 目的

Phase 2 の設計内容を要件との整合性・アーキテクチャ品質・セキュリティ・テスタビリティの観点から検証し、Phase 4 進行の可否を判定する。

## 実行タスク

### Task 3-1: 要件充足性チェック

Phase 1 の受入基準（AC-01 から AC-06）と Phase 2 の設計を対照する。

| AC ID | 受入基準                                                                                  | 設計での対応                                                                                                | 判定 |
| ----- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---- |
| AC-01 | `startSession()` が SDK の `query()` API を呼び出すこと                                   | Task 2-4 で `startSession()` が `query()` を呼び出す設計を明記                                              | OK   |
| AC-02 | `UserInput` ツールコールを受け取ったとき `question-received` IPC イベントが発行されること | Task 2-4 で `handleUserInputToolCall()` → `onQuestion` コールバック → `emitQuestionReceived()` の流れを設計 | OK   |
| AC-03 | `sendAnswer()` で SDK セッションに回答が注入されること                                    | Task 2-4 で `pendingResolve()` を呼び出して Promise を解決する設計を明記                                    | OK   |
| AC-04 | セッション完了時に `session-complete` IPC イベントが発行されること                        | Task 2-5 で `onComplete()` コールバック → `emitSessionComplete()` の流れを設計                              | OK   |
| AC-05 | セッションエラー時に `session-error` IPC イベントが発行されること                         | Task 2-3 で `SESSION_ERROR` チャネルを追加、Task 2-4 でタイムアウト後に `onError()` を呼び出す設計を明記    | OK   |
| AC-06 | IPC ハンドラーが正しく登録・解除されること                                                | Task 2-5 で `register()` / `unregister()` メソッドを設計し、解除タイミングを明記                            | OK   |

### Task 3-2: 設計品質チェック

#### 2-A: 単一責務原則（SRP）

- `SkillCreatorSdkSession`: SDK セッションのライフサイクル管理のみを担う。IPC 通信には直接依存しない
- `SkillCreatorIpcBridge`: IPC ハンドラーの登録・解除と Main↔Renderer メッセージ転送のみを担う。SDK 操作には直接依存しない
- 判定: 問題なし

#### 2-B: 依存性逆転原則（DIP）

`SkillCreatorSdkSession` はコールバック DI（`onQuestion`, `onComplete`, `onError`）で `SkillCreatorIpcBridge` との結合を避けている。`SkillCreatorIpcBridge` は `sessionFactory` DI で `SkillCreatorSdkSession` のモック注入を可能にしている。判定: 問題なし

#### 2-C: 既存コードとの責務境界

`SkillCreatorWorkflowEngine` は既存のワークフロー実行エンジンであり、本タスクで変更しない。`SkillCreatorSdkSession` は SDK セッション専用クラスとして新規追加する。責務が明確に分離されている。判定: 問題なし

#### 2-D: 型安全性

- `UserInputType` を Union 型で定義しているため、5種別のバリデーションが型レベルで保証される
- `SKILL_CREATOR_SESSION_CHANNELS` を `as const` アサーションで定義しているため、チャネル名がリテラル型として扱われる
- 判定: 問題なし

#### 2-E: セキュリティ（Electron セキュリティルール準拠）

- API キーは SDK 内部で処理され、IPC チャネルを経由してレンダラーには送出されない
- `UserInputQuestion` / `UserInputAnswer` に機密情報は含まれない（`secret` 種別の値はレンダラー側でのみ処理される）
- 判定: 問題なし

#### 2-F: タイムアウト設計

`handleUserInputToolCall()` で 30 秒タイムアウトを設定し、応答がない場合は `onError()` を呼び出してセッションを終了させる。タイムアウトは `clearTimeout()` でキャンセル可能。判定: 問題なし

#### 2-G: テスタビリティ

- `SkillCreatorSdkSession`: コールバック DI によりモック可能
- `SkillCreatorIpcBridge`: `sessionFactory` DI により `SkillCreatorSdkSession` をモック可能
- `BrowserWindow` は Electron の標準モックパターンで代替可能
- 判定: 問題なし

### Task 3-3: リスク評価

| リスク                                                    | 可能性 | 影響 | 対策                                                         |
| --------------------------------------------------------- | ------ | ---- | ------------------------------------------------------------ |
| SDK の `query()` API が `tool_use` イベントを発行しない   | 低     | 高   | Phase 6 でフォールバック処理を追加（Deferred Tool 問題対応） |
| `pendingResolve` が null のまま `sendAnswer()` が呼ばれる | 低     | 中   | 安全ガード（ログ出力して return）を実装                      |
| IPC ハンドラーの二重登録によるメモリリーク                | 中     | 中   | `register()` 呼び出し前に `unregister()` を実行する防御設計  |
| タイムアウト後に `pendingResolve` が呼ばれる競合状態      | 低     | 低   | タイムアウト後は `pendingResolve` を null にリセットする     |
| `SkillCreatorWorkflowEngine` との責務混在                 | 低     | 中   | 新規クラスを別ファイルに分離し、既存クラスは変更しない       |

### Task 3-4: 未解決事項の記録

| ID   | 事項                                                                | 種別       | 対応方針                    |
| ---- | ------------------------------------------------------------------- | ---------- | --------------------------- |
| U-01 | AskUserQuestion が Deferred Tool として扱われる場合のフォールバック | 拡張課題   | Phase 6（テスト拡充）で対応 |
| U-02 | 複数セッションの同時起動制御                                        | スコープ外 | 別タスクとして分離          |
| U-03 | セッション状態の永続化（アプリ再起動後の復元）                      | スコープ外 | 別タスクとして分離          |

### Task 3-5: レビュー判定

**判定: PASS**

以下の根拠で Phase 4 への進行を承認する:

1. 受入基準 AC-01 から AC-06 が設計で全て満たされている
2. SRP / DIP の設計原則に準拠しており、`SkillCreatorWorkflowEngine` との責務境界が明確
3. コールバック DI + sessionFactory DI によるテスタビリティが確保されている
4. API キーが IPC 経由でレンダラーに漏洩しないセキュリティ設計になっている
5. タイムアウト処理（30秒）とエラーハンドリングが設計に含まれている

MINOR 指摘事項:

- U-01: `AskUserQuestion` が Deferred Tool として扱われる可能性がある。Phase 6 でフォールバック処理を追加すること

## 参照資料

| 資料名               | パス                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-1-requirements.md` |
| Phase 2 設計         | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-2-design.md`       |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                 |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                            |

## 成果物

| 成果物                       | パス                                                                                | 形式     |
| ---------------------------- | ----------------------------------------------------------------------------------- | -------- |
| 設計レビュー書（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-3-design-review.md` | Markdown |

## 完了条件

- [ ] AC-01 から AC-06 の全受入基準と設計の対応を確認した
- [ ] SRP / DIP の設計原則への準拠を確認した
- [ ] `SkillCreatorWorkflowEngine` との責務境界が明確であることを確認した
- [ ] セキュリティ（API キー非漏洩）を確認した
- [ ] タイムアウト設計を確認した
- [ ] リスク評価テーブルを完成させた
- [ ] 未解決事項（U-01 から U-03）を記録した
- [ ] レビュー判定（PASS）を明記した

## 次の Phase

Phase 4: テスト作成（`phase-4-test-creation.md`）
