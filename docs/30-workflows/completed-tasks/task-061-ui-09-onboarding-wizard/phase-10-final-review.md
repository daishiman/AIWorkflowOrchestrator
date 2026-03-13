# Phase 10: Final Review

## メタ情報

| 項目         | 内容               |
| ------------ | ------------------ |
| Phase        | 10                 |
| Phase名      | 最終レビューゲート |
| ステータス   | completed          |
| 作成日       | 2026-03-13         |
| 担当SubAgent | SubAgent-D         |

## 目的

要件、設計、実装、テスト、品質保証の証跡を束ねて task-061 を Phase 11 と Phase 12 へ渡せる状態にする。

## 実行タスク

- 要件追跡確認: traceability matrix と実装差分を照合する
- 品質証跡確認: tests、coverage、build、screenshot plan の整合を確認する
- リスク整理: follow-up の扱いと current task の完了境界を固定する
- ゲート判定: Phase 11 と Phase 12 へ進めると判定する

## 参照資料

| 参照資料             | パス                                        | 用途            |
| -------------------- | ------------------------------------------- | --------------- |
| Phase 2 状態設計     | `outputs/phase-2/state-ipc-design.md`       | 保存契約の確認  |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装差分の確認  |
| 要件追跡表           | `requirements-traceability-matrix.md`       | FR と実装の照合 |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`   | 判定の正本      |
| open items           | `outputs/phase-10/open-items.md`            | 残課題の整理    |
| 品質チェック         | `outputs/phase-9/quality-checklist.md`      | static quality  |

## 統合テスト連携

| 観点          | 証跡                                      | 連携内容                              |
| ------------- | ----------------------------------------- | ------------------------------------- |
| FR-01〜FR-08  | `requirements-traceability-matrix.md`     | requirement と code / test を接続する |
| visual review | `outputs/phase-11/screenshot-plan.json`   | Phase 11 の対象を固定する             |
| docs sync     | `outputs/phase-12/spec-update-summary.md` | Phase 12 の更新対象を固定する         |

## 成果物

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/open-items.md`

## 完了条件

- [x] requirement と code / test / screenshot の関係が説明できる
- [x] current task で解決する項目と継続管理する項目が分離されている
- [x] Phase 11 と Phase 12 の入力が揃っている
