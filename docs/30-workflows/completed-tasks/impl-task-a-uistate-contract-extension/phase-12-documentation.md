# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 12 - ドキュメント                       |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

実装ガイド、システム仕様書更新、ドキュメント変更ログ、未タスク検出レポートを作成する。Phase 12 は漏れが最も発生しやすい Phase であるため、全項目を逐次確認する。

## 事前チェック【必須】

Phase 12 は漏れが最も発生しやすい Phase である（`.claude/rules/05-task-execution.md` 参照）。実行前に以下の既知の落とし穴を確認すること:

- [ ] P1: LOGS.md は 2 ファイル（aiworkflow-requirements / task-specification-creator）とも更新対象であることを認識している
- [ ] P2: topic-map.md の再生成が必要かどうかを判断済み（セクション追加・削除・更新がある場合は再生成必須）
- [ ] P3: 未タスクの 3 ステップ（①指示書作成 → ②残課題テーブル登録 → ③関連仕様書リンク追加）を認識している
- [ ] P4: documentation-changelog への「完了」記載は全 Step 完了後に行うことを認識している
- [ ] P25: P1 と同じミスの再発パターンを認識している
- [ ] P26: システム仕様書更新を PR マージ後に先送りしないことを認識している
- [ ] P27: セクション追加だけでなく削除・更新も topic-map.md 再生成トリガーであることを認識している
- [ ] P28: スキルフィードバックレポートは改善点なしでも「改善点なし」として作成することを認識している

## 前提成果物

| Phase | 成果物     | パス                |
| ----- | ---------- | ------------------- |
| 11    | 手動テスト | `outputs/phase-11/` |

## 参照資料

| 資料名                          | パス / 説明                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| Phase 12 必須チェックリスト     | `.claude/rules/05-task-execution.md#Phase 12 必須チェックリスト`            |
| P1 LOGS.md 2ファイル更新漏れ    | `.claude/rules/06-known-pitfalls.md#P1`                                     |
| P2 topic-map.md 再生成忘れ      | `.claude/rules/06-known-pitfalls.md#P2`                                     |
| P3 未タスク管理の3ステップ      | `.claude/rules/06-known-pitfalls.md#P3`                                     |
| P4 早期「完了」記載             | `.claude/rules/06-known-pitfalls.md#P4`                                     |
| P43 サブエージェント rate limit | `.claude/rules/06-known-pitfalls.md#P43`                                    |
| P51 早期完了記載                | `.claude/rules/06-known-pitfalls.md#P51`                                    |
| spec-update-workflow.md         | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md` |

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 中学生レベル概念説明（日常例え必須）

`outputs/phase-12/implementation-guide.md` の Part 1 として、以下を含める:

- UiState の 8 値を日常的な例え（例: 信号機の色が増えたイメージ）で説明
- Contract Matrix を「時刻表」や「メニュー表」のような身近な概念で説明
- handoffGuidance を「引き継ぎメモ」のような例えで説明
- Guard 関数を「門番」のような例えで説明

#### Part 2: 開発者向け実装詳細

`outputs/phase-12/implementation-guide.md` の Part 2 として、以下を含める:

- UiState 8 値の型定義と評価優先順位
- resolveUiState() の分岐ロジックの詳細
- resolveCtaContract() の Contract Matrix マッピング
- Guard 関数の使用方法とエラーハンドリング
- 後方互換性の維持方法
- 新値追加時の拡張ガイド

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新（P1/P25 注意: 2ファイル更新）
- [ ] `task-specification-creator/LOGS.md` 更新（P1/P25 注意: 2ファイル更新）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] 該当する実装ステータステーブルの更新（api-endpoints.md 等）

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-IMP-UISTATE-CONTRACT-EXTENSION-001" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成（P2/P27 注意）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行
- [ ] `indexes/topic-map.md` が更新されたことを確認

### Task 3: documentation-changelog.md

P4/P51 準拠: 全 Step 確認前に「完了」と記載しない。各 Step の完了結果を事後記録する。

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了（P3 準拠）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新
- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` で同時に Close（P56 準拠）

### Task 5: スキルフィードバックレポート作成

ファイル: `outputs/phase-12/skill-feedback-report.md`

P28 準拠: Phase 12 で必ずスキル改善検討を実施し、改善点がなくても「改善点なし」としてレポートを作成する。

- [ ] task-specification-creator スキルに対するフィードバック（Phase 1-13 実行で得た知見）
- [ ] aiworkflow-requirements スキルに対するフィードバック（仕様参照で得た知見）
- [ ] 改善点がなくても「改善点なし」としてレポートを作成（0件でも必須）

### Task 6: Mirror Sync

```bash
# .claude/ → .agents/ への同期
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
diff -qr ./.claude/skills/ ./.agents/skills/
```

- [ ] mirror sync が完了している（差分 0）

### P43 対策: サブエージェント分割基準

仕様書更新を複数のサブエージェントで分担する場合:

- 更新対象が 4 ファイル以上の場合はサブエージェントを分割
- 各サブエージェントは 3 ファイル以下に制限
- LOGS.md への「完了」記録は全ファイル更新後の最終ステップ
- 完了後に `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認

## 成果物

| 成果物                       | パス                                          |
| ---------------------------- | --------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`    |
| ドキュメント変更ログ         | `outputs/phase-12/documentation-changelog.md` |
| 未タスクレポート             | `outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`   |
| Phase 12 完了レポート        | `outputs/phase-12/`                           |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] implementation-guide.md Part 1（中学生レベル概念説明、日常例え含む）が作成されている
- [ ] implementation-guide.md Part 2（開発者向け実装詳細）が作成されている
- [ ] LOGS.md が 2 ファイル（aiworkflow-requirements, task-specification-creator）とも更新されている
- [ ] SKILL.md の変更履歴が 2 ファイルとも更新されている
- [ ] topic-map.md が再生成されている
- [ ] documentation-changelog.md に全 Step の完了結果が記録されている
- [ ] unassigned-task-report.md が作成されている（0件でも必須）
- [ ] 検出した未タスクが3ステップで管理されている
- [ ] artifacts.json の Phase 12 ステータスが更新されている
- [ ] スキルフィードバックレポートが作成されている（0件でも必須、P28 準拠）
- [ ] `.claude/skills/` と `.agents/skills/` の差分が 0 である（Mirror Sync 完了）

## 次Phase

[Phase 13: PR 準備](./phase-13-pr.md)
