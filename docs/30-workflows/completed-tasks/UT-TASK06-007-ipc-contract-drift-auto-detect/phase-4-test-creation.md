# Phase 4: テスト作成（TDD: Red） - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目       | 値                                           |
| ---------- | -------------------------------------------- |
| Phase      | 4                                            |
| 機能名     | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日     | 2026-03-18                                   |
| タスクID   | UT-TASK06-007                                |
| 名称       | テスト作成（TDD: Red）                       |
| 前提Phase  | Phase 1〜3（要件定義・設計・設計レビュー）   |
| 次Phase    | Phase 5（実装）                              |
| ステータス | not_started                                  |

## 目的

`apps/desktop/scripts/check-ipc-contracts.ts` の各検出ルール（R-01〜R-04）に対するテストケースを設計・作成する。TDD の Red フェーズとして、テストが全て FAIL する状態を確認する。

## 実行タスク

- Phase 4 事前確認（重複検出）: 既存の IPC 関連チェックスクリプトやユーティリティとの重複がないことを確認する
- Phase 4 事前確認（exit code 仕様合意）: P60 対策として、スクリプトの出力形式と exit code を事前に合意する
- Phase 4 事前確認（import 副作用チェック）: テスト対象ファイルの import 副作用がテスト環境に影響しないことを確認する
- Task 1（テストファイル作成）: T-4-1〜T-4-8 の全テストケースをテストファイルに実装する
- Task 2（テスト実行と Red 確認）: テスト実行で全テストが FAIL する（Red 状態）ことを確認する

## 参照資料

| 資料                                              | パス / リンク                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義                                  | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-1-requirements.md`  |
| Phase 2 設計                                      | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-2-design.md`        |
| Phase 3 設計レビュー                              | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-3-design-review.md` |
| IPC契約チェックリスト                             | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                             |
| 品質要件                                          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                               |
| テスト駆動開発ルール                              | `.claude/rules/02-code-quality.md#テスト駆動開発（TDD）`                                                  |
| 既知の落とし穴（P9: テスト間状態リーク）          | `.claude/rules/06-known-pitfalls.md#P9`                                                                   |
| 既知の落とし穴（P40: テスト実行ディレクトリ依存） | `.claude/rules/06-known-pitfalls.md#P40`                                                                  |
| 既知の落とし穴（P44: IPC インターフェース不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                                  |
| 既知の落とし穴（P27: ハードコード文字列）         | `.claude/rules/06-known-pitfalls.md#P27`                                                                  |
| 既知の落とし穴（P60: IPC テスト応答形式不一致）   | `.claude/rules/06-known-pitfalls.md#P60`                                                                  |

### システム仕様（aiworkflow-requirements）

| 資料                         | パス                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| IPC契約チェックリスト        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               |
| セキュリティ（Electron IPC） | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| 実装パターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1〜3 の成果物および既知の落とし穴（P9, P40, P44, P27, P60）を確認し、テスト設計の前提条件を固定する。

### ステップ2: 事前確認を実施する

#### 既存ユーティリティ重複検出

既存の IPC 関連チェックスクリプトやユーティリティが存在しないか確認する。

```bash
# 既存の IPC チェック関連ファイルを検索
grep -rn "ipc.*check\|check.*ipc\|ipc.*contract\|contract.*drift" apps/desktop/scripts/ --include="*.ts" --include="*.js"
```

重複するユーティリティが見つかった場合は再利用を検討する。

#### テスト対象ファイルの import 副作用チェック

テスト対象の `check-ipc-contracts.ts` が import 時に副作用（ファイルI/O、プロセス終了、グローバル状態変更）を実行しないことを確認する。

- `main()` 関数がモジュールトップレベルで自動実行されていないことを確認する
- トップレベルで `process.exit()` や `process.exitCode` を設定していないことを確認する
- テストで import するだけで副作用が発生する場合は、動的 import（`await import()`）でガードする

#### exit code 仕様の事前合意（P60 対策）

P60 対策として、スクリプトの出力形式を事前に合意する。

| 条件                   | exit code | stdout 出力                             |
| ---------------------- | --------- | --------------------------------------- |
| 全チャンネル整合       | 0         | `ALL CHECKS PASSED` を含む              |
| ドリフト検出あり       | 1         | DriftReport（Markdown or JSON）を出力   |
| `--report-only` 指定時 | 0         | DriftReport を出力するが exit code は 0 |
| スクリプトエラー       | 2         | エラーメッセージを stderr に出力        |

