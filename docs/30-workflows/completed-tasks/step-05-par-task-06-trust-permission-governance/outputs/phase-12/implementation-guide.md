# 実装ガイド: 信頼・権限・ガバナンス統合（TASK-SKILL-LIFECYCLE-06）

作成日: 2026-03-16
対象フェーズ: Phase 12 ドキュメント

---

## Part 1: 中学生レベルの概念説明

### なぜ権限管理が必要か（中学生向け）

スマートフォンに新しいアプリをインストールするとき、「このアプリはあなたの写真にアクセスしていいですか？」という確認画面が出ることがあります。あれが「権限管理」です。

AIのスキルも同じです。スキルはあなたのパソコン上で動くプログラムで、ファイルを読んだり書いたり、コマンドを実行したりすることができます。もし何も確認せずに全部許可してしまったら、大切なファイルを消されたり、知らない場所にデータを送られてしまうかもしれません。

だから「このスキルがこの操作をしていいですか？」と毎回確認する仕組みが必要です。それがこのシステムの仕事です。

---

### 1. ToolRiskLevel（リスクレベル）: スマホのアプリ権限に例えると

スマホのアプリが「何ができるか」によって危険度が違うのと同じように、スキルが使うツール（操作）にも4段階の危険度があります。

```
危険度マップ
============================================================
[Low]      安全     「写真の一覧を見る」だけ
           例: Read（ファイルを読む）, Grep（検索する）
           → 確認ダイアログを出すが「ずっと許可」も選べる

[Medium]   少し注意 「位置情報を1回だけ使う」
           例: Bash（コマンドを実行する）, ファイル書き込み
           → 確認ダイアログを出す。「ずっと許可」も選べる

[High]     要注意   「連絡先を全部読む」
           例: 任意の場所へのファイル書き込み, chmod
           → 確認ダイアログを出す。「今回だけ」しか許可できない

[Critical] 危険     「全データを消去する」「外部にデータを送る」
           例: 保護されたパス（~/.ssh/）への書き込み
           → 確認ダイアログすら出ない。自動で拒否する
============================================================
```

**重要なポイント**: Critical（危険）ツールは「今回だけ許可」も「ずっと許可」もできません。システムが自動で拒否します。これはセキュリティ上の絶対ルールです。

---

### 2. AllowedToolEntryV2（承認）: 友だちにゲームコントローラーを渡すとき

友だちがゲームコントローラーを使いたいとき、どのくらい貸すか決めますよね。

| 選択肢      | ゲームのたとえ           | システムでの意味             |
| ----------- | ------------------------ | ---------------------------- |
| `session`   | 「今日だけ使っていいよ」 | アプリを閉じるまで有効       |
| `time_24h`  | 「明日まで使っていいよ」 | 24時間後に自動で取り消し     |
| `time_7d`   | 「1週間使っていいよ」    | 7日後に自動で取り消し        |
| `permanent` | 「いつでも使っていいよ」 | 自分で取り消すまでずっと有効 |

Low・Medium のツールは4種類全部選べます。High のツールは「今日だけ（session）」しか選べません。Critical のツールはどれも選べません（自動拒否）。

---

### 3. SafetyGatePort（安全ゲート）: 映画の年齢制限チェック係

映画館の入口に「R指定（18歳以上）」の映画を確認する人がいますよね。スキルをみんなに公開する前にも、同じような「チェック係」が必要です。

SafetyGate（安全ゲート）は、スキルを公開する前に「このスキルは安全ですか？」を自動でチェックする係です。

チェック結果は3段階です:

- **SAFE（安全）**: 問題なし。そのまま公開できます
- **SAFE_WITH_WARNINGS（警告あり）**: 少し危ないけど、確認すれば公開できます
- **UNSAFE（危険）**: 問題あり。修正するまで公開できません

---

### 4. INS-01〜03（説明責任UI）: ATMの操作確認画面

ATMでお金を引き出すとき、「1万円を引き出します。よろしいですか？」という確認画面が出ます。操作の前・中・後に「今何をしているか」を教えてくれる仕組みです。

