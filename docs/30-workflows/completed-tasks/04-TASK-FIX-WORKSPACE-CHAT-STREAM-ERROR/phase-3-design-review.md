# Phase 3: 設計レビュー

## メタ情報

| 項目          | 値                                                                            |
| ------------- | ----------------------------------------------------------------------------- |
| Phase番号     | 3                                                                             |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                      |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                          |
| 作成日        | 2026-03-20                                                                    |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-2-design.md` |

## 目的

Phase 2で確定した設計の妥当性を多角的に検証する。Task 1（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）との設計パターン一貫性、Apple HIG準拠のUI設計、ストリーミング状態管理の安全性を確認し、Phase 4以降への進行可否を判定する。

## 実行タスク

### Task 1: Task 1（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）との一貫性確認

依存タスクのエラー表示パターンと設計の整合性を確認する。

```bash
# Task 1で実装されたエラーUIコンポーネントを確認
grep -rn "StreamingError\|ChatError\|ErrorDisplay\|ErrorBanner" \
  apps/desktop/src/renderer/views/

# Task 1のエラー状態インターフェースを確認
grep -rn "streamingError\|StreamingErrorState\|ErrorAction" \
  apps/desktop/src/renderer/views/ \
  apps/desktop/src/renderer/store/
```

#### 確認チェックリスト

| 確認項目                       | 判定基準                                    | 結果   |
| ------------------------------ | ------------------------------------------- | ------ |
| エラーコンポーネント名の一貫性 | Task 1と同名またはextend関係                | 未確認 |
| エラー状態型の共通化           | `StreamingErrorState` 型が共有されているか  | 未確認 |
| アクション定義の一貫性         | `SETTINGS` / `RETRY` アクション定義が共通か | 未確認 |
| スタイルトークンの共通化       | エラー色・角丸が同一CSSトークン参照か       | 未確認 |

**期待される結果**: Task 1と共通のエラー表示コンポーネントを流用できる場合は流用し、不可能な場合は同一インターフェースで独立実装する。

### Task 2: 設計レビューチェックリスト

#### 2-1: 要件カバレッジ確認

| 受入基準                                | 設計での対応箇所                                                          | カバー状況 |
| --------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| AC-1: API_KEY_MISSING → Settings誘導    | `mapLLMErrorToStreamingError` + `StreamingErrorDisplay` action="SETTINGS" | OK         |
| AC-2: NETWORK_ERROR → リトライボタン    | `mapLLMErrorToStreamingError` + `retryLastMessage` + action="RETRY"       | OK         |
| AC-3: RATE_LIMIT → ヒント + リトライ    | `hint` フィールド + action="RETRY"                                        | OK         |
| AC-4: VALIDATION_ERROR → メッセージのみ | action=null の分岐                                                        | OK         |
| AC-5: エラー後のchat状態リセット        | `onStreamError` 内の状態リセット（既存コードを維持）                      | OK         |
| AC-6: エラーdismiss                     | `dismissStreamingError` コールバック                                      | OK         |

#### 2-2: アーキテクチャ整合性確認

| 確認項目         | 設計方針                                                        | 判定   |
| ---------------- | --------------------------------------------------------------- | ------ |
| レイヤー依存方向 | Renderer内完結。IPC層変更なし                                   | OK     |
| 状態管理         | `useState` + `useCallback` でコンポーネント固有UI状態として管理 | OK     |
| 後方互換性       | 既存 `errorMessage` を維持しつつ `streamingError` を追加        | OK     |
| P31対策          | 新規 `useCallback` の依存配列に合成Hookを含めない               | 要確認 |

#### 2-3: Apple HIG準拠確認

| 確認項目               | 設計値                      | 判定                      |
| ---------------------- | --------------------------- | ------------------------- |
| エラー色（ライト）     | `#FF3B30` (systemRed)       | OK                        |
| エラー色（ダーク）     | `#FF453A` (systemRed dark)  | OK                        |
| アクション色（ライト） | `#007AFF` (systemBlue)      | OK                        |
| アクション色（ダーク） | `#0A84FF` (systemBlue dark) | OK                        |
| 角丸                   | `8px`                       | OK                        |
| アニメーション範囲     | 200-300ms                   | 要確認（Phase 5で実装時） |
| コントラスト比         | systemRed on white: 要計算  | 要Phase 5確認             |

#### 2-4: 状態管理の安全性確認

| リスク                             | 設計での対応                                                     | 判定 |
| ---------------------------------- | ---------------------------------------------------------------- | ---- |
| ストリーム中のエラー二重発火       | `if (!isStreamingRef.current) return` ガード（既存コード維持）   | OK   |
| エラー後の誤ったストリームイベント | `isStreamingRef.current = false` を先に設定                      | OK   |
| リトライ中の追加送信               | `isSending` ガード（既存ロジック流用）                           | OK   |
| `lastUserMessageRef` の未初期化    | `retryLastMessage` で `lastUserMessageRef.current` null チェック | OK   |
| `useEffect` クリーンアップ         | 既存の `disposeChunk/End/Error` パターン維持                     | OK   |

