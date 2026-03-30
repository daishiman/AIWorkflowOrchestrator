# Phase 13: PR作成

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| 機能名     | workflow-manifest-production-placement |
| 作成日     | 2026-03-29                             |
| タスクID   | TASK-P0-03                             |
| ステータス | blocked                                |

## 目的

ユーザーが明示した時だけ PR preparation を行える状態を保持する。Phase 完了条件は「実行した」ことではなく、「blocked の理由と解除条件が監査可能な形で固定された」こととする。

## 実行タスク

- blocked 理由記録: commit、PR、push を行わない理由を残す
- PR input 整理: 変更対象、テスト結果、残リスクを整理する
- 実行条件固定: ユーザー明示指示が来た時の着手条件を記録する
- blocked status 維持: `artifacts.json` と `outputs/artifacts.json` の Phase 13 を `blocked` として同期する

## 参照資料

| 資料名                    | パス                           | 説明         |
| ------------------------- | ------------------------------ | ------------ |
| phase-1 requirements      | `phase-1-requirements.md`      | AC           |
| phase-2 design            | `phase-2-design.md`            | 設計         |
| phase-5 implementation    | `phase-5-implementation.md`    | 実装結果     |
| phase-9 quality assurance | `phase-9-quality-assurance.md` | 品質確認     |
| phase-10 final review     | `phase-10-final-review.md`     | gate 判定    |
| phase-11 manual test      | `phase-11-manual-test.md`      | 手動テスト   |
| phase-12 documentation    | `phase-12-documentation.md`    | ドキュメント |

## PR 概要（準備用）

### タイトル

`feat(skill-creator): TASK-P0-03 workflow-manifest.json 本番配置`

### 変更対象

| ファイル                                              | 変更種別    | 内容                       |
| ----------------------------------------------------- | ----------- | -------------------------- |
| `.claude/skills/skill-creator/workflow-manifest.json` | 新規作成    | 本番 manifest 正本ファイル |
| `.agents/skills/skill-creator/workflow-manifest.json` | mirror 同期 | parity 確認対象            |

### テスト結果

| テストケース | 結果     |
| ------------ | -------- |
| TC-01〜TC-07 | 確認対象 |
| EC-01〜EC-05 | 確認対象 |
| RC-01〜RC-03 | 確認対象 |

### 後続タスクへの引き継ぎ

- TASK-P0-04: ManifestLoader が workflow-manifest.json をデフォルトで読み込む dynamic pipeline の有効化

## 実行手順

### ステップ1: blocked 理由を維持する

ユーザー指示が来るまで commit、PR、push を行わない。

### ステップ2: PR input を整理する

差分、テスト結果、残リスクを `pr-preparation.md` に整理する。

### ステップ3: 実行条件を明記する

ユーザー明示指示が来た時だけ Phase 13 を `in_progress` へ変える。user approval がない限り `completed` へは進めない。

## 統合テスト連携

| 観点          | 実施内容                                          |
| ------------- | ------------------------------------------------- |
| blocked state | `blocked` status が両 artifact 台帳で維持されるか |
| inputs        | PR input が揃っているか                           |
| guard         | ユーザー明示指示の条件が明記されているか          |

## 多角的チェック観点

| 観点       | この Phase で確認する内容       |
| ---------- | ------------------------------- |
| ガバナンス | 禁止アクションが破られないか    |
| 明確性     | Phase 13 の開始条件が一意か     |
| 監査性     | PR を作らない理由が文書に残るか |

## サブタスク管理

1. blocked 理由記録
2. PR input 整理
3. 実行条件固定
4. artifact status 同期

## 成果物

| 成果物         | パス                                 | 説明               |
| -------------- | ------------------------------------ | ------------------ |
| pr preparation | `outputs/phase-13/pr-preparation.md` | 差分と gate の要約 |

## 完了条件

- [ ] blocked 理由が記録されている
- [ ] PR input が整理されている
- [ ] ユーザー明示指示が開始条件として記録されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の Phase 13 status が `blocked` で一致している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 9 を参照した
- [ ] Phase 10 を参照した
- [ ] Phase 11 を参照した
- [ ] Phase 12 を参照した

## 次のPhase

ユーザー明示指示後に実行
