# Phase 13: PR作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 13                                   |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 1、Phase 2、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11、Phase 12 の成果を基に、ユーザー指示待ちの PR preparation を作る。

## 実行タスク

- PR preparation 作成: 親パックと child task の差分要約を作る
- review 観点整理: reviewer が見る順を定義する
- blocked 理由明記: commit と PR を実行しない理由を文書化する

## 参照資料

| 資料名   | パス                           | 説明               |
| -------- | ------------------------------ | ------------------ |
| Phase 1  | `phase-1-requirements.md`      | root 要件          |
| Phase 2  | `phase-2-design.md`            | task 分割          |
| Phase 5  | `phase-5-implementation.md`    | 実装順             |
| Phase 6  | `phase-6-test-expansion.md`    | regression         |
| Phase 7  | `phase-7-coverage-check.md`    | coverage           |
| Phase 8  | `phase-8-refactoring.md`       | 構造整理           |
| Phase 9  | `phase-9-quality-assurance.md` | リスク             |
| Phase 10 | `phase-10-final-review.md`     | final gate         |
| Phase 11 | `phase-11-manual-test.md`      | manual review      |
| Phase 12 | `phase-12-documentation.md`    | documentation 完了 |

## 実行手順

### ステップ1: 差分要約を作る

親ディレクトリ 1 つと Task01-03 の役割を reviewer がすぐ理解できるように整理する。

### ステップ2: review 観点を並べる

root、Task01、Task02、Task03、規約条件の順で読む review order を定義する。

### ステップ3: blocked 条件を残す

ユーザー指示がない限り commit と PR を実行しないことを明示する。

## 成果物

| 成果物         | パス                                 | 説明            |
| -------------- | ------------------------------------ | --------------- |
| PR preparation | `outputs/phase-13/pr-preparation.md` | PR 用の準備メモ |

## 完了条件

- [ ] reviewer 向けの差分要約が定義されている
- [ ] review order が文書化されている
- [ ] commit と PR を実行しない blocked 理由が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 備考

本Phaseは `blocked_awaiting_user_instruction` とし、PR 実行そのものは行わない。
