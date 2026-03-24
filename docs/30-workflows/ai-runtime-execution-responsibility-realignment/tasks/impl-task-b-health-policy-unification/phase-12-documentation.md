# Phase 12: ドキュメント

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12 - ドキュメント                      |
| 機能名   | health-policy-unification              |
| タスクID | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 作成日   | 2026-03-24                             |

## 目的

実装ガイド・システム仕様書更新・未タスク検出を行い、HealthPolicy 統一インターフェースの知識を組織に定着させる。Phase 12 は漏れが最も発生しやすい Phase であるため、全チェックリスト項目を逐次確認する。

## 前提成果物

| Phase | 成果物                                                     |
| ----- | ---------------------------------------------------------- |
| 11    | [phase-11-manual-testing.md](./phase-11-manual-testing.md) |

## 参照資料

| 資料名                          | パス / 参照先                                                               |
| ------------------------------- | --------------------------------------------------------------------------- |
| Phase 12 必須チェックリスト     | `.claude/rules/05-task-execution.md#Phase 12 必須チェックリスト`            |
| P1: LOGS.md 2ファイル更新漏れ   | `.claude/rules/06-known-pitfalls.md#P1`                                     |
| P2: topic-map.md 再生成忘れ     | `.claude/rules/06-known-pitfalls.md#P2`                                     |
| P3: 未タスク3ステップ不完全     | `.claude/rules/06-known-pitfalls.md#P3`                                     |
| P4: 早期「完了」記載            | `.claude/rules/06-known-pitfalls.md#P4`                                     |
| P43: サブエージェント分割       | `.claude/rules/06-known-pitfalls.md#P43`                                    |
| P51: 早期完了記載               | `.claude/rules/06-known-pitfalls.md#P51`                                    |
| P56: Issue Close 漏れ           | `.claude/rules/06-known-pitfalls.md#P56`                                    |
| P57: システム仕様書更新先送り   | `.claude/rules/06-known-pitfalls.md#P57`                                    |
| P59: 並列エージェント件数不整合 | `.claude/rules/06-known-pitfalls.md#P59`                                    |
| spec-update-workflow.md         | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md` |

## 実行タスク

### Task 1: 実装ガイド

#### 1-1. implementation-guide.md Part 1（中学生レベル概念説明）

ファイル: `outputs/phase-12/implementation-guide.md`

**「病院の健康診断」に例えた概念説明:**

- HealthPolicy = 健康診断の結果表
  - healthy = 異常なし（全ての検査項目がクリア）
  - degraded = 要経過観察（動けるけど注意が必要）
  - unhealthy = 要治療（今すぐ対処が必要）
  - unknown = 未受診（そもそも検査を受けていない）
- resolveHealthPolicy() = 健康診断を実施する医師
  - 検査結果（HealthPolicyInput）を受け取り、診断結果（HealthPolicy）を返す
- RuntimePolicyResolver = 学校の先生
  - 医師からもらった健康診断結果を見て、「今日の体育に参加させるか」を判断する
  - healthy → 参加OK、degraded → 見学推奨、unhealthy → 保健室へ

#### 1-2. implementation-guide.md Part 2（開発者向け実装詳細）

- HealthPolicy インターフェース定義の詳細
- resolveHealthPolicy() の導出ルール表（優先度順）
- RuntimePolicyResolver への DI パターン
- mainlineAccess.ts での消費パターン
- @deprecated 移行ガイド
- テスト戦略

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新（P1: 2ファイル更新必須）
- [ ] `task-specification-creator/LOGS.md` 更新（P1: 2ファイル更新必須）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当する仕様書の実装ステータスを更新

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-IMP-HEALTH-POLICY-UNIFICATION-001" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 関連仕様書の参照を更新

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] topic-map.md が再生成されている（P2/P27 準拠）
- [ ] `git diff --stat -- .claude/skills/` で変更ファイルを確認

#### Step 2: システム仕様更新

- [ ] 新規インターフェース（HealthPolicy）のアーキテクチャ反映
- [ ] 型定義の仕様書更新（interfaces-\*.md 等）
- [ ] P57 準拠: PR マージを待たず Phase 12 完了時点で更新する

#### Step 3: IPC 契約検証（該当する場合のみ）

本タスクは IPC 修正タスクではないため、Step 3 はスキップ可能。ただし、HealthPolicy が IPC 経由で Renderer に送信される場合は検証が必要。

- [ ] IPC 経由の場合: ipc-contract-checklist.md Phase 1-6 を実施
- [ ] IPC 非経由の場合: スキップ（理由を記録）

### Task 3: documentation-changelog.md

ファイル: `outputs/phase-12/documentation-changelog.md`

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（P4: 全 Step 確認前に「完了」と記載しない）
- [ ] P51 準拠: 事後記録のみ（実行前に完了と書かない）

### Task 4: 未タスク検出

ファイル: `outputs/phase-12/unassigned-task-report.md`

#### 4-1. 未タスク検出

37 ファイルの分散判定ロジックから HealthPolicy への移行が完了していない箇所を検出する。

```bash
# 37 ファイルの health check 関連コードを検索
grep -rn "apiKeyDegraded\|connectionStatus.*===\|isConnected\|healthCheck" apps/desktop/src/ packages/shared/src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|__tests__\|.test." | head -50
```

#### 4-2. 未タスク管理（P3: 3ステップ全完了必須）

検出した未タスクは以下の 3 ステップ全てを完了する:

1. [ ] `docs/30-workflows/unassigned-task/` に指示書作成（P58: 設計タスクでも省略不可）
2. [ ] `task-workflow.md` 残課題テーブルに登録
3. [ ] 関連仕様書に参照リンク追加

#### 4-3. 付随更新

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

## 成果物

| 成果物                               | パス                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| 実装ガイド                           | `outputs/phase-12/implementation-guide.md`                    |
| documentation-changelog              | `outputs/phase-12/documentation-changelog.md`                 |
| 未タスクレポート                     | `outputs/phase-12/unassigned-task-report.md`                  |
| スキルフィードバックレポート         | `outputs/phase-12/skill-feedback-report.md`                   |
| LOGS.md (aiworkflow-requirements)    | `.claude/skills/aiworkflow-requirements/LOGS.md`              |
| LOGS.md (task-specification-creator) | `.claude/skills/task-specification-creator/LOGS.md`           |
| topic-map.md                         | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

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

### Task 1: 実装ガイド

- [ ] Part 1（中学生レベル概念説明）が「病院の健康診断」に例えて記述されている
- [ ] Part 2（開発者向け実装詳細）が記述されている

### Task 2: システム仕様書更新

- [ ] LOGS.md が 2 ファイル更新されている（P1/P25 準拠）
- [ ] SKILL.md の変更履歴が 2 ファイル更新されている
- [ ] topic-map.md が再生成されている（P2/P27 準拠）
- [ ] システム仕様書が Phase 12 完了時点で更新されている（P57 準拠: PR マージを待たない）

### Task 3: documentation-changelog.md

- [ ] 全 Step の完了結果が事後記録されている
- [ ] 全 Step 確認前に「完了」と記載していない（P4 準拠）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` が作成されている（0 件でも必須）
- [ ] 検出された未タスクは 3 ステップ全てが完了している（P3/P58 準拠）
- [ ] P59 準拠: 件数が `unassigned-task-detection.md` と一致している

### Task 5: スキルフィードバックレポート

- [ ] スキルフィードバックレポートが作成されている（0件でも必須、P28 準拠）

### Task 6: Mirror Sync

- [ ] `.claude/skills/` と `.agents/skills/` の差分が 0 である（Mirror Sync 完了）

## 次 Phase

[Phase 13: PR 準備](./phase-13-pr.md)
