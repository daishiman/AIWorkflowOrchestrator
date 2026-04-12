# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 10                                                          |
| Phase名    | 最終レビューゲート                                          |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 前提Phase  | Phase 9                                                     |
| 後続Phase  | Phase 11                                                    |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 3〜9 の全成果物を統合的にレビューし、AC-1〜AC-6 の全件充足を確認する。
PASS 判定が出た場合のみ Phase 11（手動テスト）へ進める。

## 背景

docs-only タスクの最終レビューゲートとして、以下を確認する：

1. 3 変更対象ファイルへの追記が全件完了していること
2. TC-01〜TC-12 が全て PASS していること
3. 変更内容が設計書と一致していること
4. `.agents/skills/` mirror が `.claude/skills/` と同期されていること

MINOR 指摘は未タスク化する（`unassigned-task-guidelines.md` に従う）。
MAJOR / CRITICAL 指摘がある場合は該当 Phase へ戻る。

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-10/` へ記録する。

### タスク1: AC 全件充足確認

**目的**: Phase 1 で定義した AC-1〜AC-6 が全て満たされているかを確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` の AC-1〜AC-6 を確認する
2. 各 AC に対応する成果物・証跡を特定する
3. AC ごとに PASS / FAIL を判定する
4. 判定結果を `outputs/phase-10/final-review-result.md` に記録する

**レビュー観点**:

| 観点               | 確認項目                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| 機能完全性         | 3 変更対象ファイル（SKILL.md / compliance-template / documentation-guide）への追記が全件完了しているか     |
| テスト完全性       | TC-01〜TC-12 が全て PASS しているか（`outputs/phase-9/` の結果を確認）                                     |
| ドキュメント完全性 | 変更内容が Phase 2 設計書（`outputs/phase-2/`）と一致しているか                                            |
| mirror 同期        | `.agents/skills/task-specification-creator` と `.claude/skills/task-specification-creator` の diff が 0 か |

---

### タスク2: Phase 3〜9 成果物統合レビュー

**目的**: 各 Phase の成果物が整合的で矛盾がないことを確認する

**実行手順**:

1. `outputs/phase-3/design-review-result.md` を確認する
2. `outputs/phase-4/` 〜 `outputs/phase-9/` の成果物を確認する
3. 各 Phase 成果物の整合性を確認する
4. 統合レビュー結果を `outputs/phase-10/final-review-result.md` に追記する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料                   | パス                                                                           | 内容                            |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| Phase 1 AC 一覧            | `outputs/phase-1/acceptance-criteria.md`                                       | 充足確認の基準となる AC-1〜AC-6 |
| Phase 2 設計書群           | `outputs/phase-2/`                                                             | 変更内容の設計根拠              |
| Phase 3〜9 成果物          | `outputs/phase-3/` 〜 `outputs/phase-9/`                                       | 統合レビュー対象の成果物        |
| review-gate-criteria       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | レビューゲート基準              |
| unassigned-task-guidelines | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md`              | MINOR 指摘の未タスク化ルール    |

---

## 成果物

| 成果物           | パス                                      | 内容                                                 |
| ---------------- | ----------------------------------------- | ---------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR/CRITICAL 判定と理由・AC充足確認結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト観点のレビューゲート: TC-01〜TC-12 が全て PASS していること
- mirror 同期確認: `.agents/skills/` と `.claude/skills/` の diff が 0 であること

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                                                    | 次のアクション                            |
| -------- | ------------------------------------------------------- | ----------------------------------------- |
| PASS     | 全レビュー観点で問題なし・AC-1〜AC-6 全件充足           | Phase 11 へ進行                           |
| MINOR    | 文言の軽微な調整のみ必要（機能・AC 充足には影響なし）   | 指摘を未タスク化し Phase 11 へ進行        |
| MAJOR    | AC の一部未充足・テスト結果に FAIL あり・設計との不整合 | 該当 Phase（4〜9）へ戻り修正              |
| CRITICAL | AC の根本的な充足不可・mirror 同期不能・構造的問題      | Phase 1 または Phase 2 へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類                   | 戻り先                          |
| ---------------------------- | ------------------------------- |
| 要件（AC）の問題             | Phase 1（要件定義）             |
| 設計の構造・網羅性の問題     | Phase 2（設計）                 |
| 設計とレビューの不整合       | Phase 3（設計レビューゲート）   |
| テストが通らない・実装の漏れ | Phase 4〜9（対応する実装Phase） |
| mirror 同期の失敗            | Phase 9（mirror 同期）          |

### MINOR 指摘の扱い

MINOR 判定の指摘事項は以下のルールで未タスク化する：

1. `docs/30-workflows/unassigned-task/` 配下に未タスクエントリを作成する
2. 本 Phase の `final-review-result.md` に未タスク化済みであることを明記する
3. 当該指摘は本タスクのスコープ外として Phase 11 へ進行する

---

## 完了条件

- [ ] AC-1〜AC-6 が全件 PASS していること
- [ ] TC-01〜TC-12 が全て PASS していること（`outputs/phase-9/` の結果で確認）
- [ ] `.agents/skills/` と `.claude/skills/` の diff が 0 であること
- [ ] PASS または MINOR（指摘対応済み・未タスク化済み）判定が出ていること
- [ ] MAJOR / CRITICAL 指摘が 0 件であること
- [ ] `outputs/phase-10/final-review-result.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること（全テスト PASS・mirror 同期完了）
- **後続**: Phase 11（手動テスト）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- AC 全件充足確認: [PASS/MINOR/MAJOR/CRITICAL]
- Phase 3〜9 成果物統合レビュー: [PASS/MINOR/MAJOR/CRITICAL]

### 発見事項

- 良かった点:
- 問題点（MINOR指摘）:
- 未タスク化した指摘:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-11-manual-test.md`
