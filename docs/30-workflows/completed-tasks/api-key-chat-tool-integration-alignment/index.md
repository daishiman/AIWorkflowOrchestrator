# TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001: APIキー連動とチャット実行経路の整合

## 概要

設定画面で登録した API キーと、実際のチャット実行経路の参照先に断絶がある。  
本タスクは「保存経路」「チャット実行経路」「AuthKey 導線」を同時に整合させるための実行仕様書である。

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001                |
| タスク種別 | バグ修正                                                 |
| 優先度     | 高                                                       |
| ステータス | phase_12_completed                                       |
| 作成日     | 2026-03-11                                               |
| 対象       | Settings APIキー管理 / LLMチャット実行 / AuthKey認証導線 |
| 実施制約   | コミット・PR作成は未実施（Phase 13 未着手）              |

## ユーザー指示の要約

- 設定画面の API キーが実際に利用される状態か確認したい。
- Gemini / Claude / OpenAI / xAI のキーが連動しているか確認したい。
- キーの保存先が DB かローカルかを明確化したい。
- `task-specification-creator` と `aiworkflow-requirements` に準拠したタスク仕様書を作成したい。
- Phase 1-3 完了前に次の Phase へ進まない設計にしたい。
- 関心ごとを分離して並列実行可能な計画にしたい。

## 事実確認サマリー（2026-03-11）

| 観点                                               | 現状実装の事実                                                                                                                                                 | 判定                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Settings APIキー保存経路                           | `ApiKeysSection` は `window.electronAPI.apiKey.save/list/delete` を利用し、Main は `createApiKeyStorage()`（Store名: `api-keys`）へ保存する                    | 連動元として存在           |
| LLM実行経路（`llm.send-chat` / `llm.stream-chat`） | `LLMAdapterFactory` と `handlers/llm.ts` は `SecureStorage`（Store名: `llm-api-keys`）からのみAPIキーを取得する                                                | Settings 保存先と分断      |
| `ai.chat` 経路                                     | `aiHandlers.ts` は `getSelectedLLMConfig()` を参照し、未設定時は `openai/gpt-4o` デフォルトへフォールバックする。`setSelectedLLMConfig()` の実呼び出しは未接続 | プロバイダー選択連動が不足 |
| AuthKey 経路（Claude Agent SDK）                   | `auth-key:*` IPC → `AuthKeyService`（Store名: `auth-key-store`）で保存され、`SkillExecutor` が `getApiKey()` で参照する                                        | 連動あり                   |
| 保存先の種別                                       | APIキー系はすべて `electron-store`（ローカル）で保持。DB 保存経路は未使用                                                                                      | DB ではなくアプリローカル  |

## aiworkflow-requirements 抽出対象（今回必須）

| 区分             | 参照先                                                                        | 抽出目的                                                         |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| API全体俯瞰      | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | `apiKey:*` / `auth-key:*` / `AI_CHAT` / `llm:*` の横断関係を確認 |
| IPC契約          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | `apiKey:*` / `auth-key:*` / `llm:*` 契約突合                     |
| Agent IPC契約    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | `auth-key:exists` preflight と実行時判定の接続確認               |
| LLM型契約        | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`          | `AIChatRequest` と `LLMChatRequest` の差分整理                   |
| LLM選択UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`     | UI選択値と送信契約の期待挙動確認                                 |
| Settings導線     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | APIキーUIの期待動作と実装差分確認                                |
| 認証I/F          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`        | auth-mode と auth-key 導線の整合確認                             |
| 状態管理         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | `selectedProviderId` / `selectedModelId` の責務確認              |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | APIキー取扱いの基本要件確認                                      |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | キー露出防止と preload 境界要件確認                              |
| IPC監査手順      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 1-6 の契約チェック手順（preflight/validation/同期）を固定  |
| 例外設計         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 失敗時の分類・利用者向けエラー整合を確認                         |
| 仕様同期台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | Phase 12 同期対象の確定                                          |
| 教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 再発防止観点の抽出                                               |

## 関心ごと分離（Atent Team想定）

| Team   | 関心ごと         | 主責務                                                      |
| ------ | ---------------- | ----------------------------------------------------------- |
| Team-A | APIキー保存連動  | `api-keys` と `llm-api-keys` の連結方式を定義し実装する     |
| Team-B | チャット実行連動 | `ai.chat` と `llm.*` の経路と選択プロバイダー反映を統一する |
| Team-C | AuthKey導線連動  | `auth-key` 保存導線と Settings UI 表示導線を統一する        |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 受入基準

| ID   | 基準                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| AC-1 | Settings で保存した OpenAI/Anthropic/Google/xAI キーがチャット実行で参照される |
| AC-2 | `ai.chat` と `llm.send-chat` と `llm.stream-chat` のプロバイダー選択が一致する |
| AC-3 | API キー保存先の仕様と実装が 1 つの契約に収束している                          |
| AC-4 | AuthKey の保存導線と Settings 表示導線が一致している                           |
| AC-5 | Preload/IPC の型契約が破綻していない                                           |
| AC-6 | 秘密情報がログとエラーメッセージに出力されない                                 |
| AC-7 | 変更範囲のテストが PASS する                                                   |
| AC-8 | system spec（aiworkflow-requirements）が更新される                             |

## スコープ

**含む**:

- API キーの保存・取得・削除・一覧・チャット参照経路の整合
- LLM プロバイダー選択値の実行経路反映
- AuthKey 設定 UI と認証モード導線の整合
- IPC/Preload/Shared Types の契約確認

**含まない**:

- 新しい LLM プロバイダー追加
- 課金管理、使用量管理、レート制御の新機能追加
- 既存 RAG 機能の設計変更

## Phase進行ゲート

- Phase 1-3 が `PASS` または `MINOR` で完了するまで、Phase 4 へ進行しない。
- Phase 13 はユーザーの明示許可が出るまで実行しない。

## 関連する既知の落とし穴

- P31: Zustand セレクタ不安定化
- P48: non-null assertion による境界破綻
- P53: 画面証跡と実行証跡の混同
