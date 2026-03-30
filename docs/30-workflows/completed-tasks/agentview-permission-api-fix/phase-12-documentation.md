# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| Phase     | 12                                                                                 |
| 名称      | ドキュメント更新                                                                   |
| 前提Phase | Phase 11                                                                           |
| 成果物    | 実装ガイド、system spec 更新サマリー、更新履歴、未タスク検出、skill フィードバック |

## 目的

本タスクの bugfix 内容を将来参照可能な形で整理し、Step 1 の完了記録と Step 2 の要否判断を明文化する。

## 実行タスク

- Task 12-1: 実装ガイドを 2パート構成で作成する
- Task 12-2: システム仕様更新 Step 1-A〜1-C を実施し、Step 2 要否を判定する
- Task 12-3: ドキュメント更新履歴を作成する
- Task 12-4: 未タスク検出レポートを 0件でも出力する
- Task 12-5: skill フィードバックレポートを改善点なしでも出力する

### Task 12-1: 実装ガイド作成（2パート構成）

**Part 1: 初学者向け**

- 住所を間違えた配達の例えで、`window.electronAPI.permissions` から `window.permissionAPI` への修正理由を説明する
- 「なぜ必要か」を先に説明し、その後で「何を直したか」を説明する
- 専門用語は使う場合に直後で補足する

**Part 2: 技術者向け**

- `PermissionAPI` の既存契約と、Renderer 側修正箇所を整理する
- API シグネチャ、利用例、失敗時の挙動、local state 化した `AgentPermissionMode` の境界を書く
- 設定可能項目と定数扱いの値を一覧化する

**成果物**:

- `outputs/phase-12/implementation-guide.md`

### Task 12-2: システム仕様更新

> Step 1 は必須。Step 2 は条件付き。

#### Step 1-A: 完了記録

- 本 workflow pack の close-out 内容を `system-spec-update-summary.md` に整理する
- `task-specification-creator` / `aiworkflow-requirements` 観点での判断根拠を記録する
- bugfix の責務境界と follow-up task 分離方針を記録する

#### Step 1-B: 実装状況テーブル更新

- 本 workflow は `pending` の task spec pack として扱い、今回の更新は「仕様書の整備」であることを明記する
- `completed` や `spec_created` を誤って付与しない

#### Step 1-C: 関連タスクと未タスク候補の整理

- `AgentPermissionMode` 永続化は follow-up task 候補として残す
- 今回タスクに混在させない理由を明文化する

#### Step 2: domain spec sync 判定

**判定**: 不要

**根拠**:

- `apps/desktop/src/preload/types.ts` の `PermissionAPI` 契約は既存のまま
- `apps/desktop/src/preload/index.ts` の expose 面も既存のまま
- 変更対象は Renderer の参照先と利用方法のみ

**成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

### Task 12-3: ドキュメント更新履歴作成

- 追加・修正した仕様書ファイル
- `outputs/` 成果物追加
- `outputs/artifacts.json` 同期
- Phase 13 を blocked にした判断根拠

**成果物**:

- `outputs/phase-12/documentation-changelog.md`

### Task 12-4: 未タスク検出レポート作成

- Phase 3 / 10 のレビュー結果
- Phase 11 の手動テストで発見された追加 gap
- コードコメントの TODO/FIXME/HACK/XXX
- `AgentPermissionMode` 永続化の follow-up 候補

0件でも「0件」と記録する。

**成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

### Task 12-5: skill フィードバックレポート作成

- `task-specification-creator` 観点: 必須セクション不足、index 導線不足、outputs 台帳不足の再発防止
- `aiworkflow-requirements` 観点: source file 直参照だけでなく、正本仕様参照を最初に固定する運用改善

改善点がなくても「改善点なし」と明記する。

**成果物**:

- `outputs/phase-12/skill-feedback-report.md`

## 参照資料

| 資料名                   | パス                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| spec-update workflow     | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`  |
| security skill execution | `.agents/skills/aiworkflow-requirements/references/security-skill-execution.md` |
| settings UI details      | `.agents/skills/aiworkflow-requirements/references/ui-ux-settings-details.md`   |
| AgentView navigation     | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         |

## 実行手順

### ステップ1: 実装ガイドを作成する

初心者向けと技術者向けを分け、bugfix の責務境界を説明する。

### ステップ2: Step 1 と Step 2 判定を記録する

完了記録は実施し、domain spec sync は no-op 根拠付きで閉じる。

### ステップ3: 残課題と feedback を formalize する

未タスクと skill 改善点を separate output として残す。

## 多角的チェック観点

| 観点         | 本Phaseでの確認内容                                    |
| ------------ | ------------------------------------------------------ |
| 矛盾なし     | bugfix と follow-up task の境界が混ざっていないか      |
| 漏れなし     | 必須5成果物が揃っているか                              |
| 整合性あり   | root / outputs / phase本文の記述が一致しているか       |
| 依存関係整合 | Phase 11 evidence と Step 2 no-op 判断が整合しているか |

## 成果物

| 成果物                   | パス                                                                                            | 説明                            |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| 実装ガイド               | `docs/30-workflows/agentview-permission-api-fix/outputs/phase-12/implementation-guide.md`       | Part 1/2 構成                   |
| system spec 更新サマリー | `docs/30-workflows/agentview-permission-api-fix/outputs/phase-12/system-spec-update-summary.md` | Step 1 実施 + Step 2 no-op 根拠 |
| 更新履歴                 | `docs/30-workflows/agentview-permission-api-fix/outputs/phase-12/documentation-changelog.md`    | 本waveの更新記録                |
| 未タスク検出             | `docs/30-workflows/agentview-permission-api-fix/outputs/phase-12/unassigned-task-detection.md`  | 0件でも必須                     |
| skill フィードバック     | `docs/30-workflows/agentview-permission-api-fix/outputs/phase-12/skill-feedback-report.md`      | 改善点なしでも必須              |
| outputs 台帳             | `docs/30-workflows/agentview-permission-api-fix/outputs/artifacts.json`                         | root 台帳との同期用             |

## 完了条件

- [ ] Task 12-1 から Task 12-5 を全て実行した
- [ ] Step 1-A〜1-C を記録し、Step 2 no-op 判断根拠を残した
- [ ] 必須5成果物を `outputs/phase-12/` に配置した
- [ ] `artifacts.json` と `outputs/artifacts.json` を同期した
- [ ] 計画中を示す曖昧な文言や PR 後追い前提を残していない

## サブタスク管理

1. 実装ガイド作成
2. Step 1/2 判断記録
3. 更新履歴作成
4. 未タスク検出
5. skill feedback 作成
6. outputs 台帳同期
7. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 必須5成果物が存在する
- [ ] no-op 判断にも根拠がある

## 次のPhase

Phase 13: PR 作成（ユーザー明示承認後のみ実行）
