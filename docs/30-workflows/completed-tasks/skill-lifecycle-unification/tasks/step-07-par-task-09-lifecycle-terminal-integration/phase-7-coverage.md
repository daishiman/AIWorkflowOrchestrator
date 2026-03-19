# Phase 7 カバレッジ確認 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                               |
| Phase      | 7 - カバレッジ確認                                                                        |
| ステータス | 未着手                                                                                    |
| 前提 Phase | Phase 6 完了（テスト拡充済み・全追加テストが PASS していること）                          |
| 成果物     | `outputs/phase-7/coverage-report.md`                                                      |
| 次 Phase   | PASS → Phase 8 リファクタリング、未達 → Phase 6 へ戻る（最大 3 回リトライ）               |
| ゲート     | 全対象ファイルが Line 80%・Branch 60%・Function 80% を達成している場合のみ Phase 8 へ進む |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントに委譲する場合、既存テストのインポートパスを確認してから記述する（P63 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

Phase 4〜6 で作成・拡充したテストが、実装対象ファイルのカバレッジ基準を充足しているかを計測・判定する。基準未達の場合は Phase 6 へ戻り不足テストを追加する。

## 実行タスク

### Task 7-1: カバレッジ計測実行

以下のコマンドを実行して、対象ファイルのカバレッジレポートを生成する。

```bash
cd apps/desktop && pnpm vitest run --coverage
```

対象ファイル（以下の全ファイルのカバレッジを確認する）:

| ファイル                                                             | 役割                                      |
| -------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | Terminal ボタン・TerminalHandoffCard 統合 |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | buildForSkillImprovement() 新メソッド     |
| IPC ハンドラファイル（Phase 5 で確定）                               | skill:buildImprovementHandoff ハンドラ    |

### Task 7-2: カバレッジ基準判定

計測結果を以下の記録表に記入し、全ファイルが最低基準を満たしているかを判定する。

#### カバレッジ基準テーブル（`02-code-quality.md` より）

| 指標              | 最低基準（必達） | 推奨基準 | 未達時の対応   |
| ----------------- | ---------------- | -------- | -------------- |
| Line Coverage     | 80%              | 90%      | Phase 6 へ戻る |
| Branch Coverage   | 60%              | 70%      | Phase 6 へ戻る |
| Function Coverage | 80%              | 90%      | Phase 6 へ戻る |

#### 計測結果記録表

| ファイル                       | Line % | Branch % | Function % | Line 達成 | Branch 達成 | Function 達成 | 総合判定 |
| ------------------------------ | ------ | -------- | ---------- | --------- | ----------- | ------------- | -------- |
| SkillLifecyclePanel.tsx        | -      | -        | -          | -         | -           | -             | 未計測   |
| TerminalHandoffBuilder.ts      | -      | -        | -          | -         | -           | -             | 未計測   |
| IPC ハンドラ（Phase 5 で確定） | -      | -        | -          | -         | -           | -             | 未計測   |

#### ゲート条件テーブル

| 判定     | 条件                                                                               | 対応                                                                            |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| PASS     | 全対象ファイルで Line 80% 以上・Branch 60% 以上・Function 80% 以上                 | Phase 8 リファクタリング (`phase-8-refactor.md`) へ進む                         |
| FAIL     | いずれか1ファイルでも最低基準を満たしていない                                      | Phase 6 テスト拡充 (`phase-6-test-expansion.md`) へ戻る                         |
| CRITICAL | 3 回リトライ後も基準未達（理由を `outputs/phase-7/coverage-report.md` に記録済み） | 理由を明記した上で Phase 8 へ進む（技術的負債として `unassigned-task/` に登録） |

### Task 7-3: 未達時の対応

カバレッジ基準を満たしていない場合、以下の手順で対応する。

#### Step 7-3-1: 未達箇所の特定

カバレッジレポートから、基準未達のファイルと未カバーのコード行・分岐・関数を特定する。

記録形式:

```
ファイル名: SkillLifecyclePanel.tsx
未達指標: Branch Coverage 55%（基準 60%）
未カバー箇所:
  - L245-251: handoffGuidance が null の場合の早期 return 分岐
  - L312: creatorImproveResult が非 null（improve フェーズ相当）かつ improvementCount === 0 の組合せ分岐
```

#### Step 7-3-2: Phase 6 へ戻る（リトライ）

Phase 6 (`phase-6-test-expansion.md`) へ戻り、特定した未達箇所に対するテストケースを追加する。

リトライ上限: 3 回。各リトライの結果を `outputs/phase-7/coverage-report.md` に記録する。

| リトライ回数 | Phase 6 追加テスト内容 | 再計測後のカバレッジ | 基準達成 |
| ------------ | ---------------------- | -------------------- | -------- |
| 1 回目       | -                      | -                    | -        |
| 2 回目       | -                      | -                    | -        |
| 3 回目       | -                      | -                    | -        |

#### Step 7-3-3: 3 回未達時の処理（CRITICAL 対応）

3 回リトライ後も基準未達の場合、以下を実施して Phase 8 へ進む。

