# SafetyGate 実装ガイド

## Part 1: 概念説明（中学生レベル）

### SafetyGate とは? --- 「映画館の年齢制限チェック係」に例えると

映画館に行くと、チケットを買う前に「この映画は何歳から見れるか」をチェックする係の人がいますよね。SafetyGate はまさにこの「チェック係」です。

スキル（自動化プログラム）を実行する前に、チェック係が「このスキルは安全に動くかどうか」を事前に判定します。映画のレーティングと同じように、チェック係は複数の観点から調べて、最終的に3段階の判定を下します。

### 1. SafetyGate の役割（何をチェックするのか）

映画館のチェック係が「暴力シーンがあるか」「怖い表現があるか」を調べるように、SafetyGate はスキルが使おうとしている「ツール（道具）」と「アクセスするフォルダ」を調べます。

- そのスキルが使うツールは危険ではないか?
- そのスキルがアクセスするフォルダは立入禁止エリアではないか?

この2つの観点から、スキルを実行しても大丈夫かどうかを判定します。

### 2. 3段階のグレード --- 日常のどの状況に対応するか

| グレード           | 映画館での例え                                 | 意味                                   |
| ------------------ | ---------------------------------------------- | -------------------------------------- |
| SAFE               | 「全年齢OK、誰でも見て大丈夫!」                | 全てのチェックに合格。安全に実行可能   |
| SAFE_WITH_WARNINGS | 「保護者と一緒なら見て大丈夫」（注意事項あり） | 一部注意点あり。確認しながら実行は可能 |
| UNSAFE             | 「18歳未満お断り。入場禁止!」                  | 危険なツールや禁止エリアあり。実行不可 |

### 3. 5種類のチェック --- 何を検査するか

映画のレーティングでも「暴力描写」「性的表現」「言語」「薬物」「恐怖表現」のように複数の観点でチェックしますよね。SafetyGate も5種類の観点でチェックします。

| チェック名             | 映画館での例え                                     | 検査内容                                       |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------- |
| CRITICAL_TOOL_REQUIRED | 「この映画は上映禁止レベル」                       | 最も危険な（critical）ツールが含まれていないか |
| HIGH_TOOL_REQUIRED     | 「R指定。保護者同伴が必要」                        | 危険度の高い（high）ツールが含まれていないか   |
| NO_PERMANENT_APPROVAL  | 「初回は必ず身分証を見せてね」                     | 中・低リスクツールに恒久許可が出ているか       |
| ALL_LOW_TOOLS          | 「全年齢OK作品です!」                              | 全てのツールが低リスク（low）かどうか          |
| PROTECTED_PATH_ACCESS  | 「関係者以外立入禁止エリアに入ろうとしていないか」 | 保護対象フォルダにアクセスしようとしていないか |

### 4. Grade 集約ルール --- なぜ最もキビしい結果を採用するのか

映画のレーティングを想像してください。ある映画に「暴力シーンは全年齢OK」「でも言語表現はR指定」の2つの評価があったら、最終判定はどうなるでしょう? 当然、キビしい方の「R指定」が最終レーティングになりますよね。

SafetyGate も同じです。5つのチェック結果のうち、1つでも「blocked（入場禁止）」があれば全体が UNSAFE になります。blocked がなくても「warned（注意）」があれば SAFE_WITH_WARNINGS になります。全部「passed（合格）」のときだけ SAFE です。

安全性は「一番弱い部分」で決まります。鎖の強さが一番弱い輪で決まるのと同じ考え方です。

### 5. DI（依存性注入）の意味 --- なぜ具体的なサービスに直接依存しないのか

映画館のチェック係は、映画の内容を自分で見て判断するのではなく、「映画情報カード」を受け取って判断しますよね。チェック係自身が映画を作ったり、映画データベースを管理したりはしません。

SafetyGate も同じで、「ツール情報を調べる係（metadataProvider）」と「許可状態を管理する係（permissionStore）」を外から受け取ります。これを DI（依存性注入）と呼びます。

この仕組みのメリットは:

- **テストが簡単**: チェック係に「テスト用の映画情報カード」を渡せば、本物の映画データベースがなくてもテストできる
- **差し替え可能**: 映画情報カードの形式さえ同じなら、情報の出どころは何でもOK
- **責任が明確**: チェック係は「判定」だけに集中できる。情報収集は別の係の仕事

---

## Part 2: 開発者向け技術詳細

### 2-1. 型定義と API シグネチャ

実装の中核となる3つのインターフェースを以下に示す。型定義は `packages/shared/src/types/safety-gate.ts` に配置されている。

