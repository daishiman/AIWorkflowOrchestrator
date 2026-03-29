# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 3                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

Phase 2 設計が task-spec と aiworkflow の両方に準拠し、重複 UI を増やさない設計になっているかを gate 判定する。

## 実行タスク

- 設計の矛盾・漏れ・不整合を点検する
- review gate を PASS / MINOR / FAIL で判定する
- follow-up があれば formalize 先を定義する

## 参照資料

| 資料名          | パス                                                                           | 説明      |
| --------------- | ------------------------------------------------------------------------------ | --------- |
| Phase 1         | `phase-1-requirements.md`                                                      | 要件      |
| Phase 2         | `phase-2-design.md`                                                            | 設計      |
| task-spec guide | `.agents/skills/task-specification-creator/references/review-gate-criteria.md` | gate 基準 |

## 実行手順

### ステップ1: 4条件レビュー

1. 矛盾なし
2. 漏れなし
3. 整合性あり
4. 依存関係整合

### ステップ2: エレガンスレビュー

1. Settings UI と重複していないか確認する。
2. `skill-creator-api.ts` を不要に汚していないか確認する。
3. runtime unblock に対して UI が過剰でないか確認する。

### ステップ3: gate 判定

1. blocker を列挙する。
2. MINOR は未タスク化要否を判定する。
3. Phase 4 進行可否を明記する。

## 統合テスト連携

- Phase 4 の test matrix に review 指摘を反映する。
- Phase 10 で同じ観点を再利用できるよう判定根拠を残す。

## 成果物

| 成果物           | パス                                      | 説明            |
| ---------------- | ----------------------------------------- | --------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 指摘一覧        |
| 整合レビュー     | `outputs/phase-3/consistency-review.md`   | 4条件点検       |
| gate 判定        | `outputs/phase-3/gate-decision.md`        | PASS/MINOR/FAIL |

## 完了条件

- [ ] 4条件レビューが完了している
- [ ] blocker と MINOR が分類されている
- [ ] Phase 4 進行可否が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
