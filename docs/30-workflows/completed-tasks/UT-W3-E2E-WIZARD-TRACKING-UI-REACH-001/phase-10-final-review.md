# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 10                                                       |
| Phase名    | 最終レビュー                                             |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| 機能名     | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| タスク種別 | E2E テスト追加（NON_VISUAL から E2E 昇格）               |
| 前提Phase  | Phase 9                                                  |
| 後続Phase  | Phase 11                                                 |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-12                                               |

---

## 目的

Phase 3〜9 の全成果物を統合的にレビューし、AC-1〜AC-9 の全件充足を確認する。
PASS 判定が出た場合のみ Phase 11（手動テスト）へ進める。

---

## 背景

E2E テスト追加タスクの最終レビューゲートとして、以下を確認する：

1. AC-1〜AC-9 の全件充足（E2E テスト PASS・型整合・CI 設定）
2. スタブが本番コードに混入していないことの確認（grep 証跡）
3. Phase 13（PR 作成）の blocked 条件を確認し、ユーザー承認なしで PR 作成が実行されないことを確保する
4. 変更内容が設計書と一致していること

MINOR 指摘は未タスク化する（`unassigned-task-guidelines.md` に従う）。
MAJOR / CRITICAL 指摘がある場合は該当 Phase へ戻る。

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-10/` へ記録する。

### タスク1: AC 全件充足確認

**目的**: Phase 1 で定義した AC-1〜AC-9 が全て満たされているかを確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` の AC-1〜AC-9 を確認する
2. 各 AC に対応する成果物・証跡を特定する
3. AC ごとに PASS / FAIL を判定する
4. 判定結果を `outputs/phase-10/final-review-result.md` に記録する

**レビュー観点**:

| 観点              | 確認項目                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| E2E テスト完全性  | TC-03/05/06/08/09/11/12 相当のテストケースが全て実装・PASS していること                           |
| 型整合性          | `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` が本番型定義と型整合していること（AC-8）    |
| CI 設定完全性     | `.github/workflows/ci.yml` と `apps/desktop/vite.e2e.config.ts` に E2E 実行設定があること（AC-9） |
| スタブ混入ゼロ    | 本番コード（`src/` 配下）にスタブが混入していないこと（grep 証跡）                                |
| Phase 13 ブロック | Phase 13 が BLOCKED 状態であり、ユーザー明示承認なしで PR 作成が実行されない状態であること        |

---

### タスク2: スタブ本番混入確認（grep 証跡）

**目的**: `wizard-tracking-stub.ts` が本番コードに混入していないことを grep 証跡で確認する

**実行手順**:

1. 以下のコマンドを実行し、結果を記録する:

```bash
grep -r "wizard-tracking-stub\|trackEvent.e2e-stub" apps/desktop/src/
grep -r "wizard-tracking-stub\|trackEvent.e2e-stub" packages/
```

2. 出力が空（0 件）であることを確認する
3. 確認結果を `outputs/phase-10/final-review-result.md` に「grep 証跡」として記録する

**期待結果**: 全コマンドの出力が空（本番コードへの混入 0 件）

---

### タスク3: Phase 13 blocked 条件の確認

**目的**: Phase 13（PR 作成）が BLOCKED 状態であることを確認し、ユーザー承認なしで PR 作成が実行されない状態を担保する

**実行手順**:

1. `phase-13-pr-creation.md` を確認し、BLOCKED 条件が明記されていることを確認する
2. PR 作成の前提条件（ユーザー明示承認）が列挙されていることを確認する
3. 確認結果を `outputs/phase-10/final-review-result.md` に記録する

**期待結果**: Phase 13 が BLOCKED 状態であり、承認後の実行手順が明記されていること

---

### タスク4: Phase 3〜9 成果物統合レビュー

**目的**: 各 Phase の成果物が整合的で矛盾がないことを確認する

**実行手順**:

