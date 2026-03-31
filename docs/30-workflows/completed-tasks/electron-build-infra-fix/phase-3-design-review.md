# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 3                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 1, Phase 2        |
| 後続Phase  | Phase 4                 |
| ステータス | completed               |
| 主担当     | Agent-D                 |

## 目的

Phase 1-2 の結果を 4条件と 30思考法で監査し、Phase 4 へ進める設計かどうかを PASS / MINOR / MAJOR / CRITICAL で判定する。

## 実行タスク

- 4条件で設計を確認する
- 30思考法をカテゴリ別に適用して盲点を確認する
- 差し戻し条件と戻り先を明記する
- MINOR 項目は追跡台帳へ残す

## 参照資料

| 資料             | パス                                                                       | 用途                  |
| ---------------- | -------------------------------------------------------------------------- | --------------------- |
| workflow index   | `docs/30-workflows/electron-build-infra-fix/index.md`                      | AC、4条件、思考法一覧 |
| phase 1          | `docs/30-workflows/electron-build-infra-fix/phase-1-requirements.md`       | 要件確認              |
| phase 2          | `docs/30-workflows/electron-build-infra-fix/phase-2-design.md`             | 設計確認              |
| execute workflow | `.claude/skills/task-specification-creator/references/execute-workflow.md` | ゲート運用確認        |

## 実行手順

### ステップ1: 4条件監査

- 矛盾、漏れ、整合性、依存関係整合を個別に判定する

### ステップ2: 30思考法レビュー

- 論理分析、構造分解、メタ、発想、システム、戦略、問題解決の各カテゴリでレビューする
- 各カテゴリから少なくとも 1 件の示唆を残す

### ステップ3: ゲート判定

- PASS は Phase 4 へ進行
- MINOR は未タスク化または Phase 10 までに回収
- MAJOR は Phase 2 へ差し戻し
- CRITICAL は Phase 1 へ差し戻し

## 統合テスト連携

- Phase 4 で必要になるテスト観点の抜け漏れをレビューで先に検出する
- 30思考法レビューの結果を test plan へ引き渡す

## 成果物

| 成果物       | パス                                      | 説明           |
| ------------ | ----------------------------------------- | -------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 総合判定       |
| MINOR 追跡表 | `outputs/phase-3/minor-tracking-table.md` | 軽微指摘の追跡 |
| 思考法監査   | `outputs/phase-3/multithinking-audit.md`  | 30思考法の結果 |

## 完了条件

- [ ] 4条件の判定が記録されている
- [ ] 30思考法レビューの要点が残っている
- [ ] 戻り先が条件付きで定義されている
- [ ] Phase 4 の開始可否が明確である
