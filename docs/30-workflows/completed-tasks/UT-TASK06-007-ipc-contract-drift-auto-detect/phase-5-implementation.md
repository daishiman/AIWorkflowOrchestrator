# Phase 5: 実装（TDD: Green） - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 5                                                      |
| 機能名     | UT-TASK06-007-ipc-contract-drift-auto-detect           |
| 作成日     | 2026-03-18                                             |
| タスクID   | UT-TASK06-007                                          |
| 名称       | 実装（TDD: Green）                                     |
| 前提Phase  | Phase 1〜4（要件定義・設計・設計レビュー・テスト作成） |
| 次Phase    | Phase 6（テスト拡充）                                  |
| ステータス | not_started                                            |

## 目的

Phase 4 で作成した全テストケース（T-4-1〜T-4-8）をパスさせるために、`apps/desktop/scripts/check-ipc-contracts.ts` の本体実装を行う。TDD の Green フェーズとして、全テストが PASS する最小限の実装を行う。実装は200行以内を目標とする。

## 実行タスク

- Phase 5 事前確認（既存テスト回帰確認）: 実装前に既存テストが全て PASS することを確認する
- Phase 5 事前確認（既存ユーティリティ重複検出）: Phase 4 から継続して、再利用可能な既存ユーティリティがないか確認する
- Phase 5 事前確認（IPC ハンドラ register/unregister ペア確認）: 本タスクは IPC ハンドラではなくスクリプトのため該当なし
- Task 1（本体実装）: check-ipc-contracts.ts の全関数を実装し、Phase 4 テストを PASS させる
- Task 2（Phase 9 テンプレート更新）: IPC 契約ドリフト検出ステップを Phase 9 テンプレートに追加する（該当する場合）
- Task 3（Green 確認）: Phase 4 の全テスト（T-4-1〜T-4-8）が PASS することを確認する

## 参照資料

| 資料                                              | パス / リンク                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 2 設計                                      | `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-2-design.md`        |
| Phase 4 テスト作成                                | `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-4-test-creation.md` |
| Phase 4 テストファイル                            | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                              |
| IPC_CHANNELS 定数定義                             | `apps/desktop/src/main/ipc/channels.ts`（または同等ファイル）                             |
| IPC ハンドラ登録                                  | `apps/desktop/src/main/handlers/` 配下                                                    |
| Preload API                                       | `apps/desktop/src/preload/` 配下                                                          |
| IPC契約チェックリスト                             | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`             |
| 品質要件                                          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`               |
| 既知の落とし穴（P42: trim バリデーション）        | `.claude/rules/06-known-pitfalls.md#P42`                                                  |
| 既知の落とし穴（P44: IPC インターフェース不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                  |
| 既知の落とし穴（P27: ハードコード文字列）         | `.claude/rules/06-known-pitfalls.md#P27`                                                  |
| 既知の落とし穴（P5: リスナー二重登録）            | `.claude/rules/06-known-pitfalls.md#P5`                                                   |

### システム仕様（aiworkflow-requirements）

| 資料                         | パス                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| IPC契約チェックリスト        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               |
| セキュリティ（Electron IPC） | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| 実装パターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 2 設計書と Phase 4 テストファイルを確認し、実装対象と期待動作を固定する。

### ステップ2: 事前確認を実施する

#### 既存テスト回帰確認

