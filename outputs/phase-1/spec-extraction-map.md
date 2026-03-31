# Phase 1: 要件抽出マップ (Spec Extraction Map)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| 機能名   | claude-sdk-permission-hooks-governance |
| Phase    | 1                                      |
| 作成日   | 2026-03-31                             |

## 1. Phase 別 Tool Policy

動的 skill-creator 実行を維持したまま、各 phase で SDK に渡す permission option を固定する。

### 1.1 plan phase: 読み取り専用

| 項目            | 値                                    |
| --------------- | ------------------------------------- |
| permissionMode  | `"plan"`                              |
| allowedTools    | `["Read", "Glob", "Grep", "Bash"]`    |
| disallowedTools | `["Edit", "Write"]`                   |
| canUseTool      | なし（allowedTools で十分制約される） |

**根拠**: plan phase はスキル仕様の分析と計画生成のみを行う。ファイルシステムへの書き込みは一切不要であり、Read / Glob / Grep による情報収集と Bash による read-only コマンド実行のみを許可する。

**Bash の制約**: `permissionMode: "plan"` により Bash は read-only コマンドのみ許可される。destructive コマンド（rm, mv, chmod 等）は SDK 側で拒否される。

### 1.2 execute phase: 生成対象 skill dir への限定書き込み

| 項目            | 値                                                                        |
| --------------- | ------------------------------------------------------------------------- |
| permissionMode  | `"acceptEdits"`                                                           |
| allowedTools    | `["Read", "Edit", "Write", "Glob", "Grep", "Bash"]`                       |
| disallowedTools | なし                                                                      |
| canUseTool      | Write / Edit を skill target dir（`~/.claude/skills/<skillName>/`）に制限 |

**根拠**: execute phase はスキルファイルを新規生成する。生成先は常に `~/.claude/skills/<skillName>/` 配下であり、それ以外のパスへの書き込みは安全上許可しない。

**canUseTool 実装方針**:

```typescript
// execute phase の canUseTool
canUseTool(toolName: string, input: Record<string, unknown>): ToolDecision {
  if (toolName === "Write" || toolName === "Edit") {
    const filePath = input.file_path as string;
    if (!filePath.startsWith(skillTargetDir)) {
      return { allowed: false, reason: `Write/Edit は ${skillTargetDir} 配下のみ許可` };
    }
  }
  return { allowed: true };
}
```

### 1.3 verify phase: 読み取り / テスト実行

| 項目            | 値                                    |
| --------------- | ------------------------------------- |
| permissionMode  | `"plan"`                              |
| allowedTools    | `["Read", "Glob", "Grep", "Bash"]`    |
| disallowedTools | `["Edit", "Write"]`                   |
| canUseTool      | なし（allowedTools で十分制約される） |

**根拠**: verify phase は生成されたスキルの検証のみを行う。ファイルの変更は improve phase の責務であり、verify は pure な読み取り / テスト実行に限定する。Bash はテストスクリプト実行に使用される（`permissionMode: "plan"` で destructive コマンドは拒否される）。

### 1.4 improve phase: 限定的な既存ファイル編集

| 項目            | 値                                                                |
| --------------- | ----------------------------------------------------------------- |
| permissionMode  | `"acceptEdits"`                                                   |
| allowedTools    | `["Read", "Edit", "Glob", "Grep"]`                                |
| disallowedTools | `["Write"]`                                                       |
| canUseTool      | Edit を skill target dir（`~/.claude/skills/<skillName>/`）に制限 |

**根拠**: improve phase は verify で検出された問題を既存ファイルの編集で修正する。新規ファイル作成（Write）は execute phase の責務であり、improve では既存ファイルへの Edit のみを許可する。Edit 対象は skill target dir 内に限定する。

**canUseTool 実装方針**:

```typescript
// improve phase の canUseTool
canUseTool(toolName: string, input: Record<string, unknown>): ToolDecision {
  if (toolName === "Edit") {
    const filePath = input.file_path as string;
    if (!filePath.startsWith(skillTargetDir)) {
      return { allowed: false, reason: `Edit は ${skillTargetDir} 配下のみ許可` };
    }
  }
  return { allowed: true };
}
```

### 1.5 Phase 別 Policy 一覧表

| Phase   | permissionMode | allowedTools                        | disallowedTools | canUseTool 制約                  |
| ------- | -------------- | ----------------------------------- | --------------- | -------------------------------- |
| plan    | `plan`         | Read, Glob, Grep, Bash              | Edit, Write     | なし                             |
| execute | `acceptEdits`  | Read, Edit, Write, Glob, Grep, Bash | なし            | Write/Edit → skillTargetDir のみ |
| verify  | `plan`         | Read, Glob, Grep, Bash              | Edit, Write     | なし                             |
| improve | `acceptEdits`  | Read, Edit, Glob, Grep              | Write           | Edit → skillTargetDir のみ       |

---

## 2. Hooks / 監査要件

### 2.1 SessionStart Hook

**発火タイミング**: SDK セッション開始時

**記録内容**:

| フィールド     | 型       | 説明                                                   |
| -------------- | -------- | ------------------------------------------------------ |
| sourceRoot     | string   | `.claude/skills/skill-creator/` の解決済み絶対パス     |
| manifestHash   | string   | `workflow-manifest.json` の SHA-256 ハッシュ（存在時） |
| resolvedPath   | string   | ManifestLoader が解決した manifest の実パス            |
| sessionId      | string   | SDK が発行するセッション ID                            |
| phase          | string   | 開始時の phase（plan / execute / verify / improve）    |
| timestamp      | string   | ISO 8601 タイムスタンプ                                |
| permissionMode | string   | 適用された permissionMode                              |
| allowedTools   | string[] | 適用された allowedTools                                |

