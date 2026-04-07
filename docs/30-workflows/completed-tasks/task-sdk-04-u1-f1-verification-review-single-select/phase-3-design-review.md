# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 3                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 2                                                      |
| 後続Phase  | Phase 4                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

Phase 2 の設計内容を検証し、Phase 4（テスト作成）へ進んでよいかを判定する。

## 判定基準

| 判定     | 条件             | 対応                                 |
| -------- | ---------------- | ------------------------------------ |
| PASS     | 全観点で問題なし | Phase 4 へ進行                       |
| MINOR    | 軽微な指摘あり   | 未タスクとして記録後 Phase 4 へ進行  |
| MAJOR    | 重大な問題あり   | Phase 2 に戻り設計を修正             |
| CRITICAL | 致命的な問題あり | Phase 1 に戻りユーザーと要件を再確認 |

## 実行タスク

- 設計整合チェック: Phase 2 成果物（lane A/B/C の結果）が Phase 1 受け入れ基準を満たすか確認する
- 矛盾チェック: 型定義・テスト戦略・影響範囲に矛盾がないか確認する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を判定する

## 参照資料

| 資料名             | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| 設計書             | `outputs/phase-2/design-document.md`         | Phase 2 成果物 |
| SubAgent lane plan | `outputs/phase-2/subagent-lane-plan.md`      | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物 |

## サブタスク管理

- Lane A: Phase 2 設計の整合性を確認する
- Lane B: 依存関係と影響範囲を確認する
- Lane C: A/B の結果を統合して gate 判定を確定する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| #   | チェック項目                                                                | 判定基準                               |
| --- | --------------------------------------------------------------------------- | -------------------------------------- |
| 1   | `single_select` kind が型定義に存在するか                                   | `SkillCreatorUserInputKind` に定義済み |
| 2   | options の id が `applyVerificationReviewTransition()` の期待値と一致するか | approve / improve / reject             |
| 3   | 影響範囲が Main Process 内で閉じているか                                    | IPC/Preload/Renderer 変更なし          |
| 4   | free_text → single_select で `placeholder` 削除の副作用はないか             | renderer 側の表示影響を確認            |
| 5   | テスト変更方針が AC-1〜AC-4 を網羅しているか                                | 全AC に対応するテストが存在            |
| 6   | 30 思考法の適用結果が Phase 2 に記録されているか                            | 7 カテゴリ一巡 + synthesis で統合済み  |
| 7   | パッチ修正か再構成かの判断が Phase 2/3 で一貫しているか                     | 最小複雑性の方針に整合                 |

## 統合テスト連携

設計段階のため、テスト実行は Phase 4 以降。
本 Phase では設計書の整合性チェックのみ実施。

## 成果物

| 成果物           | パス                                      | 説明                           |
| ---------------- | ----------------------------------------- | ------------------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | チェック結果一覧               |
| ゲート判定       | `outputs/phase-3/gate-decision.md`        | PASS/MINOR/MAJOR/CRITICAL 判定 |

## 完了条件

- [ ] 全チェック項目を確認した
- [ ] ゲート判定が記録されている
- [ ] MAJOR/CRITICAL の場合、戻り先 Phase が明記されている
- [ ] MINOR の場合、未タスク候補が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 3
```

## 次のPhase

Phase 4: テスト作成
