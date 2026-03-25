# Phase 9 品質検証チェックリスト

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 9                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-8                                       |

## 1. Policy QA（規約適合）

### 1.1 DENY 項目検証

| ID      | 禁止事項                               | 検証方法                                                             | 判定 |
| ------- | -------------------------------------- | -------------------------------------------------------------------- | ---- |
| DENY-1  | consumer auth 流用                     | CAG-1〜CAG-3 が設計で定義されていることを確認                        | PASS |
| DENY-2  | transcript auto-send                   | NAS-1 の IPC endpoint 非提供が設計で定義されていることを確認         | PASS |
| DENY-3  | hidden parsing                         | NAS-3 + DENY-3 が compliance baseline で明示禁止されていることを確認 | PASS |
| DENY-4  | hidden prompt injection                | DENY-4 が compliance baseline で明示禁止されていることを確認         | PASS |
| DENY-5  | API key を Renderer に渡す             | Disclosure 2.4 Data Flow で secret 非送信が定義されていることを確認  | PASS |
| DENY-6  | terminal command に API key を含む     | Advanced Console 4.2 で secret 非露出が定義されていることを確認      | PASS |
| DENY-7  | advanced console を default surface に | GATE-1 opt-in 必須 + Layer 構造が定義されていることを確認            | PASS |
| DENY-8  | terminal ラベルを front 主導線に       | CTA-R4 ラベル固定規則が定義されていることを確認                      | PASS |
| DENY-9  | 承認なし実行                           | ApprovalGate interface + Approval Flow が定義されていることを確認    | PASS |
| DENY-10 | DEFAULT_CONFIG 暗黙 fallback           | P62 準拠が compliance baseline で明記されていることを確認            | PASS |

### 1.2 MUST 項目検証

| ID      | 遵守事項                            | 検証方法                                                        | 判定 |
| ------- | ----------------------------------- | --------------------------------------------------------------- | ---- |
| MUST-1  | Session 開始時 AI 開示              | DSC-R1 + SessionDisclosureBanner 設計が存在することを確認       | PASS |
| MUST-2  | 外部送信の approval 承認            | APR-T1 + Approval Sheet 設計が存在することを確認                | PASS |
| MUST-3  | 危険操作の approval 承認            | APR-T2〜T4 + Approval Sheet 設計が存在することを確認            | PASS |
| MUST-4  | transcript 共有は3操作              | Task02 Manual Share Rail との連携が scope-definition で確認済み | PASS |
| MUST-5  | advanced console は opt-in          | GATE-1〜GATE-3 + CTA-R1〜R5 が定義されていることを確認          | PASS |
| MUST-6  | primary CTA は常に1個               | CTA-R1 + Session State 統合マトリクスが定義されていることを確認 | PASS |
| MUST-7  | 「端末で続ける」は handoff のみ     | CTA-R3 + Session State 統合マトリクス handoff 行を確認          | PASS |
| MUST-8  | 「高度な表示」は secondary/tertiary | CTA-R2 + Phase 8 S-5 メニュー内統一を確認                       | PASS |
| MUST-9  | エラーは sanitizeErrorMessage 適用  | compliance baseline の既存 safety 基盤整合表で確認              | PASS |
| MUST-10 | 新規 IPC は P42 3段バリデーション   | compliance baseline の P42 適用必須が明記されていることを確認   | PASS |

## 2. Security QA（セキュリティ）

### 2.1 Electron セキュリティモデル整合

| チェック項目                                              | 検証方法                                               | 判定 |
| --------------------------------------------------------- | ------------------------------------------------------ | ---- |
| Approval enforcement が Main Process に存在する           | ApprovalGate interface が Main 層で定義されている      | PASS |
| Renderer からの Approval bypass が不可能である            | Main Process が approval token を独立検証する設計      | PASS |
| 新規 IPC channel が safeInvoke ホワイトリスト管理下にある | IPC Boundary 5.2 で ALLOWED_INVOKE_CHANNELS 追加を明記 | PASS |
| API key / token が Renderer に到達しない                  | Disclosure 2.4 Data Flow で分離設計                    | PASS |
| terminal command に secret が含まれない                   | Advanced Console 4.2 で API key 非含有を明記           | PASS |
| validateIpcSender が新規 handler にも適用される           | compliance baseline で適用必須を明記                   | PASS |
| contextIsolation / nodeIntegration 設定に変更がない       | scope-definition でスコープ外と明記                    | PASS |

