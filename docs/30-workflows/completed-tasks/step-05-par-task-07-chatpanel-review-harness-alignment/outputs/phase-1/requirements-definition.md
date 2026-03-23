# Phase 1: 要件定義書

> タスクID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
> 作成日: 2026-03-23

## 1. 機能要件（FR）

### FR-1: Review Harness Role 明文化

ChatPanel の JSDoc、コンポーネントコメント、仕様書に「review harness」としての役割を明記する。

| 項目     | 定義                                                                      |
| -------- | ------------------------------------------------------------------------- |
| role     | review harness（mainline 契約を再現する補助 panel）                       |
| 主ジョブ | mainline の state machine / fallback / launcher contract を検証・再現する |
| 禁止     | mainline の primary CTA を奪うこと                                        |
| 許容     | mainline と同名の CTA ラベルを使用すること                                |

### FR-2: State / Action Contract 定義

placeholder / no-op を許さない state / action contract を定義する。

#### 状態契約

| 状態      | 表示ルール                  | CTA                   | 禁止事項                   |
| --------- | --------------------------- | --------------------- | -------------------------- |
| idle      | 初期表示メッセージ          | -                     | blank state にしない       |
| ready     | 実行可能理由を 1 行で示す   | primary CTA を有効化  | 準備条件を hidden にしない |
| streaming | ストリーミング中表示        | cancel                | 中断不能にしない           |
| completed | 完了メッセージ表示          | 新規入力を許可        | 完了状態を隠さない         |
| cancelled | キャンセル表示              | 再試行を許可          | silent discard しない      |
| error     | エラーガイダンス表示        | retry（retryable 時） | エラーを握りつぶさない     |
| blocked   | 設定不足ガイダンス          | 設定画面へ遷移        | **no-op CTA を見せない**   |
| handoff   | terminal handoff ガイダンス | terminal を開く       | 自動送信しない             |

#### アクション契約

| アクション               | 責務                     | no-op 許容                     |
| ------------------------ | ------------------------ | ------------------------------ |
| handleSendMessage        | メッセージ送信           | 不可                           |
| handleNavigateToSettings | 設定画面遷移             | 不可                           |
| cancelStream             | ストリーミングキャンセル | 不可                           |
| onTerminalSwitch         | terminal 切替            | **不可（現在 no-op、要修正）** |
| onSelectProvider         | プロバイダー選択         | **不可（現在 no-op、要修正）** |
| onSelectModel            | モデル選択               | **不可（現在 no-op、要修正）** |
| onOpenTerminal           | terminal 起動            | **不可（現在 no-op、要修正）** |

### FR-3: Mainline vs Harness 差分表

mainline と review harness の責務境界を表形式で固定する。

| 観点                 | Mainline                        | Review Harness                    | 差分                               |
| -------------------- | ------------------------------- | --------------------------------- | ---------------------------------- |
| 位置付け             | user-facing primary execution   | mainline 契約再現の補助 panel     | harness は non-primary             |
| 状態機械             | 8 state union                   | 同一の 8 state union              | state 定義は同一                   |
| CTA ラベル           | 「送信する」「terminal を開く」 | 同名ラベル                        | ラベル同一                         |
| CTA の actionability | 全 CTA が実動作                 | 全 CTA が実動作（**no-op 禁止**） | 動作要件同一                       |
| Fallback             | blocked → 設定遷移              | blocked → 設定遷移                | fallback logic 同一                |
| Launcher             | PersistentTerminalLauncher      | 同一 launcher                     | 共有                               |
| Primary lane         | Yes                             | No                                | harness は primary lane でない     |
| 新規ジョブ生成       | Yes                             | No（既存契約の再現のみ）          | harness は新規ジョブを主生成しない |

### FR-4: Panel 統合パターン整合

| パターン      | 対象                                 | 整合条件                                   |
| ------------- | ------------------------------------ | ------------------------------------------ |
| 条件レンダー  | SkillStreamingView / ChatMessageList | `isExecuting && selectedSkillName` で切替  |
| forwardRef    | ChatPanelHandle                      | `handleImportRequest` を公開               |
| RuntimeBanner | capability 表示                      | `resolvedCapability` で条件分岐            |
| ErrorGuidance | blocked 表示                         | `chatPanelStatus === "blocked"` で条件分岐 |
| HandoffBlock  | handoff 表示                         | `chatPanelStatus === "handoff"` で条件分岐 |

## 2. 非機能要件（NFR）

| NFR-ID | 要件             | 基準                                                      |
| ------ | ---------------- | --------------------------------------------------------- |
| NFR-1  | 再レンダー最適化 | 個別セレクタ使用（P31 対策）                              |
| NFR-2  | a11y             | WCAG 2.1 AA 準拠（role, aria-label, keyboard navigation） |
| NFR-3  | テストカバレッジ | Line 80%+, Branch 60%+, Function 80%+                     |
| NFR-4  | no-op 排除       | コールバック引数に `() => {}` を渡す箇所が 0 件           |

## 3. ガバナンス要件

| GOV-ID | 要件                                         |
| ------ | -------------------------------------------- |
| GOV-1  | Phase 4 は Phase 1-3 完了まで開始しない      |
| GOV-2  | コミット / PR はユーザー指示なしに実行しない |
| GOV-3  | mainline 侵食の検出時は Phase 2 へ差し戻す   |

## 4. 受入基準の検証可能化

| AC-ID | 基準                                               | 検証方法                                          |
| ----- | -------------------------------------------------- | ------------------------------------------------- |
| AC-1  | ChatPanel の role が review harness として明文化   | JSDoc に `@role review-harness` が記載されている  |
| AC-2  | placeholder / no-op を許さない contract が定義     | `grep -rn "() => {}" ChatPanel.tsx` の結果が 0 件 |
| AC-3  | mainline と harness の差分が表形式で固定           | FR-3 差分表が outputs/phase-2/ に存在する         |
| AC-4  | panel 統合パターンと launcher / fallback UX が整合 | FR-4 整合条件が全て満たされている                 |