| 番号   | 場面               | ATMのたとえ                             | 表示されるもの                             |
| ------ | ------------------ | --------------------------------------- | ------------------------------------------ |
| INS-01 | 実行前（CTA画面）  | 「この操作には暗証番号が必要です」      | 危険なツールを使うスキルの警告バナー       |
| INS-02 | 実行中             | 「処理中です...しばらくお待ちください」 | 権限の確認を待機中のスピナー表示           |
| INS-03 | 実行後（結果画面） | 「明細：1万円を引き出しました」         | このセッション中に許可・拒否した権限の履歴 |

これによって「スキルが何をしたか」があとから確認できます。

---

### 5. fallback（abort/skip/retry）: 電車が遅延したとき

電車に乗ろうとしたら遅延していました。さて、どうしますか？

| 選択肢              | 電車のたとえ                           | システムでの意味                   |
| ------------------- | -------------------------------------- | ---------------------------------- |
| `retry`（もう一度） | 「もう少し待ってみる」（最大3回）      | もう一度権限ダイアログを表示する   |
| `skip`（スキップ）  | 「この電車はあきらめて別の路線で行く」 | この操作だけ飛ばして続きを実行する |
| `abort`（中止）     | 「今日は外出をやめて家に帰る」         | スキルの実行を全て停止する         |

優先順位は「abort > skip > retry」です。abort（中止）が発生したら、skipもretryも途中でやめます。

---

## Part 2: 開発者向け実装詳細

### 2-1. 型定義一覧

#### security.ts（`packages/shared/src/constants/security.ts` へ追加）

```typescript
/**
 * ツール操作のリスクレベル分類。
 *
 * | レベル   | 典型ツール例                      | デフォルト動作           |
 * | -------- | --------------------------------- | ------------------------ |
 * | critical | 保護パスへの書き込み、ネットワーク | 自動拒否（承認不可）     |
 * | high     | 任意パスへのファイル書き込み      | ダイアログ表示（一時のみ）|
 * | medium   | ファイル読み取り、Bash 実行       | ダイアログ表示（恒久可）  |
 * | low      | テキスト変換、計算                | ダイアログ表示（恒久可）  |
 */
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

export interface ToolRiskConfig {
  level: ToolRiskLevel;
  /** 「今回のみ許可」ボタンをダイアログに表示するか */
  allowApproveOnce: boolean;
  /** 「常に許可（恒久許可）」ボタンをダイアログに表示するか */
  allowPermanent: boolean;
  /**
   * デフォルトで自動拒否するか。
   * true の場合、PermissionDialog を表示せずに decision: "denied" を返す。
   */
  autoDenyDefault: boolean;
  /** ダイアログヘッダー背景色の CSS 変数トークン名（形式: "--status-xxx"） */
  headerColorToken: string;
  /** ダイアログ幅（px）: Critical=640, High=480, Medium/Low=400 */
  dialogWidth: 400 | 480 | 640;
}

/**
 * 不変条件（TC-T-001 で検証）:
 * - critical.allowPermanent === false
 * - critical.allowApproveOnce === false
 * - critical.autoDenyDefault === true
 */
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

#### permission-store-interface.ts（`apps/desktop/src/main/permissions/` へ追加）

```typescript
/** 既存型（変更なし。破壊禁止）。 */
export interface AllowedToolEntry {
  toolName: string;
  allowedAt: number; // Unix timestamp (ms)
}

/**
 * 拡張型。既存の AllowedToolEntry に失効情報を追加。
 *
 * 後方互換性ルール:
 * - expiresAt が undefined の既存エントリは「無期限有効」として扱う
 * - skillName が undefined のエントリは「全スキルに適用」として扱う
 * - expiryPolicy が undefined の既存エントリは "permanent" として扱う
 */
export interface AllowedToolEntryV2 extends AllowedToolEntry {
  /** 失効タイムスタンプ（Unix ms）。undefined = 無期限 */
  expiresAt?: number;
  /** 適用対象スキル名。undefined = 全スキルに適用 */
  skillName?: string;
  /** 失効ポリシー種別 */
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}