```typescript
/**
 * SafetyGatePort インターフェース（変更禁止）
 * DI 境界として機能し、DefaultSafetyGate の具象クラスはこのポートを実装する
 */
interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}

/**
 * SafetyGateResult 構造
 * evaluate() の戻り値。スキル名・評価時刻・総合グレード・個別チェック結果を含む
 */
interface SafetyGateResult {
  skillName: string;
  overallGrade: SafetyGrade; // "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"
  details: SafetyCheckDetail[];
  evaluatedAt: number; // Unix timestamp (ms)
}

/**
 * SafetyCheckDetail 構造
 * 5種の SafetyCheckId ごとに生成される個別チェック結果
 */
interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  toolName: string;
  riskLevel: ToolRiskLevel; // "critical" | "high" | "medium" | "low"
  status: "blocked" | "warned" | "passed";
  message: string;
}
```

補助型定義:

```typescript
type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";

type ToolRiskLevel = "critical" | "high" | "medium" | "low";
```

### 2-2. DefaultSafetyGate の使用例

DefaultSafetyGate は Constructor Injection パターンで依存オブジェクトを受け取る。依存は `DefaultSafetyGateDeps` インターフェースにまとめられている。

```typescript
import { DefaultSafetyGate } from "../permissions/default-safety-gate";
import type { IPermissionStore } from "@repo/shared";

// DefaultSafetyGateDeps インターフェース
interface DefaultSafetyGateDeps {
  permissionStore: IPermissionStore;
  metadataProvider: SkillMetadataProvider;
  protectedPaths: readonly string[];
}

// Constructor Injection によるインスタンス化
const safetyGate = new DefaultSafetyGate({
  permissionStore, // IPermissionStore 実装
  metadataProvider, // SkillMetadataProvider 実装
  protectedPaths: ["/etc", "/usr/bin", "/System"], // 保護パス一覧
});

// evaluate() 呼び出し
const result = await safetyGate.evaluate("my-skill");
console.log(result.overallGrade); // "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"
console.log(result.details); // SafetyCheckDetail[]
console.log(result.evaluatedAt); // 1710600000000 (Unix timestamp ms)
```

`SkillMetadataProvider` インターフェース:

```typescript
interface ToolInfo {
  name: string;
  riskLevel: ToolRiskLevel;
}

interface SkillMetadataProvider {
  getRequiredTools(skillName: string): Promise<ToolInfo[]>;
  getAccessPaths(skillName: string): Promise<string[]>;
}
```

### 2-3. IPC 経由での利用方法

Renderer プロセスから Preload API 経由で SafetyGate を呼び出す。IPC チャンネルは `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` で定義されている。

```typescript
// Renderer から Preload API 経由で呼び出し
const result = await window.electronAPI.skill.evaluateSafety("my-skill");

if (result.success) {
  const { overallGrade, details } = result.data;
  // overallGrade に応じた UI 表示
} else {
  // result.error.code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "INTERNAL_ERROR"
  // result.error.message: エラーメッセージ
}
```

IPC ハンドラ（`safetyGateHandlers.ts`）は以下の3ステップで処理を行う:

1. **送信元検証**: `event.sender !== mainWindow.webContents` で不正送信元を拒否（UNAUTHORIZED）
2. **P42 準拠 3段バリデーション**: `typeof skillName !== "string"` → `skillName === ""` → `skillName.trim() === ""`（VALIDATION_ERROR）
3. **SafetyGate 実行**: `safetyGate.evaluate(skillName)` を呼び出し、結果を `{ success: true, data: result }` で返却。エラー時はサニタイズして返却

### 2-4. 5種の SafetyCheckId と評価結果対応表

| SafetyCheckId          | blocked 条件                               | warned 条件                                      | passed 条件              |
| ---------------------- | ------------------------------------------ | ------------------------------------------------ | ------------------------ |
| CRITICAL_TOOL_REQUIRED | critical リスクレベルのツールが1つ以上存在 | -                                                | critical ツールなし      |
| HIGH_TOOL_REQUIRED     | -                                          | high リスクレベルのツールが1つ以上存在           | high ツールなし          |
| NO_PERMANENT_APPROVAL  | -                                          | medium/low ツールで恒久許可（isToolAllowed）なし | 全ツールに恒久許可あり   |
| ALL_LOW_TOOLS          | -                                          | -                                                | 全ツールが low リスク    |
| PROTECTED_PATH_ACCESS  | アクセスパスが保護パス配下に一致           | -                                                | 保護パスへのアクセスなし |

補足:

- CRITICAL_TOOL_REQUIRED: critical ツールごとに1件の blocked 結果を生成する
- HIGH_TOOL_REQUIRED: high ツールごとに1件の warned 結果を生成する
- NO_PERMANENT_APPROVAL: `permissionStore.isToolAllowed(toolName)` が false の medium/low ツールごとに1件の warned 結果を生成する
- ALL_LOW_TOOLS: 全ツールが low の場合のみ、toolName=`"*"` で1件の passed 結果を生成する
- PROTECTED_PATH_ACCESS: パス正規化（末尾スラッシュ除去）後、完全一致またはプレフィックス一致で判定する

