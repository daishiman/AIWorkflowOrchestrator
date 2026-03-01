# Phase 2: 設計 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| Phase名    | 設計                                     |
| 前提Phase  | Phase 1（要件定義）                      |
| 後続Phase  | Phase 3（設計レビュー）                  |
| ステータス | 完了（2026-02-28）                       |
| 作成日     | 2026-02-28                               |
| 機能名     | ut-imp-ipc-handler-coverage-granular-001 |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| Issue      | #854                                     |

## 目的

Phase 1 で定義した要件を実現可能な構造に落とし込む。以下の3つのタスクを実行する:

1. カバレッジ集計スクリプトのアーキテクチャ設計
2. データモデル・インターフェース設計
3. Phase 7 判定ルールの文書構造設計

## 実行タスク

- **Task 1**: アーキテクチャ設計（モジュール分割・データフロー）
- **Task 2**: インターフェース・型定義設計
- **Task 3**: Phase 7 判定ルール文書・テンプレート構造設計

## 参照資料

| 参照資料             | パス                                                                                        | 内容                           |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 成果物       | `outputs/phase-1/requirements-definition.md`                                                | 機能要件・非機能要件           |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                                    | 各要件の検証基準               |
| Phase 1 スコープ定義 | `outputs/phase-1/scope-definition.md`                                                       | スコープ境界                   |
| skillHandlers.ts     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 対象ファイル（AST解析対象）    |
| カバレッジ基準       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値の定義           |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの参考             |
| IPC API契約          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:*` チャンネル契約       |
| Skill型契約          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型・戻り値・エラー契約         |
| IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証・登録ライフサイクル |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 異常系レスポンス仕様           |
| Main/IPC責務分離     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | サービス責務と依存関係設計     |
| IPC登録パターン      | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | 配線漏れ防止パターン           |
| タスクワークフロー   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題テーブルへの登録         |
| P41 記録             | `.claude/rules/06-known-pitfalls.md#P41`                                                    | v8 インライン関数カウント      |

## 抽出仕様の設計反映（SubAgent分担）

| SubAgent                          | 担当仕様書                                                           | 設計への反映項目                                          |
| --------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| SubAgent-A（品質/判定）           | `quality-requirements.md`, `architecture-implementation-patterns.md` | Rule-1〜4 の判定ロジック、閾値、テスト可能性基準          |
| SubAgent-B（IPC契約）             | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`                  | チャンネル名、引数/戻り値型、レポート出力インターフェース |
| SubAgent-C（セキュリティ/異常系） | `security-electron-ipc.md`, `error-handling.md`                      | sender検証、入力検証、CLI異常系メッセージと終了コード     |
| SubAgent-D（配線/責務分離）       | `arch-electron-services.md`, `arch-ipc-persistence.md`               | `register*Handlers` 連携とMain Process責務境界            |

## 実行手順

### Step 1: アーキテクチャ設計

#### モジュール構成

```
apps/desktop/scripts/
├── coverage-by-handler.ts          # メインスクリプト（CLI エントリポイント）
└── coverage-by-handler.test.ts     # ユニットテスト

# 内部モジュール構成（単一ファイル内）
coverage-by-handler.ts
├── [1] HandlerDetector        # AST解析によるハンドラ境界検出
├── [2] CoverageParser         # v8 カバレッジ JSON 解析
├── [3] CoverageCalculator     # ハンドラ単位カバレッジ算出
├── [4] Phase7Judge            # Phase 7 判定ルール適用
└── [5] ReportFormatter        # JSON/Markdown レポート出力
```

#### データフロー図

```
入力:
  ┌─────────────────────────┐   ┌──────────────────────────┐
  │ TypeScript ソースファイル │   │ v8 カバレッジ JSON        │
  │ (skillHandlers.ts)       │   │ (coverage-final.json)    │
  └──────────┬──────────────┘   └──────────┬───────────────┘
             │                              │
             ▼                              ▼
  ┌──────────────────┐          ┌──────────────────────┐
  │ HandlerDetector  │          │ CoverageParser       │
  │ (ts-morph AST)   │          │ (JSON読み込み)       │
  └──────────┬───────┘          └──────────┬───────────┘
             │                              │
             │  HandlerInfo[]               │  V8CoverageData
             ▼                              ▼
         ┌──────────────────────────────────────┐
         │ CoverageCalculator                   │
         │ (ハンドラ境界 × カバレッジデータ突合)  │
         └──────────────────┬───────────────────┘
                            │
                            │  HandlerCoverage[]
                            ▼
              ┌─────────────────────────┐
              │ Phase7Judge             │
              │ (Rule-1〜4 判定)        │
              └─────────┬───────────────┘
                        │
                        │  JudgmentResult
                        ▼
              ┌─────────────────────────┐
              │ ReportFormatter         │
              │ (JSON / Markdown 出力)  │
              └─────────────────────────┘

