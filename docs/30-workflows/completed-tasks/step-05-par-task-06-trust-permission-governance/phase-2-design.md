# Phase 2: 設計 - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目           | 内容                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| タスクID       | TASK-SKILL-LIFECYCLE-06                                                                                |
| Phase          | 2                                                                                                      |
| Phase名        | 設計                                                                                                   |
| ステータス     | not_started                                                                                            |
| 依存成果物     | `phase-1-requirements.md`（同ディレクトリ）                                                            |
| ブロック対象   | `phase-3-design-review.md`、TASK-SKILL-LIFECYCLE-08 の公開前安全性ゲート                               |
| 前提タスク成果 | TASK-SKILL-LIFECYCLE-03（runtime routing 契約）、TASK-SKILL-LIFECYCLE-05（CTA 画面・ScoringGate 契約） |

---

## 目的

PermissionResolver・PermissionStore・承認履歴の既存実装を土台として、以下の4つの設計空白を埋める。

1. リスクレベル別の権限要求 UI 表現を確定する
2. 承認永続化の失効・取り消しポリシーを定義する
3. Task-03/05 の実行導線に説明責任 UI をどの位置で差し込むかを確定する
4. Task-08（スキル公開）に渡す安全性チェック契約のインターフェースを定義する

---

## Agent Team 編成

| ロール     | 担当範囲                                                      |
| ---------- | ------------------------------------------------------------- |
| Lead       | 設計統括・concern topology 定義・Task-08 契約インターフェース |
| SubAgent-A | リスクレベル分類と権限要求 UI ワイヤーフレーム設計            |
| SubAgent-B | 承認永続化・失効・取り消し・拒否時 fallback 設計              |

---

## 実行タスク

- 設計境界の固定: concern topology と既存契約を照合し、変更対象を確定する
- 設計成果物の確定: 権限・失効・説明責任・SafetyGate の仕様を成果物化する

### Task 1: Concern topology と契約境界の固定

### Task 2: 権限モデル・失効・説明責任UI・SafetyGate契約の設計

1. concern ごとの target topology を table 化する
2. リスクレベル分類とそれに対応する権限要求 UI 表現を設計する
3. 承認永続化の失効ポリシー（時間ベース・バージョンベース）と取り消し UI フローを設計する
4. Task-03/05 の実行導線に組み込む説明責任 UI 挿入点を設計する
5. 権限拒否時の fallback / retry / abort フローを設計する
6. Task-08 に渡す安全性チェック契約インターフェースを定義する

---

## 参照資料

### ローカル参照

| 資料名                   | パス                                                                                                  | 読む理由                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`（同ディレクトリ）                                                           | 受入基準 AC-1〜AC-4 の確認        |
| Task-03 Phase 2 設計     | `../../../completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/phase-2-design.md`          | preflight/permission 挿入点の前提 |
| Task-05 Phase 2 設計     | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md` | CTA 画面・ScoringGate 契約の確認  |
| Task-08 Phase 1 要件定義 | `../step-06-seq-task-08-skill-publishing-version-compatibility/phase-1-requirements.md`               | 公開前安全性ゲート要件の確認      |

### システム仕様参照

| 資料名                                | パス                                                                                                                | 読む理由                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| aiworkflow resource-map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                    | 抽出順序と対象仕様の確定                   |
| security-skill-execution              | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | DANGEROUS_PATTERNS・リスクレベル体系の確認 |
| security-api-electron                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                        | IPC境界と Permission 経路の安全性確認      |
| interfaces-agent-sdk-executor-details | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | PermissionResolver 8ステップフローの確認   |
| arch-state-management-permissions     | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | permissionHistorySlice の型定義確認        |
| ui-ux-settings                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                               | Permission History Panel の UI 仕様確認    |
| ui-ux-agent-execution                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                        | PermissionDialog/streaming 表示責務確認    |
| workflow-skill-lifecycle-04           | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`             | ScoringGate と evaluatePrompt 契約確認     |
| workflow-skill-lifecycle-05           | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`         | CTA導線と PostExecutionActionBar 接続確認  |

