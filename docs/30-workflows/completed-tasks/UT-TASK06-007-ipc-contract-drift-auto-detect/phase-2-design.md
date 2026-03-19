# Phase 2: 設計 - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 2                                            |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

IPC契約ドリフト自動検出スクリプトのアーキテクチャ・データフロー・検出ルールを設計する。grepベースのパターンマッチでMainハンドラとPreload APIの契約を照合する仕組みを定義する。

## 実行タスク

- アーキテクチャ設計: スクリプトのモジュール構成と処理フローを設計
- 抽出パターン設計: Mainハンドラ・Preload API のgrep抽出パターンを定義
- 検出ルール設計: P44/P45/P60パターンを検出するルールセットを設計
- レポート形式設計: 不一致レポートのJSON/Markdown出力形式を設計
- CLIインターフェース設計: `--report-only` / `--strict` モードのCLI設計

## 参照資料

| 資料名           | パス                                                                                | 説明           |
| ---------------- | ----------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物   | `outputs/phase-1/requirements.md`                                                   | FR/NFR/AC定義  |
| 既存タスク指示書 | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect.md` | 推奨アプローチ |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                                        | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 既存の手動チェック手順 |
| セキュリティ-Electron IPC  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ設計    |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターンの正本  |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Phase 9品質ゲート基準  |

## 実行手順

### ステップ1: 処理フロー設計

```
入力:
  apps/desktop/src/main/handlers/**/*.ts  （Mainハンドラ定義）
  apps/desktop/src/preload/**/*.ts         （Preload API定義）
  apps/desktop/src/shared/ipc-channels.ts  （チャンネル定数）

処理フロー:
  ┌─────────────────────────────────────────┐
  │ 1. Extract: Mainハンドラ抽出            │
  │    rg "ipcMain\.handle" → チャンネル名  │
  │    + 引数型パターン（オブジェクト/直値） │
  ├─────────────────────────────────────────┤
  │ 2. Extract: Preload API抽出             │
  │    rg "safeInvoke" → チャンネル名       │
  │    + 渡す引数パターン                   │
  ├─────────────────────────────────────────┤
  │ 3. Match: チャンネル名でJOIN            │
  │    Main側 ∪ Preload側 の全チャンネル    │
  ├─────────────────────────────────────────┤
  │ 4. Validate: 検出ルール適用             │
  │    Rule-1: チャンネル存在確認           │
  │    Rule-2: 引数形式照合                 │
  │    Rule-3: バリデーションチェック       │
  ├─────────────────────────────────────────┤
  │ 5. Report: 結果出力                     │
  │    JSON/Markdown + exit code            │
  └─────────────────────────────────────────┘

出力:
  stdout: 不一致レポート（Markdown形式）
  exit 0: 整合（または --report-only モード）
  exit 1: 不一致検出（--strict モード）
```

### ステップ2: モジュール構成設計

スクリプトは単一ファイル `check-ipc-contracts.ts` に収め、内部を論理的なセクションに分割する。

```typescript
// ── 型定義 ──
interface HandlerEntry {
  channel: string; // チャンネル名（例: "skill:import"）
  file: string; // 定義ファイルパス
  line: number; // 行番号
  argPattern: "object" | "primitive" | "none" | "unknown";
  rawSignature: string; // 生の引数シグネチャ文字列
}

interface PreloadEntry {
  channel: string; // チャンネル名
  file: string; // 呼び出しファイルパス
  line: number; // 行番号
  argPattern: "object" | "primitive" | "none" | "unknown";
  rawArgs: string; // 生の引数文字列
}

interface DriftReport {
  timestamp: string;
  summary: {
    total: number;
    matched: number;
    drifted: number;
    orphaned: number;
  };
  drifts: DriftEntry[];
  orphans: OrphanEntry[];
}

interface DriftEntry {
  channel: string;
  rule: string; // 違反ルール名
  mainSide: { file: string; line: number; detail: string };
  preloadSide: { file: string; line: number; detail: string };
  severity: "error" | "warning";
}

