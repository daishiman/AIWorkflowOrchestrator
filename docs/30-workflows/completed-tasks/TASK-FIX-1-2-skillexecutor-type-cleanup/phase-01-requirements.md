# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 1                                         |
| 機能名   | skillexecutor-type-cleanup                |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 分類     | リファクタリング                          |
| 作成日   | 2026-02-07                                |

## 目的

SkillExecutor.ts（L25-127）に残存する6つのローカル型定義を削除し、`@repo/shared/src/types/skill.ts`の正本型に統一することで、型の重複による不整合リスクを排除し、Single Source of Truth原則を徹底する。

## 実行タスク

- 要件抽出: ローカル型と正本型の差異を特定し、統合方針を決定
- 受け入れ基準作成: 各型の統合に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類

## 参照資料

| 資料名                | パス                                                    | 説明                           |
| --------------------- | ------------------------------------------------------- | ------------------------------ |
| SkillExecutor.ts      | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 統合対象（ローカル型定義あり） |
| shared/types/skill.ts | `packages/shared/src/types/skill.ts`                    | 正本型定義                     |
| 01-architecture.md    | `.claude/rules/01-architecture.md`                      | モノレポ構造の依存ルール       |
| 02-code-quality.md    | `.claude/rules/02-code-quality.md`                      | 型安全ルール                   |

## 実行手順

### 1. 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

#### 1.1 対象型定義の特定

SkillExecutor.ts L25-127 に定義された以下の6つのローカル型を特定：

| #   | 型名                    | 行番号   | 正本型との差異                                        |
| --- | ----------------------- | -------- | ----------------------------------------------------- |
| 1   | ExecutionState          | L31-36   | 同一（値一致）                                        |
| 2   | SkillExecutionRequest   | L67-74   | `skillId` vs `skillName`、追加フィールド有            |
| 3   | SkillExecutionResponse  | L77-81   | `error`型が`SkillExecutionError`（構造体）vs `string` |
| 4   | ExecutionInfo           | L84-90   | 同一（構造一致）                                      |
| 5   | SkillStreamMessage      | L100-108 | 単純オブジェクト vs Discriminated Union、type値差異   |
| 6   | SkillExecutionErrorCode | L110-120 | 同一（値一致）                                        |

#### 1.2 追加型定義（SkillExecutor固有）

削除対象外の型（SkillExecutor固有で正本化されていないもの）：

| #   | 型名                 | 行番号   | 説明                                  |
| --- | -------------------- | -------- | ------------------------------------- |
| 1   | RetryableErrorType   | L39-43   | リトライ判定用（SkillExecutor固有）   |
| 2   | RetryConfig          | L46-57   | リトライ設定（SkillExecutor固有）     |
| 3   | RetryableErrorResult | L60-64   | リトライ判定結果（SkillExecutor固有） |
| 4   | SkillExecutionError  | L122-127 | 正本にも同名の型あり                  |
| 5   | ExecutionContext     | L129-137 | 内部用コンテキスト                    |
| 6   | SkillMetadata        | L140-142 | Skill拡張型（正本とは別定義）         |

### 2. 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

#### AC-1: 同一型の削除

- SkillExecutor.ts から `ExecutionState`、`ExecutionInfo`、`SkillExecutionErrorCode` のローカル定義を削除
- `@repo/shared` からの import で置き換え
- **検証方法**: TypeScript型チェック通過

#### AC-2: 差異のある型の統合方針決定

| 型名                   | 統合方針                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| SkillExecutionRequest  | SkillExecutor固有フィールド（`timeout`, `sessionId`, `retryConfig`）を正本に追加、`skillId`を正式採用 |
| SkillExecutionResponse | `error`型を`SkillExecutionError`構造体に統一（正本を更新）                                            |
| SkillStreamMessage     | SkillExecutor用に専用型（`SimpleSkillStreamMessage`）を正本に追加、または Discriminated Union に移行  |

- **検証方法**: 型定義の差分レビュー、コンパイル通過

#### AC-3: import文の整理

- SkillExecutor.ts の import 文を最適化
- `@repo/shared` からの統一的なインポートパスを使用
- **検証方法**: 不要な import がないこと

#### AC-4: 既存テストの継続通過

- 全ての既存テストが変更後も PASS すること
- **検証方法**: `pnpm test` 全体通過

### 3. FR/NFR分類

機能要件と非機能要件を分類し、優先度を設定する。

## 機能要件（FR）

| ID    | 要件                                                                                       | 優先度 |
| ----- | ------------------------------------------------------------------------------------------ | ------ |
| FR-01 | 同一構造の型（ExecutionState, ExecutionInfo, SkillExecutionErrorCode）を正本 import に置換 | 高     |
| FR-02 | SkillExecutionRequest の差異を解決（skillId/skillName 統一、追加フィールド移行）           | 高     |
| FR-03 | SkillExecutionResponse の error 型を SkillExecutionError に統一                            | 高     |
| FR-04 | SkillStreamMessage の型差異を解決（Discriminated Union への移行または互換型の追加）        | 中     |
| FR-05 | SkillExecutor固有型（RetryConfig等）を正本に移行または明示的に分離                         | 中     |

## 非機能要件（NFR）

| ID     | 要件                                                   | 優先度 |
| ------ | ------------------------------------------------------ | ------ |
| NFR-01 | Single Source of Truth 原則の遵守（型定義は1箇所のみ） | 高     |
| NFR-02 | 既存 API の後方互換性維持（破壊的変更なし）            | 高     |
| NFR-03 | TypeScript strict モードでのコンパイル通過             | 高     |
| NFR-04 | コードの可読性・保守性向上（重複削除による簡素化）     | 中     |
| NFR-05 | 依存方向のルール遵守（apps → packages の一方向依存）   | 高     |

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| API接続          | SkillExecutor は IPC 経由で Renderer と通信。型定義変更は IPC 契約に影響 |
| 認証フロー       | 本タスクでは認証フローへの影響なし                                       |
| データフロー     | SkillStreamMessage の型変更は Renderer への配信メッセージ形式に影響      |

## アーキテクチャ層別要件（AIが判断）

| 層                         | 確認観点                                                     |
| -------------------------- | ------------------------------------------------------------ |
| フロントエンド（Renderer） | SkillStreamMessage 型変更時、Renderer 側の型参照も更新が必要 |
| バックエンド（Main）       | SkillExecutor.ts の型 import 先を変更                        |
| IPC通信                    | 型定義変更による IPC チャンネルの型整合性確認                |
| セキュリティ               | 本タスクでは影響なし                                         |
| データ                     | 本タスクでは影響なし                                         |

## 成果物

| 成果物       | パス                                         | 説明                     |
| ------------ | -------------------------------------------- | ------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 本ドキュメント（FR/NFR） |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義（AC-1〜4）        |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲                 |

## 完了条件

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある（AC-1〜AC-4）
- [x] FR/NFRが分類されている
- [x] ステークホルダーが特定されている（開発者）
- [x] 接続要件（API/認証/データフロー）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