実装前に既存テストが全て PASS することを確認する。

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | tail -20
```

#### 既存ユーティリティ重複検出（Phase 4 から継続）

Phase 4 で検出した結果を踏まえ、実装時に再利用可能な既存ユーティリティがないか再確認する。

```bash
# 正規表現パース関連のユーティリティを検索
grep -rn "extractMainHandlers\|extractPreload\|parseIpc" apps/desktop/scripts/ apps/desktop/src/main/ --include="*.ts" --include="*.js"
```

#### IPC ハンドラ register/unregister ペアの確認（P5 対策）

本タスクは IPC ハンドラの追加・変更ではなく、静的解析スクリプトの作成であるため、P5（リスナー二重登録）の直接的な影響はない。ただし、本スクリプトが検出対象とする `ipcMain.handle` / `ipcMain.on` の register/unregister ペアの整合性は、検出ルール R-01 でカバーされている。

### ステップ3: 実行タスクを上から順に実施する

Task 1（本体実装）→ Task 2（Phase 9 統合）→ Task 3（Green 確認）の順で処理する。

#### 実装対象: `apps/desktop/scripts/check-ipc-contracts.ts`

##### アーキテクチャ

```
check-ipc-contracts.ts (200行以内目標)
├── 型定義
│   ├── HandlerEntry
│   ├── PreloadEntry
│   ├── DriftEntry
│   ├── OrphanEntry
│   └── DriftReport
├── 抽出関数
│   ├── extractMainHandlers(sourcePaths: string[]): HandlerEntry[]
│   └── extractPreloadEntries(sourcePaths: string[]): PreloadEntry[]
├── 検出関数
│   └── matchAndValidate(handlers: HandlerEntry[], preloads: PreloadEntry[], channels: Set<string>): DriftReport
├── レポート関数
│   └── generateReport(report: DriftReport, format: 'markdown' | 'json'): string
└── main(argv: string[]): void
```

##### 型定義

```typescript
interface HandlerEntry {
  channel: string; // チャンネル名またはIPC_CHANNELS参照
  argType: string; // 引数のパターン（'string' | 'object' | 'destructured' | 'none'）
  filePath: string; // 検出元ファイルパス
  line: number; // 検出行番号
}

interface PreloadEntry {
  channel: string; // チャンネル名またはIPC_CHANNELS参照
  args: string[]; // 渡される引数のリスト
  filePath: string; // 検出元ファイルパス
  line: number; // 検出行番号
}

interface DriftEntry {
  channel: string; // 対象チャンネル
  rule: "R-01" | "R-02" | "R-03" | "R-04"; // 検出ルール
  severity: "error" | "warning"; // 重要度
  message: string; // 検出内容の説明
  handler?: HandlerEntry; // Main 側の情報（存在する場合）
  preload?: PreloadEntry; // Preload 側の情報（存在する場合）
}

interface OrphanEntry {
  channel: string; // 孤児チャンネル名
  side: "main-only" | "preload-only"; // 存在する側
  filePath: string; // 検出元ファイルパス
  line: number; // 検出行番号
}

