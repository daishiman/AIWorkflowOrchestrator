# Phase 10: 最終レビュー

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 10 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

受入基準 AC-1〜AC-7 の達成可否と、Phase 12 へ送れる状態かを最終判定する。

## 実行タスク

1. AC-1〜AC-7 を一つずつ判定する
2. MAJOR / MINOR / follow-up を仕分ける
3. Phase 12 に必要な close-out 条件を確認する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| requirements | `docs/30-workflows/conflict-prevent-skills-001/phase-01-requirements.md` | AC 参照 |
| quality assurance | `docs/30-workflows/conflict-prevent-skills-001/phase-09-quality-assurance.md` | 実測結果参照 |

## 実行手順

### ステップ1: AC 判定

| AC | 観点 | 判定方式 |
| --- | --- | --- |
| AC-1 | 13 phase 骨格 | validator |
| AC-2 | 4分類設計 | document review |
| AC-3 | custom / built-in 整合 | git manual + spec review |
| AC-4 | canonical / mirror 一貫性 | parity + Phase 12 設計 |
| AC-5 | deterministic topic-map | grep + regenerate |
| AC-6 | EVALS schema 不変 | merge policy review |
| AC-7 | Phase 13 blocked | artifacts / phase-13 review |

### ステップ2: レビュー判定

- PASS: Phase 12 close-out へ進む
- MINOR: wording / path 名だけを修正する
- MAJOR: Phase 2 へ戻す

## 統合テスト連携

- Phase 11 の手動ウォークスルーと Phase 12 の compliance-check へ渡す

## 多角的チェック観点（AIが判断）

- 論点思考: 判定と根拠が 1:1 で対応しているか
- プラスサム思考: follow-up 化したことで本 wave の品質が上がっているか
- ダブルループ思考: 受入基準そのものに誤りがないか見直しているか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-20 | AC final review | Lane C |

## 成果物

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/blocker-disposition.md`
- `outputs/phase-10/review-prompt.txt`

## 完了条件

- [ ] AC-1〜AC-7 の判定がある
- [ ] blocker と follow-up が分離されている
- [ ] Phase 12 に渡す条件がある

## タスク100%実行確認【必須】

- [ ] AC 判定を記載した
- [ ] 戻り先を記載した
- [ ] Phase 11/12 に接続した

## 次Phase

Phase 11 では NON_VISUAL docs-only task としてウォークスルーを行う。
