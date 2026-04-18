# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 7                                                 |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 6                                           |
| 後続Phase  | Phase 8                                           |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

スナップショットテストのカバレッジ状況を確認し、トレーサビリティを確保する。`registerRuntimeSkillCreatorHandlers()` が登録する全 `ipcMain.handle()` チャンネルに対してテストケースが対応していることを数値と対応表で証明し、未到達コードパスの意図を記録する。

## 実行タスク

### タスク 7-1: カバレッジ計測の実行

1. 以下のコマンドを実行してカバレッジレポートを生成する。

   ```bash
   pnpm --filter @repo/desktop test -- --coverage
   ```

2. `creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` のカバレッジ率（行・関数・分岐）を記録する。
3. カバレッジ出力（`coverage/` ディレクトリ）の HTML または JSON を参照し、数値を `outputs/phase-7/coverage-plan.md` に記載する。

### タスク 7-2: 未到達コードパスの分析

1. カバレッジレポートで赤表示（未到達）になっているコードパスを列挙する。
2. 各未到達パスについて、以下を判定する。
   - 意図的なスキップか
   - テストケース不足によるものか
3. 分析結果を `outputs/phase-7/uncovered-analysis.md` に記載する。

### タスク 7-3: トレーサビリティの網羅確認

1. `outputs/phase-1/acceptance-criteria.md` に記載された受け入れ基準と、各テストケースの対応関係を表形式で整理する。
2. 要件 ID（REG-SNAP-01 / REG-DEDUP-01）がどのテストケースでカバーされているかを明示する。
3. 網羅率レポートを `outputs/phase-7/traceability-coverage-report.md` に記載する。

## 参照資料

- `outputs/phase-6/` — Phase 6 成果物（テスト実装・実行結果）
- `outputs/phase-1/acceptance-criteria.md` — 受け入れ基準との対応確認
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts` — 対象テストファイル
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — カバレッジ計測対象

## 実行手順

1. Phase 6 成果物と対象テストファイルを確認する。
2. カバレッジ計測を実行し、対象関数の行・関数・分岐カバレッジを記録する。
3. 未到達コードパスを「意図的」または「テスト不足」に分類する。
4. 受け入れ基準とテストケースの対応表を作成し、網羅率を算出する。
5. 成果物を `outputs/phase-7/` に保存し、完了条件を判定する。

## 成果物

`outputs/phase-7/` 配下に以下を作成する。

| ファイル名                        | 内容                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `coverage-plan.md`                | カバレッジ計画（計測方法・目標値・実測値）                   |
| `uncovered-analysis.md`           | 未到達コードパスの分析結果（意図的・テスト不足の分類と根拠） |
| `traceability-coverage-report.md` | 要件 → テストケース → カバレッジの対応表と網羅率サマリー     |

## 統合テスト連携

- Phase 4 の REG-SNAP-01 / REG-DEDUP-01 と Phase 6 の REG-EDGE-01〜03 の対応を 1 つのトレーサビリティ表で統合管理する。
- CI 実行コマンドとローカル実行コマンドの差異がある場合は `coverage-plan.md` に明記し、Phase 9 の品質監査へ引き渡す。

## 多角的チェック観点

| 観点     | 確認内容                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------- |
| 矛盾     | カバレッジ数値と traceability で示す対象テストが食い違っていないか確認する                     |
| 漏れ     | 受け入れ基準、異常系、未到達コード分析が全て成果物へ反映されているか確認する                   |
| 整合性   | カバレッジ計測コマンド、出力先、引用するテスト ID が全成果物で統一されているか確認する         |
| 依存関係 | Phase 6 の実装結果を前提にし、Phase 8 のリファクタリング判断に必要な情報が揃っているか確認する |

## 完了条件

- [ ] `registerRuntimeSkillCreatorHandlers()` のカバレッジ率（行・関数・分岐）が `coverage-plan.md` に記録されている
- [ ] 要件 ID `REG-SNAP-01` が対応するテストケースでカバーされていることが確認されている
- [ ] 要件 ID `REG-DEDUP-01` が対応するテストケースでカバーされていることが確認されている
- [ ] 全未到達パスが「意図的」または「テスト不足」として分類されている
- [ ] `traceability-coverage-report.md` の網羅率が 100% か、不足分の理由が記録されている

## サブタスク管理

1. Phase 6 成果物の確認
2. カバレッジ計測
3. 未到達コードパス分析
4. トレーサビリティ表作成
5. 成果物出力
6. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
```

## 次のPhase

Phase 8: リファクタリング