---

## aiworkflow-requirements 抽出セット（設計フェーズ）

| Lane         | 抽出した仕様                                                                                                     | 固定する契約                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Lane-A: UI   | `ui-ux-agent-execution.md`, `ui-ux-settings.md`, `workflow-skill-lifecycle-created-skill-usage-journey.md`       | PermissionDialog 表示・INS-01/03・CTA接続  |
| Lane-B: 永続 | `interfaces-agent-sdk-executor-details.md`, `arch-state-management-reference-permissions-import-lifecycle.md`    | PermissionResolver/Persistence/History拡張 |
| Lane-C: 統合 | `security-skill-execution.md`, `security-api-electron.md`, `workflow-skill-lifecycle-evaluation-scoring-gate.md` | リスク判定・ScoringGate連動・公開前判定    |

---

## 設計方針

### 基本方針

- 既存の `PermissionResolver`・`PermissionStore`・`permissionHistorySlice` を**破壊しない**。拡張のみ行う
- リスクレベルは `security-skill-execution.md` の DANGEROUS_PATTERNS を正本とし、UI 表現を追加する形で拡張する
- 失効ポリシーは `AllowedToolEntry` に `expiresAt?: number` フィールドを追加することで実現する（既存エントリとの後方互換を維持）
- Task-03/05 への説明責任 UI 挿入は「既存 CTA 画面への表示追加」に限定し、新規画面遷移は追加しない
- Task-08 との契約インターフェースは型定義のみを設計フェーズで確定し、実装は Phase 5 で行う

### 設計禁止事項

- `PermissionResolver.DEFAULT_TIMEOUT_MS`（300000ms）の変更禁止
- `permissionHistorySlice.PERMISSION_HISTORY_MAX_ENTRIES`（1000件）の変更禁止
- `ALLOWED_TOOLS_WHITELIST`（11ツール）への追加・削除禁止（Task-08 でのスコープ）

---

## 実行手順

### ステップ 1: concern ごとの target topology 定義

concern を3レーンに分類し、各 concern の対象レイヤ・既存コンポーネント・今回追加する設計要素を確定する。

#### Concern Target Topology

| Concern                         | Lane         | 対象レイヤ                     | 既存コンポーネント                                            | 今回追加する設計要素                                   |
| ------------------------------- | ------------ | ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------ |
| リスクレベル分類と UI 表現      | Lane-A: UI   | Renderer Process               | `toolMetadata.ts`、`PermissionDialog`                         | リスクレベル別ダイアログ表現設計、操作前警告バナー設計 |
| 承認永続化・失効・取り消し      | Lane-B: 永続 | Main Process + Renderer        | `PermissionStore`（electron-store）、`permissionHistorySlice` | `expiresAt` フィールド拡張設計、取り消し UI フロー設計 |
| 説明責任 UI・公開前安全性ゲート | Lane-C: 統合 | Renderer + Main + Task-08 契約 | Task-05 CTA 画面、Task-03 runtime routing                     | 説明責任表示挿入点設計、`SafetyGateContract` 型定義    |

---

### ステップ 2: リスクレベル分類と権限要求 UI 表現設計

#### 2-1. リスクレベル定義（既存 security-skill-execution.md を正本とし UI 表現を追加）

