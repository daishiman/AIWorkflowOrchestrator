# Phase 12 成果物: スキルフィードバックレポート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | completed                                 |

---

## 改善点サマリ

| 項目     | 件数 |
| -------- | ---- |
| 改善点   | 4 件 |
| 改善なし | 0 件 |

---

## 改善点 #1: `generatedSkill` を保持するが表示しない設計

### 学び

`generatedSkill` を Props として受け取るが、表示文言に使わない設計は「表示責務と状態保持の分離」を体現している。

**なぜ保持するか:**

- 将来的に親コンポーネント（W2-seq-03a）が `generatedSkill` を使って表示内容を切り替える可能性がある
- `CompleteStep` を呼び出す親が `generatedSkill` を持つことを型で明示し、API 契約として固定する

**なぜ表示しないか:**

- `CompleteStep` の役割は「完了通知 + 次のアクション誘導」に特化する
- スキルパスや生成メタ情報の表示は別コンポーネントの責務とする
- 表示文言を固定（`"スキルの骨格を生成しました"`）することで、生成結果に依存した複雑な表示分岐を排除する

**次回再利用可能な形:**

> Props に将来拡張用のコンテキストを持たせるが、現在の実装では表示に使わない場合、Props のコメントに「親コンテキスト用」「表示に使わない」と明記する。

---

## 改善点 #2: `onQualityFeedback` と `onRetry` の境界設計

### 学び

フィードバック収集（`onQualityFeedback`）とリカバリー起動（`onRetry`）を別々の Props に分離することで、以下のメリットが生まれた:

| メリット     | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| 単一責務     | フィードバック収集とナビゲーションを独立して変更できる             |
| テスト容易性 | `onQualityFeedback` と `onRetry` を個別に `vi.fn()` でモックできる |
| 任意結合     | 👎 時のリカバリーが不要な文脈では `onRetry` を渡さなければよい     |

**次回再利用可能な形:**

> 「通知」と「副作用（ナビゲーション等）」は別 Props に分離する。`onAction(result)` + `onSideEffect?.()` のパターンを基本形とする。

---

## 改善点 #3: canonical filename への寄せ方

### 学び

成果物ファイル名は phase 仕様書の `成果物` テーブルに記載された canonical filename（例: `requirements.md`, `design.md`, `qa-report.md`）と完全一致させること。

今回確認した canonical filename の対応:

| Phase | canonical filename         | 実際に作成したファイル                     | 一致 |
| ----- | -------------------------- | ------------------------------------------ | ---- |
| 1     | `requirements.md`          | `outputs/phase-1/requirements.md`          | OK   |
| 2     | `design.md`                | `outputs/phase-2/design.md`                | OK   |
| 3     | `design-review.md`         | `outputs/phase-3/design-review.md`         | OK   |
| 4     | `test-matrix.md`           | `outputs/phase-4/test-matrix.md`           | OK   |
| 5     | `implementation-record.md` | `outputs/phase-5/implementation-record.md` | OK   |
| 6     | `test-expansion.md`        | `outputs/phase-6/test-expansion.md`        | OK   |
| 7     | `coverage-report.md`       | `outputs/phase-7/coverage-report.md`       | OK   |
| 8     | `refactoring-log.md`       | `outputs/phase-8/refactoring-log.md`       | OK   |
| 9     | `qa-report.md`             | `outputs/phase-9/qa-report.md`             | OK   |
| 10    | `final-review-result.md`   | `outputs/phase-10/final-review-result.md`  | OK   |
| 11    | `manual-test-result.md`    | `outputs/phase-11/manual-test-result.md`   | OK   |
| 13    | `pr-creation-record.md`    | `outputs/phase-13/pr-creation-record.md`   | OK   |

**次回再利用可能な形:**

> Phase 仕様書の `成果物` テーブルを開いてファイル名を確認してから Write する。ファイル名の揺れ（`-` と `_` の混在等）に注意する。

---

## 改善点 #4: 旧パス参照はダミーを増やさず、正本へ寄せる

### 学び

`verify-unassigned-links` で old path が見つかったとき、単に新しいファイルを増やすのではなく、参照元を既存の completed 正本へ寄せるほうが整合性が高い。

**今回の対応:**

- `task-workflow-backlog.md` の `task-ut-sdk-07-approval-request-surface-001` 参照を completed path に修正した
- `task-workflow-completed-recent-2026-04b.md` の `UT-VERIFY-DOC-CONSOLIDATION-001` / `ut-phase-spec-format-improvement-001` 参照を completed path に修正した
- `verify-unassigned-links.js` は再実行後に `missing 0` で PASS になった

**次回再利用可能な形:**

> 参照切れを見つけたら、まず「参照元を直す」「実体を補う」のどちらが正本かを判断する。履歴リンクなら completed 正本へ寄せ、ダミーの重複生成は避ける。

---

## 次 Action

| アクション | 状態                                               |
| ---------- | -------------------------------------------------- |
| なし       | 完了済み（反映対象は今回の branch に既に適用済み） |

---

## 完了確認

- [x] 改善点が 0 件でも出力されている（3 件を記録）
- [x] `generatedSkill` を保持する理由と表示しない理由が明記されている
- [x] `onQualityFeedback` と `onRetry` の境界が明記されている
- [x] canonical filename への寄せ方が次回再利用可能な形で残されている
- [x] 次 action が明記されている
- [x] 参照切れの修正方針が記録されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
