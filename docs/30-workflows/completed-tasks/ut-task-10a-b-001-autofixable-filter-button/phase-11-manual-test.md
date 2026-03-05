# Phase 11: 手動テスト検証 — 自動修正可能フィルタボタン実装

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 11                        |
| タスクID   | UT-TASK-10A-B-001         |
| 前提Phase  | Phase 10                  |
| 後続Phase  | Phase 12 ドキュメント更新 |
| 作成日     | 2026-03-05                |
| ステータス | 完了（2026-03-05）        |

## 目的

実機操作で「一括選択導線がUX上自然に機能するか」を検証し、証跡を残す。

## Atent Team（SubAgent）分担

| SubAgent | 担当                                |
| -------- | ----------------------------------- |
| A        | 画面操作テスト実施（通常導線）      |
| B        | 境界ケース手動確認                  |
| C        | 証跡整理（結果/スクリーンショット） |

## 実行タスク

### Task 11-1: 通常導線テスト

- TC-11-01: 通常表示で一括選択ボタンが表示される
- TC-11-02: 一括選択押下で auto-fixable のみ選択される

### Task 11-2: 境界ケーステスト

- TC-11-03: auto-fixable 0件時の disabled 状態
- TC-11-04: light mode で視認性維持
- TC-11-05: mobile幅でレイアウト破綻がない

### Task 11-3: 証跡収集

- 手動テスト結果
- スクリーンショット索引

## テストケース

| TC       | シナリオ                 | 期待結果                                 |
| -------- | ------------------------ | ---------------------------------------- |
| TC-11-01 | 通常表示（dark）         | 一括選択ボタンが表示される               |
| TC-11-02 | 一括選択押下後（dark）   | auto-fixable提案のみ選択される           |
| TC-11-03 | auto-fixable 0件（dark） | 一括選択ボタンがdisabledになる           |
| TC-11-04 | 通常表示（light）        | ラベルとコントロールの可読性が維持される |
| TC-11-05 | モバイル表示（dark）     | CTAと提案カードのレイアウトが崩れない    |

## 画面カバレッジマトリクス

| TC       | 画面状態                     | 証跡（スクリーンショット）                                             | 判定 |
| -------- | ---------------------------- | ---------------------------------------------------------------------- | ---- |
| TC-11-01 | 通常表示（dark）             | `outputs/phase-11/screenshots/TC-11-01-default-dark.png`               | PASS |
| TC-11-02 | 一括選択押下後（dark）       | `outputs/phase-11/screenshots/TC-11-02-auto-fix-selected-dark.png`     | PASS |
| TC-11-03 | auto-fixable 0件（disabled） | `outputs/phase-11/screenshots/TC-11-03-non-auto-fix-disabled-dark.png` | PASS |
| TC-11-04 | 通常表示（light）            | `outputs/phase-11/screenshots/TC-11-04-default-light.png`              | PASS |
| TC-11-05 | モバイル表示（dark）         | `outputs/phase-11/screenshots/TC-11-05-default-mobile-dark.png`        | PASS |

## 並列実行計画

| タスク                       | 実行パターン | 理由                     |
| ---------------------------- | ------------ | ------------------------ |
| Task 11-1(A) と Task 11-2(B) | 並列         | シナリオが独立           |
| Task 11-3(C)                 | 直列         | 結果を一本化して証跡管理 |

## 参照資料

依存Phase成果物: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10

| 資料名                | パス                                                                              | 用途               |
| --------------------- | --------------------------------------------------------------------------------- | ------------------ |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                                         | 手動検証対象確定   |
| UI仕様                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 期待UI整合         |
| テストパターン        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 手動テスト項目補完 |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に実施し、成果物へ記録する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                         | 参照仕様                      |
| -------------------- | -------------------------------- | ----------------------------- |
| セキュリティ         | 入力検証・境界防御が必要かを確認 | `security-*.md`               |
| UI/UX                | 操作導線・a11y要件の充足を確認   | `ui-ux-*.md`                  |
| アーキテクチャ       | 責務分離と依存方向を確認         | `architecture-*.md`           |
| API/インターフェース | 既存契約とのドリフト有無を確認   | `api-*.md`, `interfaces-*.md` |
| エラーハンドリング   | 失敗時の通知と分類を確認         | `error-handling.md`           |

## 統合テスト連携（Phase 1〜11）

- 自動テストPASSでもUX不整合がないかを手動で補完する。

## 成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` |
| スクリーンショット索引 | `outputs/phase-11/screenshot-index.md`   |

## 完了条件

- [x] 全TC結果が記録されている
- [x] 失敗時の再現手順が残っている（FAILなしのため N/A 記録）
- [x] Phase 12 へ渡す課題整理が完了している

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物2点を出力済み
- [x] 引き継ぎ事項を記録済み

## 次のPhase

Phase 12: ドキュメント更新