### 2.2 Approval Token セキュリティ

| チェック項目                            | 検証方法                                                      | 判定 |
| --------------------------------------- | ------------------------------------------------------------- | ---- |
| Approval token に session ID が紐づく   | ApprovalGate.checkApproval(sessionId, operationId) 設計で確認 | PASS |
| Approval token に operation ID が紐づく | 同上                                                          | PASS |
| Approval token に有効期限がある         | ApprovalStatus に approvedAt フィールド + 有効期限設計で確認  | PASS |
| Approval token が単一操作で失効する     | Approval 1.4 で「操作完了後に失効」を明記                     | PASS |
| 期限切れ token での操作が拒否される     | ApprovalStatus の "expired" ステータスが定義されている        | PASS |

### 2.3 Consumer Auth Guard

| チェック項目                                   | 検証方法                                           | 判定 |
| ---------------------------------------------- | -------------------------------------------------- | ---- |
| claude.ai session token の受け入れが拒否される | CAG-1 で Main Process での token format 検証を定義 | PASS |
| claude.ai cookie が Preload で公開されない     | CAG-2 で cookie API 非公開を定義                   | PASS |
| consumer 認証フローが実装されない              | CAG-3 で設計レビューでの検出を定義                 | PASS |
| 許可される認証方式が限定的に列挙されている     | Consumer Auth Guard 4.2 で3方式のみ列挙            | PASS |

## 3. Disclosure QA（開示品質）

### 3.1 開示の完全性

| チェック項目                                          | 検証根拠                                    | 判定 |
| ----------------------------------------------------- | ------------------------------------------- | ---- |
| Session open 時に AI 利用が開示される                 | DSC-R1 + SessionDisclosureBanner 設計       | PASS |
| Session open 時に外部送信可能性が開示される           | DSC-R1 + Disclosure 2.2 テンプレート        | PASS |
| AI モデル名が開示に含まれる                           | FR-2b + Disclosure 2.2 {modelName}          | PASS |
| 外部送信先の種別が開示に含まれる                      | FR-3b + Disclosure 2.2 {destinations}       | PASS |
| Approval Sheet で操作内容が具体的に説明される         | Approval 1.3 表示内容テーブル               | PASS |
| Approval Sheet で送信先情報が表示される（外部送信時） | Approval 1.3 送信先情報行（条件: 外部送信） | PASS |
| guidance-only state で「AI 実行なし」が開示される     | DSC-R5                                      | PASS |

### 3.2 開示の適切性

| チェック項目                                         | 検証根拠                          | 判定 |
| ---------------------------------------------------- | --------------------------------- | ---- |
| 開示内容に API key / token が含まれない              | Disclosure 2.4 Data Flow 分離設計 | PASS |
| 開示内容に内部パスが含まれない                       | MUST-9 sanitizeErrorMessage 適用  | PASS |
| Banner が dismiss 可能かつ再表示可能である           | DSC-R2 + DSC-R3                   | PASS |
| Approval Sheet 内の disclosure が dismiss 不可である | DSC-R4                            | PASS |
| Phase 8 短縮版でも開示義務の核心が伝達される         | S-1 の UX を壊さない根拠          | PASS |

### 3.3 開示のタイミング

| タイミング          | 期待される開示                   | 設計根拠             | 判定 |
| ------------------- | -------------------------------- | -------------------- | ---- |
| Session open        | AI 利用 + 外部送信可能性         | Disclosure 2.1       | PASS |
| 外部送信実行前      | 送信先 + 送信内容概要            | Disclosure 2.1 + APR | PASS |
| 危険操作実行前      | 操作内容 + 影響範囲              | Disclosure 2.1 + APR | PASS |
| Terminal handoff 前 | handoff 理由 + terminal での操作 | Disclosure 2.1 + APR | PASS |

