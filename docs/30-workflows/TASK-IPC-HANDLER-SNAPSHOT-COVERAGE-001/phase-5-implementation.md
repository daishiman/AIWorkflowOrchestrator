# Phase 5: 実装（Wave 1 Green）

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 5                                                    |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001               |
| ステータス | 未実施                                               |
| 作成日     | 2026-04-19                                           |
| タスク種別 | NON_VISUAL（UI変更なし）                             |
| 入力       | Phase 4 で作成した Wave 1 テストファイル（Red 状態） |

## 目的

TDD の Green フェーズとして、Phase 4 で作成した Wave 1 のスナップショットテストを全て PASS させる。具体的には、スナップショットの初回生成・REG-COUNT の期待値確定・型エラー解消を行う。

重要な制約として、このフェーズで変更するのはテストファイルのみである。既存の handler 実装コード（`registerSkillHandlers` 等の本体）には一切手を加えない。

## 実装対象

| 対象ファイル                                                                              | 作業内容                                   |
| ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.registrationSnapshot.test.ts`          | スナップショット生成、REG-COUNT 期待値確定 |
| `apps/desktop/src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts`            | スナップショット生成、REG-COUNT 期待値確定 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.registrationSnapshot.test.ts`   | スナップショット生成、REG-COUNT 期待値確定 |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.registrationSnapshot.test.ts`      | スナップショット生成、REG-COUNT 期待値確定 |
| `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.registrationSnapshot.test.ts`     | スナップショット生成、REG-COUNT 期待値確定 |
| `apps/desktop/src/main/ipc/__tests__/approvalHandlers.registrationSnapshot.test.ts`       | スナップショット生成、REG-COUNT 期待値確定 |
| `apps/desktop/src/main/ipc/__tests__/agentExecutionHandlers.registrationSnapshot.test.ts` | スナップショット生成、REG-COUNT 期待値確定 |

変更しないファイル（確認のみ）:

- `apps/desktop/src/main/ipc/` 配下の handler 実装ファイル群
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（既存テスト）

## 実行手順

### Step 1: スナップショット初回生成

`pnpm vitest run apps/desktop/src/main/ipc/__tests__/ --update-snapshots` を実行する。

このコマンドにより以下が発生する:

- 各テストファイルの REG-SNAP-{PREFIX}-01 が初回実行され、実際に登録されるチャンネル名の配列（ソート済み）がスナップショットファイルに書き出される
- 生成先: `apps/desktop/src/main/ipc/__tests__/__snapshots__/{テストファイル名}.snap`

実行後に確認すること:

- `__snapshots__/` 配下に 7 つの新しい `.snap` ファイルが作成されている
- 各 `.snap` ファイルにチャンネル名の配列が記録されている
- REG-DEDUP と REG-EDGE テストが PASS している
- REG-COUNT のみが FAIL している（仮値 0 のままのため）

### Step 2: REG-COUNT 期待値の確定

Step 1 で生成されたスナップショットを参照し、各 handler 関数の実際の登録チャンネル数を確認する。各テストファイルの `REG-COUNT-{PREFIX}-01` テストケースで仮値 `0` を実際のチャンネル数に書き換える。

期待値確定の方法:

- `__snapshots__/{テストファイル名}.snap` を開き、配列の要素数を数える
- その数値を `expect(handles).toHaveLength(N)` の `N` に設定する

各関数の実際のチャンネル数は実行時に確定するため、本仕様書には記載しない。Step 1 の実行結果から読み取ること。

### Step 3: 全テスト実行と Green 確認

`pnpm vitest run apps/desktop/src/main/ipc/__tests__/` を実行し、
Wave 1 の全対象ファイルの必須テストケースが PASS することを確認する。

確認すべきテストケース一覧:

| テストID               | 期待結果                     |
| ---------------------- | ---------------------------- |
| REG-SNAP-SKILL-01      | PASS（スナップショット一致） |
| REG-DEDUP-SKILL-01     | PASS（重複なし）             |
| REG-COUNT-SKILL-01     | PASS（実際のチャンネル数）   |
| REG-EDGE-SKILL-01      | PASS（重複検出能力確認）     |
| REG-SNAP-LLM-01        | PASS                         |
| REG-DEDUP-LLM-01       | PASS                         |
| REG-COUNT-LLM-01       | PASS                         |
| REG-EDGE-LLM-01        | PASS                         |
| REG-SNAP-SCREATOR-01   | PASS                         |
| REG-DEDUP-SCREATOR-01  | PASS                         |
| REG-COUNT-SCREATOR-01  | PASS                         |
| REG-EDGE-SCREATOR-01   | PASS                         |
| REG-SNAP-SFILE-01      | PASS                         |
| REG-DEDUP-SFILE-01     | PASS                         |
| REG-COUNT-SFILE-01     | PASS                         |
| REG-EDGE-SFILE-01      | PASS                         |
| REG-SNAP-SAFETY-01     | PASS                         |
| REG-DEDUP-SAFETY-01    | PASS                         |
| REG-COUNT-SAFETY-01    | PASS                         |
| REG-EDGE-SAFETY-01     | PASS                         |
| REG-SNAP-APPROVAL-01   | PASS                         |
| REG-DEDUP-APPROVAL-01  | PASS                         |
| REG-COUNT-APPROVAL-01  | PASS                         |
| REG-EDGE-APPROVAL-01   | PASS                         |
| REG-SNAP-AGENTEXEC-01  | PASS                         |
| REG-DEDUP-AGENTEXEC-01 | PASS                         |
| REG-COUNT-AGENTEXEC-01 | PASS                         |
| REG-EDGE-AGENTEXEC-01  | PASS                         |

mixed 型 handler（Phase 1 で mixed 分類された関数）については REG-EDGE-{PREFIX}-02 も PASS であることを確認する。

### Step 4: 既存テスト全体の PASS 確認

`pnpm --filter @repo/desktop test` で全テストを実行し、Wave 1 の新規テスト追加によって既存テストが壊れていないことを確認する。特に以下を確認する:

- `creatorHandlers.registrationSnapshot.test.ts` の全テストが PASS している
- `ipcHandlerRegistrationSnapshot.test.ts` の全テストが PASS している
- `ipc-double-registration.test.ts` の全テストが PASS している
- `index.integration.test.ts` の全テストが PASS している

### Step 5: スナップショットファイルのステージング

生成された 7 つの `.snap` ファイルを git に追加する。スナップショットファイルは CI で差分検出に使用するため、必ずコミット対象に含める。

- `apps/desktop/src/main/ipc/__tests__/__snapshots__/skillHandlers.registrationSnapshot.test.ts.snap`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/llmHandlers.registrationSnapshot.test.ts.snap`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/skillCreatorHandlers.registrationSnapshot.test.ts.snap`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/skillFileHandlers.registrationSnapshot.test.ts.snap`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/safetyGateHandlers.registrationSnapshot.test.ts.snap`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/approvalHandlers.registrationSnapshot.test.ts.snap`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/agentExecutionHandlers.registrationSnapshot.test.ts.snap`

## 注意事項

- このフェーズで handler 実装コード（`registerSkillHandlers` 等）を変更してはならない
- REG-COUNT の期待値が実際のチャンネル数と異なる場合、実装コードではなくテストの期待値を修正する
- スナップショット生成後に handler 実装を見て「チャンネルが多すぎる・少なすぎる」と感じた場合は、本タスクのスコープ外として別タスクで対応する
- mixed 型 handler でチャンネル数が想定と大きく異なる場合（倍以上のずれ）は、Phase 1 の棚卸し結果の見直しを検討する

## NON_VISUAL タスクの記録

本フェーズで追加・変更するファイルは全てテストファイルと `.snap` ファイルのみであり、UI コンポーネント・スタイル・レイアウトへの変更はない。NON_VISUAL タスクとして記録する。

## 参照資料

- Phase 4 で作成したテストファイル 7 本
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（Green 状態の参考）
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/creatorHandlers.registrationSnapshot.test.ts.snap`（既存スナップショットの形式参考）
- `outputs/phase-2/wave-plan.md`（想定チャンネル数の参照）