出力:
  ┌──────────────────┐  ┌──────────────────────┐
  │ JSON レポート     │  │ Markdown レポート     │
  └──────────────────┘  └──────────────────────┘
```

#### AST解析によるハンドラ検出アルゴリズム

`ipcMain.handle()` コールを検出するための手順:

1. ts-morph で対象ファイルの AST を生成
2. `CallExpression` ノードを全走査
3. `ipcMain.handle` をコール先とする式を抽出
4. 第1引数（チャンネル名文字列または `IPC_CHANNELS.*` 定数参照）を解決
5. 第2引数（コールバック関数）の開始行・終了行を記録
6. `IPC_CHANNELS` 定数の場合は定数定義元を辿ってチャンネル名文字列を取得

### Step 2: インターフェース・型定義設計

#### コアデータモデル

```typescript
/** ハンドラの境界情報（AST解析結果） */
interface HandlerInfo {
  /** IPCチャンネル名（例: "skill:remove"） */
  channel: string;
  /** ハンドラコールバックの開始行（1-indexed） */
  startLine: number;
  /** ハンドラコールバックの終了行（1-indexed） */
  endLine: number;
  /** 登録関数名（例: "registerSkillHandlers"） */
  registrationGroup: string;
}

/** v8 カバレッジデータの解析結果 */
interface V8CoverageData {
  /** ファイルパス */
  filePath: string;
  /** 行ごとのヒットカウント（0-indexed配列、値は実行回数） */
  lineHits: number[];
  /** 関数カバレッジ情報 */
  functions: V8FunctionCoverage[];
  /** 分岐カバレッジ情報 */
  branches: V8BranchCoverage[];
}

/** v8 関数カバレッジ */
interface V8FunctionCoverage {
  /** 関数名（匿名の場合は空文字列） */
  functionName: string;
  /** 開始行（1-indexed） */
  startLine: number;
  /** 終了行（1-indexed） */
  endLine: number;
  /** 実行回数 */
  count: number;
}

/** v8 分岐カバレッジ */
interface V8BranchCoverage {
  /** 分岐の開始行（1-indexed） */
  line: number;
  /** 分岐タイプ（"if", "switch", "ternary", "logical"） */
  type: string;
  /** 各分岐の実行回数 */
  locations: { count: number }[];
}

/** ハンドラ単位のカバレッジ計算結果 */
interface HandlerCoverage {
  /** IPCチャンネル名 */
  channel: string;
  /** ハンドラの開始行 */
  startLine: number;
  /** ハンドラの終了行 */
  endLine: number;
  /** 登録関数名 */
  registrationGroup: string;
  /** 行カバレッジ */
  lines: CoverageMetric;
  /** 関数カバレッジ */
  functions: CoverageMetric;
  /** 分岐カバレッジ */
  branches: CoverageMetric;
}

/** カバレッジ指標 */
interface CoverageMetric {
  /** 総数 */
  total: number;
  /** カバー済み数 */
  covered: number;
  /** カバレッジ率（0-100） */
  pct: number;
}

/** Phase 7 判定結果 */
interface JudgmentResult {
  /** 総合判定 */
  verdict: "PASS" | "FAIL";
  /** 適用されたルール */
  appliedRules: AppliedRule[];
  /** 修正対象ハンドラのカバレッジ */
  targetHandlerCoverage: HandlerCoverage | null;
  /** ファイル全体のカバレッジ */
  fileCoverage: {
    lines: CoverageMetric;
    functions: CoverageMetric;
    branches: CoverageMetric;
  };
  /** 未カバーハンドラ一覧（Rule-3 用） */
  uncoveredHandlers: string[];
}

/** 適用されたルールの詳細 */
interface AppliedRule {
  /** ルールID */
  ruleId: "Rule-1" | "Rule-2" | "Rule-3" | "Rule-4";
  /** ルール名 */
  ruleName: string;
  /** 判定結果 */
  result: "PASS" | "FAIL" | "N/A";
  /** 判定理由 */
  reason: string;
}
```

#### CLI インターフェース設計

```typescript
/** スクリプト実行オプション */
interface CoverageByHandlerOptions {
  /** 対象の TypeScript ソースファイルパス */
  sourceFile: string;
  /** v8 カバレッジ JSON ファイルパス */
  coverageJsonPath: string;
  /** 修正対象ハンドラのチャンネル名（Phase 7 判定用、省略可） */
  targetHandler?: string;
  /** 出力フォーマット（デフォルト: "both"） */
  outputFormat?: "json" | "markdown" | "both";
  /** カバレッジ基準（デフォルト: quality-requirements.md の値） */
  thresholds?: {
    lines: number; // デフォルト: 80
    functions: number; // デフォルト: 80
    branches: number; // デフォルト: 60
  };
}
```

#### 公開関数インターフェース

```typescript
/**
 * ハンドラ単位のカバレッジを計算する（メイン関数）
 * テストからも呼び出し可能な純粋関数として設計
 */