### ステップ3: テストケースを作成する

上記テストケース設計に基づいて `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` を作成する。

#### テストケース設計

##### 1. 抽出関数ユニットテスト

###### 1.1 `extractMainHandlers` テスト（T-4-1）

| #      | テストケース名                                        | 入力                                                          | 期待出力                                                            | 分類   |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| T-4-1a | ipcMain.handle 行からチャンネル名を正しく抽出する     | `ipcMain.handle('skill:import', async (event, args) => {`     | `HandlerEntry { channel: 'skill:import', argType: 'args' }`         | 正常系 |
| T-4-1b | IPC_CHANNELS 定数参照からチャンネル名を正しく抽出する | `ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (e, a) => {` | `HandlerEntry { channel: 'IPC_CHANNELS.SKILL_IMPORT', ... }`        | 正常系 |
| T-4-1c | ipcMain.on 行からチャンネル名を正しく抽出する         | `ipcMain.on('system:theme-changed', (event, data) => {`       | `HandlerEntry { channel: 'system:theme-changed', argType: 'data' }` | 正常系 |
| T-4-1d | 複数ハンドラを含むファイルから全件を抽出する          | 複数の ipcMain.handle/on を含むソース                         | 全ハンドラの `HandlerEntry[]` を返す                                | 正常系 |
| T-4-1e | ハンドラが0件のファイルは空配列を返す                 | ipcMain 呼び出しを含まないソース                              | `[]`                                                                | 境界値 |

###### 1.2 `extractPreloadEntries` テスト（T-4-2）