/**
 * PermissionStore の公開メソッド仕様。
 *
 * isToolAllowed 6分岐フロー:
 * 1. entry が存在しない → false
 * 2. expiresAt === undefined → true（無期限有効）
 * 3. expiresAt < Date.now() → electron-store から削除して false（失効）
 * 4. expiresAt >= Date.now() → true（有効期限内）
 * 5. skillName が定義されており呼び出し時の skillName と不一致 → false
 * 6. それ以外（全条件クリア）→ true
 */
export interface PermissionStoreInterface {
  isToolAllowed(toolName: string, skillName?: string): boolean;
  allowTool(entry: AllowedToolEntryV2): void;
  revokeTool(toolName: string): void;
  revokeAll(): void;
  revokeSessionEntries(sessionId: string): void;
  getAllowedTools(): AllowedToolEntryV2[];
}

/**
 * 失効ポリシー別 expiresAt 計算関数（TC-ST-002 の検証対象）。
 *
 * | ポリシー  | expiresAt 計算式        |
 * | --------- | ----------------------- |
 * | session   | undefined               |
 * | time_24h  | allowedAt + 86_400_000  |
 * | time_7d   | allowedAt + 604_800_000 |
 * | permanent | undefined               |
 */
export function calcExpiresAt(
  policy: NonNullable<AllowedToolEntryV2["expiryPolicy"]>,
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      return undefined;
    case "time_24h":
      return allowedAt + 86_400_000;
    case "time_7d":
      return allowedAt + 604_800_000;
    case "permanent":
      return undefined;
  }
}

/** 承認履歴の最大保持件数（超過時は最古エントリを FIFO 削除）。 */
export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;
```

#### safety-gate.ts（`apps/desktop/src/main/permissions/` へ追加）

```typescript
import type { ToolRiskLevel } from "../constants/security";

/**
 * 公開前安全性チェックの総合グレード。
 * 優先度: UNSAFE > SAFE_WITH_WARNINGS > SAFE
 */
export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

/**
 * 安全性チェック ID の種別。
 *
 * | チェックID               | 期待 overallGrade  | 判定条件                                  |
 * | ------------------------ | ------------------ | ----------------------------------------- |
 * | CRITICAL_TOOL_REQUIRED   | UNSAFE             | Critical ツールを1件以上要求する          |
 * | PROTECTED_PATH_ACCESS    | UNSAFE             | PROTECTED_PATHS に Write/Edit を要求する  |
 * | HIGH_TOOL_REQUIRED       | SAFE_WITH_WARNINGS | High ツールを要求するが Critical ではない |
 * | NO_PERMANENT_APPROVAL    | SAFE_WITH_WARNINGS | 全ツールが session or approve_once のみ   |
 * | ALL_LOW_TOOLS            | SAFE               | 全ツールが Low リスク                     |
 */
export type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";

export interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "passed" | "warned" | "blocked";
  /** 曖昧表現禁止。具体的な操作・パス・理由を含める。 */
  message: string;
}

