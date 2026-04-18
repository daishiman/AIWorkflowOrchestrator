# Phase 5: 実装

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 5                                                 |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 4                                           |
| 後続Phase  | Phase 6                                           |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

テストを Green にし、初回スナップショットを生成する。

## 背景

Phase 4 で設計した REG-SNAP-01 / REG-DEDUP-01 のテスト骨格を実際のファイルとして作成し、
`--updateSnapshot` オプションで初回スナップショットを生成する。
あわせて CI ワークフローでの自動実行を確認・設定し、重複チャンネル登録の自動検出体制を確立する。

## 実行タスク

1. `creatorHandlers.registrationSnapshot.test.ts` を新規作成する
2. `pnpm --filter @repo/desktop test -- --updateSnapshot` で初回スナップショット生成
3. CI ワークフロー確認・更新（既存 workflow での自動実行確認）
4. 実装サマリーと変更ファイル一覧を作成する

## 参照資料

| 参照資料        | パス                                           | 説明                                         |
| --------------- | ---------------------------------------------- | -------------------------------------------- |
| テスト仕様書    | `outputs/phase-4/test-specification.md`        | Phase 4 成果物（REG-SNAP-01, REG-DEDUP-01）  |
| Red 結果        | `outputs/phase-4/red-test-result.md`           | Phase 4 成果物（スナップショット未生成状態） |
| 統合テスト計画  | `outputs/phase-4/integration-test-plan.md`     | Phase 4 成果物                               |
| ハンドラ実装    | `apps/desktop/src/main/ipc/creatorHandlers.ts` | 対象ハンドラファイル                         |
| CI ワークフロー | `.github/workflows/`                           | 既存 CI ワークフロー                         |

## 実行手順

1. Phase 4 成果物（テスト仕様書・Red 結果・統合テスト計画）を確認する。
2. `creatorHandlers.registrationSnapshot.test.ts` を作成する。
3. `pnpm --filter @repo/desktop test -- --updateSnapshot` を実行し、スナップショットを生成する。
4. `.github/workflows/` を確認し、テストが CI で自動実行される設定を検証・追加する。
5. 実装サマリー・変更ファイル一覧・スナップショット内容を `outputs/phase-5/` に保存する。
6. 完了条件を判定する。

## 作成対象ファイル

### テストファイル

```
apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts
```

Phase 4 で設計した概念コードを元に、以下の点に注意して実装する。

- `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` で `ipcMain.handle` を capture する
- `beforeEach` でキャプチャ配列を初期化し、`vi.clearAllMocks()` でモック状態をリセットする
- `registerRuntimeSkillCreatorHandlers(mockWindow)` の引数に適切なモック `BrowserWindow` を渡す
- REG-SNAP-01: `expect(handles).toMatchSnapshot()` でチャンネル一覧を固定する
- REG-DEDUP-01: `expect(new Set(handles).size).toBe(handles.length)` で重複を検出する

### スナップショットファイル（自動生成）

```
apps/desktop/src/main/ipc/__tests__/__snapshots__/creatorHandlers.registrationSnapshot.test.ts.snap
```

`--updateSnapshot` 実行後に自動生成される。内容は `outputs/phase-5/snapshot-result.md` に記録する。

## CI ワークフロー確認観点

| 確認項目                                 | 確認方法                                                   |
| ---------------------------------------- | ---------------------------------------------------------- |
| desktop テストが CI に含まれているか     | `.github/workflows/` 内の `test` ジョブを確認する          |
| スナップショット不一致で CI が失敗するか | `--updateSnapshot` なし実行で失敗することを確認する        |
| PR マージ前にテストが実行されるか        | branch protection rules または workflow trigger を確認する |

## 統合テスト連携

- Phase 4 の `REG-*` 仕様と Phase 6 の edge case を壊さないことを実装完了条件に含める。
- Phase 12 の implementation guide には、本 Phase で確定した capture パターンと実行コマンドを同期する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                      |
| -------- | --------------------------------------------------------------------------------------------- |
| 矛盾     | 生成されたスナップショットが Phase 4 仕様の期待チャンネル一覧と一致しているか確認する         |
| 漏れ     | `creatorHandlers.ts` の全 `ipcMain.handle` 呼び出しがスナップショットに含まれているか確認する |
| 整合性   | CI での実行コマンドがローカル実行と同等であることを確認する                                   |
| 依存関係 | Phase 4 成果物を全て参照した上で実装していることを確認する                                    |

## 成果物

| 成果物               | パス                                        | 説明                           |
| -------------------- | ------------------------------------------- | ------------------------------ |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | 実装内容と手順のサマリー       |
| 変更ファイル一覧     | `outputs/phase-5/changed-files.md`          | 新規作成・変更したファイル一覧 |
| スナップショット結果 | `outputs/phase-5/snapshot-result.md`        | 初回スナップショットの内容     |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test` が全パス
- [ ] スナップショットファイルが生成されている
- [ ] CI で自動実行される設定が確認または追加されている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. Phase 4 成果物の確認
2. テストファイルの作成
3. 初回スナップショット生成（`--updateSnapshot`）
4. CI ワークフローの確認・更新
5. 実装サマリーの作成
6. 変更ファイル一覧の作成
7. スナップショット内容の記録
8. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
```

## 次のPhase

Phase 6: テスト拡充