| リスクレベル | 対象操作（抜粋）                                                   | ダイアログ表現                                 | ヘッダー背景色トークン         | 「今回のみ許可」表示 | 「恒久許可」表示 | 自動拒否                                    |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------ | -------------------- | ---------------- | ------------------------------------------- |
| Critical     | `rm -rf`・`sudo`・`curl\|sh`・フォークボム                         | モーダル全画面（640px 幅、blur backdrop）      | `--status-destructive`（赤系） | 非表示               | 非表示           | SKILL_EXECUTOR_AUTO_DENY=ON（設定で変更可） |
| High         | `chmod 777`・`chown root`・`eval`・`exec`・`source`・`bash -c`     | モーダル（480px 幅）+ 警告バナー               | `--status-warning`（橙系）     | 表示                 | 非表示           | OFF                                         |
| Medium       | `Write`・`Edit`・`crontab`・`at`                                   | モーダル（400px 幅）                           | `--status-caution`（黄系）     | 表示                 | 表示             | OFF                                         |
| Low          | `Read`・`Glob`・`Grep`・`LS`・`WebSearch`・`WebFetch`・`TodoWrite` | インライン確認（トーストまたはミニダイアログ） | `--status-info`（青系）        | 表示                 | 表示             | OFF                                         |

#### 2-2. PermissionDialog ワイヤーフレーム（テキスト表現）

```
┌──────────────────────────────────────────────────────────┐
│ [リスクバッジ: High ▲]  ツール使用の許可を求めています  │  ← ヘッダー（背景色はリスクレベルで変化）
├──────────────────────────────────────────────────────────┤
│ スキル名: {skillName}                                    │
│ ツール: {toolName}                                       │
│ 引数プレビュー:                                          │
│   {argsSnapshot（最大200文字）}                          │
│                                                          │
│ ⚠️ セキュリティ影響:                                     │  ← toolMetadata.ts の影響テキスト
│   {securityImpact}                                       │
├──────────────────────────────────────────────────────────┤
│ 承認スコープ:                                            │  ← リスクHighのみ表示
│   ○ 今回のセッションのみ                                 │  ← approve_once
│   ● このスキルに対して常に許可                          │  ← approve（Medium以上でのみ）
├──────────────────────────────────────────────────────────┤
│            [拒否]          [許可する]                    │
└──────────────────────────────────────────────────────────┘
```

Critical レベルの場合は「承認スコープ」セクションが非表示となり、ボタンが「[拒否]」のみになる（自動拒否設定が OFF の場合は「[今回のみ許可]」を追加表示）。

#### 2-3. ToolRiskLevel 型定義（新規追加）

```typescript
// packages/shared/src/constants/security.ts に追加
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

export interface ToolRiskConfig {
  level: ToolRiskLevel;
  allowApproveOnce: boolean; // 「今回のみ許可」を表示するか
  allowPermanent: boolean; // 「恒久許可」を表示するか
  autoDenyDefault: boolean; // デフォルトで自動拒否するか（ユーザー設定で変更可能）
  headerColorToken: string; // CSS変数トークン名
  dialogWidth: 400 | 480 | 640; // ダイアログ幅（px）
}

export const TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig> = {
  critical: {
    level: "critical",
    allowApproveOnce: false,
    allowPermanent: false,
    autoDenyDefault: true,
    headerColorToken: "--status-destructive",
    dialogWidth: 640,
  },
  high: {
    level: "high",
    allowApproveOnce: true,
    allowPermanent: false,
    autoDenyDefault: false,
    headerColorToken: "--status-warning",
    dialogWidth: 480,
  },
  medium: {
    level: "medium",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-caution",
    dialogWidth: 400,
  },
  low: {
    level: "low",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-info",
    dialogWidth: 400,
  },
};
```

---

### ステップ 3: 承認永続化・失効・取り消し設計

#### 3-1. AllowedToolEntry 拡張（後方互換維持）

```typescript
// 既存型（変更なし）
interface AllowedToolEntry {
  toolName: string;
  allowedAt: number; // Unix timestamp (ms)
}

// 拡張型（既存エントリは expiresAt が undefined → 失効なし として扱う）
interface AllowedToolEntryV2 extends AllowedToolEntry {
  expiresAt?: number; // Unix timestamp (ms)。undefined = 無期限
  skillName?: string; // スキル名。undefined = 全スキルに適用
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}
```