export interface SafetyGateResult {
  skillName: string;
  evaluatedAt: number; // Unix ms
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

/**
 * 安全性チェック関数の契約インターフェース（TC-T-005 の検証対象）。
 * Task-08 は本インターフェースを通じて Task-06 の安全性チェックを呼び出す。
 */
export interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}
```

---

### 2-2. 安全性チェックルール一覧

| チェックID               | 判定条件                                                            | Grade 影響             | 実装時注意                                                      |
| ------------------------ | ------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| `CRITICAL_TOOL_REQUIRED` | `skill.requiredTools` に Critical ツールが1件以上                   | → `UNSAFE`             | `DANGEROUS_PATTERNS` 正規表現（`rm -rf`、`sudo` 等）でも検出    |
| `PROTECTED_PATH_ACCESS`  | `PROTECTED_PATHS`（`~/.ssh/` 等 25 パターン）への Write/Edit を要求 | → `UNSAFE`             | パスの前方一致チェック。末尾 `/` の有無を正規化してから比較する |
| `HIGH_TOOL_REQUIRED`     | High ツールを要求するが Critical は含まない                         | → `SAFE_WITH_WARNINGS` | Bash・chmod・chown・mv・cp などが対象                           |
| `NO_PERMANENT_APPROVAL`  | 全ツールが `session` または `approve_once` のみ（恒久許可なし）     | → `SAFE_WITH_WARNINGS` | `electron-store` に `permanent` エントリが存在するか確認        |
| `ALL_LOW_TOOLS`          | `skill.requiredTools` の全ツールが `low` リスク                     | → `SAFE`               | Read・Glob・Grep・テキスト変換系が該当                          |

**グレード集約ルール（TC-R-002 対応）**:

- `details` 内に `status: "blocked"` が1件以上 → `overallGrade = "UNSAFE"`
- `status: "blocked"` なし かつ `status: "warned"` が1件以上 → `overallGrade = "SAFE_WITH_WARNINGS"`
- 全チェックが `status: "passed"` → `overallGrade = "SAFE"`

---

### 2-3. 説明責任 UI 挿入ポイント

#### INS-01: リスク警告バナー（CTA 画面）

| 項目                 | 内容                                  |
| -------------------- | ------------------------------------- |
| 挿入先コンポーネント | Task-05 CTA 画面                      |
| 挿入位置             | ヘッダー下・スキル詳細上              |
| コンポーネント名     | `<RiskWarningBanner>`（organisms 層） |
| Atomic Design 層     | organisms                             |

**発火条件**:

```typescript
const shouldShowRiskBanner = skill.requiredTools.some(
  (tool) => TOOL_RISK_CONFIG[tool.riskLevel].dialogWidth >= 480,
);
// dialogWidth >= 480 は "high" または "critical" に対応
```

**非表示条件**: 全ツールが Medium/Low、または `requiredTools` が空配列

**表示コンテンツ**: `[警告アイコン] このスキルは高リスクツール（{ツール名リスト}）を使用します。` ツール名は最大3件、超過時は「他 N 件」と表示。

---

#### INS-02: 権限待機インジケーター（実行中画面）

| 項目                 | 内容                                           |
| -------------------- | ---------------------------------------------- |
| 挿入先コンポーネント | Task-03 スキル実行中画面                       |
| 挿入位置             | 実行ログエリア上部                             |
| コンポーネント名     | `<PermissionPendingIndicator>`（molecules 層） |
| ARIA                 | `role="status"`, `aria-live="polite"`          |

**発火条件**:

```typescript
// IPC チャンネル "permission:pending:count" から取得
const shouldShowPendingIndicator = permissionResolver.pendingCount > 0;
```

**非表示条件**: `permissionResolver.pendingCount === 0`（300ms フェードアウト）

**IPC 購読**: `permission:pending:updated` イベントを購読してリアルタイム更新。

---

#### INS-03: セッション権限履歴パネル（実行結果画面）

| 項目                 | 内容                                              |
| -------------------- | ------------------------------------------------- |
| 挿入先コンポーネント | Task-05 実行結果画面                              |
| 挿入位置             | 実行完了メッセージ下                              |
| コンポーネント名     | `<SessionPermissionHistoryPanel>`（organisms 層） |
| ARIA                 | `role="region"`, `aria-label="権限履歴"`          |

**発火条件**:

```typescript
const shouldShowHistory = sessionPermissionHistory.length > 0;
```

**非表示条件**: セッション中の権限承認・拒否が0件

**decision バッジ色**:

- `approved_once`: `--status-success`（緑）「今回のみ」
- `approved_permanent`: `--status-info`（青）「常に許可」
- `denied`: `--status-destructive`（赤）「拒否」

**恒久許可の取り消し**: `decision === "approved_permanent"` のエントリにのみ「取り消す」ボタンを表示。IPC チャンネル `permission:revoke` を呼び出す。

---

### 2-4. fallback フロー実装ガイド

#### abort フロー（4ステップ擬似コード）

```typescript
async function onAbort(sessionId: string): Promise<void> {
  // Step 1: 全待機中リクエストをキャンセル
  // permissionResolver が保持している pending な Promise を全て reject する。
  // reject 理由: new Error("PermissionAborted")
  await permissionResolver.cancelAll();

  // Step 2: セッション中の approve_once エントリを削除
  // expiryPolicy === "session" のエントリのみ削除する。
  // approved（恒久許可）エントリは削除しない。
  permissionStore.revokeSessionEntries(sessionId);

  // Step 3: 実行ログに abort イベントを記録
  executionLog.record({
    event: "aborted",
    reason: "permission_denied", // タイムアウト時は "timeout" で上書き
    timestamp: Date.now(),
  });

  // Step 4: Renderer に IPC イベントを送信
  // mainWindow が null の場合は Step 4 をスキップし、Steps 1-3 は実行する。
  mainWindow.webContents.send("skill:execution:aborted", { sessionId });
}
```

**事後条件**:

- `permissionResolver` の pending リクエストが0件になること
- `permissionStore` に `expiryPolicy: "session"` のエントリが0件になること
- `executionLog` に `event: "aborted"` のレコードが1件追記されること
- **冪等性**: 同一 `sessionId` で2回呼び出しても副作用なし

#### skip 契約

```typescript
const decision: PermissionDecision = {
  approved: false,
  skip: true, // abort ではなく後続処理を続行
};
```

- 当該ツール呼び出し: 実行しない（Claude SDK の tool_call に対して空結果を返す）
- 後続処理: 続行する（セッションは終了しない）
- 承認履歴: `decision: "denied"` を1件追記
- Renderer 通知: `skill:tool:skipped` イベントを送信

#### retry フロー（最大3回）

```typescript
export const MAX_PERMISSION_RETRY_COUNT = 3;
// 変更禁止定数: 変更する場合は TC-FL-003 のテスト期待値も更新すること。
```

```
1回目キャンセル → PermissionDialog を再表示（2回目）
2回目キャンセル → PermissionDialog を再表示（3回目）
3回目キャンセル → abort フロー（フロー 1）に自動移行
```

**承認履歴への記録**: 初回の `decision: "denied"` のみ1件追記する。2回目・3回目のキャンセルは追記しない（重複記録禁止）。

#### タイムアウト仕様

```typescript
export const DEFAULT_PERMISSION_TIMEOUT_MS = 300_000; // 5分
// セキュリティ要件として定義。変更する場合は Phase 3 設計レビューを再実施すること。
```

タイムアウト後は abort フロー（フロー 1）を自動実行する。retry フローには移行しない。retry 中にタイムアウトした場合は、カウンターをリセットして再計測する。

---

### 2-5. TASK-08 への接続手順

TASK-08（スキル公開）は `SafetyGatePort.evaluate()` を呼び出してブロック判定を行う。

#### 呼び出し方法

```typescript
// TASK-08 の公開処理コード（抜粋）
import type {
  SafetyGatePort,
  SafetyGateResult,
} from "../permissions/safety-gate";

