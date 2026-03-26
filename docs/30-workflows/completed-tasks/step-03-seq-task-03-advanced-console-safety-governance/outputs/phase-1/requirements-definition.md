# Phase 1 要件定義書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase      | 1                                               |
| 作成日     | 2026-03-24                                      |
| 前提タスク | Task01 (完了), Task02 (完了)                    |

## 機能要件（FR）

### FR-1: Approval Sheet

| ID    | 要件                                                                                     |
| ----- | ---------------------------------------------------------------------------------------- |
| FR-1a | 危険操作（ファイル削除、システム設定変更、外部プロセス起動）の実行前に承認画面を表示する |
| FR-1b | 外部送信（API呼び出し、データ転送）の実行前に送信先・送信内容の概要を承認画面に表示する  |
| FR-1c | 承認画面には「承認」「拒否」「詳細を見る」の3つのアクションを提供する                    |
| FR-1d | 承認画面には停止方法（中止ボタンの存在と位置）を明示する                                 |
| FR-1e | 承認なしでは危険操作・外部送信を実行しない（runtime enforcement）                        |

### FR-2: AI 利用開示

| ID    | 要件                                                                        |
| ----- | --------------------------------------------------------------------------- |
| FR-2a | セッション開始時に「AI が操作を支援していること」を明示するバナーを表示する |
| FR-2b | バナーには AI モデル名またはサービス名を含める                              |
| FR-2c | バナーは dismiss 可能だが、セッション中いつでも再表示できる導線を維持する   |

### FR-3: 外部送信開示

| ID    | 要件                                                                       |
| ----- | -------------------------------------------------------------------------- |
| FR-3a | セッション開始時に「外部サービスへのデータ送信が発生する可能性」を開示する |
| FR-3b | 送信先の種別（LLM API、外部ツール等）を明示する                            |
| FR-3c | 開示はセッション開始時の disclosure banner と approval sheet の2層で行う   |

### FR-4: Advanced Console

| ID    | 要件                                                                                |
| ----- | ----------------------------------------------------------------------------------- |
| FR-4a | advanced console（raw terminal / 詳細ログ）は opt-in の detail layer として提供する |
| FR-4b | front default surface（実行コンソール）には advanced console を露出しない           |
| FR-4c | 「高度な表示」ラベルで secondary/tertiary CTA として配置する                        |
| FR-4d | advanced console 内では copy command、raw log 閲覧、低レベル操作を許可する          |

### FR-5: Manual Boundary Enforcement

| ID    | 要件                                                                                        |
| ----- | ------------------------------------------------------------------------------------------- |
| FR-5a | transcript は自動で chat に送信しない（no auto-send）                                       |
| FR-5b | transcript 共有は Manual Share Rail の3操作（選択 → 確認 → 送信）で明示的に行う             |
| FR-5c | hidden parsing（ユーザーに見えない形でのデータ解析）を行わない                              |
| FR-5d | `端末で続ける` は handoff state の primary CTA としてのみ表示する（自動リダイレクトしない） |

## 非機能要件（NFR）

| ID    | カテゴリ         | 要件                                                                               |
| ----- | ---------------- | ---------------------------------------------------------------------------------- |
| NFR-1 | セキュリティ     | API key / token を Renderer に直接渡さない（Main Process で保持）                  |
| NFR-2 | セキュリティ     | terminal command に API key を含めない（secret 非中継）                            |
| NFR-3 | セキュリティ     | エラーメッセージに内部パス・トークンを含めない（sanitizeErrorMessage 準拠）        |
| NFR-4 | パフォーマンス   | approval sheet の表示は 200ms 以内に完了する                                       |
| NFR-5 | アクセシビリティ | approval sheet はキーボード操作で完結する（WCAG 2.1 AA）                           |
| NFR-6 | UX               | disclosure banner は Session Dock の state machine に統合する（Task02 state 準拠） |
| NFR-7 | 規約適合         | Anthropic Usage Policy / Commercial Terms に準拠する                               |

## 受入基準（AC）

| ID   | 基準                                                                              | 検証方法                                 |
| ---- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| AC-1 | approval sheet が危険操作と外部送信の承認面として定義されている                   | FR-1a〜FR-1e の設計書存在を確認          |
| AC-2 | 各セッション開始時に AI 利用と外部送信可能性を開示する契約が定義されている        | FR-2a, FR-3a の設計書存在を確認          |
| AC-3 | no auto-send、no hidden parsing、no consumer auth embedding が明記されている      | FR-5a, FR-5c, compliance baseline を確認 |
| AC-4 | advanced console が opt-in detail layer であり、front の default surface ではない | FR-4a, FR-4b の設計書存在を確認          |

## P50 チェック結果

既存実装で確認済みの safety 基盤:

| 実装                      | ファイル                       | 状態           |
| ------------------------- | ------------------------------ | -------------- |
| terminal:open IPC         | `preload/channels.ts:42`       | 存在           |
| handoffGuidance state     | `agentSlice.ts:214`            | 存在           |
| terminal_handoff 分岐     | `agentSlice.ts:35`             | 存在           |
| RuntimePolicyResolver     | `RuntimePolicyResolver.ts`     | 3パターン      |
| RuntimeSkillCreatorFacade | `RuntimeSkillCreatorFacade.ts` | handoff 対応   |
| safeInvoke / safeOn       | `preload/index.ts`             | ホワイトリスト |