#### 3-2. 失効ポリシー定義

| ポリシー名  | 値             | 失効タイミング                                  | 適用条件                                  |
| ----------- | -------------- | ----------------------------------------------- | ----------------------------------------- |
| `session`   | `approve_once` | アプリ終了時（electron-store には書き込まない） | PermissionDialog の「今回のみ許可」選択時 |
| `time_24h`  | `approve_temp` | `allowedAt + 86400000ms` 経過後                 | 設定画面で「24時間有効」選択時            |
| `time_7d`   | `approve_week` | `allowedAt + 604800000ms` 経過後                | 設定画面で「1週間有効」選択時             |
| `permanent` | `approve_all`  | 明示的に取り消すまで有効                        | PermissionDialog の「常に許可」選択時     |

#### 3-3. PermissionStore 失効チェックフロー

```
isToolAllowed(toolName, skillName?) を呼び出した時:
  1. electron-store から AllowedToolEntryV2 を取得
  2. entry が存在しない → false を返す
  3. entry.expiresAt が undefined → true を返す（無期限）
  4. entry.expiresAt < Date.now() → electron-store から削除 → false を返す
  5. entry.skillName が定義されており skillName と不一致 → false を返す
  6. それ以外 → true を返す
```

#### 3-4. 取り消し UI フロー（Permission History Panel 拡張）

```
┌─ Permission History Panel（既存） ──────────────────────────┐
│ フィルタ: [ツール名▼] [判断結果▼] [期間▼]                  │
├──────────────────────────────────────────────────────────────┤
│ Bash  chmod 777 /tmp/x  [approved ●]  2026-03-16 14:23      │
│                         [取り消す ×]                        │  ← 新規追加ボタン
│                                                              │
│ Read  ~/.env             [approved ●]  2026-03-16 13:45      │
│                         [取り消す ×]                        │
│ ...                                                          │
│                                         [全て取り消す]      │  ← 既存の clearAll を起動
└──────────────────────────────────────────────────────────────┘
```

取り消しボタンをクリックした時:

1. `PermissionStore.revokeTool(toolName)` を IPC 経由で呼び出す
2. `permissionHistorySlice` の該当エントリに `revokedAt: number` フィールドを追加して履歴を保持する（削除はしない）
3. バッジ表示を `approved` → `revoked`（灰色）に変更する

```typescript
// 取り消し後のバッジ色定義（追加）
type PermissionDecisionExtended = PermissionDecision | "revoked";
// バッジ色: revoked = var(--text-secondary)（灰色）
```

---

### ステップ 4: 説明責任 UI 挿入点設計

Task-03 runtime routing と Task-05 CTA 画面への説明責任表示の挿入点を3箇所に限定する。

#### 4-1. 挿入点 topology

| 挿入点 ID | 挿入先画面               | タイミング                               | 表示要素                                                                  | 表示条件                                          |
| --------- | ------------------------ | ---------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| INS-01    | Task-05 CTA 画面         | スキル実行前（「今すぐ使う」ボタン上部） | 要求される権限サマリーバナー（ツール名とリスクレベル）                    | スキルが High/Critical ツールを1件以上含む場合    |
| INS-02    | Task-03 Agent 実行中画面 | PermissionDialog 表示前                  | 「権限確認中...」インジケーター（既存ストリーミング UI の一部として表示） | PermissionResolver.pendingCount > 0 の場合        |
| INS-03    | Task-05 実行結果画面     | 実行完了後                               | 実行中に承認した権限のサマリー（ツール名・判断結果・回数）                | 実行セッション中に1件以上の権限承認が発生した場合 |

#### 4-2. INS-01: 権限サマリーバナーのワイヤーフレーム（テキスト表現）