class SkillPublishService {
  constructor(
    private readonly safetyGate: SafetyGatePort, // DI で注入
  ) {}

  async publishSkill(skillName: string): Promise<void> {
    // Step 1: 安全性チェックを実行
    const result: SafetyGateResult = await this.safetyGate.evaluate(skillName);

    // Step 2: gradeでブロック判定
    if (result.overallGrade === "UNSAFE") {
      // 公開をブロックし、details の blocked メッセージをユーザーに表示
      throw new PublishBlockedError(
        result.details.filter((d) => d.status === "blocked"),
      );
    }

    if (result.overallGrade === "SAFE_WITH_WARNINGS") {
      // 警告ダイアログを表示してユーザーに確認
      const confirmed = await showWarningDialog(
        result.details.filter((d) => d.status === "warned"),
      );
      if (!confirmed) return; // ユーザーがキャンセルした場合は中止
    }

    // Step 3: 公開処理を続行（SAFE または警告確認済み）
    await this.doPublish(skillName);
  }
}
```

#### キャッシュ利用（5分以内）

```typescript
// evaluatedAt が5分以内なら再評価を省略可能
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分
const isFresh = Date.now() - result.evaluatedAt < CACHE_TTL_MS;
if (!isFresh) {
  result = await this.safetyGate.evaluate(skillName);
}
```

#### テスト時のモック注入

```typescript
// テストファイル内で MockSafetyGate を inline 定義
const mockSafetyGate: SafetyGatePort = {
  evaluate: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    evaluatedAt: Date.now(),
    overallGrade: "SAFE",
    details: [],
  }),
};
const service = new SkillPublishService(mockSafetyGate);
```

---

### 2-6. API/CLIシグネチャ

#### APIシグネチャ（TypeScript）

```typescript
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

