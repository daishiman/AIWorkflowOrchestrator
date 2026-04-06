# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 5                 |
| 後続Phase  | Phase 7                 |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

Phase 5 の実装に対して、回帰防止、異常系、境界値のテストを追加し、Phase 7 以降で不足観点が出ない状態を作る。

## 実行タスク

- dual output が崩れた場合の回帰テストを追加する
- ABI 不整合や rebuild 失敗時の異常系を追加する
- packaging hook と postinstall 導線の境界を確認する

## 参照資料

| 資料                 | パス                                                                        | 用途           |
| -------------------- | --------------------------------------------------------------------------- | -------------- |
| phase 4              | `docs/30-workflows/electron-build-infra-fix/phase-4-test-creation.md`       | 既存テスト計画 |
| phase 5              | `docs/30-workflows/electron-build-infra-fix/phase-5-implementation.md`      | 実装結果       |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 回帰厚み確認   |

## 実行手順

### ステップ1: shared 側の回帰ガード

- dual output、exports、bundle 経路の崩れを検知するテストを追加する

### ステップ2: native 側の異常系

- ABI 不一致、依存欠如、hook 不在を検知するテストまたはチェックを追加する

### ステップ3: 件数と観点の再確認

- shared / desktop 双方で最低限の件数と観点を満たすか確認する

## 統合テスト連携

- Phase 5 実装で追加した分岐を回帰防止テストへ接続する
- Phase 7 が coverage を議論できるよう concern 単位で整理する

## 成果物

| 成果物         | パス                                         | 説明           |
| -------------- | -------------------------------------------- | -------------- |
| 拡充テスト結果 | `outputs/phase-6/expanded-test-result.md`    | 追加分の結果   |
| 回帰ガード表   | `outputs/phase-6/regression-guard-report.md` | 守る条件の一覧 |

## 完了条件

- [ ] 回帰防止の追加理由が明記されている
- [ ] 異常系観点が問題B に接続している
- [ ] shared / desktop の両方に拡充結果がある
- [ ] Phase 7 で coverage を議論できる粒度になっている
