# Phase 4: テスト作成（Wave 1 Red）

## メタ情報

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| Phase      | 4                                                                                |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001                                           |
| ステータス | 未実施                                                                           |
| 作成日     | 2026-04-19                                                                       |
| 入力       | outputs/phase-3/gate-decision.md（進行可確認済み）, outputs/phase-2/wave-plan.md |

## 目的

TDD の Red フェーズとして、`outputs/phase-2/wave-plan.md` で承認された
Wave 1 対象に対する registration snapshot テストファイルを作成する。
この時点ではスナップショットファイルが存在しないため、
テストはスナップショット未生成または期待値未確定によって失敗する状態（Red）が正しい。
テストファイルの構造・命名・テストIDが設計と一致していることを確認し、
Phase 5 の Green 化へ受け渡す。

## 実行タスク

- `wave-plan.md` で承認された Wave 1 対象の Red テストファイルを作成する
- REG-SNAP / REG-DEDUP / REG-COUNT を実装し、必要なら mixed 型向け補助テストを追加する
- スナップショット未生成 FAIL を確認して `red-test-result.md` に記録する

## Wave 1 初期候補とテストファイル対応

以下は初期候補であり、正本は `wave-plan.md` とする。

| 対象関数                       | テストファイルパス                                                                        | テストIDプレフィックス |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------- |
| registerSkillHandlers          | `apps/desktop/src/main/ipc/__tests__/skillHandlers.registrationSnapshot.test.ts`          | SKILL                  |
| registerLLMHandlers            | `apps/desktop/src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts`            | LLM                    |
| registerSkillCreatorHandlers   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.registrationSnapshot.test.ts`   | SCREATOR               |
| registerSkillFileHandlers      | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.registrationSnapshot.test.ts`      | SFILE                  |
| registerSafetyGateHandlers     | `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.registrationSnapshot.test.ts`     | SAFETY                 |
| registerApprovalHandlers       | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.registrationSnapshot.test.ts`       | APPROVAL               |
| registerAgentExecutionHandlers | `apps/desktop/src/main/ipc/__tests__/agentExecutionHandlers.registrationSnapshot.test.ts` | AGENTEXEC              |

## テストケース定義

### 全 Wave 1 ファイル共通のテストケース構成

各テストファイルに以下の 3 テストケースを必須で定義する。`{PREFIX}` は上記テーブルまたは `wave-plan.md` のプレフィックスに置換する。

#### REG-SNAP-{PREFIX}-01: 登録チャンネル一覧がスナップショットと一致する

- 対象: `ipcMain.handle()` で登録されたチャンネル名の配列（ソート済み）
- 検証: `expect([...handles].sort()).toMatchSnapshot()` でスナップショット照合
- 失敗条件: チャンネルの追加・削除・リネームが発生した場合
- 初回実行: スナップショットが存在しないため FAIL → Phase 5 で `--update-snapshots` を実行して固定する

#### REG-DEDUP-{PREFIX}-01: 重複チャンネルが存在しない

- 対象: `handles` 配列
- 検証: `expect(new Set(handles).size).toBe(handles.length)`
- 失敗条件: 同一チャンネル名が 2 回以上 `handle()` で登録された場合

#### REG-COUNT-{PREFIX}-01: 登録チャンネル総数が期待値と一致する

- 対象: `handles.length`
- 検証: `expect(handles).toHaveLength(N)`（N は Phase 1 の棚卸しで確認した実際の値）
- 注意: N の値は Phase 5 の実装時に実際のテスト実行結果から確定させる。本フェーズでは仮値 `0` を設定してよい
- 失敗条件: チャンネルの追加・削除が発生した場合

### mixed 型 handler（handle と on の両方を使う）の追加テストケース

対象関数が `ipcMain.on()` も呼ぶ場合（Phase 1 の棚卸しで mixed と分類された関数）は以下を追加する。

#### REG-EDGE-{PREFIX}-02: ipcMain.on() は handle spy に含まれない

- 対象: `onChannels` と `handles` の重複チェック
- 検証: `handles.filter((ch) => onChannels.includes(ch))` の結果が空配列
- 目的: on チャンネルが handle チャンネルと分離されていることを確認する

任意で `REG-EDGE-*` を追加してよいが、Phase 4 の完了条件と受入基準は
`REG-SNAP` / `REG-DEDUP` / `REG-COUNT` を正本とする。

## テストファイルの構造仕様

各テストファイルは以下の構造に準拠する（`creatorHandlers.registrationSnapshot.test.ts` と同等の骨格）。

ファイル冒頭のコメントブロックに含める情報:

- タスクID: TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
- 対象関数名
- テストID一覧（REG-SNAP-XX-01 〜 REG-EDGE-XX-03）

モック設定:

- `vi.hoisted()` で `mockIpcMainHandle` と `mockIpcMainOn` を定義する
- `vi.mock("electron", ...)` で `ipcMain.handle`・`ipcMain.removeHandler`・`ipcMain.on`・`ipcMain.removeAllListeners` をモックする

テスト構造:

- `describe("{関数名} - チャンネル登録スナップショット", ...)` をトップレベルに置く
- `describe("REG-SNAP-XX-01〜REG-COUNT-XX-01: 正常系", ...)` の中に `beforeEach` で対象関数を呼び出す
- `describe("REG-EDGE-XX-01〜REG-EDGE-XX-03: 境界値・異常系", ...)` をネストする

各テストファイルで必要な `BrowserWindow` モックの方針:

- `{ isDestroyed: () => false, webContents: { send: vi.fn() } }` を `mockMainWindow` として定義する
- 対象関数が `BrowserWindow` を引数に取らない場合はモック不要

## テストファイル命名規則

テストファイル名は以下の命名規則に従う（受入基準 AC-008 より）：

```
{camelCasedHandlerName}.registrationSnapshot.test.ts
```

例: `registerSkillHandlers` → `skillHandlers.registrationSnapshot.test.ts`

上記テーブルおよび `wave-plan.md` に記載されたテストファイルパスが正本であり、
命名規則との整合性を作成時に必ず確認すること。

## 実行手順

1. `apps/desktop/src/main/ipc/__tests__/` 配下に `wave-plan.md` で承認された Wave 1 テストファイルを作成する
2. 各ファイルに上記の構造仕様に準拠したテストコードを記述する（REG-COUNT の N は仮値 0 のままでよい）
3. `pnpm vitest run apps/desktop/src/main/ipc/__tests__/` でテストを実行し、スナップショット未生成による FAIL を確認する（Red 状態の確認）
4. FAIL が REG-COUNT や REG-SNAP のみで、モック設定エラー・インポートエラーが発生していないことを確認する
5. エラーがある場合はモック設定・インポートパスを修正してから Phase 5 へ進む

## 参照資料

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（実装基準）
- `outputs/phase-2/test-pattern-design.md`（テストパターン設計）
- `outputs/phase-2/wave-plan.md`（Wave 1 の対象関数・想定チャンネル数）
- `outputs/phase-1/handler-inventory.md`（handle/on/mixed 分類の参照元）

## 成果物

- `apps/desktop/src/main/ipc/__tests__/*Handlers.registrationSnapshot.test.ts`（Wave 1 分）
- `outputs/phase-4/red-test-result.md`（Red 状態確認の実行ログ記録）

## 統合テスト連携

- `wave-plan.md` で承認された Wave 1 対象のみを Red 実装し、統合テストの対象境界を固定する
- Red ではスナップショット未生成 FAIL を意図的に作り、Phase 5 の Green 化に接続する
- 既存 `creatorHandlers.registrationSnapshot.test.ts` を壊さないことを継続条件とする

## 完了条件

- [ ] `wave-plan.md` で承認された Wave 1 テストファイルが `apps/desktop/src/main/ipc/__tests__/` 配下に作成されている
- [ ] 各ファイルにテストID `REG-SNAP-{PREFIX}-01`・`REG-DEDUP-{PREFIX}-01`・`REG-COUNT-{PREFIX}-01` が定義されている
- [ ] モック設定エラー・インポートエラーが発生していない（テストが「実行されて FAIL」している状態）
- [ ] `red-test-result.md` に FAIL の確認記録が記載されている
- [ ] 既存テスト群が引き続き PASS している（`pnpm --filter @repo/desktop test` 全体実行で確認）

## タスク100%実行確認【必須】

1. `wave-plan.md` の Wave 1 対象が漏れなく作成されているか
2. 各ファイルのテストID命名が採番規則に準拠しているか
3. 各テストファイル名が命名規則 `{camelCasedHandlerName}.registrationSnapshot.test.ts` に準拠しているか（受入基準 AC-008）
4. 実行結果が「モックエラー・インポートエラーなし、スナップショット未生成による FAIL」であることを確認したか
5. `red-test-result.md` に実行ログを記録したか
6. 既存テストが全 PASS であることを確認したか

## 次Phase

Phase 5（実装 Wave 1 Green）へ進む。スナップショットを初回生成し、REG-COUNT の期待値を実際のチャンネル数に更新して全テストを PASS させる。