| #      | テストケース名                                              | 入力                                               | 期待出力                                                                     | 分類   |
| ------ | ----------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| T-4-2a | safeInvoke 行からチャンネル名と引数パターンを正しく抽出する | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` | `PreloadEntry { channel: 'IPC_CHANNELS.SKILL_IMPORT', args: ['skillName'] }` | 正常系 |
| T-4-2b | safeOn 行からチャンネル名を正しく抽出する                   | `safeOn(IPC_CHANNELS.SYSTEM_THEME, callback)`      | `PreloadEntry { channel: 'IPC_CHANNELS.SYSTEM_THEME', ... }`                 | 正常系 |
| T-4-2c | 文字列リテラルのチャンネル名を正しく抽出する                | `safeInvoke('skill:import', data)`                 | `PreloadEntry { channel: 'skill:import', ... }`                              | 正常系 |
| T-4-2d | Preload エントリが0件のファイルは空配列を返す               | safeInvoke/safeOn を含まないソース                 | `[]`                                                                         | 境界値 |

##### 2. 検出ルールユニットテスト

###### 2.1 R-01: チャンネル孤児検出テスト（T-4-3）

| #      | テストケース名                                       | 入力                                                                     | 期待出力                                                     | 分類   |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ | ------ |
| T-4-3a | Main にのみ存在するチャンネルを孤児として検出する    | Handler: `['skill:import', 'skill:remove']`, Preload: `['skill:import']` | `orphans: [{ channel: 'skill:remove', side: 'main-only' }]`  | 異常系 |
| T-4-3b | Preload にのみ存在するチャンネルを孤児として検出する | Handler: `['skill:import']`, Preload: `['skill:import', 'skill:list']`   | `orphans: [{ channel: 'skill:list', side: 'preload-only' }]` | 異常系 |
| T-4-3c | 全チャンネルが双方に存在する場合は孤児なし           | Handler: `['skill:import']`, Preload: `['skill:import']`                 | `orphans: []`                                                | 正常系 |
| T-4-3d | 両側とも0件の場合は孤児なし                          | Handler: `[]`, Preload: `[]`                                             | `orphans: []`                                                | 境界値 |

###### 2.2 R-02: 引数形式不一致検出テスト（T-4-4）

| #      | テストケース名                                                | 入力                                                                  | 期待出力                                                   | 分類   |
| ------ | ------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| T-4-4a | P44パターン: オブジェクト引数 vs 単一文字列の不一致を検出する | Handler: `{ skillIds: string[] }`, Preload: `skillName (string)`      | `drifts: [{ channel: 'skill:import', rule: 'R-02', ... }]` | 異常系 |
| T-4-4b | 引数形式が一致する場合はドリフトなし                          | Handler: `string`, Preload: `string`                                  | `drifts: []`                                               | 正常系 |
| T-4-4c | ハンドラが destructured object を受け取る場合の検出           | Handler: `async (event, { id, name })`, Preload: `safeInvoke(ch, id)` | `drifts: [{ rule: 'R-02', ... }]`                          | 異常系 |

###### 2.3 R-04: 未登録チャンネル検出テスト（T-4-5）

| #      | テストケース名                                         | 入力                                                                              | 期待出力                                          | 分類   |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- | ------ |
| T-4-5a | IPC_CHANNELS 定義にないチャンネル文字列を検出する      | Handler: `ipcMain.handle('unlisted:channel', ...)`, 定義: `IPC_CHANNELS` に未登録 | `unregistered: [{ channel: 'unlisted:channel' }]` | 異常系 |
| T-4-5b | 全チャンネルが IPC_CHANNELS に登録済みの場合は検出なし | Handler/Preload 全て IPC_CHANNELS 経由                                            | `unregistered: []`                                | 正常系 |

##### 3. レポート出力テスト（T-4-6）

| #      | テストケース名                                    | 入力                                     | 期待出力                             | 分類   |
| ------ | ------------------------------------------------- | ---------------------------------------- | ------------------------------------ | ------ |
| T-4-6a | Markdown 形式でドリフトレポートを出力する         | DriftReport with drifts                  | Markdown テーブル形式の出力を含む    | 正常系 |
| T-4-6b | JSON 形式でドリフトレポートを出力する             | DriftReport with drifts, `--format json` | 有効な JSON 文字列を出力する         | 正常系 |
| T-4-6c | ドリフトなしの場合 `ALL CHECKS PASSED` を出力する | DriftReport with no drifts               | stdout に `ALL CHECKS PASSED` を含む | 正常系 |

##### 4. CLI オプションテスト（T-4-7）

| #      | テストケース名                                         | 入力                              | 期待出力                                             | 分類   |
| ------ | ------------------------------------------------------ | --------------------------------- | ---------------------------------------------------- | ------ |
| T-4-7a | `--report-only` 指定時はドリフトがあっても exit code 0 | ドリフトあり + `--report-only`    | `process.exitCode` 未設定（0）、レポートは出力される | 正常系 |
| T-4-7b | `--strict` 指定時は警告レベルでも exit code 1          | 警告レベルのドリフト + `--strict` | `process.exitCode === 1`                             | 正常系 |
| T-4-7c | `--format json` 指定時は JSON 形式で出力する           | `--format json`                   | JSON.parse 可能な出力                                | 正常系 |
| T-4-7d | `--format markdown` 指定時は Markdown 形式で出力する   | `--format markdown`               | Markdown テーブルを含む出力                          | 正常系 |
| T-4-7e | デフォルト（オプションなし）は Markdown 形式で出力する | オプションなし                    | Markdown テーブルを含む出力                          | 正常系 |

##### 5. exit code テスト（T-4-8）

| #      | テストケース名                              | 入力                 | 期待出力                  | 分類   |
| ------ | ------------------------------------------- | -------------------- | ------------------------- | ------ |
| T-4-8a | ドリフト検出時は exit code 1 を設定する     | ドリフトあり         | `process.exitCode === 1`  | 異常系 |
| T-4-8b | 全チャンネル整合時は exit code 0（未設定）  | ドリフトなし         | `process.exitCode` 未設定 | 正常系 |
| T-4-8c | スクリプトエラー時は exit code 2 を設定する | ファイル読み取り失敗 | `process.exitCode === 2`  | 異常系 |

#### テスト設計のポイント

##### P9 対策: テスト間状態共有の禁止

- 各テストケースは `beforeEach` で入力データを初期化する
- グローバル状態やモジュールスコープ変数に依存しない
- ファイルシステムのモックは各テストで `mockReturnValue` をリセットする

##### P40 対策: テスト実行ディレクトリ

- テストファイルは `apps/desktop/scripts/__tests__/` に配置する
- 実行コマンド: `cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts`

##### P60 対策: IPC テスト応答形式の事前合意

- exit code 仕様を Phase 4 事前確認で合意し、テストのアサーションに反映する
- DriftReport の構造体形式を Phase 2 設計書と整合させる

##### モック戦略

| 対象                | モック方法                                                | 理由                                    |
| ------------------- | --------------------------------------------------------- | --------------------------------------- |
| `fs.readFileSync`   | `vi.mock('fs')` + `mockReturnValue`                       | ファイルI/Oを制御し、テストデータを注入 |
| `process.exitCode`  | 直接参照して検証                                          | exit() はテストプロセスを終了させるため |
| `console.log/error` | `vi.spyOn(console, 'log')` + `vi.spyOn(console, 'error')` | レポート出力の検証                      |
| `child_process`     | `vi.mock('child_process')` + `execSync` モック            | rg コマンドの実行を制御する             |

##### テストファイル構造

```typescript
// apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 抽出関数のインポート（Phase 5 で実装）
// import { extractMainHandlers, extractPreloadEntries } from '../check-ipc-contracts';
// 検出関数のインポート
// import { matchAndValidate, generateReport } from '../check-ipc-contracts';