1. 未達の理由を `outputs/phase-7/coverage-report.md` に記録する
   - 未達の根本原因（テストが書けない理由、例: Electron 固有の API が happy-dom で再現不可等）
   - 未達指標と実測値
   - リスク評価（品質への影響度: 低・中・高）
2. 技術的負債として未タスクを登録する（P3 準拠の3ステップ）
   - `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/unassigned-task/` に指示書を作成
   - `task-workflow.md` 残課題テーブルに登録
   - 関連仕様書に参照リンクを追加

## 参照資料

| 資料                   | パス                                                                                                                               | 参照目的                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                                                                                 | カバレッジ基準の確認                       |
| Phase 6 テスト拡充仕様 | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/phase-6-test-expansion.md` | 追加テストケース一覧と判断基準             |
| 未タスク管理ルール     | `.claude/rules/05-task-execution.md#Task 4`                                                                                        | CRITICAL 時の未タスク3ステップ登録         |
| 既知の落とし穴（P3）   | `.claude/rules/06-known-pitfalls.md#P3`                                                                                            | 未タスク管理の3ステップ不完全防止          |
| 既知の落とし穴（P40）  | `.claude/rules/06-known-pitfalls.md#P40`                                                                                           | テスト実行ディレクトリ依存（モノレポ）確認 |

## 実行手順

1. `cd apps/desktop && pnpm vitest run --coverage` を実行してカバレッジレポートを生成する
2. 対象3ファイル（SkillLifecyclePanel.tsx・TerminalHandoffBuilder.ts・IPC ハンドラ）のカバレッジ値を Task 7-2 の記録表に転記する
3. 全ファイルで Line 80%・Branch 60%・Function 80% を達成しているかを判定する
4. PASS の場合: 判定結果を `outputs/phase-7/coverage-report.md` に記録し、Phase 8 へ進む
5. FAIL の場合: Step 7-3-1 で未達箇所を特定し、Phase 6 へ戻る
6. Phase 6 からリトライ後に再び本 Phase を実行する（リトライ回数を記録表に記録する）
7. 3 回リトライ後も未達の場合: Step 7-3-3 の CRITICAL 対応を実施し、Phase 8 へ進む

## 成果物

| 成果物             | パス                                 | 完了条件                                                                                   |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| coverage-report.md | `outputs/phase-7/coverage-report.md` | 全対象ファイルのカバレッジ値・判定結果（PASS/FAIL/CRITICAL）・リトライ記録が記載されている |

`outputs/phase-7/coverage-report.md` に記録する項目:

- 計測日時
- 計測コマンド
- 対象ファイルのカバレッジ値（Line/Branch/Function）
- 判定結果（PASS/FAIL/CRITICAL）
- FAIL の場合: 未達ファイル名・未達指標・未達箇所のファイル行番号
- リトライ実施回数と各回の再計測値
- CRITICAL の場合: 未達の根本原因・リスク評価・未タスク登録先

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスクを実行した
- [ ] 各タスクの成果物が全て生成されている
- [ ] 成果物の内容が各タスクの仕様を満たしている

## 統合テスト連携

本 Phase のカバレッジ計測結果は、Phase 6 へのフィードバックループで使用される。

- 基準未達の場合は Phase 6 へ戻り、不足テストを追加する（最大 3 回リトライ）
- カバレッジレポートは Phase 10 最終レビューの品質確認根拠として参照される

## 多角的チェック観点

| 観点             | 確認内容                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------- |
| 対象ファイル網羅 | SkillLifecyclePanel.tsx・TerminalHandoffBuilder.ts・IPC ハンドラの3対象が計測に含まれているか |
| 基準値           | Line 80%/90%、Branch 60%/70%、Function 80%/90% の最低/推奨基準が明記されているか              |
| リトライ回数     | Phase 6 へのリトライ回数が記録されているか                                                    |

## 完了条件チェックリスト

- [ ] `cd apps/desktop && pnpm vitest run --coverage` を実行している
- [ ] SkillLifecyclePanel.tsx のカバレッジ値（Line/Branch/Function）を記録している
- [ ] TerminalHandoffBuilder.ts のカバレッジ値（Line/Branch/Function）を記録している
- [ ] IPC ハンドラファイルのカバレッジ値（Line/Branch/Function）を記録している
- [ ] 全ファイルに対して PASS/FAIL の判定を実施している
- [ ] PASS の場合: `outputs/phase-7/coverage-report.md` が作成されている
- [ ] FAIL の場合: 未達箇所を特定し、Phase 6 へ戻る判断が記録されている
- [ ] CRITICAL の場合: 根本原因・リスク評価・未タスク登録（3ステップ全完了）が記録されている

## 次 Phase

- PASS（全ファイル基準達成）→ Phase 8 リファクタリング (`phase-8-refactor.md`)
- FAIL（基準未達）→ Phase 6 テスト拡充 (`phase-6-test-expansion.md`) へ戻る（リトライ上限: 3 回）
- CRITICAL（3 回リトライ後も未達）→ 理由を記録して Phase 8 リファクタリング (`phase-8-refactor.md`) へ進む
