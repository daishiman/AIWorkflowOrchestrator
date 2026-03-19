# UT-CHATPANEL-FIX-002 cancelStreaming リセット挙動の方針確定

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-CHATPANEL-FIX-002                                                        |
| タスク名     | cancelStreaming リセット挙動の方針確定                                      |
| 分類         | 設計確定                                                                    |
| 対象機能     | ChatPanel streaming キャンセル                                              |
| 優先度       | 中                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 エレガンスレビュー NOTE-2（2026-03-18） |
| 発見日       | 2026-03-18                                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`cancelStreaming` の `streamingContent` リセット挙動について、設計書（state-machine.md）では「蓄積コンテンツ保持」と記載されているが、現在の chatSlice 実装では `""` にリセットしている。設計と実装の乖離が存在する。

### 1.2 問題点・課題

- 設計書: キャンセル時に蓄積された部分レスポンスを保持し、ユーザーが途中まで生成された内容を確認可能にする
- 実装: `streamingContent: ""` でリセットし、キャンセル時に途中の内容が消失する
- ユーザー体験の観点でどちらが適切か未確定

### 1.3 放置した場合の影響

設計と実装の不一致が残り、後続の実装タスクで判断が分かれるリスクがある。

## 2. 何を達成するか（What）

### 2.1 目的

cancelStreaming 時の streamingContent の扱い方針を確定し、設計書と実装を一致させる。

### 2.2 受入基準

- [ ] cancelStreaming 時の streamingContent 方針が確定している（保持 or リセット）
- [ ] state-machine.md が方針に合わせて更新されている
- [ ] chatSlice.ts の cancelStreaming が方針に合わせて実装されている
- [ ] キャンセル後の UI 表示が方針通りに動作するテストが存在する
- [ ] 既存テスト 139 件が全て PASS

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`（cancelStreaming アクション）
- `outputs/phase-2/state-machine.md`（設計書更新）
- `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`（キャンセル後表示）

### 3.2 判断基準

| 方針     | メリット                                           | デメリット                                     |
| -------- | -------------------------------------------------- | ---------------------------------------------- |
| 保持     | ユーザーが途中内容を確認可能、再送信の参考にできる | cancelled 状態の messages 配列管理が複雑になる |
| リセット | 実装がシンプル、状態遷移が明確                     | ユーザーが途中内容を失う                       |

### 3.3 推奨方針

「保持」を推奨。cancelled 状態の最後のメッセージに `[中断]` マーカーを付与し、ChatMessageList で視覚的に区別する。

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                    | 解決策                            | 教訓                                                        |
| ------------------------------------------- | --------------------------- | --------------------------------- | ----------------------------------------------------------- |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で混乱 | 各制御の設計意図を JSDoc に明記   | UI 制御が複数ある場合、設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | blocked 状態遷移の UX 影響  | ErrorGuidance → Settings 誘導 CTA | fallback 禁止と UX の両立を設計段階で評価する               |

**固有の教訓**:

- 設計書と実装の乖離は Phase 5 完了時に検出すべきだった。今後は設計書の状態遷移定義と実装の状態遷移を Phase 5 で照合すること
- キャンセル UI は ComposerArea の disabled/canSubmit 二重制御（TL-1）と密接に関連する。保持方針を採用する場合、cancelled 状態での ComposerArea の挙動を明示的に設計すること

## 4. 参照

- エレガンスレビュー NOTE-2: `outputs/verification-report.md`
- 状態機械設計: `outputs/phase-2/state-machine.md`
- chatSlice: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
