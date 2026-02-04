# 型棚卸しリスト: TASK-FIX-1-1-TYPE-ALIGNMENT

## 1. skill.ts の型定義（正・維持）

### 1.1 基本型

| 型名                   | 行番号   | 説明                     | 対応 |
| ---------------------- | -------- | ------------------------ | ---- |
| `Anchor`               | L11-20   | アンカー（参照文献）情報 | 維持 |
| `SkillEnvironmentType` | L26      | スキル環境設定           | 維持 |
| `EnvironmentConfig`    | L31-38   | 環境設定                 | 維持 |
| `SkillCategory`        | L43-50   | スキルカテゴリ           | 維持 |
| `Skill`                | L71-102  | スキルの基本情報         | 維持 |
| `SkillDetail`          | L107-118 | スキル詳細情報           | 維持 |
| `SkillImportConfig`    | L123-128 | インポート設定           | 維持 |
| `OperationResult`      | L133-140 | 操作結果                 | 維持 |
| `SkillScanError`       | L145-152 | スキルスキャンエラー     | 維持 |
| `SkillScanResult`      | L157-164 | スキルスキャン結果       | 維持 |
| `ImportResult`         | L169-176 | インポート結果           | 維持 |
| `RemoveResult`         | L181-186 | 削除結果                 | 維持 |
| `SkillRunResult`       | L191-204 | スキル実行結果           | 維持 |

### 1.2 メタデータ型（§5.1）

| 型名               | 行番号   | 説明                           | 対応 |
| ------------------ | -------- | ------------------------------ | ---- |
| `SkillOtherFile`   | L215-224 | スキルディレクトリの他ファイル | 維持 |
| `SkillSubResource` | L230-242 | スキル配下のサブリソース       | 維持 |
| `SkillMetadata`    | L249-285 | スキルメタデータ               | 維持 |
| `ImportedSkill`    | L290-299 | インポート済みスキル           | 維持 |

### 1.3 実行関連型（§5.1）

| 型名                     | 行番号   | 説明                 | 対応 |
| ------------------------ | -------- | -------------------- | ---- |
| `SkillExecutionRequest`  | L310-319 | 実行リクエスト（正） | 維持 |
| `SkillExecutionResponse` | L324-333 | 実行レスポンス       | 維持 |
| `SkillExecutionStatus`   | L338-344 | 実行ステータス       | 維持 |

### 1.4 ストリーミングメッセージ型（§5.1）

| 型名                       | 行番号   | 説明                               | 対応 |
| -------------------------- | -------- | ---------------------------------- | ---- |
| `SkillStreamMessageType`   | L354-359 | メッセージ種別（正）               | 維持 |
| `AssistantMessageContent`  | L364-370 | アシスタントメッセージ内容         | 維持 |
| `ToolUseMessageContent`    | L375-384 | ツール使用メッセージ内容           | 維持 |
| `ToolResultMessageContent` | L389-401 | ツール結果メッセージ内容           | 維持 |
| `StatusMessageContent`     | L406-412 | ステータスメッセージ内容           | 維持 |
| `ErrorMessageContent`      | L417-426 | エラーメッセージ内容               | 維持 |
| `SkillStreamMessage`       | L433-463 | ストリーミングメッセージ（正・DU） | 維持 |

### 1.5 権限確認型（§5.1）

| 型名                      | 行番号   | 説明               | 対応 |
| ------------------------- | -------- | ------------------ | ---- |
| `SkillPermissionRequest`  | L473-488 | 権限確認リクエスト | 維持 |
| `SkillPermissionResponse` | L493-505 | 権限確認レスポンス | 維持 |

---

## 2. skill-execution.ts の型定義（統合対象）

| 型名                       | 行番号   | 説明                         | 対応                     |
| -------------------------- | -------- | ---------------------------- | ------------------------ |
| `ExecutionState`           | L10-15   | 実行状態                     | skill.tsへ移行           |
| `SkillExecutionRequest`    | L20-31   | 実行リクエスト（重複）       | **削除**（skill.ts使用） |
| `SkillExecutionResponse`   | L36-43   | 実行レスポンス（重複）       | **削除**（skill.ts使用） |
| `ExecutionInfo`            | L48-59   | 実行情報                     | skill.tsへ移行           |
| `SkillStreamMessageType`   | L64      | メッセージ種別（重複）       | **削除**（skill.ts使用） |
| `SkillStreamMessage`       | L69-82   | ストリームメッセージ（重複） | **削除**（skill.ts使用） |
| `SkillExecutionErrorCode`  | L87-96   | エラーコード                 | skill.tsへ移行           |
| `SkillExecutionError`      | L101-108 | 実行エラー                   | skill.tsへ移行           |
| `ExecutionContext`         | L113-126 | 実行コンテキスト（内部用）   | skill.tsへ移行           |
| `SKILL_EXECUTION_DEFAULTS` | L131-142 | 実行設定定数                 | skill.tsへ移行           |

---

## 3. 型マッピングサマリー

### 3.1 削除対象（skill-execution.ts）

| 型名                     | 理由                                  |
| ------------------------ | ------------------------------------- |
| `SkillStreamMessage`     | skill.tsにDiscriminated Union版が存在 |
| `SkillStreamMessageType` | skill.tsに正しい5種類の定義が存在     |
| `SkillExecutionRequest`  | skill.tsに定義が存在                  |
| `SkillExecutionResponse` | skill.tsに定義が存在                  |

### 3.2 移行対象（skill-execution.ts → skill.ts）

| 型名                       | 理由                             |
| -------------------------- | -------------------------------- |
| `ExecutionState`           | skill.tsに存在しない実行状態型   |
| `ExecutionInfo`            | skill.tsに存在しない実行情報型   |
| `SkillExecutionErrorCode`  | skill.tsに存在しないエラーコード |
| `SkillExecutionError`      | skill.tsに存在しないエラー型     |
| `ExecutionContext`         | skill.tsに存在しない内部用型     |
| `SKILL_EXECUTION_DEFAULTS` | skill.tsに存在しない定数         |

---

## 4. import影響ファイル一覧

| ファイル                                                                | 現在のimport                         | 修正後                     |
| ----------------------------------------------------------------------- | ------------------------------------ | -------------------------- |
| `apps/desktop/src/preload/skill-api.ts`                                 | `@repo/shared/types/skill-execution` | `@repo/shared/types/skill` |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | `@repo/shared/types/skill-execution` | `@repo/shared/types/skill` |
| `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`   | `@repo/shared/types/skill-execution` | `@repo/shared/types/skill` |
| `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | `@repo/shared/types/skill-execution` | `@repo/shared/types/skill` |
| `apps/desktop/src/renderer/components/AgentView/__tests__/*.test.tsx`   | `@repo/shared/types/skill-execution` | `@repo/shared/types/skill` |
| `apps/desktop/src/__tests__/skill-stream-integration.test.ts`           | `@repo/shared/types/skill-execution` | `@repo/shared/types/skill` |
| `packages/shared/src/types/index.ts`                                    | `./skill-execution`のre-export       | 削除または`./skill`へ変更  |
