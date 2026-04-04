# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 3                 |
| 後続Phase  | Phase 5                 |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

問題A と問題B を再現し、修正後の PASS 条件を機械的に確認できるテストとコマンドを整える。

## 実行タスク

- shared 側の build / exports / preload bundle 観点をテストに落とす
- desktop 側の ABI / rebuild / packaging hook 観点をテストに落とす
- AC-1〜AC-9 とテスト・コマンドの対応表を作る

## 参照資料

| 資料                 | パス                                                                        | 用途           |
| -------------------- | --------------------------------------------------------------------------- | -------------- |
| workflow index       | `docs/30-workflows/electron-build-infra-fix/index.md`                       | AC 定義        |
| phase 2              | `docs/30-workflows/electron-build-infra-fix/phase-2-design.md`              | 設計根拠       |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト厚み確認 |

## 実行手順

### ステップ1: 問題A テスト

- dual output、exports、preload bundle の 3 観点をテスト化する

### ステップ2: 問題B テスト

- ABI、rebuild command、afterPack hook の 3 観点をテスト化する

### ステップ3: トレーサビリティ作成

- AC ごとに対応テストまたは確認コマンドを 1 つ以上割り当てる

## 統合テスト連携

- 問題A は shared build と preload bundle の両方に接続する
- 問題B は rebuild、ABI、packaging hook の 3 点に接続する

## 成果物

| 成果物             | パス                                    | 説明       |
| ------------------ | --------------------------------------- | ---------- |
| テスト仕様         | `outputs/phase-4/test-specification.md` | AC 対応表  |
| shared テスト計画  | `outputs/phase-4/shared-test-plan.md`   | 問題A 観点 |
| desktop テスト計画 | `outputs/phase-4/desktop-test-plan.md`  | 問題B 観点 |

## 完了条件

- [ ] AC-1〜AC-6 に対してテストまたは確認コマンドが割り当てられている
- [ ] AC-7〜AC-9 に対して品質 gate が割り当てられている
- [ ] 問題A と問題B の観点が混線していない
- [ ] Phase 5 が RED から GREEN へ進める状態になっている
