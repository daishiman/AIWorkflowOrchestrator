# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 12                                 |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

実装ガイド・システム仕様書更新・未タスク検出・スキルフィードバックを実施する。

## 参照資料

| 資料名                  | パス                                                                        | 説明               |
| ----------------------- | --------------------------------------------------------------------------- | ------------------ |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md#Phase 12`                               | 必須チェックリスト |
| spec-update-workflow    | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md` | 仕様書更新手順     |

## 事前チェック【必須】

Phase 12 で漏れやすい既知の落とし穴を事前確認する:

| #   | Pitfall                                          | 対策                                                              | チェック |
| --- | ------------------------------------------------ | ----------------------------------------------------------------- | -------- |
| 1   | P1/P25: LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements + task-specification-creator の両方を更新 | [ ]      |
| 2   | P2/P27: topic-map.md 再生成忘れ                  | `node generate-index.js` を実行                                   | [ ]      |
| 3   | P3/P38: 未タスク管理の3ステップ不完全            | ①指示書 → ②残課題テーブル → ③関連仕様書リンク                     | [ ]      |
| 4   | P4/P51: documentation-changelog への早期完了記載 | 全 Step 完了後に事後記録                                          | [ ]      |
| 5   | P26: システム仕様書更新遅延                      | Phase 12 完了時点で更新する                                       | [ ]      |
| 6   | P28/P29: SKILL.md 変更履歴の更新漏れ             | 両方の SKILL.md を更新                                            | [ ]      |
| 7   | P43: サブエージェント rate limit                 | 3ファイル以下/エージェントに分割                                  | [ ]      |
| 8   | P56: 再評価クローズ時の Issue Close              | `gh issue close` で同時に Close                                   | [ ]      |
| 9   | P57: 設計タスクでの先送りパターン                | Phase 12 完了時点で実更新                                         | [ ]      |

## 実行タスク

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

- IPC sender 検証を「受付の身分証確認」に例えて説明
- なぜ全てのハンドラで検証が必要かを日常的な言葉で解説

#### Part 2: 開発者向け実装詳細

- `validateIpcSender` の使い方
- `registerPermissionStoreHandlers` のシグネチャ変更内容
- テストでのモック方法

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（2ファイル両方）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] `security-electron-ipc-core.md` の sender 検証適用状況テーブルを更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "UT-06-002" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成

#### Step 2: システム仕様更新

| 判断項目                  | 結果 | 理由                                                     |
| ------------------------- | ---- | -------------------------------------------------------- |
| 新規インターフェース追加  | なし | 既存の `withValidation` パターンを適用                   |
| アーキテクチャ変更        | なし | IPC ハンドラ内部の変更のみ                               |
| IPC チャンネル追加/変更   | なし | 既存チャンネルの内部実装変更のみ                         |
| sender 検証適用状況の更新 | 必要 | `security-electron-ipc-core.md` の適用状況テーブルを更新 |

→ `security-electron-ipc-core.md` の sender 検証適用状況のみ更新する。

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録
- [ ] `artifacts.json` の Phase 12 ステータスを `completed` に更新

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` で同時に Close

### Task 5: スキルフィードバックレポート

- [ ] `skill-feedback-report.md` 作成（改善点なしでも必須）

## 実行手順

### ステップ1: 実装ガイド作成（Task 1）

Part 1 と Part 2 を作成。

### ステップ2: システム仕様書更新（Task 2）

Step 1-A → 1-B → 1-C → 1-D → Step 2 の順で逐次実行。P43 対策: 3ファイル以下/エージェントに分割。

### ステップ3: documentation-changelog.md（Task 3）

全 Step の結果を事後記録。全 Step 確認前に「完了」と記載しない（P4/P51 対策）。

### ステップ4: 未タスク検出（Task 4）

3ステップ全完了を確認（P3/P38 対策）。

### ステップ5: スキルフィードバック（Task 5）

改善点の有無を記録。

## 統合テスト連携

Phase 12 はドキュメント作成のため統合テスト連携なし。

## 苦戦箇所の記録【推奨】

| #                         | 苦戦箇所 | 原因 | 解決策 | 所要時間 |
| ------------------------- | -------- | ---- | ------ | -------- |
| （Phase 12 実行時に記入） | -        | -    | -      | -        |

## 漏れやすいポイント

| #   | ポイント                | 対策                                                               |
| --- | ----------------------- | ------------------------------------------------------------------ |
| 1   | LOGS.md が2箇所ある     | aiworkflow-requirements と task-specification-creator の両方を確認 |
| 2   | topic-map.md の再生成   | 仕様書に変更があれば必ず `node generate-index.js` を実行           |
| 3   | 未タスクの3ステップ     | ①指示書 ②task-workflow.md ③関連仕様書リンク を全て完了             |
| 4   | documentation-changelog | 各 Step の事後記録。早期に「完了」と書かない                       |

## フォールバック手順

| 状況                                 | 対応                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| サブエージェントが rate limit で中断 | `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認し、未完了分を手動実行    |
| topic-map.md 再生成が失敗            | スクリプトパスを確認: `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` |
| GitHub Issue の Close に失敗         | `gh auth status` で認証を確認後に再実行                                                  |

## 多角的チェック観点

- **P1/P25**: LOGS.md 2ファイル更新漏れ防止
- **P2/P27**: topic-map.md 再生成忘れ防止
- **P3/P38**: 未タスク3ステップ完全実施
- **P4/P51**: documentation-changelog への早期完了記載防止
- **P43**: サブエージェント分割基準（3ファイル以下/エージェント）
- **P56**: 再評価クローズ時の Issue Close

## アーキテクチャ層別ドキュメント

| 層           | 対象ドキュメント                | 更新要否 | 理由                      |
| ------------ | ------------------------------- | -------- | ------------------------- |
| Main Process | `security-electron-ipc-core.md` | 要       | sender 検証適用状況の更新 |
| Preload      | -                               | 不要     | Preload 層に変更なし      |
| Renderer     | -                               | 不要     | Renderer 層に変更なし     |
| Shared Types | -                               | 不要     | 型定義に変更なし          |

## 成果物

| 成果物                  | パス                                            |
| ----------------------- | ----------------------------------------------- |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`      |
| documentation-changelog | `outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート    | `outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック    | `outputs/phase-12/skill-feedback-report.md`     |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1/Part 2 作成完了
- [ ] Task 2: Step 1-A~1-D + Step 2 全完了
- [ ] Task 3: documentation-changelog.md に全 Step の結果記録
- [ ] Task 4: 未タスク検出レポート作成（0件でも必須）
- [ ] Task 5: スキルフィードバックレポート作成

## 次のPhase

Phase 13: PR作成

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