export function calculateHandlerCoverage(
  options: CoverageByHandlerOptions,
): Promise<{
  handlers: HandlerCoverage[];
  judgment: JudgmentResult | null;
  report: { json: string; markdown: string };
}>;

/**
 * TypeScript AST からハンドラ境界を検出する
 */
export function detectHandlers(sourceFilePath: string): HandlerInfo[];

/**
 * v8 カバレッジ JSON を解析する
 */
export function parseCoverageJson(
  coverageJsonPath: string,
  targetFilePath: string,
): V8CoverageData;

/**
 * ハンドラ境界とカバレッジデータを突合してハンドラ単位カバレッジを算出する
 */
export function computeHandlerCoverage(
  handlers: HandlerInfo[],
  coverageData: V8CoverageData,
): HandlerCoverage[];

/**
 * Phase 7 判定ルールを適用する
 */
export function judgePhase7(
  handlerCoverages: HandlerCoverage[],
  targetHandler: string,
  thresholds: { lines: number; functions: number; branches: number },
): JudgmentResult;
```

### Step 3: Phase 7 判定ルール文書構造設計

#### `quality-requirements.md` への追記構造

```markdown
## Phase 7 ハンドラ単位カバレッジ判定ルール

### 適用条件

- 修正対象ファイルが複数の IPC ハンドラを含む場合に適用
- 単一ハンドラのみのファイルでは従来のファイル全体基準を使用

### 判定ルール

| ルールID | ルール名 | 条件 | 判定 |
| Rule-1 | ... | ... | PASS |
| Rule-2 | ... | ... | PASS |
| Rule-3 | ... | ... | 必須対応 |
| Rule-4 | ... | ... | 必須 |

### カバレッジ集計スクリプトの使用方法

[実行コマンド例]

### Phase 7 レポートテンプレート

[テンプレート構造]
```

#### Phase 7 テンプレートへの追加セクション

```markdown
### ハンドラ単位カバレッジレポート

#### 対象ファイル: `[ファイルパス]`

| ハンドラ (チャンネル) | Lines | Functions | Branches | 判定 |
| --------------------- | ----- | --------- | -------- | ---- |
| [チャンネル名]        | XX%   | XX%       | XX%      | -    |
| **[修正対象]**        | XX%   | XX%       | XX%      | PASS |

#### Phase 7 判定結果