interface OrphanEntry {
  channel: string;
  side: "main-only" | "preload-only";
  file: string;
  line: number;
}
```

### ステップ3: 抽出パターン設計

#### Mainハンドラ抽出パターン

```bash
# パターン1: ipcMain.handle 直接呼び出し
rg -n "ipcMain\.handle\(" apps/desktop/src/main/

# パターン2: IPC_CHANNELS 定数参照
rg -n "IPC_CHANNELS\.\w+" apps/desktop/src/main/handlers/

# 引数型判定:
# - "event, args: { ... }" → object
# - "event, value: string" → primitive
# - "event" のみ → none
# - それ以外 → unknown
```

#### Preload API抽出パターン

```bash
# パターン1: safeInvoke 呼び出し
rg -n "safeInvoke\(" apps/desktop/src/preload/

# パターン2: safeOn 呼び出し（イベントリスナー）
rg -n "safeOn\(" apps/desktop/src/preload/

# 引数判定:
# - safeInvoke(channel, { key: value }) → object
# - safeInvoke(channel, value) → primitive
# - safeInvoke(channel) → none
# - それ以外 → unknown
```

### ステップ4: 検出ルール設計

| ルールID | ルール名                 | 検出パターン                                    | 重大度  | 対応P |
| -------- | ------------------------ | ----------------------------------------------- | ------- | ----- |
| R-01     | チャンネル孤児           | Main/Preloadの片方にしか存在しないチャンネル    | warning | -     |
| R-02     | 引数形式不一致           | Main=object、Preload=primitive（またはその逆）  | error   | P44   |
| R-03     | チャンネル名ハードコード | `IPC_CHANNELS` 定数でなく文字列リテラルを使用   | warning | P27   |
| R-04     | 未登録チャンネル         | Preloadで使用しているがMainでhandleされていない | error   | -     |

#### ルール適用フロー

```
全チャンネル一覧 = Main側チャンネル ∪ Preload側チャンネル

for each チャンネル in 全チャンネル一覧:
  if チャンネル ∈ Main側 AND チャンネル ∉ Preload側:
    → R-01 (main-only orphan)
  if チャンネル ∉ Main側 AND チャンネル ∈ Preload側:
    → R-04 (未登録チャンネル - error)
  if チャンネル ∈ Main側 AND チャンネル ∈ Preload側:
    Main引数 = getArgPattern(Main側エントリ)
    Preload引数 = getArgPattern(Preload側エントリ)
    if Main引数 ≠ Preload引数 AND both ≠ "unknown":
      → R-02 (引数形式不一致 - error)
```

#### IPC規模情報（aiworkflow-requirements正本）

スクリプトが検証対象とするIPC契約の規模:

| 指標                     | 数値  | 出典                                                |
| ------------------------ | ----- | --------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS  | 242個 | `security-electron-ipc.md`                          |
| ALLOWED_ON_CHANNELS      | 41個  | `security-electron-ipc.md`                          |
| ハンドラ総数             | 324個 | `ipc-contract-checklist.md`                         |
| Preload呼び出し          | 325個 | `ipc-contract-checklist.md`                         |
| チャンネル定義           | 360個 | `ipc-contract-checklist.md`                         |
| P42準拠3段バリデーション | 必須  | `typeof === "string"` → `=== ""` → `.trim() === ""` |

#### IPC契約チェックリスト6Phase構成（自動化対象）

| Phase | 内容                           | 確認項目数 | 自動化対象                   |
| ----- | ------------------------------ | ---------- | ---------------------------- |
| 1     | 変更前の契約確認               | 5項目      | 対象外（事前確認は手動）     |
| 2     | 実装変更3箇所同時更新          | 6項目      | R-01/R-04（存在チェック）    |
| 3     | P42準拠バリデーション（3段階） | 3項目      | 将来拡張（grepでは限界あり） |
| 4     | 型定義同期 P23/P32             | 5項目      | R-02（引数形式照合）         |
| 5     | 仕様書同期                     | 7項目      | 対象外（ドキュメント領域）   |
| CC-7  | Renderer防御                   | 7項目      | 対象外（Renderer層は除外）   |

Phase 1 詳細（5項目）: 4箇所のshape確認、引数命名一致、引数構造一致、envelope一致、event channel再利用確認

Phase 2 詳細（6項目）: ハンドラ定義、Preload API、型定義ファイル、テスト、仕様書、チャンネル定数の同時更新

Phase 3 詳細（3段階）: `typeof === "string"` → `=== ""` → `.trim() === ""`

### ステップ5: CLIインターフェース設計

```bash
# 基本実行（--strict がデフォルト）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts

