# Phase 6: テスト拡充

## メタ情報

| 項目               | 内容                                                 |
| ------------------ | ---------------------------------------------------- |
| Phase              | 6                                                    |
| Phase名            | テスト拡充                                           |
| タスクID           | TASK-9B                                              |
| 機能名             | task-9b-skill-creator                                |
| 作成日             | 2026-02-26                                           |
| ステータス         | pending                                              |
| 前Phase            | [Phase 5: 実装](phase-5-implementation.md)           |
| 後続Phase          | [Phase 7: カバレッジ確認](phase-7-coverage-check.md) |
| 成果物ディレクトリ | outputs/phase-6/                                     |

## 目的

Phase 5の実装に対してカバレッジを測定し、不足箇所のテストを追加してカバレッジ目標を達成する。
Phase 4で作成したテスト（Green状態）に加え、実装で判明した分岐・エッジケース・エラーハンドリングパスを網羅する。

## 参照資料テーブル

| 参照資料          | パス                                                                                            | 用途                   |
| ----------------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 4テスト仕様 | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-4/test-specification.md` | 既存テスト一覧         |
| Phase 5実装コード | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` 他                                | カバレッジ対象         |
| テストパターン    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`               | テスト設計パターン参照 |
| 品質基準          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                     | カバレッジ判定基準     |
| Agent IPC仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | IPCテスト観点          |
| セキュリティ仕様  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                       | セキュリティテスト要件 |
| 実装パターン      | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`     | テストパターン         |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | Phase 5時点の値（測定後記入） |
| ----------------- | -------- | -------- | ----------------------------- |
| Line Coverage     | 80%      | 90%      | \_%                           |
| Branch Coverage   | 60%      | 70%      | \_%                           |
| Function Coverage | 80%      | 90%      | \_%                           |

## 結合テストカバレッジ基準

| 指標           | 最低基準 | 推奨基準 | Phase 5時点の値（測定後記入） |
| -------------- | -------- | -------- | ----------------------------- |
| API カバレッジ | 100%     | 100%     | \_%                           |
| 正常系         | 100%     | 100%     | \_%                           |
| 異常系         | 80%      | 90%      | \_%                           |

## 実行タスク

- Task 6-1: カバレッジ測定で現状を把握する
- Task 6-2: カバレッジギャップを分析する
- Task 6-3: ユニットテストを追加する
- Task 6-4: 統合テストを追加する
- Task 6-5: カバレッジを再測定して基準充足を確認する

### Task 6-1: カバレッジ測定（現状把握）

以下のコマンドでカバレッジを測定する:

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreator \
  src/main/services/skill/__tests__/HearingFacilitator \
  src/main/services/skill/__tests__/TaskGenerator \
  src/main/services/skill/__tests__/CodeGenerator \
  src/main/services/skill/__tests__/Validator \
  src/main/ipc/__tests__/skillCreator \
  --coverage
