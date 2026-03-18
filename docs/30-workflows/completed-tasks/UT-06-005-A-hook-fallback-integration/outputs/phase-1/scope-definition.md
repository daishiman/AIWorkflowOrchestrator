# Phase 1 成果物: スコープ定義

## メタ情報

| 項目      | 値                                                                                     |
| --------- | -------------------------------------------------------------------------------------- |
| タスク ID | UT-06-005-A                                                                            |
| フェーズ  | Phase 1 - 要件定義                                                                     |
| 作成日    | 2026-03-17                                                                             |
| 参照      | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/acceptance-criteria.md` |

## 実装スコープ（対象）

### 対象ファイル

| ファイル                                                | 変更種別   | 内容                                                                                                                   |
| ------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 追加・修正 | `handlePermissionCheck`, `sendPermissionRequestWithTimeout`, `PermissionTimeoutError` の追加、`PreToolUse Hook` の修正 |

### 対象フロー

- `PreToolUse Hook`（`SkillExecutor.ts` L1127-1184 付近）への Permission チェック統合
- FR-001〜FR-003 の後段で実行される Permission 連携フロー（FR-101〜FR-106）

### 新規追加コンポーネント

| コンポーネント                     | 種別                 | 説明                                                                       |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `PermissionTimeoutError`           | クラス（Error 継承） | タイムアウト発生を表すカスタムエラー。`SkillExecutor.ts` 内に定義          |
| `sendPermissionRequestWithTimeout` | private メソッド     | `Promise.race` + `clearTimeout` によるタイムアウト付き Permission 要求送信 |
| `handlePermissionCheck`            | private メソッド     | retry ループ + fail-closed を実装する Permission チェック統括メソッド      |

### 既存コンポーネント（修正対象）

| コンポーネント    | 変更内容                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `PreToolUse Hook` | `processPermissionFallback` 呼び出しを組み込む（現状 `{ proceed: true }` を直接返している箇所を修正） |

## 実装スコープ外（対象外）

| 項目                                                       | 理由                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| IPC チャネルの新規追加                                     | `sendPermissionRequest` の既存 IPC チャネルを利用する |
| UI 側の仕様変更                                            | Renderer/Preload 層の変更は本タスクのスコープ外       |
| `processPermissionFallback` の内部ロジック変更             | UT-06-005 で実装済みの既存メソッドをそのまま呼び出す  |
| `executeAbortFlow` / `executeSkipFlow` の変更              | 既存実装をそのまま利用する                            |
| `DEFAULT_TIMEOUT_MS` / `PERMISSION_MAX_RETRIES` 定数の変更 | 既存定数をそのまま使用する                            |
| テスト以外のファイルへの変更                               | `SkillExecutor.ts` の実装変更と対応するテストのみ     |

## 依存関係

### 前提条件（実装済み）

- `processPermissionFallback`（SkillExecutor.ts L1535-1681）
- `executeAbortFlow`（SkillExecutor.ts 実装済み）
- `executeSkipFlow`（SkillExecutor.ts 実装済み）
- `DEFAULT_TIMEOUT_MS = 30000`（SkillExecutor.ts L257）
- `PERMISSION_MAX_RETRIES = 3`（SkillExecutor.ts L251）
- `PermissionFlowContext` / `PermissionFlowResult` / `AbortReason`（SkillExecutor.ts L232 付近）

### 後続タスクへの影響

- Phase 4: 本スコープ定義に基づきテストケースを設計する
- Phase 5: 本スコープ定義に基づき `SkillExecutor.ts` を実装する

## 受け入れ基準との対応

本スコープで実装される機能が AC-001〜AC-007 を満たすことが完了条件となる。

詳細は `outputs/phase-1/acceptance-criteria.md` を参照。