# レポートのみ（常に exit 0）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only

# 厳格モード（不一致で exit 1）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict

# JSON出力
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json

# ヘルプ
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --help
```

| オプション      | 型      | デフォルト | 説明                         |
| --------------- | ------- | ---------- | ---------------------------- |
| `--report-only` | boolean | false      | 不一致検出してもexit 0で終了 |
| `--strict`      | boolean | true       | 不一致検出時にexit 1で終了   |
| `--format`      | string  | "markdown" | 出力形式（markdown/json）    |
| `--help`        | boolean | false      | ヘルプ表示                   |

### ステップ6: レポート出力形式設計

#### Markdown形式

```text
# IPC Contract Drift Report

**Generated**: 2026-03-18T10:00:00Z
**Summary**: 15 channels checked, 13 matched, 1 drifted, 1 orphaned

## Drifts (1)

| Channel      | Rule | Main                              | Preload                 | Severity |
| ------------ | ---- | --------------------------------- | ----------------------- | -------- |
| skill:import | R-02 | object (`{ skillIds: string[] }`) | primitive (`skillName`) | error    |

## Orphans (1)

| Channel       | Side      | File           | Line |
| ------------- | --------- | -------------- | ---- |
| ai:deprecated | main-only | handlers/ai.ts | 42   |

## Result: FAIL (1 error, 1 warning)
```

#### JSON形式

```json
{
  "timestamp": "2026-03-18T10:00:00Z",
  "summary": { "total": 15, "matched": 13, "drifted": 1, "orphaned": 1 },
  "drifts": [
    {
      "channel": "skill:import",
      "rule": "R-02",
      "mainSide": {
        "file": "handlers/skill.ts",
        "line": 15,
        "detail": "object: { skillIds: string[] }"
      },
      "preloadSide": {
        "file": "skill-api.ts",
        "line": 28,
        "detail": "primitive: skillName"
      },
      "severity": "error"
    }
  ],
  "orphans": [
    {
      "channel": "ai:deprecated",
      "side": "main-only",
      "file": "handlers/ai.ts",
      "line": 42
    }
  ]
}
```

### ステップ7: Phase 9 統合設計

`phase-templates.md` の Phase 9 セクションに以下のチェック項目を追加する:

```text
### IPC契約ドリフト検証【Phase 9 品質ゲート】

- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts` が exit 0 で完了する
- [ ] チャンネル孤児（R-01）が存在しない、または正当な理由が記録されている
- [ ] 引数形式不一致（R-02）が存在しない
```

### ステップ8: concern数による設計書分割基準

| concern数 | 分割方針                             | 本タスクでの判定                                    |
| --------- | ------------------------------------ | --------------------------------------------------- |
| 1-3       | 単一設計書で完結                     | **該当**: 5 concern（下表）だが単一スクリプトに収束 |
| 4-7       | 論理セクション分割（単一ファイル内） | 本タスクはこの方針を採用                            |
| 8+        | 複数設計書に分割（concern群ごと）    | 非該当                                              |

### ステップ9: concern ごとの target topology