1. `outputs/phase-3/` 〜 `outputs/phase-9/` の成果物を確認する
2. 各 Phase 成果物の整合性を確認する
3. 統合レビュー結果を `outputs/phase-10/final-review-result.md` に追記する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料                   | パス                                                                               | 内容                            |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 AC 一覧            | `outputs/phase-1/acceptance-criteria.md`                                           | 充足確認の基準となる AC-1〜AC-9 |
| Phase 2 設計書群           | `outputs/phase-2/`                                                                 | 変更内容の設計根拠              |
| Phase 3〜9 成果物          | `outputs/phase-3/` 〜 `outputs/phase-9/`                                           | 統合レビュー対象の成果物        |
| Phase 13 BLOCKED 定義      | `docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-13-pr-creation.md` | BLOCKED 条件確認                |
| unassigned-task-guidelines | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md`                  | MINOR 指摘の未タスク化ルール    |

---

## 成果物

| 成果物           | パス                                      | 内容                                                  |
| ---------------- | ----------------------------------------- | ----------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR/CRITICAL 判定・AC充足確認・grep 証跡 |

---

## 統合テスト連携

- `outputs/phase-9/quality-report.md` の E2E テスト実行結果を参照し、AC-1〜AC-7 が全件 PASS であることを確認する
- `outputs/phase-9/quality-report.md` の型チェック結果と `apps/desktop/vite.e2e.config.ts` を参照し、AC-8/AC-9 を確認する
- grep 証跡により `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` が本番コードに混入していないことを確認する

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                                                    | 次のアクション                            |
| -------- | ------------------------------------------------------- | ----------------------------------------- |
| PASS     | 全レビュー観点で問題なし・AC-1〜AC-9 全件充足           | Phase 11 へ進行                           |
| MINOR    | 文言の軽微な調整のみ必要（機能・AC 充足には影響なし）   | 指摘を未タスク化し Phase 11 へ進行        |
| MAJOR    | AC の一部未充足・テスト結果に FAIL あり・設計との不整合 | 該当 Phase（4〜9）へ戻り修正              |
| CRITICAL | AC の根本的な充足不可・スタブ本番混入・構造的問題       | Phase 1 または Phase 2 へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類                   | 戻り先                          |
| ---------------------------- | ------------------------------- |
| 要件（AC）の問題             | Phase 1（要件定義）             |
| 設計の構造・網羅性の問題     | Phase 2（設計）                 |
| 設計とレビューの不整合       | Phase 3（設計レビューゲート）   |
| テストが通らない・実装の漏れ | Phase 4〜9（対応する実装Phase） |
| スタブの本番コード混入       | Phase 5（実装）                 |

### MINOR 指摘の扱い

MINOR 判定の指摘事項は以下のルールで未タスク化する：

1. `docs/30-workflows/unassigned-task/` 配下に未タスクエントリを作成する
2. 本 Phase の `final-review-result.md` に未タスク化済みであることを明記する
3. 当該指摘は本タスクのスコープ外として Phase 11 へ進行する

---

## 完了条件

- [ ] AC-1〜AC-9 が全件 PASS していること
- [ ] スタブの本番コード混入が 0 件であることが grep 証跡で確認されていること
- [ ] Phase 13 が BLOCKED 状態であることが確認されていること
- [ ] PASS または MINOR（指摘対応済み・未タスク化済み）判定が出ていること
- [ ] MAJOR / CRITICAL 指摘が 0 件であること
- [ ] `outputs/phase-10/final-review-result.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] タスク1（AC 全件充足確認）を100%完了し、完了を明記した
- [ ] タスク2（スタブ本番混入確認）を100%完了し、grep 証跡を記録した
- [ ] タスク3（Phase 13 blocked 条件確認）を100%完了し、完了を明記した
- [ ] タスク4（Phase 3〜9 成果物統合レビュー）を100%完了し、完了を明記した
- [ ] 成果物 `outputs/phase-10/final-review-result.md` が生成されていることを確認した

---

## 依存関係

- **前提**: Phase 9 が完了していること（全テスト PASS・型チェック PASS・Lint PASS）
- **後続**: Phase 11（手動テスト）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- AC 全件充足確認: [PASS/MINOR/MAJOR/CRITICAL]
- スタブ本番混入確認（grep 証跡）: [混入件数]
- Phase 13 blocked 条件確認: [確認結果]
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

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-11-manual-test.md`