```
┌─ CTA 画面（「今すぐ使う」の上部に追加） ──────────────────────┐
│ ⚠️ このスキルは次の権限を要求する可能性があります:            │
│   • Bash（High） • Write（Medium）                           │
│   実行時に権限確認ダイアログが表示されます。                  │
│                           [権限の詳細を見る ▼]               │  ← 折りたたみ展開
│ ─────────────────────────────────────────────────────────── │
│                [今すぐ使う]   [保存して後で使う]             │
└─────────────────────────────────────────────────────────────┘
```

#### 4-3. INS-03: 実行後権限サマリーのワイヤーフレーム（テキスト表現）

```
┌─ 実行結果画面（実行ログ下部に追加） ─────────────────────────┐
│ 実行中の権限承認:                                            │
│   Bash × 2回（今回のみ）  Write × 1回（常に許可）           │
│                           [権限設定を確認する →]             │  ← Permission History Panel へ遷移
└─────────────────────────────────────────────────────────────┘
```

---

### ステップ 5: 権限拒否時の fallback / retry / abort フロー設計

#### 5-1. 状態遷移図（テキスト表現）

```
[PermissionDialog 表示]
        |
        ├─ [許可] ──────────────────────────→ SkillExecutor 処理続行
        |
        ├─ [拒否] ──────────────────────────→ [拒否後オプション画面]
        |                                            |
        |                                            ├─ [スキルを中断する] → abort フロー ①
        |                                            ├─ [この操作をスキップして続行] → skip フロー ②
        |                                            └─ [別の方法で実行する] → retry フロー ③
        |
        └─ [タイムアウト（300秒）] ─────────→ abort フロー ① （自動）
```

#### 5-2. フロー詳細定義

| フロー ID | フロー名 | SkillExecutor への指示                                    | UI 表示                                            | `permissionHistorySlice` 記録       |
| --------- | -------- | --------------------------------------------------------- | -------------------------------------------------- | ----------------------------------- |
| ①         | abort    | `PermissionResolver.cancelAll()` → 実行中止エラーを返す   | 「スキルを中断しました」トーストを表示             | `decision: "denied"` を記録         |
| ②         | skip     | SkillExecutor に `{ approved: false, skip: true }` を返す | 「この操作をスキップしました」インラインメッセージ | `decision: "denied"` を記録         |
| ③         | retry    | PermissionDialog を再表示（最大3回まで）                  | 「再度確認してください」バナーを表示               | `decision: "denied"` を初回のみ記録 |

#### 5-3. abort 時のクリーンアップ契約

```typescript
// SkillExecutor が abort を受けた時の処理順序
async function onAbort(sessionId: string): Promise<void> {
  // 1. PermissionResolver.cancelAll() で全待機中リクエストをキャンセル
  // 2. セッション中の一時的な approve_once エントリを PermissionStore から削除
  // 3. 実行ログに abort イベントを記録（タイムスタンプ・理由）
  // 4. Renderer に skill:execution:aborted IPC イベントを送信
}
```

---

### ステップ 6: Task-08 公開前安全性チェック契約インターフェース設計

#### 6-1. SafetyGateContract 型定義

```typescript
// packages/shared/src/types/safety-gate.ts（新規ファイル）

/** Task-06 → Task-08 に渡す安全性チェック結果 */
export interface SafetyGateResult {
  skillName: string;
  evaluatedAt: number; // Unix timestamp (ms)
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

export type SafetyGrade =
  | "SAFE" // 全チェック通過。公開可能
  | "SAFE_WITH_WARNINGS" // 警告あり。ユーザー確認後に公開可能
  | "UNSAFE"; // 公開不可（Critical ツール要求が承認済みでも公開不可）

export interface SafetyCheckDetail {
  checkId: string; // 例: "DANGEROUS_PATTERN_FOUND"
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "passed" | "warned" | "blocked";
  message: string; // ユーザー向けメッセージ（曖昧表現禁止）
}

/** Task-08 が Task-06 に問い合わせる安全性チェック関数の契約 */
export interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}
```

#### 6-2. 安全性チェックルール定義