- **総合判定**: PASS / FAIL
- **適用ルール**: Rule-X（理由）
- **未カバーハンドラ**: [ハンドラ一覧]（→ Phase 12 未タスク化対象）
```

### Step 4: P41 対策設計

v8 カバレッジプロバイダのインライン関数カウント問題（P41）への対策:

1. **Function カバレッジの算出方法**: ハンドラ内のインライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）は、v8 が独立関数としてカウントする。集計スクリプトでは以下の方針を採用する:
   - v8 の関数カウントをそのまま使用する（v8 の動作に合わせる）
   - レポートに「P41注記: v8 はインライン関数を独立カウントする」旨の注記を追加
   - 判定時は、修正対象ハンドラの全関数が実行されているかを重視し、インライン関数の未実行は Rule-2 の許容対象に含めない

2. **Branch カバレッジの算出方法**: v8 の分岐データは行ベースで提供されるため、ハンドラ境界（startLine〜endLine）でフィルタリングして算出する

### Step 5: エラーハンドリング設計

| エラーケース                       | エラーメッセージ                                                    | 復帰方法       |
| ---------------------------------- | ------------------------------------------------------------------- | -------------- |
| ソースファイルが存在しない         | `Source file not found: {path}`                                     | 処理中断       |
| カバレッジ JSON が存在しない       | `Coverage JSON not found: {path}. Run tests with --coverage first.` | 処理中断       |
| カバレッジ JSON のフォーマット不正 | `Invalid coverage JSON format: {details}`                           | 処理中断       |
| 対象ファイルのカバレッジが未収集   | `No coverage data for file: {path}`                                 | 空レポート出力 |
| AST 解析でハンドラ未検出           | `No ipcMain.handle() calls found in: {path}`                        | 空レポート出力 |
| 修正対象ハンドラが見つからない     | `Target handler not found: {channel}`                               | 判定スキップ   |
| ts-morph パース失敗                | `Failed to parse TypeScript file: {path}: {error}`                  | 処理中断       |

## 統合テスト連携

### テスト戦略との統合

| 統合ポイント             | 設計上の考慮点                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Vitest v8 カバレッジ出力 | `coverage/coverage-final.json` のスキーマが Vitest バージョンで変化する可能性がある。v8 フォーマットのバージョン検出を実装 |
| ts-morph バージョン      | TypeScript バージョンとの互換性を確認。`tsconfig.json` の `target` 設定に依存しない解析を実装                              |
| モノレポパス解決（P40）  | カバレッジ JSON 内のファイルパスは絶対パスで記録される。`sourceFile` との突合時にパス正規化を実施                          |
| CI 環境                  | CI 上でもパスが一致するよう、相対パス変換ロジックを実装                                                                    |

### IPC ハンドラ検出パターン

`skillHandlers.ts` における4つの登録関数グループを正しく検出する:

| グループ                        | 検出対象                 | ハンドラ数 |
| ------------------------------- | ------------------------ | ---------- |
| `registerSkillHandlers`         | スキル管理・改善ハンドラ | 14         |
| `registerSkillScheduleHandlers` | スケジュール管理         | 5          |
| `registerSkillDocsHandlers`     | ドキュメント生成         | 4          |

## 多角的チェック観点

| 観点                     | チェック項目                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| モジュール分割の妥当性   | 単一ファイル内の関数分割は単一責務を満たしているか。将来的なファイル分割が容易な構造か      |
| インターフェースの安定性 | 公開関数のシグネチャが将来の拡張（他ファイル対応、新ルール追加）に耐えうるか                |
| v8 JSON フォーマット     | Vitest のバージョンアップで v8 カバレッジ JSON のフォーマットが変わった場合の対応策があるか |
| AST 解析の堅牢性         | `ipcMain.handle()` 以外のパターン（`ipcMain.on()` 等）への将来的な拡張が可能か              |
| P41 対策の十分性         | インライン関数の扱いが Phase 7 判定結果に不当な影響を与えないか                             |
| 型定義の完全性           | 全てのインターフェースが `strict: true` でコンパイル可能か。`any` 型が含まれていないか      |
| エラーハンドリング網羅性 | 全エラーケースに対して明確なメッセージと復帰方法が定義されているか                          |

## 成果物

| 成果物               | パス                                     | 説明                              |
| -------------------- | ---------------------------------------- | --------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | モジュール構成・データフロー      |
| API仕様書            | `outputs/phase-2/api-specification.md`   | インターフェース・型定義・CLI仕様 |

## 完了条件

- [ ] モジュール構成が定義され、各モジュールの責務が明確である
- [ ] データフロー図が作成され、入力→処理→出力の流れが可視化されている
- [ ] 全てのコアデータモデル（HandlerInfo, V8CoverageData, HandlerCoverage, JudgmentResult）の型定義が完成している
- [ ] CLI インターフェース（CoverageByHandlerOptions）が定義されている
- [ ] 公開関数のシグネチャが定義され、テストから呼び出し可能な設計である
- [ ] P41 対策の設計方針が文書化されている
- [ ] エラーハンドリングの全ケースが定義されている
- [ ] Phase 7 判定ルール文書・テンプレートの構造が設計されている
- [ ] 成果物が全て作成されている

## サブタスク管理

| サブタスク                                          | 担当           | 依存関係    | 状態   |
| --------------------------------------------------- | -------------- | ----------- | ------ |
| Task 1: アーキテクチャ設計                          | AIエージェント | Phase 1完了 | 未実施 |
| Task 2: インターフェース・型定義設計                | AIエージェント | Task 1      | 未実施 |
| Task 3: Phase 7判定ルール文書・テンプレート構造設計 | AIエージェント | Phase 1完了 | 未実施 |
| Step 4: P41対策設計                                 | AIエージェント | Task 1, 2   | 未実施 |
| Step 5: エラーハンドリング設計                      | AIエージェント | Task 1, 2   | 未実施 |

## タスク100%実行確認【必須】

- [ ] Task 1〜3 および Step 4〜5 の全てが完了している
- [ ] 成果物2件の全てが指定パスに出力されている
- [ ] 完了条件チェックリストの全項目がチェック済みである
- [ ] 次の Phase（Phase 3）に進むために必要な情報が全て揃っている

## 次のPhase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