### 2-5. Grade 集約ルール

`calculateOverallGrade` は details 配列の status フィールドを走査し、最もキビしい結果を採用する。

```typescript
private calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
  // 優先度: UNSAFE > SAFE_WITH_WARNINGS > SAFE
  if (details.some((d) => d.status === "blocked")) {
    return "UNSAFE";
  }
  if (details.some((d) => d.status === "warned")) {
    return "SAFE_WITH_WARNINGS";
  }
  return "SAFE";
}
```

判定フロー:

1. details 内に `status === "blocked"` が1件でもあれば `"UNSAFE"` を返す
2. blocked がなく `status === "warned"` が1件でもあれば `"SAFE_WITH_WARNINGS"` を返す
3. blocked も warned もなければ `"SAFE"` を返す

### 2-6. エラーハンドリング

IPC ハンドラ層で発生するエラーとその対応を以下に示す。

| エラーケース             | IPC エラーコード | 発生箇所     | 挙動                                                        |
| ------------------------ | ---------------- | ------------ | ----------------------------------------------------------- |
| 不正な送信元             | UNAUTHORIZED     | IPC ハンドラ | `event.sender !== mainWindow.webContents` で即座に拒否      |
| skillName が非文字列     | VALIDATION_ERROR | IPC ハンドラ | `typeof skillName !== "string"` で即座に reject             |
| skillName が空文字列     | VALIDATION_ERROR | IPC ハンドラ | `skillName === ""` で即座に reject                          |
| skillName がスペースのみ | VALIDATION_ERROR | IPC ハンドラ | `skillName.trim() === ""` で即座に reject（P42 準拠）       |
| スキルが存在しない       | SKILL_NOT_FOUND  | evaluate()   | metadataProvider が reject → エラーコードをそのまま返却     |
| 内部エラー               | INTERNAL_ERROR   | evaluate()   | 予期しない例外 → サニタイズ後に返却（内部情報を漏洩しない） |

エラーレスポンス形式:

```typescript
// エラー時のレスポンス構造
{
  success: false,
  error: {
    code: string,   // "VALIDATION_ERROR" | "UNAUTHORIZED" | "SKILL_NOT_FOUND" | "INTERNAL_ERROR"
    message: string  // サニタイズ済みメッセージ
  }
}
```

エラーサニタイズの実装: 例外オブジェクトが `code` と `message` プロパティを持つ場合はそれらを使用し、持たない場合は `INTERNAL_ERROR` / `"Safety evaluation failed"` にフォールバックする。`in` 演算子と `typeof` による実行時型検証を使用している（P49 準拠）。

### 2-7. テスト時のモック差し替え方法

SafetyGatePort はインターフェースであるため、テスト時に容易にモックに差し替えられる。

```typescript
import { vi } from "vitest";
import type { SafetyGatePort, SafetyGateResult } from "@repo/shared";

// SafetyGatePort のモックを作成
const mockSafetyGate: SafetyGatePort = {
  evaluate: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    overallGrade: "SAFE",
    details: [
      {
        checkId: "ALL_LOW_TOOLS",
        toolName: "*",
        riskLevel: "low",
        status: "passed",
        message: "全ツールが低リスクです",
      },
    ],
    evaluatedAt: Date.now(),
  } satisfies SafetyGateResult),
};

// IPC ハンドラのテストで使用
registerSafetyGateHandlers(mockMainWindow, mockSafetyGate);
```

UNSAFE ケースのモック:

```typescript
const mockUnsafeSafetyGate: SafetyGatePort = {
  evaluate: vi.fn().mockResolvedValue({
    skillName: "dangerous-skill",
    overallGrade: "UNSAFE",
    details: [
      {
        checkId: "CRITICAL_TOOL_REQUIRED",
        toolName: "rm",
        riskLevel: "critical",
        status: "blocked",
        message:
          'ツール "rm" は critical リスクレベルのため使用がブロックされました',
      },
    ],
    evaluatedAt: Date.now(),
  } satisfies SafetyGateResult),
};
```

DefaultSafetyGate 自体のテストでは、依存オブジェクトをモック化する:

```typescript
const mockPermissionStore: IPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
};

const mockMetadataProvider: SkillMetadataProvider = {
  getRequiredTools: vi.fn().mockResolvedValue([
    { name: "readFile", riskLevel: "low" },
    { name: "executeCommand", riskLevel: "high" },
  ]),
  getAccessPaths: vi.fn().mockResolvedValue(["/home/user/project"]),
};

const safetyGate = new DefaultSafetyGate({
  permissionStore: mockPermissionStore,
  metadataProvider: mockMetadataProvider,
  protectedPaths: ["/etc", "/usr/bin"],
});

const result = await safetyGate.evaluate("test-skill");
expect(result.overallGrade).toBe("SAFE_WITH_WARNINGS");
```