export interface PermissionStoreInterface {
  isToolAllowed(toolName: string, skillName?: string): boolean;
  allowTool(entry: AllowedToolEntryV2): void;
  revokeTool(toolName: string): void;
  revokeAll(): void;
  revokeSessionEntries(sessionId: string): void;
  getAllowedTools(): AllowedToolEntryV2[];
}

export interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}
```

#### CLIシグネチャ（証跡取得）

```bash
qlmanage -t -s 1600 -o <output-dir> <input-html>
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-dir>
```

### 2-7. 使用例

#### 使用例 1: 権限照会

```typescript
const allowed = permissionStore.isToolAllowed("Bash", "skill-lifecycle-06");
if (!allowed) {
  return { approved: false, skip: true };
}
```

#### 使用例 2: 公開前安全性チェック

```typescript
const result = await safetyGate.evaluate("skill-lifecycle-06");
if (result.overallGrade === "UNSAFE") {
  throw new Error("publish blocked by safety gate");
}
```

#### 使用例 3: Phase 11 画面証跡検証

```bash
WF=docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow "$WF"
```

### 2-8. エラーハンドリング

- `PermissionResolver.cancelAll()` が失敗した場合: `onAbort` 全体を失敗扱いにせず、失敗ログを `executionLog` に追記して Step 2 以降を継続する。
- `permissionStore.revokeSessionEntries()` が失敗した場合: `sessionId` と失敗件数をログに残し、Renderer へ `skill:execution:aborted` を送信して整合を優先する。
- `SafetyGatePort.evaluate()` が例外を送出した場合: 公開処理は fail-closed（公開中止）にする。
- 画面証跡生成で `qlmanage` が失敗した場合: `manual-test-result.md` を更新せず失敗として再実行する（部分更新禁止）。

### 2-9. エッジケース

- `riskLevel="critical"` かつ `allowApproveOnce=false`: PermissionDialog を表示せず `denied` を返す。
- `skillName` 未指定エントリ（互換データ）: 全スキル適用として `isToolAllowed` 判定する。
- `expiresAt` 未設定エントリ: 無期限有効として扱う。
- 同一 `sessionId` で `onAbort()` が複数回呼ばれた場合: 冪等に処理し、副作用を増やさない。
- `HIGH_TOOL_REQUIRED` と `NO_PERMANENT_APPROVAL` が同時成立する場合: `overallGrade` は `SAFE_WITH_WARNINGS` を維持する。

### 2-10. 設定項目と定数一覧

| 設定項目/定数                           | 値              | 用途                        |
| --------------------------------------- | --------------- | --------------------------- |
| `DEFAULT_PERMISSION_TIMEOUT_MS`         | `300_000`       | 権限確認タイムアウト（5分） |
| `MAX_PERMISSION_RETRY_COUNT`            | `3`             | retry 上限回数              |
| `PERMISSION_HISTORY_MAX_ENTRIES`        | `1000`          | 承認履歴のFIFO上限          |
| `CACHE_TTL_MS`                          | `5 * 60 * 1000` | SafetyGate 評価キャッシュ   |
| `TOOL_RISK_CONFIG.critical.dialogWidth` | `640`           | Critical ダイアログ幅       |
| `TOOL_RISK_CONFIG.high.dialogWidth`     | `480`           | High ダイアログ幅           |
| `TOOL_RISK_CONFIG.medium.dialogWidth`   | `400`           | Medium ダイアログ幅         |
| `TOOL_RISK_CONFIG.low.dialogWidth`      | `400`           | Low ダイアログ幅            |