describe("check-ipc-contracts", () => {
  describe("extractMainHandlers", () => {
    // T-4-1a〜T-4-1e
  });

  describe("extractPreloadEntries", () => {
    // T-4-2a〜T-4-2d
  });

  describe("R-01: チャンネル孤児検出", () => {
    // T-4-3a〜T-4-3d
  });

  describe("R-02: 引数形式不一致検出", () => {
    // T-4-4a〜T-4-4c
  });

  describe("R-04: 未登録チャンネル検出", () => {
    // T-4-5a〜T-4-5b
  });

  describe("レポート出力", () => {
    // T-4-6a〜T-4-6c
  });

  describe("CLIオプション", () => {
    // T-4-7a〜T-4-7e
  });

  describe("exit code", () => {
    // T-4-8a〜T-4-8c
  });
});
```

### ステップ4: Red 確認

テストを実行し、全テストが FAIL することを確認する（実装が存在しないため）。

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件を確認して記録する。

## 統合テスト連携

| 統合対象           | 検証内容                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| Phase 9 品質ゲート | check-ipc-contracts.ts の実行結果が Phase 9 の品質チェックに統合される |
| IPC ハンドラ       | Main Process のハンドラ登録と Preload 層の呼び出しの整合性を検証       |
| IPC_CHANNELS 定数  | チャンネル名の一元管理と未登録チャンネルの検出                         |

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                                       |
| ------------ | -------------------------------------------------------------- |
| 正確性       | 各検出ルール（R-01〜R-04）のテストケースが仕様と一致している   |
| 網羅性       | 正常系・異常系・境界値が各ルールに対して定義されている         |
| P44再現性    | skill:import の P44 パターンがテストケースとして再現されている |
| P27再現性    | ハードコード文字列チャンネルの検出がテストケースに含まれている |
| 独立性       | 各テストが他のテストの状態に依存していない（P9 準拠）          |
| 実行環境     | テスト実行ディレクトリの制約が明示されている（P40 準拠）       |
| 応答形式合意 | exit code とレポート形式が事前に合意されている（P60 準拠）     |

## 成果物

| 成果物       | パス                                                                                                            | 内容                       |
| ------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| テスト設計書 | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-4/test-design.md` | テストケース一覧と設計根拠 |
| テストコード | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                                    | 全検出ルールのテストコード |

## 完了条件

- [ ] T-4-1〜T-4-8 の全テストケースがテストファイルに実装されている
- [ ] テスト実行で全テストが FAIL する（Red 状態の確認）
- [ ] P9/P40/P60 対策が適用されている
- [ ] P44 パターン（skill:import の引数形式不一致）がテストケースとして再現されている
- [ ] P27 パターン（ハードコード文字列チャンネル）がテストケースに含まれている
- [ ] exit code 仕様がテストに反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク                   | ステータス  | 担当 |
| ---------------------------- | ----------- | ---- |
| 事前確認: 重複検出           | not_started | -    |
| 事前確認: exit code 仕様合意 | not_started | -    |
| テストファイル作成           | not_started | -    |
| Red 確認                     | not_started | -    |

## タスク100%実行確認【必須】

```bash
# Phase 4 成果物の検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  --task-id UT-TASK06-007 \
  --phase 4 \
  --workflow-dir docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect
```

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
