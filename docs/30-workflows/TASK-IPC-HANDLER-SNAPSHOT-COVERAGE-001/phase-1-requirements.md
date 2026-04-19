# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-19                             |

## 目的

`apps/desktop/src/main/ipc/` 配下に存在する全 `register*Handlers()` 関数を網羅的に棚卸しし、既存スナップショットテストの有無を確認することで、wave分割計画の基礎データを確定する。曖昧な前提のまま設計・実装フェーズに進まず、このフェーズで事実ベースの情報を収集する。

## 実行タスク

### Step 0: P50チェック（前提確認）

- 既存テスト確認: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts` の内容・テストID・スナップショットパスを把握する
- `git log --oneline -5` で `UT-IPC-HANDLER-CI-001` の成果物コミットを特定し、変更ファイル一覧を確認する
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/` 配下の既存スナップショットファイル一覧を確認する
- vitest の設定ファイル（`vitest.config.ts` または `vite.config.ts`）でスナップショット保存先の設定を確認する

### Step 1: `register*Handlers()` 棚卸し

- `apps/desktop/src/main/ipc/index.ts` を読み込み、呼び出されている全 `register*Handlers()` 関数を列挙する
- 各関数について以下を判定し分類する
  - handle のみ使用: `ipcMain.handle()` のみ呼ぶ関数
  - on のみ使用: `ipcMain.on()` のみ呼ぶ関数
  - mixed: `ipcMain.handle()` と `ipcMain.on()` を両方呼ぶ関数
- 各 `register*Handlers()` の実装ファイルパスを特定する（`apps/desktop/src/main/ipc/` 配下のどのファイルか）
- 各関数が登録するチャンネル数をソースコード上でカウントする（概算でよい）

### Step 2: 既存テスト有無確認

- `apps/desktop/src/main/ipc/__tests__/` 配下のテストファイル一覧を取得する
- `*registrationSnapshot*` または `*RegistrationSnapshot*` を含むファイルを抽出する
- Step 1 で列挙した全 `register*Handlers()` 関数と、既存テストファイルの対応表を作成する
- テスト未対応の関数を「テスト欠損リスト」として明示する

### Step 3: 重複・欠損リスク評価

- `ipc-double-registration.test.ts` の内容を確認し、既存の重複検出テストとの役割分担を明確にする
- 変更頻度が高いと思われる handler 群を特定する（スキル、LLM、エージェント系）
- CI でのテスト実行時間への影響を概算する（スナップショットテストは1ファイルあたり概ね数百ms程度）
- wave分割の初期案として、優先度高・中・低の3グループに分類する

## 参照資料

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（既存パターン）
- `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`（別パターン参照）
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（重複検出の既存テスト）
- `apps/desktop/src/main/ipc/index.ts`（handler登録エントリポイント）
- GitHub Issue #2269（CLOSED）のコメント・実装記録

## 実行手順

1. `apps/desktop/src/main/ipc/index.ts` を読み込み、`register*Handlers` のパターンに一致する全関数呼び出しを抽出する
2. 抽出した関数名を `outputs/phase-1/handler-inventory.md` に記載する
3. 各関数の実装ファイルを特定し、`ipcMain.handle` と `ipcMain.on` の使用状況を確認する
4. `__tests__/` 配下のスナップショットテスト有無を確認し、`outputs/phase-1/existing-test-map.md` に対応表を記載する
5. テスト欠損リストと優先度初期案を `outputs/phase-1/handler-inventory.md` に追記する

## 統合テスト連携

Phase 1 は調査・分析フェーズであるため、コード変更は行わない。既存テストが引き続き PASS していることを `pnpm --filter @repo/desktop test` で確認し、調査作業が既存テストを破壊していないことを記録する。

## 多角的チェック観点

- 網羅性: `index.ts` 以外のエントリポイント（lazy-load や条件分岐での登録）が存在しないか確認する
- 命名規則の揺れ: `register*Handler`（複数形なし）のような例外的な命名がないか確認する
- テスト重複: 既存の `ipc-double-registration.test.ts` が担保している範囲と、スナップショットテストが担保する範囲の差分を明確にする
- CI コスト: wave 全体で追加されるテスト数の上限を見積もり、許容範囲内かを確認する

## サブタスク管理

| サブタスクID | 内容                       | 担当Step |
| ------------ | -------------------------- | -------- |
| ST-1-01      | handler一覧の列挙          | Step 1   |
| ST-1-02      | handle/on/mixed 分類       | Step 1   |
| ST-1-03      | 既存テスト対応表の作成     | Step 2   |
| ST-1-04      | テスト欠損リストの作成     | Step 2   |
| ST-1-05      | 重複リスク評価・wave初期案 | Step 3   |

## 成果物

- `outputs/phase-1/handler-inventory.md`（register\*Handlers() 棚卸し一覧。関数名・実装ファイル・handle/on/mixed分類・チャンネル概算数・wave候補を列形式で記載）
- `outputs/phase-1/existing-test-map.md`（既存テスト対応表。関数名とスナップショットテストの有無を列形式で記載し、テスト欠損リストを末尾に明示）

## 完了条件

- [ ] `apps/desktop/src/main/ipc/index.ts` の registration unit が `handler-inventory.md` に漏れなく列挙されている（Phase 2/AC-001〜003 の入力）
- [ ] 全対象に対して handle/on/mixed の分類が完了し `handler-inventory.md` に記載されている
- [ ] 全対象と既存スナップショットテストの対応が `existing-test-map.md` に記載されている
- [ ] テスト欠損リストと wave 分割の初期案（優先度高・中・低）が記載されている
- [ ] 既存テスト群が `pnpm --filter @repo/desktop test` で引き続き PASS している

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. `handler-inventory.md` に index.ts の全 `register*Handlers()` が漏れなく記載されているか
2. handle/on/mixed の分類が全関数に付与されているか
3. `existing-test-map.md` の関数数と `handler-inventory.md` の関数数が一致しているか
4. テスト欠損リストの関数が wave 初期案のいずれかに割り当てられているか
5. 既存テストがすべて PASS していることを確認したか

## 次Phase

Phase 2（設計）へ進む。`handler-inventory.md` と `existing-test-map.md` を入力として、wave分割の詳細設計とテストパターンの設計を行う。
