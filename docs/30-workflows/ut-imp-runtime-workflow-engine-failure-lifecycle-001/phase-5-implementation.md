# Phase 5: 実装

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 5                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系 lifecycle 修正の変更順序を定義し、code / docs / tests の same-wave 実装を可能にする。

## 実行タスク

- `RuntimeSkillCreatorFacade.execute()` の reject 捕捉を先に実装する
- engine に failure 専用 transition / guard を追加する
- `verification_review` prompt 生成を実装する
- artifact append と既存 snapshot 更新を整理する
- 親 task 文書の ownership / transition 記述を同期する

## 参照資料

| 資料名  | パス                       | 説明       |
| ------- | -------------------------- | ---------- |
| Phase 2 | `phase-2-design.md`        | 実装設計   |
| Phase 4 | `phase-4-test-creation.md` | 検証ケース |

## 成果物

| 成果物       | パス                        | 説明                   |
| ------------ | --------------------------- | ---------------------- |
| 実装サマリー | `phase-5-implementation.md` | 変更順序と対象ファイル |

## 統合テスト連携

- 実装順序は `facade reject 捕捉 -> engine transition/guard -> verification_review 生成 -> artifact append -> docs sync` とし、各段階で Phase 4 の `outputs/phase-4/test-matrix.md` に対応する観点が増える形にする。
- Phase 2 の `outputs/phase-2/failure-transition-matrix.md` と `outputs/phase-2/artifact-history-decision.md` を source of truth とし、コードがこれを上回る独自解釈を持たないことを確認する。
- 実装後は engine 単体と facade 経由の両レーンで failure path を再実行する。

## 完了条件

- [ ] facade / engine / docs / tests の変更順序が定義されている
- [ ] 同ターンで同期すべきファイル群が明記されている
- [ ] downstream へ波及する shared contract が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
