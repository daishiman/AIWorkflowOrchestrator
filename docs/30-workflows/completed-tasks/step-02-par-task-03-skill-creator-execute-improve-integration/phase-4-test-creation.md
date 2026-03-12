# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 4                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

単一セッション導線、create / execute / improve handoff、wizard 縮退、内部エンジンの表示境界を検証するテスト仕様と Red テストを定義する。

## 実行タスク

- UI テスト設計: session card の入力、状態表示、アクション遷移を検証する
- 状態管理テスト設計: create 後の selection handoff と improve 連携を検証する
- API 統合テスト設計: preload skill API と skillCreatorAPI の呼び出し経路を検証する
- 境界テスト設計: wizard 競合回避と内部名称の非表示を検証する
- Red テスト作成: Phase 5 の実装前に失敗するテストを追加する

## 参照資料

| 参照資料                     | パス                                               | 説明           |
| ---------------------------- | -------------------------------------------------- | -------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物 |
| 受け入れ基準                 | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物 |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物 |
| セッション状態設計           | `outputs/phase-2/session-state-design.md`          | Phase 2 成果物 |
| 内部オーケストレーション設計 | `outputs/phase-2/internal-orchestration-design.md` | Phase 2 成果物 |
| 設計レビュー記録             | `outputs/phase-3/design-review-report.md`          | Phase 3 成果物 |
| 指摘一覧                     | `outputs/phase-3/review-findings.md`               | Phase 3 成果物 |

## 実行手順

### ステップ1: テスト対象を UI / store / API に分解する

`SkillManagementPanel`、renderer hooks、`agentSlice`、preload API の各レイヤへテスト責務を割り当てる。

### ステップ2: 正常系テストを定義する

create 成功、execute handoff、analyze / autoImprove 成功、wizard secondary action の維持を検証する。

### ステップ3: 失敗系の入口を定義する

Phase 6 で拡充する create 失敗、execute 失敗、analyze 失敗の前提を先に整理する。

### ステップ4: Red テストを追加する

未実装状態で失敗する UI / hook / store テストを作成し、Phase 5 の実装対象を固定する。

## 統合テスト連携

| 統合観点        | テストレイヤ                   | 検証内容                                           |
| --------------- | ------------------------------ | -------------------------------------------------- |
| 自然言語 create | component test                 | 入力から create action が発火すること              |
| 選択 handoff    | store / hook test              | create 成功後に target skill が execute へ渡ること |
| improve handoff | component / hook test          | analyze 結果と improve action が連動すること       |
| UI 境界         | component snapshot / assertion | 内部オーケストレーション名称が露出しないこと       |

## 成果物

| 成果物             | パス                                 | 説明                       |
| ------------------ | ------------------------------------ | -------------------------- |
| テスト戦略         | `outputs/phase-4/test-strategy.md`   | テスト対象とレイヤ分解     |
| テストケース一覧   | `outputs/phase-4/test-cases.md`      | 正常系と境界系のケース定義 |
| Red テスト追加記録 | `outputs/phase-4/red-test-report.md` | 実装前の失敗確認結果       |

## 完了条件

- [ ] 正常系のテストケースが create / execute / improve を網羅している
- [ ] wizard 縮退と UI 境界のテストが定義されている
- [ ] Phase 5 実装前の Red テストが追加されている