#### 2-5: IPC設計レビュー（変更なし確認）

- Renderer から Main Process への新規IPC呼び出しなし
- 既存 `onStreamError` / `onStreamChunk` / `onStreamEnd` リスナーを維持
- IPC契約ドリフト（P44/P45）の発生なし

#### 2-6: テスタビリティ確認

| テスト対象                    | テスト可能性                            | 方針                              |
| ----------------------------- | --------------------------------------- | --------------------------------- |
| `mapLLMErrorToStreamingError` | 純粋関数 → 単体テスト容易               | Phase 4でユニットテスト作成       |
| `StreamingErrorDisplay`       | props駆動 → レンダリングテスト容易      | Phase 4でコンポーネントテスト作成 |
| `useWorkspaceChatController`  | `window.electronAPI` モック必要         | 既存テストパターン踏襲            |
| `retryLastMessage`            | `lastUserMessageRef` のモック注入が必要 | Phase 4で設計                     |

### Task 3: レビュー判定

#### 判定基準

| 判定              | 対応                                              |
| ----------------- | ------------------------------------------------- |
| PASS              | Phase 4（テスト作成）へ進む                       |
| MINOR             | 指摘事項を未タスク化または即修正し、Phase 4へ進む |
| MAJOR（設計問題） | Phase 2へ戻り設計修正                             |
| MAJOR（要件問題） | Phase 1へ戻り要件修正                             |

#### 想定MINOR指摘事項（事前特定）

以下は Phase 3 時点で設計上の未確定事項として特定済み。Phase 5 実装時に確定する。

1. **Settings遷移の実装方針**: 既存パターン調査が必要。`grep -rn "openSettings"` の結果次第で実装方式が変わる。
2. **コントラスト比の数値計算**: systemRed on error-container-background の WCAG AA 準拠確認は Phase 5 で実施。
3. **Task 1との共通化範囲**: Task 1の実装状況によって `StreamingErrorDisplay` の独立実装 vs 共通コンポーネント流用が変わる。

## 参照資料

### システム仕様（aiworkflow-requirements）

| ドキュメント            | パス                                                                         | 参照目的             |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------- |
| エラーハンドリング仕様  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラーカテゴリ定義   |
| エラーハンドリング コア | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`   | リトライ戦略         |
| 状態管理アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand設計・P31対策 |
| アーキテクチャ概要      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | レイヤー依存方向     |

### Phase成果物

| ドキュメント | パス                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| 要件定義書   | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md` |
| 設計書       | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-2-design.md`       |

## 実行手順

1. Task 1の実装状況を調査し（Task 1確認チェックリスト実行）、共通化方針を決定する
2. Task 2-1（要件カバレッジ）を逐次確認する
3. Task 2-2（アーキテクチャ整合性）を確認する
4. Task 2-3（Apple HIG準拠）を確認する
5. Task 2-4（状態管理の安全性）を確認する
6. Task 2-5（IPC設計）を確認する
7. Task 2-6（テスタビリティ）を確認する
8. Task 3（レビュー判定）を実施し、判定結果を記録する
9. MINOR指摘がある場合は未タスク化または即修正する
10. PASS/MINORの場合は Phase 4 へ進む

## 統合テスト連携

- `mapLLMErrorToStreamingError.test.ts`、`StreamingErrorDisplay.test.tsx`、`useWorkspaceChatController.runtime.test.ts`、`WorkspaceChatPanel.runtime.test.tsx` の 4 系統で責務分離を検証できることを確認する。
- Phase 11 screenshot に必要な 5 シナリオをここで固定し、Phase 10/11 の evidence drift を防ぐ。

## 成果物

| 成果物                               | パス                                                                                 | 形式       |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ---------- |
| Phase 3 設計レビュー書（本ファイル） | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-3-design-review.md` | Markdown   |
| レビュー判定結果                     | 本ファイルの Task 3 セクションに記録                                                 | インライン |

## 完了条件

- [ ] Task 1（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）との一貫性確認完了
- [ ] 要件カバレッジ（AC-1〜AC-6）の設計での対応を確認済み
- [ ] アーキテクチャ整合性チェックリスト全項目確認済み
- [ ] Apple HIG準拠カラー設計の確認済み
- [ ] ストリーミング状態管理の安全性リスク全項目確認済み
- [ ] IPC変更なしの確認済み
- [ ] テスタビリティの確認済み
- [ ] レビュー判定（PASS / MINOR / MAJOR）を記録済み
- [ ] MINOR指摘がある場合は全て未タスク化または即修正済み
- [ ] Phase 4 への進行が承認済み

## 次Phase

判定結果に応じて以下に進む:

| 判定              | 次のアクション                 |
| ----------------- | ------------------------------ |
| PASS              | Phase 4: テスト作成            |
| MINOR             | 指摘対応後 Phase 4: テスト作成 |
| MAJOR（設計問題） | Phase 2: 設計 へ戻る           |
| MAJOR（要件問題） | Phase 1: 要件定義 へ戻る       |