## 成果物

- `wave-plan.md` で承認された Wave 1 テストファイル群（REG-COUNT 期待値が実際のチャンネル数に更新された状態）
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/` 配下の Wave 1 対応 `.snap` ファイル
- `outputs/phase-5/green-test-result.md`（全 PASS の確認記録。テストID・チャンネル数・実行時間を記載）
- `outputs/phase-5/wave1-channel-counts.md`（各関数の確定チャンネル数一覧）

## 完了条件

- [ ] Wave 1 対象ファイルの必須テストケース（REG-SNAP・REG-DEDUP・REG-COUNT）が PASS している
- [ ] Wave 1 対象分の `.snap` ファイルが `__snapshots__/` 配下に生成されている
- [ ] REG-COUNT の期待値が全て仮値 0 から実際のチャンネル数に更新されている
- [ ] `pnpm --filter @repo/desktop test` 全体実行で既存テストが引き続き PASS している
- [ ] `green-test-result.md` に全 PASS の確認記録が記載されている
- [ ] `wave1-channel-counts.md` に各関数の確定チャンネル数が記載されている
- [ ] handler 実装コードへの変更がないことを `git diff` で確認している

## タスク100%実行確認【必須】

1. `--update-snapshots` を 1 回だけ実行し、その後は通常実行（`--update-snapshots` なし）でテストを確認したか
2. Wave 1 対象分の `.snap` ファイルが全て生成されていることを確認したか
3. REG-COUNT の `N` を全テストファイルで更新したか
4. `git diff apps/desktop/src/main/ipc/` で handler 実装ファイルに変更がないことを確認したか
5. `pnpm --filter @repo/desktop test` 全体で既存テストが PASS していることを確認したか
6. `green-test-result.md` に実行日時・テスト数・実行時間を記録したか

## 次Phase

Phase 6（Wave 2 テスト作成）へ進む。Wave 1 で確立したパターンを再利用して
`wave-plan.md` の Wave 2 対象に対するスナップショットテストファイルを作成する。
`wave1-channel-counts.md` を入力として、Wave 2 の想定チャンネル数との比較に使用する。
