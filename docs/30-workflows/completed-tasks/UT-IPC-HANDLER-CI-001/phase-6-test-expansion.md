# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 6                                                 |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 5                                           |
| 後続Phase  | Phase 7                                           |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

境界値・異常系のテストを追加し、堅牢性を高める。

## 背景

Phase 5 で Green 化・スナップショット生成を完了した。
本 Phase では、重複チャンネル追加シナリオ・`ipcMain.on()` 混在シナリオ・`beforeEach` リセット処理の検証を追加し、
境界値と異常系のテストを追加し、回帰テスト網羅性を高める。
特に「重複チャンネルを追加した場合にテストが失敗すること」を意図的に確認することで、
スナップショットテストの検出能力を証明する。

## 実行タスク

1. 重複チャンネルが追加された場合の失敗確認テストを設計する
2. `ipcMain.on()` との混在シナリオの影響確認
3. `beforeEach` でのリセット処理の確認
4. 回帰テスト結果を記録する

## 参照資料

| 参照資料             | パス                                        | 説明           |
| -------------------- | ------------------------------------------- | -------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| Red 結果             | `outputs/phase-4/red-test-result.md`        | Phase 4 成果物 |
| 統合テスト計画       | `outputs/phase-4/integration-test-plan.md`  | Phase 4 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧     | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| スナップショット結果 | `outputs/phase-5/snapshot-result.md`        | Phase 5 成果物 |

## 実行手順

1. Phase 5 成果物（実装サマリー・変更ファイル一覧・スナップショット結果）を確認する。
2. 拡張テストケースを設計・追加する。
3. 全テストを実行し、回帰テスト結果を記録する。
4. 異常系（重複チャンネル追加シナリオ）の動作を確認する。
5. 成果物を `outputs/phase-6/` に保存する。
6. 完了条件を判定する。

## 拡張テストケース仕様

### REG-EDGE-01: 重複チャンネル追加時のテスト失敗確認

| 項目      | 内容                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| テスト ID | REG-EDGE-01                                                                                                               |
| 目的      | 重複チャンネルを追加した場合に REG-DEDUP-01 が失敗することを確認する                                                      |
| 前提条件  | 意図的な重複チャンネル配列または重複登録フィクスチャを用意する                                                            |
| 手順      | 1. capture 条件を整える / 2. 重複チャンネルを返すフィクスチャを呼び出す / 3. 重複検出アサーションが失敗することを確認する |
| 期待結果  | `expect(new Set(handles).size).toBe(handles.length)` が失敗し、テストが RED になる                                        |
| 備考      | `expect.assertions(1)` を用いて「意図的に失敗させる」テストではなく「失敗パスの存在証明」として設計する                   |

### REG-EDGE-02: `ipcMain.on()` 混在時の spy 範囲確認

| 項目      | 内容                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト ID | REG-EDGE-02                                                                                                                                                         |
| 目的      | `ipcMain.on()` 呼び出しが `ipcMain.handle` spy のキャプチャ対象に含まれないことを確認する                                                                           |
| 前提条件  | capture は `ipcMain.handle` にのみ適用されている                                                                                                                    |
| 手順      | 1. `ipcMain.handle` capture と `ipcMain.on` mock を両方セットアップする / 2. 関数を呼び出す / 3. キャプチャ済みチャンネルが `handle` 登録分のみであることを確認する |
| 期待結果  | `ipcMain.on` で登録したチャンネルは `handles` 配列に含まれない                                                                                                      |

### REG-EDGE-03: `beforeEach` リセット処理の正常動作確認

| 項目      | 内容                                                                                          |
| --------- | --------------------------------------------------------------------------------------------- |
| テスト ID | REG-EDGE-03                                                                                   |
| 目的      | テスト間でキャプチャ配列と spy が正しくリセットされることを確認する                           |
| 前提条件  | `beforeEach` で `handles = []` の初期化と `mockImplementation` の再セットアップが行われている |
| 手順      | 1. 1 テスト目を実行する / 2. 2 テスト目で `handles` 配列が空から始まることを確認する          |
| 期待結果  | 各テストで `handles` の長さが独立しており、前テストの登録数が持ち越されない                   |

## テストコード骨格（概念コード）

```typescript
// REG-EDGE-01: 重複チャンネル追加時の失敗確認（フィクスチャによる検証）
describe("重複チャンネル検出", () => {
  it("REG-EDGE-01: 重複チャンネルが存在する場合に検出できる", () => {
    const duplicateHandles = [
      "skill-creator:get-adapter-status",
      "skill-creator:get-adapter-status", // 意図的な重複
      "skill-creator:generate",
    ];
    // Set のサイズ < 配列長 → 重複あり
    expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
  });
});

// REG-EDGE-02: ipcMain.on() 混在時の spy 範囲確認
it("REG-EDGE-02: ipcMain.on() は handle spy に含まれない", () => {
  const onChannels: string[] = [];
  mockIpcMainOn.mockImplementation((channel: string) => {
    onChannels.push(channel);
    return ipcMain;
  });

  const mockWindow = {} as Electron.BrowserWindow;
  registerRuntimeSkillCreatorHandlers(mockWindow);

  // handle と on のチャンネルに重複がないことを確認する
  const overlap = handles.filter((ch) => onChannels.includes(ch));
  expect(overlap).toHaveLength(0);
});

// REG-EDGE-03: beforeEach リセット処理の確認
it("REG-EDGE-03: 各テストで handles が独立している", () => {
  // beforeEach で handles = [] に初期化されているため
  // このテスト開始時点では handles は空のはず
  expect(handles).toHaveLength(0);
});
```

## 統合テスト連携

- 本 Phase の edge case 結果は Phase 11 の `manual-test-result.md` と `discovered-issues.md` に接続する。
- Phase 12 では `edge-case-result.md` を参照し、implementation guide の異常系説明に反映する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 矛盾     | REG-EDGE-01 が「失敗することを確認する」テストであり、CI で誤って失敗しないよう設計されているか確認する  |
| 漏れ     | `ipcMain.handle` 以外の登録メカニズム（例: `ipcMain.on`）の影響が考慮されているか確認する                |
| 整合性   | `beforeEach` と mock reset の処理が全拡張テストで有効であることを確認する                                |
| 依存関係 | Phase 5 のスナップショット結果との整合を取り、拡張テストが既存スナップショットを破壊しないことを確認する |

## 成果物

| 成果物           | パス                                        | 説明                                       |
| ---------------- | ------------------------------------------- | ------------------------------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | REG-EDGE-01, REG-EDGE-02, REG-EDGE-03 仕様 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全テスト実行結果（グリーン確認）           |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | 重複チャンネル追加シナリオの動作確認結果   |

## 完了条件

- [ ] 重複チャンネルを追加した場合にテストが失敗することが確認されている
- [ ] `beforeEach` リセット処理が正しく動作している
- [ ] 全テストがグリーン
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. Phase 5 成果物の確認
2. REG-EDGE-01 テストケースの設計・追加
3. REG-EDGE-02 テストケースの設計・追加
4. REG-EDGE-03 テストケースの設計・追加
5. 全テスト実行・回帰結果の記録
6. 異常系（重複チャンネル）動作確認の記録
7. 成果物出力
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

Phase 7: テストカバレッジ確認