| チェック ID              | 判定条件                                                                              | Grade への影響           |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------ |
| `CRITICAL_TOOL_REQUIRED` | スキルが Critical ツール（`rm -rf` 等）を要求する                                     | → UNSAFE（公開ブロック） |
| `HIGH_TOOL_REQUIRED`     | スキルが High ツール（`Bash` 等）を要求するが Critical ではない                       | → SAFE_WITH_WARNINGS     |
| `NO_PERMANENT_APPROVAL`  | 実行に必要なツールがいずれも恒久許可されていない（全て approve_once or session のみ） | → SAFE_WITH_WARNINGS     |
| `ALL_LOW_TOOLS`          | スキルが要求するツールが全て Low リスク                                               | → SAFE                   |
| `PROTECTED_PATH_ACCESS`  | スキルが `PROTECTED_PATHS` に該当するパスへの Write/Edit を要求する                   | → UNSAFE（公開ブロック） |

---

## 統合テスト連携

| テスト種別  | テスト対象                                | 確認内容                                                                                       |
| ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Unit        | `ToolRiskConfig` 定義                     | 全4レベルで `allowApproveOnce`・`allowPermanent`・`autoDenyDefault` が正しく設定されていること |
| Unit        | `AllowedToolEntryV2` 失効チェックロジック | `expiresAt < Date.now()` の時 `false` を返し、electron-store から削除されること                |
| Unit        | `SafetyGateResult.evaluate()`             | CRITICAL_TOOL_REQUIRED で `UNSAFE`、HIGH_TOOL_REQUIRED で `SAFE_WITH_WARNINGS` を返すこと      |
| Integration | PermissionDialog × ToolRiskConfig         | Critical ツールのダイアログで「恒久許可」ボタンが非表示になること                              |
| Integration | abort フロー ① × PermissionStore          | abort 後に approve_once エントリが削除されていること                                           |

---

## 多角的チェック観点

| 観点         | チェック内容                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| セキュリティ | Critical ツールに対して恒久許可を絶対に与えない設計になっているか（TOOL_RISK_CONFIG.critical.allowPermanent === false） |
| UX           | 権限拒否後の fallback オプション（abort/skip/retry）がユーザーに明示的に提示されるか                                    |
| 後方互換性   | `AllowedToolEntryV2` の `expiresAt?: number` が optional のため既存エントリが破壊されないか                             |
| Task-08 接続 | `SafetyGatePort.evaluate()` が async で定義されており、Task-08 の公開フローが非同期チェックを待機できるか               |
| Task-03 接続 | INS-02（権限確認中インジケーター）が既存ストリーミング UI を破壊しないか                                                |
| Task-05 接続 | INS-01（権限サマリーバナー）が ScoringGate の USE_ALLOWED 判定とトリガー条件が整合しているか                            |
| テスト容易性 | `SafetyGatePort` がインターフェースとして定義されており、テスト時にモックを注入できるか                                 |

---

## サブタスク管理

| ID   | 担当       | 内容                                                          | 依存       |
| ---- | ---------- | ------------------------------------------------------------- | ---------- |
| ST-1 | Lead       | concern target topology 作成（ステップ 1）                    | -          |
| ST-2 | SubAgent-A | リスクレベル分類・ToolRiskConfig 型定義（ステップ 2）         | ST-1       |
| ST-3 | SubAgent-A | PermissionDialog ワイヤーフレーム設計（ステップ 2）           | ST-2       |
| ST-4 | SubAgent-B | AllowedToolEntryV2 拡張・失効ポリシー定義（ステップ 3）       | ST-1       |
| ST-5 | SubAgent-B | 取り消し UI フロー設計（ステップ 3）                          | ST-4       |
| ST-6 | SubAgent-A | 説明責任 UI 挿入点設計（ステップ 4）                          | ST-2       |
| ST-7 | SubAgent-B | 拒否時 fallback/retry/abort フロー設計（ステップ 5）          | ST-4       |
| ST-8 | Lead       | SafetyGateContract 型定義・安全性チェックルール（ステップ 6） | ST-2, ST-4 |