```

測定結果を以下の形式で記録する:

| ファイル                | Line | Branch | Function | 未カバー行番号 |
| ----------------------- | ---- | ------ | -------- | -------------- |
| SkillCreatorService.ts  | \_%  | \_%    | \_%      | （測定後記入） |
| HearingFacilitator.ts   | \_%  | \_%    | \_%      | （測定後記入） |
| TaskGenerator.ts        | \_%  | \_%    | \_%      | （測定後記入） |
| CodeGenerator.ts        | \_%  | \_%    | \_%      | （測定後記入） |
| ApiIntegrator.ts        | \_%  | \_%    | \_%      | （測定後記入） |
| SkillValidator.ts       | \_%  | \_%    | \_%      | （測定後記入） |
| skillCreatorHandlers.ts | \_%  | \_%    | \_%      | （測定後記入） |

### Task 6-2: ギャップ分析

カバレッジ不足箇所を以下のカテゴリに分類する:

| カテゴリ               | 内容                                           | 追加テスト方針                     |
| ---------------------- | ---------------------------------------------- | ---------------------------------- |
| 未カバーの条件分岐     | switch文のdefault、if/elseの未通過パス         | 各分岐を通過するテストを追加       |
| エラーハンドリングパス | try/catch、Error throw、sanitizeErrorMessage   | 異常系テストを追加                 |
| privateメソッド        | Facadeから呼ばれる内部メソッド                 | Facadeのpublicメソッド経由でカバー |
| コールバック関数       | getAllowedWindows等のインライン関数（P41対策） | コールバックの戻り値を明示的に検証 |
| 境界条件               | 空配列、null/undefined、最大値                 | 境界値テストを追加                 |

### Task 6-3: ユニットテスト追加

Phase 5実装で判明した以下の追加テストケースを作成する:

#### SkillCreatorService 追加テスト

| テストID  | テスト名                                                  | カバー対象                         |
| --------- | --------------------------------------------------------- | ---------------------------------- |
| SC-EX-001 | improveSkill: autoApply=true で自動修正が適用される       | improveSkill() の autoApply 分岐   |
| SC-EX-002 | improveSkill: targetAreas 指定で対象領域を限定する        | improveSkill() の targetAreas 分岐 |
| SC-EX-003 | forkSkill: sourceName がパストラバーサルで拒否される      | forkSkill() のバリデーション       |
| SC-EX-004 | shareSkill: format="zip" でZIPファイルが生成される        | shareSkill() の format 分岐        |
| SC-EX-005 | shareSkill: format="tar" でtarballが生成される            | shareSkill() の format 分岐        |
| SC-EX-006 | shareSkill: format="directory" でディレクトリコピーされる | shareSkill() の format 分岐        |
| SC-EX-007 | scheduleSkill: 不正なcron式でエラーを返す                 | scheduleSkill() のバリデーション   |
| SC-EX-008 | debugSkill: breakpoints 指定で特定行で停止する            | debugSkill() の breakpoints 分岐   |
| SC-EX-009 | getStats: skillName 未指定で全スキルの統計を返す          | getStats() の optional 分岐        |
| SC-EX-010 | executeTasks: タスク0件で空レポートを返す（既存拡充）     | executeTasks() の空リスト分岐      |

#### サブコンポーネント追加テスト

| テストID  | テスト名                                                | カバー対象                      |
| --------- | ------------------------------------------------------- | ------------------------------- |
| HF-EX-001 | processAnswer: 回答から複数の features を抽出する       | processAnswer() の複数結果パス  |
| HF-EX-002 | completeInterview: constraints が空の場合に空配列を返す | completeInterview() のnull安全  |
| TG-EX-001 | generateTasks: 10件超のタスクを正しく分割する           | generateTasks() の大量入力      |
| TG-EX-002 | groupParallelTasks: 全タスクが独立の場合に1グループ     | groupParallelTasks() の全独立   |
| CG-EX-001 | generateWithSDK: SDK タイムアウト時にエラーを返す       | generateWithSDK() のtimeout     |
| CG-EX-002 | generateFromTemplate: 未定義変数が残る場合に警告        | generateFromTemplate() の未置換 |
| VL-EX-001 | validateSecurity: シンボリックリンクを拒否する          | validateSecurity() のsymlink    |
| VL-EX-002 | validateSchema: data が null の場合にエラーを返す       | validateSchema() のnull入力     |

#### IPCハンドラ追加テスト

| テストID   | テスト名                                                    | カバー対象                        |
| ---------- | ----------------------------------------------------------- | --------------------------------- |
| IPC-EX-001 | skill-creator:improve: サービス例外時にsanitizeエラー返却   | improve ハンドラのcatch分岐       |
| IPC-EX-002 | skill-creator:fork: sourceName 未指定でエラー               | fork ハンドラのバリデーション分岐 |
| IPC-EX-003 | skill-creator:schedule: schedule オブジェクト不正でエラー   | schedule ハンドラの型チェック分岐 |
| IPC-EX-004 | 全ハンドラ: BrowserWindow.isDestroyed()=true で送信スキップ | progress送信のisDestroyed分岐     |
| IPC-EX-005 | unregisterSkillCreatorHandlers: 全チャンネルが解除される    | unregister のチャンネル数一致     |

### Task 6-4: 統合テスト追加

| テストID   | テスト名                                                | カバー対象              |
| ---------- | ------------------------------------------------------- | ----------------------- |
| INT-EX-001 | スキル改善フロー: improve → validate → 改善結果確認     | improveSkill 統合フロー |
| INT-EX-002 | スキルフォーク→検証フロー: fork → validate              | forkSkill 統合フロー    |
| INT-EX-003 | デバッグ実行→ログ出力フロー: debug → ログ検証           | debugSkill 統合フロー   |
| INT-EX-004 | ドキュメント生成フロー: generateDocs → ファイル存在確認 | generateDocs 統合フロー |

### Task 6-5: カバレッジ再測定

Task 6-1と同じコマンドでカバレッジを再測定し、結果を記録する。

## 統合テスト連携【必須】

| テストカテゴリ         | 検証項目                                                | 目標カバレッジ |
| ---------------------- | ------------------------------------------------------- | -------------- |
| Facade公開メソッド網羅 | 全9つのpublicメソッドの正常系・異常系                   | Function 100%  |
| IPCチャンネル全網羅    | 全12チャンネル（既存5 + 新規7）の正常/異常/セキュリティ | Line 90%+      |
| サブコンポーネント分岐 | 各コンポーネントの条件分岐を網羅                        | Branch 70%+    |
| エラーハンドリング     | sanitize、Error throw、catch パス                       | Line 80%+      |
| 統合フロー             | 主要4フローの端到端テスト                               | 全フロー成功   |

## 既知のPitfall対策テーブル

| Pitfall ID | 注意事項                             | Phase 6での対策                                        |
| ---------- | ------------------------------------ | ------------------------------------------------------ |
| P41        | v8カバレッジのインライン関数カウント | getAllowedWindows コールバックの戻り値を明示的に検証   |
| P9         | テスト間状態リーク                   | 追加テストでも beforeEach で vi.clearAllMocks() を徹底 |
| P40        | テスト実行ディレクトリ依存           | `pnpm --filter @repo/desktop exec vitest run` で実行   |
| P13        | タイマーテスト無限ループ             | timeout テストでは advanceTimersByTime を使用          |

## 多角的チェック観点（AIが判断）

### カバレッジ網羅性観点

- [ ] 全ファイルの Line Coverage が80%以上である
- [ ] 全ファイルの Branch Coverage が60%以上である
- [ ] 全ファイルの Function Coverage が80%以上である
- [ ] カバレッジが目標未達のファイルがリストアップされている

### エッジケース観点

- [ ] null/undefined 入力に対するテストが追加されている
- [ ] タイムアウト・ネットワークエラーに対するテストが追加されている
- [ ] 大量データ入力（1000件タスク）に対するテストが含まれている
- [ ] 並行実行時の競合条件に対するテストが検討されている

### リグレッション観点

- [ ] Phase 4の既存テストが全てGreen（成功）のままである
- [ ] 追加テストがPhase 4テストと重複していない
- [ ] モック設定が既存テストに影響を与えていない

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                               | 仕様参照先                                         |
| -------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（バックエンドテスト拡充のみ）                   | -                                                  |
| バックエンド（Main）       | 必須（サブコンポーネント分岐・エラーパスのテスト追加） | aiworkflow-requirements: arch-electron-services.md |
| IPC通信                    | 必須（全12チャンネルの異常系・セキュリティテスト拡充） | aiworkflow-requirements: api-ipc-agent.md          |
| Preload/セキュリティ       | 確認のみ（Preload APIテストの継続成功を確認）          | aiworkflow-requirements: security-api-electron.md  |
| ローカルストレージ         | 非該当（DB変更なし）                                   | -                                                  |

## サブタスク管理

| サブタスクID | 内容                       | 状態    | 依存関係 |
| ------------ | -------------------------- | ------- | -------- |
| 6-1          | カバレッジ測定（現状把握） | pending | なし     |
| 6-2          | ギャップ分析               | pending | 6-1      |
| 6-3          | ユニットテスト追加         | pending | 6-2      |
| 6-4          | 統合テスト追加             | pending | 6-2      |
| 6-5          | カバレッジ再測定           | pending | 6-3, 6-4 |

## タスク100%実行確認【必須】

- [ ] カバレッジ測定コマンドが正常に実行される
- [ ] ギャップ分析テーブルが記入されている
- [ ] ユニットテスト追加（SC-EX-001〜SC-EX-010, HF-EX-001〜HF-EX-002, TG-EX-001〜TG-EX-002, CG-EX-001〜CG-EX-002, VL-EX-001〜VL-EX-002, IPC-EX-001〜IPC-EX-005）が全て作成されている
- [ ] 統合テスト追加（INT-EX-001〜INT-EX-004）が全て作成されている
- [ ] 追加テスト合計29件が全てGreen（成功）である
- [ ] カバレッジ再測定結果が記録されている
- [ ] 全カバレッジ指標が最低基準を満たしている

## Phase完了時の検証コマンド

```bash
# Phase出力検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 6

