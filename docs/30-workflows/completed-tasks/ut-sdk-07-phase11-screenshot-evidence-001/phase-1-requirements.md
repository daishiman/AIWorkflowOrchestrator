# Phase 1: 要件定義 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2                                   |
| ステータス | complete                                  |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |

---

## 目的

このタスクのスコープ・前提・制約・acceptance criteria を固定し、Phase 2 以降の設計判断の基盤を作る。

**タスク分類**: docs-only / screenshot evidence 型（コード変更なし）

---

## Step 0: P50チェック（必須）

Phase 1 開始前に対象ファイルの実装状態を確認し、既実装コードの重複作成を防止する。

```bash
# TASK-SDK-07 の Phase 11 成果物の現状確認
ls docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/

# screenshot-plan.json の内容確認
cat docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshot-plan.json 2>/dev/null || echo "ファイル未存在"

# SkillLifecyclePanel の現状確認
grep -n "HandoffGuidance\|terminal_handoff\|disclosure" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20
```

---

## 実行タスク

### タスク1: タスク分類の明示確認

**目的**: このタスクが docs-only / screenshot evidence 型であることを明示し、Phase 4〜8 が N/A であることを記録する。

**実行手順**:

1. 以下のタスク分類テーブルを確認する

| 分類軸           | 判定           | 理由                                                |
| ---------------- | -------------- | --------------------------------------------------- |
| コード変更       | なし（N/A）    | SkillLifecyclePanel の実装は TASK-SDK-07 で完了済み |
| 自動テスト追加   | なし（N/A）    | コード変更がないため新規テスト不要                  |
| 手動テスト       | 必要（VISUAL） | screenshot 取得が主要成果物                         |
| ドキュメント更新 | 必要           | Phase 11 evidence chain の補完                      |

2. 上記に基づき Phase 4〜8 を全て N/A として記録する

---

### タスク2: スコープ・前提・制約の固定

**目的**: 実施範囲を明確にし、見落としや過剰実施を防ぐ。

**スコープ（含むもの）**:

- `SkillLifecyclePanel` 上の `HandoffGuidance` 表示（`terminal_handoff` 状態）
- disclosure summary セクションの表示確認（`data-testid="skill-lifecycle-disclosure-summary"`）
- `integrated_api` 成功後の状態（対照用 screenshot）
- TASK-SDK-07 Phase 11 の `manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md` / `discovered-issues.md` / `ui-sanity-visual-review.md` / `screenshot-coverage.md` / `phase11-capture-metadata.json` への evidence 追記
- `screenshot-plan.json` との capture ID 対応確認

**スコープ（含まないもの）**:

- Approval request surface（別タスク `UT-SDK-07-APPROVAL-REQUEST-SURFACE-001` で対応）
- SkillLifecyclePanel のコード変更
- 新規テストケース追加

**前提条件**:

- TASK-SDK-07 が実装完了済みであること
- desktop app が開発モードで起動可能であること
- `terminal_handoff` 状態を再現できること（API key なし または degraded 状態）

**制約**:

- コード変更は禁止（docs-only タスク）
- Phase 13（PR作成）はユーザー明示承認後のみ実施

---

### タスク3: Acceptance Criteria の定義

**目的**: 完了判定基準を番号付きで定義する。

| AC番号 | 条件                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1   | `terminal_handoff` 状態の `HandoffGuidance` 表示 screenshot が保存されている                                                                                     |
| AC-2   | disclosure summary（`data-testid="skill-lifecycle-disclosure-summary"`）の screenshot が保存されている                                                           |
| AC-3   | `integrated_api` 成功後の screenshot（対照用）が保存されている                                                                                                   |
| AC-4   | screenshot ファイルは `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` に配置されている          |
| AC-5   | `screenshot-plan.json` に記録した capture ID と screenshot ファイルが対応している                                                                                |
| AC-6   | `outputs/phase-11/manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md` に evidence が追記されている                                     |
| AC-7   | `outputs/phase-11/discovered-issues.md` / `ui-sanity-visual-review.md` / `screenshot-coverage.md` / `screenshots/phase11-capture-metadata.json` が作成されている |

---

### タスク4: artifact 命名 canonical 一覧の確定

**目的**: Phase 12 での artifact 名ドリフトを防止する。

| artifact 名                             | 配置先                                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `terminal_handoff-handoff-guidance.png` | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `disclosure-summary-display.png`        | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `integrated-api-success-comparison.png` | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `manual-test-checklist.md`              | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `manual-test-result.md`（追記）         | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `manual-test-report.md`                 | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `discovered-issues.md`                  | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `ui-sanity-visual-review.md`            | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `screenshot-plan.json`                  | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `screenshot-coverage.md`                | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `phase11-capture-metadata.json`         | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `implementation-guide.md`               | `outputs/phase-12/`                                                                                              |
| `system-spec-update-summary.md`         | `outputs/phase-12/`                                                                                              |
| `documentation-changelog.md`            | `outputs/phase-12/`                                                                                              |
| `unassigned-task-detection.md`          | `outputs/phase-12/`                                                                                              |
| `skill-feedback-report.md`              | `outputs/phase-12/`                                                                                              |
| `phase12-task-spec-compliance-check.md` | `outputs/phase-12/`                                                                                              |

---

## 参照資料

| 参照資料               | パス                                                                                                                        | 内容                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 元未タスク仕様書       | `docs/30-workflows/unassigned-task/task-ut-sdk-07-phase11-screenshot-evidence-001.md`                                       | タスク背景・完了条件 |
| screenshot-plan.json   | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshot-plan.json`    | capture ID 定義      |
| TASK-SDK-07 実装ガイド | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-12/implementation-guide.md` | 実装詳細・UI 構造    |
| SkillLifecyclePanel    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                        | 対象コンポーネント   |

---

## 成果物

| 成果物             | パス                              | 内容                     |
| ------------------ | --------------------------------- | ------------------------ |
| 要件定義書（本書） | `outputs/phase-1/requirements.md` | スコープ・AC・タスク分類 |

---

## 統合テスト連携

- Phase 2 で capture ID と evidence 保存先を設計し、Phase 11 の screenshot 取得に引き渡す
- Phase 9 / Phase 10 で手動テスト前の前提とリスクを確認する
- Phase 12 で `artifacts.json` と `outputs/artifacts.json` の parity を確認する

## 完了条件

- [ ] タスク分類（docs-only / VISUAL）が明記されている
- [ ] スコープ（含む・含まない）が定義されている
- [ ] Acceptance Criteria（AC-1〜AC-6）が定義されている
- [ ] artifact 命名 canonical 一覧が確定している
- [ ] Phase 4〜8 が N/A であることが記録されている

## タスク100%実行確認【必須】

上記の全完了条件を確認し、Phase 1 が完了したことを記録すること。Phase 2 へ進む前にゲートを通過していることを確認する。

## 次Phase

Phase 2: 設計（手動テスト手順設計）