## 4. Boundary QA（境界検証）

### 4.1 Layer 分離

| チェック項目                                                      | 検証根拠                      | 判定 |
| ----------------------------------------------------------------- | ----------------------------- | ---- |
| Layer 1 (Primary Surface) に Advanced Console が含まれない        | Advanced Console Boundary 1.1 | PASS |
| Layer 2 (Safety Surface) に Approval Sheet が含まれる             | Advanced Console Boundary 1.1 | PASS |
| Layer 3 (Detail Surface) が opt-in でのみアクセス可能             | GATE-1 + Phase 8 S-5          | PASS |
| Layer 間の情報伝播が一方向である（Detail → Primary への逆流なし） | Advanced Console 4.3 禁止操作 | PASS |

### 4.2 State Machine 境界

| チェック項目                                                     | 検証根拠                              | 判定 |
| ---------------------------------------------------------------- | ------------------------------------- | ---- |
| collapsed state で Approval/Disclosure/Advanced Console が非表示 | Session State 統合マトリクス          | PASS |
| unavailable state で全 safety UI が非表示                        | Session State 統合マトリクス          | PASS |
| guidance-only state で guidance 固有の開示が表示される           | Session State 統合マトリクス + DSC-R5 | PASS |
| running state で Advanced Console が read-only                   | State Machine 連携 2.3 + Phase 8 S-4  | PASS |
| state 遷移で approval token が無効化される                       | ApprovalGate 1.4 有効期限設計         | PASS |

### 4.3 IPC 境界

| チェック項目                                                               | 検証根拠                        | 判定 |
| -------------------------------------------------------------------------- | ------------------------------- | ---- |
| 新規 IPC channel が2本のみ（execution:get-terminal-log, get-copy-command） | IPC Boundary 5.1                | PASS |
| 自動送信用 IPC が存在しない                                                | NAS-1〜NAS-3 消極的 enforcement | PASS |
| hidden parsing 用 IPC が存在しない                                         | DENY-3 + NAS 設計               | PASS |
| consumer auth 用 IPC が存在しない                                          | CAG-1〜CAG-3 設計               | PASS |
| 全新規 IPC に P42 3段バリデーションが要求されている                        | IPC Boundary 5.2 + MUST-10      | PASS |

### 4.4 Manual Boundary

| チェック項目                                      | 検証根拠             | 判定 |
| ------------------------------------------------- | -------------------- | ---- |
| transcript 共有が3操作で明示的である              | MUST-4 + Task02 連携 | PASS |
| 「端末で続ける」が自動リダイレクトしない          | FR-5d                | PASS |
| Advanced Console Panel 内に自動実行トリガーがない | Advanced Console 4.3 | PASS |
| Advanced Console Panel 内に外部送信ボタンがない   | Advanced Console 4.3 | PASS |

## 5. 品質検証サマリー

| QA カテゴリ   | チェック項目数 | PASS   | FAIL  | 合格率   |
| ------------- | -------------- | ------ | ----- | -------- |
| Policy QA     | 20             | 20     | 0     | 100%     |
| Security QA   | 16             | 16     | 0     | 100%     |
| Disclosure QA | 14             | 14     | 0     | 100%     |
| Boundary QA   | 14             | 14     | 0     | 100%     |
| **合計**      | **64**         | **64** | **0** | **100%** |

## 6. Phase 8 リファクタリング反映確認

| 簡素化 ID | 内容                         | 品質への影響             | 確認結果 |
| --------- | ---------------------------- | ------------------------ | -------- |
| S-1       | Disclosure Banner 短縮版     | 開示義務は維持           | 問題なし |
| S-2       | Approval Sheet AI 名再掲削除 | 情報は Banner で開示済み | 問題なし |
| S-3       | Approval Sheet 停止方法1行化 | FR-1d は維持             | 問題なし |
| S-4       | Advanced Console 2区画統合   | FR-4d は維持             | 問題なし |
| S-5       | Toggle メニュー内統一        | GATE-1 を強化            | 問題なし |