| concern        | 対象ファイル/ディレクトリ                 | 処理                          |
| -------------- | ----------------------------------------- | ----------------------------- |
| ハンドラ抽出   | `apps/desktop/src/main/handlers/**/*.ts`  | `ipcMain.handle` パターン抽出 |
| Preload抽出    | `apps/desktop/src/preload/**/*.ts`        | `safeInvoke`/`safeOn` 抽出    |
| チャンネル定数 | `apps/desktop/src/shared/ipc-channels.ts` | チャンネル名の正規化参照      |
| 照合・検出     | メモリ内（抽出結果の突き合わせ）          | R-01〜R-04 ルール適用         |
| レポート出力   | stdout / ファイル出力                     | Markdown/JSON 形式            |

### ステップ10: ファイル配置設計

| ファイル                                                     | 役割             |
| ------------------------------------------------------------ | ---------------- |
| `apps/desktop/scripts/check-ipc-contracts.ts`                | メインスクリプト |
| `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | ユニットテスト   |

#### DI境界の型配置判断フロー

| 条件                                 | 配置先                   | 例                                         |
| ------------------------------------ | ------------------------ | ------------------------------------------ |
| 複数パッケージで共有する型           | `packages/shared/`       | `DriftReport` 等が他で必要な場合           |
| 単一パッケージ内で複数ファイルが参照 | パッケージ内 `types.ts`  | ハンドラとテストで共有する型               |
| 単一ファイルでのみ使用               | ファイル内インライン定義 | **本タスク該当**: 全型をスクリプト内に定義 |

本タスクでは、スクリプトは独立したCLIツールのためDIは不要。型定義はスクリプトファイル内にインライン定義する。

### ステップ11: IPCハンドラ設計時の確認項目

本タスクはIPCハンドラ自体を新規作成するものではないが、IPC契約検証スクリプトとして以下の設計上の確認が必須:

| 確認項目                         | 本タスクでの適用                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| 依存先がPort/Interfaceであること | スクリプトはファイルシステムとrgコマンドに依存。抽出関数のインターフェースを型で定義 |
| IPCレスポンス形式の事前決定      | スクリプト自体のexit code仕様（0/1）とレポート形式（Markdown/JSON）をPhase 2で確定   |
| P60対策: wrapper形式の合意       | DriftReport型をPhase 2で確定し、Phase 4テストはこの型に基づいてアサーションを記述    |

## 統合テスト連携

| テスト観点   | 確認内容                                                  | 結果       |
| ------------ | --------------------------------------------------------- | ---------- |
| 抽出精度     | 既存の全Mainハンドラが抽出される                          | {{RESULT}} |
| 照合精度     | チャンネル名による照合が正確に動作する                    | {{RESULT}} |
| ルール適用   | R-01〜R-04のルールが正しく適用される                      | {{RESULT}} |
| レポート出力 | Markdown/JSON形式で正しいレポートが出力される             | {{RESULT}} |
| exit code    | `--strict` で不一致時exit 1、`--report-only` で常にexit 0 | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                            | 仕様参照先                                                         |
| -------------- | ----------------------------------- | ------------------------------------------------------------------ |
| アーキテクチャ | 単一ファイルスクリプトの責務分離    | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| セキュリティ   | IPCチャンネルホワイトリストとの整合 | `aiworkflow-requirements: security-electron-ipc.md`                |

## 成果物

| 成果物 | パス                        | 説明                       |
| ------ | --------------------------- | -------------------------- |
| 設計書 | `outputs/phase-2/design.md` | アーキテクチャ・ルール設計 |

## 完了条件

- [ ] 処理フロー（抽出→照合→検出→レポート）が定義されている
- [ ] モジュール構成と型定義が設計されている
- [ ] 4つの検出ルール（R-01〜R-04）が定義されている
- [ ] CLIインターフェース（--report-only / --strict / --format）が設計されている
- [ ] レポート出力形式（Markdown/JSON）が設計されている
- [ ] Phase 9 統合の追加チェック項目が設計されている
- [ ] ファイル配置が決定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1成果物・IPC仕様書）
2. 処理フロー・モジュール構成設計
3. 抽出パターン・検出ルール設計
4. CLI・レポート形式設計
5. Phase 9統合設計
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 2
```

## 次のPhase

Phase 3: 設計レビュー