interface DriftReport {
  timestamp: string; // ISO 8601 形式
  totalHandlers: number; // Main ハンドラ総数
  totalPreloads: number; // Preload エントリ総数
  drifts: DriftEntry[]; // 検出されたドリフト一覧
  orphans: OrphanEntry[]; // 孤児チャンネル一覧
  passed: boolean; // 全チェック合格フラグ
}
```

##### 抽出関数の実装仕様

###### `extractMainHandlers(sourcePaths: string[]): HandlerEntry[]`

- 指定されたファイルパスのソースコードを `fs.readFileSync` で読み取る
- 正規表現 `ipcMain\.(handle|on)\s*\(\s*(['"]([^'"]+)['"]|([A-Z_]+\.[A-Z_]+))` でハンドラ登録行を検出する
- チャンネル名（文字列リテラルまたは定数参照）と引数パターンを抽出する
- 引数パターンの判定:
  - `{ ... }` → `'object'`（オブジェクト引数）
  - `({ ... })` → `'destructured'`（分割代入）
  - 単一識別子 → `'string'`
  - 引数なし → `'none'`

###### `extractPreloadEntries(sourcePaths: string[]): PreloadEntry[]`

- 指定されたファイルパスのソースコードを `fs.readFileSync` で読み取る
- 正規表現 `safe(Invoke|On)\s*\(\s*(['"]([^'"]+)['"]|([A-Z_]+\.[A-Z_]+))` で Preload API 呼び出しを検出する
- チャンネル名と渡される引数を抽出する

##### 検出関数の実装仕様

###### `matchAndValidate(handlers, preloads, channels): DriftReport`

4つの検出ルールを順に適用する:

1. **R-01（チャンネル孤児）**: handlers と preloads のチャンネル集合を比較し、片方のみに存在するチャンネルを検出する
2. **R-02（引数形式不一致）**: 同一チャンネルの handler.argType と preload.args のパターンを比較し、不一致を検出する（P44 対応）
3. **R-03（ハードコード文字列）**: チャンネル名が `IPC_CHANNELS` 定数ではなく文字列リテラルで指定されている箇所を検出する（P27 対応）。severity は `'warning'`
4. **R-04（未登録チャンネル）**: `IPC_CHANNELS` 定数に登録されていないチャンネル名を検出する

##### レポート関数の実装仕様

###### `generateReport(report: DriftReport, format: 'markdown' | 'json'): string`

- `format === 'json'`: `JSON.stringify(report, null, 2)` を返す
- `format === 'markdown'`: 以下の形式で Markdown テーブルを返す:

  ```markdown
  # IPC Contract Drift Report

  | Channel      | Rule | Severity | Message             |
  | ------------ | ---- | -------- | ------------------- |
  | skill:import | R-02 | error    | 引数形式不一致: ... |

  ## Summary

  - Total Handlers: X
  - Total Preloads: Y
  - Drifts: Z
  - Orphans: W
  ```

- ドリフトなしの場合は `ALL CHECKS PASSED` を含む

##### `main(argv: string[]): void`

1. CLI 引数をパースする:
   - `--report-only`: ドリフト検出時も exit code 0
   - `--strict`: 警告レベルでも exit code 1
   - `--format json|markdown`: 出力形式（デフォルト: markdown）
2. ファイルパスを設定する（`apps/desktop/src/main/handlers/`, `apps/desktop/src/preload/`）
3. `extractMainHandlers` と `extractPreloadEntries` を実行する
4. IPC_CHANNELS 定数の全チャンネル一覧を取得する
5. `matchAndValidate` を実行する
6. `generateReport` でレポートを生成し `console.log` で出力する
7. exit code を設定する:
   - ドリフトあり + `--report-only` なし → `process.exitCode = 1`
   - ドリフトあり + `--report-only` → exit code 未設定
   - 警告のみ + `--strict` → `process.exitCode = 1`
   - エラー発生 → `process.exitCode = 2`

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

| 統合対象           | 検証内容                                                           |
| ------------------ | ------------------------------------------------------------------ |
| Phase 4 テスト     | T-4-1〜T-4-8 の全テストが PASS すること                            |
| Phase 9 品質ゲート | check-ipc-contracts.ts が Phase 9 実行テンプレートに統合されること |
| 既存テスト         | 本実装追加後も既存テストスイートが全て PASS すること               |

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                                   |
| ------------------ | ---------------------------------------------------------- |
| TDD Green 達成     | Phase 4 で作成した全テストが PASS する                     |
| 200行以内          | 実装コードが200行以内に収まっている                        |
| P44 検出精度       | skill:import の P44 パターンが正しく検出される             |
| P27 検出精度       | ハードコード文字列チャンネルが正しく検出される             |
| 実行速度           | スクリプトが10秒以内に実行完了する                         |
| 既存テスト回帰     | 既存テストスイートに影響がない                             |
| CLI オプション動作 | `--report-only`, `--strict`, `--format` が仕様通り動作する |

## 成果物

| 成果物                   | パス                                                                                                   | 内容                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| チェックスクリプト       | `apps/desktop/scripts/check-ipc-contracts.ts`                                                          | IPC契約ドリフト自動検出スクリプト本体       |
| Phase 9 テンプレート更新 | `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-5/phase9-integration.md` | Phase 9 への統合手順（該当する場合）        |
| Green 確認記録           | `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-5/green-confirmation.md` | テスト実行結果（全 PASS）のスナップショット |

## 完了条件

- [ ] `apps/desktop/scripts/check-ipc-contracts.ts` が実装されている
- [ ] Phase 4 の全テスト（T-4-1〜T-4-8）が PASS する
- [ ] 実装が200行以内に収まっている（目標）
- [ ] スクリプトが10秒以内に実行完了する
- [ ] 既存テストスイートに回帰がない
- [ ] CLI オプション（`--report-only`, `--strict`, `--format`）が動作する
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク                       | ステータス  | 担当 |
| -------------------------------- | ----------- | ---- |
| 事前確認: 既存テスト回帰確認     | not_started | -    |
| Task 1: 本体実装                 | not_started | -    |
| Task 2: Phase 9 テンプレート更新 | not_started | -    |
| Task 3: Green 確認               | not_started | -    |

## タスク100%実行確認【必須】

```bash
# Phase 5 成果物の検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  --task-id UT-TASK06-007 \
  --phase 5 \
  --workflow-dir docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect
```

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