# カバレッジ付きテスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreator \
  src/main/services/skill/__tests__/HearingFacilitator \
  src/main/services/skill/__tests__/TaskGenerator \
  src/main/services/skill/__tests__/CodeGenerator \
  src/main/services/skill/__tests__/Validator \
  src/main/ipc/__tests__/skillCreator \
  --coverage
```

## 成果物テーブル

| 成果物名              | パス                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| カバレッジレポート    | `outputs/phase-6/coverage-report.md`                                                             |
| 統合テスト結果        | `outputs/phase-6/integration-test.md`                                                            |
| 追加テスト（Service） | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（拡充）             |
| 追加テスト（サブ）    | `apps/desktop/src/main/services/skill/__tests__/*.test.ts`（各ファイル拡充）                     |
| 追加テスト（IPC）     | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.*.test.ts`（拡充）                     |
| 統合テスト（追加）    | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.integration.test.ts`（拡充） |

## 完了条件

- [ ] Line Coverage 80%以上（全対象ファイル）
- [ ] Branch Coverage 60%以上（全対象ファイル）
- [ ] Function Coverage 80%以上（全対象ファイル）
- [ ] Phase 4 + Phase 6の全テストがGreen（成功）である
- [ ] 統合テスト4件が全て成功している
- [ ] カバレッジレポートが `outputs/phase-6/` に出力されている

## 次Phase

Phase 6完了後、[Phase 7: カバレッジ確認](phase-7-coverage-check.md)へ進む。
カバレッジ基準未達の場合はPhase 6に戻り、追加テストを実施する。