---

## 成果物

成果物はすべて `outputs/phase-2/` 配下に配置する。

| 成果物ファイル名                                   | 説明                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `outputs/phase-2/risk-level-design.md`             | リスクレベル分類・TOOL_RISK_CONFIG 型定義・ダイアログワイヤーフレーム |
| `outputs/phase-2/permission-persistence-design.md` | AllowedToolEntryV2・失効ポリシー・取り消し UI フロー                  |
| `outputs/phase-2/accountability-ui-design.md`      | 説明責任 UI 挿入点（INS-01〜03）のワイヤーフレームと発火条件          |
| `outputs/phase-2/abort-fallback-design.md`         | 拒否時 fallback/retry/abort フロー・クリーンアップ契約                |
| `outputs/phase-2/safety-gate-contract.md`          | SafetyGateResult・SafetyGatePort 型定義・安全性チェックルール一覧     |

---

## 完了条件

- [ ] concern target topology（3レーン）が table 化されている
- [ ] ToolRiskLevel / ToolRiskConfig 型定義が全4レベルで定義されている
- [ ] PermissionDialog ワイヤーフレーム（Critical/High/Medium/Low 各レベル）が設計されている
- [ ] AllowedToolEntryV2 の `expiresAt` 拡張と既存エントリとの後方互換が明記されている
- [ ] 失効ポリシー4種（session/time_24h/time_7d/permanent）が定義されている
- [ ] 取り消し UI フロー（`revokedAt` フィールド追加・バッジ変更）が設計されている
- [ ] 説明責任 UI 挿入点 INS-01〜INS-03 の挿入先・タイミング・表示条件が定義されている
- [ ] 拒否時 fallback フロー①②③が SkillExecutor への指示内容まで定義されている
- [ ] abort 時クリーンアップ契約（4ステップ）が定義されている
- [ ] SafetyGateResult / SafetyGatePort 型定義が確定されている
- [ ] 安全性チェックルール5件（CRITICAL_TOOL_REQUIRED 等）が判定条件・Grade 影響まで定義されている
- [ ] 成果物5ファイルが `outputs/phase-2/` 配下に存在する

---

## タスク100%実行確認【必須】

Phase 2 設計の成果を Phase 3 設計レビューに渡す前に、以下を逐次確認する。

- [ ] 全5成果物ファイルが `outputs/phase-2/` 配下に存在することを `ls` で確認した
- [ ] `SafetyGatePort` インターフェースが async メソッドとして定義されていることを確認した
- [ ] `TOOL_RISK_CONFIG.critical.allowPermanent === false` かつ `allowApproveOnce === false` であることを確認した
- [ ] `AllowedToolEntryV2.expiresAt` が `optional` フィールドであることを確認した（既存エントリの後方互換）
- [ ] 説明責任 UI 挿入点が新規画面遷移を追加していないことを確認した（既存画面への表示追加のみ）
- [ ] Task-03/05/08 との接続インターフェースに曖昧語が残っていないことを確認した

---

## 次 Phase

**Phase 3: 設計レビュー** (`phase-3-design-review.md`)

Phase 3 開始条件: 本ファイルの「完了条件」チェックリストが全項目 CHECKED であること。

Phase 3 でのレビュー観点（事前通知）:

- AC-1（危険操作の権限境界）: `TOOL_RISK_CONFIG.critical` の `allowPermanent=false` が AC-1 を充足するか
- AC-2（承認履歴と取り消し方針）: `AllowedToolEntryV2` + 取り消し UI フローが AC-2 を充足するか
- AC-3（実行導線への説明責任）: INS-01〜INS-03 の3挿入点が AC-3 を充足するか
- AC-4（公開前安全性ゲート接続）: `SafetyGatePort.evaluate()` が AC-4 を充足するか