**目的**: session provenance を固定し、どの skill-creator ソースから、どの permission 設定で実行されたかを追跡可能にする。

### 2.2 PreToolUse Hook

**発火タイミング**: ツール呼び出し前

**記録内容**:

| フィールド | 型     | 説明                                    |
| ---------- | ------ | --------------------------------------- |
| toolName   | string | 要求されたツール名                      |
| toolInput  | object | ツールに渡される入力パラメータ（要約）  |
| phase      | string | 現在の phase                            |
| decision   | string | `"allow"` / `"deny"`                    |
| reason     | string | 判定理由（deny 時は具体的な理由を記録） |

**処理フロー**:

1. `toolName` が `allowedTools` に含まれるか確認
2. `toolName` が `disallowedTools` に含まれるか確認
3. `canUseTool` が定義されている場合、入力パラメータで追加判定
4. 判定結果を audit event として記録
5. `allow` / `deny` を SDK に返却

**deny 時の動作**: SDK に deny を返し、UI 向け permission denial payload を生成する。

### 2.3 PostToolUse Hook

**発火タイミング**: ツール実行完了後

**記録内容**:

| フィールド | 型      | 説明               |
| ---------- | ------- | ------------------ |
| toolName   | string  | 実行されたツール名 |
| duration   | number  | 実行時間（ミリ秒） |
| success    | boolean | 実行成功 / 失敗    |
| phase      | string  | 現在の phase       |

**目的**: ツール実行のパフォーマンスと成功率を追跡する。

### 2.4 SessionEnd Hook

**発火タイミング**: SDK セッション終了時

**記録内容**:

| フィールド      | 型     | 説明                       |
| --------------- | ------ | -------------------------- |
| sessionId       | string | セッション ID              |
| phase           | string | 終了時の phase             |
| totalToolCalls  | number | ツール呼び出し総数         |
| denialCount     | number | permission denial 総数     |
| sessionDuration | number | セッション総時間（ミリ秒） |
| toolBreakdown   | object | ツール別の呼び出し回数     |

**目的**: セッション全体の統計を記録し、governance の有効性を事後分析可能にする。

---

## 3. 監査ペイロード構造

### 3.1 GovernanceAuditEvent 型定義

```typescript
/**
 * ガバナンス監査イベント
 * 全 Hook 共通の audit payload 構造
 */
export interface GovernanceAuditEvent {
  /** ISO 8601 タイムスタンプ */
  timestamp: string;

  /** SDK セッション ID */
  sessionId: string;

  /** 現在の skill-creator phase */
  phase: "plan" | "execute" | "verify" | "improve";

  /** イベント種別 */
  eventKind: "session_start" | "tool_request" | "tool_result" | "session_end";

  /** ツール名（tool_request / tool_result 時のみ） */
  toolName?: string;

  /** 判定結果（tool_request 時のみ） */
  decision?: "allow" | "deny";

  /** 判定理由 */
  reason?: string;

  /** session_start 時の provenance 情報 */
  provenance?: GovernanceProvenance;

  /** tool_result 時の実行情報 */
  toolResult?: {
    duration: number;
    success: boolean;
  };

  /** session_end 時のサマリー */
  sessionSummary?: {
    totalToolCalls: number;
    denialCount: number;
    sessionDuration: number;
    toolBreakdown: Record<string, number>;
  };
}

/**
 * セッション開始時の provenance 情報
 */
export interface GovernanceProvenance {
  /** skill-creator ソースルート */
  sourceRoot: string;

  /** manifest ハッシュ */
  manifestHash?: string;

  /** 解決済み manifest パス */
  resolvedPath?: string;

  /** 適用された permissionMode */
  permissionMode: string;

  /** 適用された allowedTools */
  allowedTools: string[];

  /** 適用された disallowedTools */
  disallowedTools?: string[];
}
```

### 3.2 ペイロード設計原則

1. **最小限の情報**: tool_request 時の `toolInput` は要約のみ記録し、ファイル内容全体は含めない
2. **構造化**: 全イベントが `GovernanceAuditEvent` 型に準拠し、パース可能
3. **不変性**: 記録済みイベントは変更不可（append-only）
4. **既存型との整合**: `SkillCreatorSdkEvent` / `SkillCreatorSdkPermissionDenial` と互換

---

## 4. 受入基準との対応

| AC   | 本 Phase での対応                                                            |
| ---- | ---------------------------------------------------------------------------- |
| AC-1 | Phase 別 `permissionMode` と tool 境界を 1.1-1.4 で定義                      |
| AC-2 | `allowedTools` / `disallowedTools` / `canUseTool` を 1.5 の一覧表で固定      |
| AC-3 | SessionStart / PreToolUse / PostToolUse / SessionEnd の要件を 2.1-2.4 で定義 |
| AC-4 | permission denial の UI 反映を 2.2 の deny 時動作で定義                      |
| AC-5 | provenance 記録を 2.1 / 3.1 で定義                                           |
| AC-6 | 全設計が動的読込を前提としており、固定化要素なし                             |

---

## 5. 非スコープ確認

- skill-creator 本文の固定化: **対象外**
- `.claude/skills/skill-creator/` の静的コピー作成: **対象外**
- ManifestLoader のコア読込ロジック変更: **対象外**
- session resume UI 本体（TASK-P0-08）: **対象外**
