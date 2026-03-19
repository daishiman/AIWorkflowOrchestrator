# UT-CHATPANEL-FIX-001 streaming リトライ上限・retryAfterMs UI 表示設計

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-CHATPANEL-FIX-001                                                        |
| タスク名     | streaming リトライ上限・retryAfterMs UI 表示設計                            |
| 分類         | 機能実装                                                                    |
| 対象機能     | ChatPanel streaming エラーリカバリ                                          |
| 優先度       | 中                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 エレガンスレビュー NOTE-1（2026-03-18） |
| 発見日       | 2026-03-18                                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ChatPanel の状態機械で `retryable: true` エラー時にリトライが可能だが、リトライ回数の上限が設計されていない。また `retryAfterMs` の値が UI に反映されず、ユーザーがいつリトライ可能になるかわからない。

### 1.2 問題点・課題

- リトライ回数上限なし → 無限リトライによるリソース浪費の可能性
- retryAfterMs がバックエンドから返されても UI にカウントダウン表示がない
- ユーザーがリトライ可能タイミングを把握できない UX 問題

### 1.3 放置した場合の影響

- レート制限エラー時に無限リトライが発生し、API クォータを消費し続ける
- ユーザーが手動でリトライを連打する可能性があり、二重リクエストのリスク

## 2. 何を達成するか（What）

### 2.1 目的

リトライ回数上限（推奨: 最大3回）を設定し、`retryAfterMs` の値を ChatMessageList にカウントダウン表示する UI を実装する。

### 2.2 受入基準

- [ ] リトライ回数上限（最大3回）が実装されている
- [ ] 上限到達時に「リトライ上限に到達しました」エラー表示がある
- [ ] retryAfterMs がカウントダウン表示される（例: 「30秒後にリトライ可能」）
- [ ] カウントダウン完了時に自動でリトライボタンが有効になる
- [ ] streaming 状態機械の error → streaming 遷移にリトライカウントが反映されている
- [ ] 既存テスト 139 件が全て PASS

## 3. どのように実施するか（How）

### 3.1 前提条件

- TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 の設計完了（state-machine.md 参照）
- chatSlice の error 状態に retryable/retryAfterMs フィールドが存在

### 3.2 対象ファイル

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`（retryCount フィールド追加）
- `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`（カウントダウン UI）
- `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`（リトライ上限表示）
- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`（リトライカウント管理）

### 3.3 実装方針

1. chatSlice に `retryCount: number` フィールドを追加（初期値 0）
2. startStreaming 時に retryCount をインクリメント、endStreaming(completed) 時にリセット
3. retryCount >= MAX_RETRY_COUNT の場合、error 状態から streaming への遷移をブロック
4. ErrorGuidance に retryAfterMs カウントダウンコンポーネントを追加
5. `useEffect` + `setInterval` でカウントダウン表示（P31 準拠: 個別セレクタ使用）

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                          | 解決策                            | 教訓                                                        |
| ------------------------------------------- | ------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で条件式が直感的でなく混乱   | 各制御の設計意図を JSDoc に明記   | UI 制御が複数ある場合、設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Provider/Model 未選択時に blocked 状態遷移        | ErrorGuidance → Settings 誘導 CTA | fallback 禁止と UX の両立を設計段階で評価する               |
| 8状態×4 capability の組み合わせ爆発         | テスト設計で 32 通りのうち有効組み合わせが限定的  | 有効組み合わせマトリクスを定義    | 状態追加時にマトリクス更新を忘れない                        |
| Phase 9 tsc エラーの発見遅延                | Phase 5 で検出可能だった型エラーが Phase 9 で発見 | Phase 5 で `tsc --noEmit` 必須化  | スタブでも型整合性を早期確認する                            |

**固有の教訓**:

- リトライカウントを chatSlice に追加する際、既存の streaming 系アクション（startStreaming/endStreaming/cancelStreaming）との状態遷移の整合性を慎重に確認すること
- カウントダウン UI で `setInterval` を使用する場合、P5（リスナー二重登録）に注意し、useEffect のクリーンアップで確実に解除すること

## 4. 参照

- エレガンスレビュー NOTE-1: `outputs/verification-report.md`
- 状態機械設計: `outputs/phase-2/state-machine.md`
- chatSlice 拡張: `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`
- P5: `.claude/rules/06-known-pitfalls.md`（リスナー二重登録）
- P31/P48: `.claude/rules/06-known-pitfalls.md`（Zustand セレクタ）
