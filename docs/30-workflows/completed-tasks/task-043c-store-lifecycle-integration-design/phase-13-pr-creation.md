# Phase 13: 完了・PR準備

## メタ情報

| 項目      | 値                                 |
| --------- | ---------------------------------- |
| タスク ID | TASK-10A-E-C                       |
| Phase     | 13                                 |
| 機能名    | store-lifecycle-integration-design |
| 作成日    | 2026-03-06                         |
| 前提Phase | Phase 12（ドキュメント更新 完了）  |
| 後続Phase | なし（ワークフロー完了）           |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- 成果物確認: Phase 1-12の全成果物が存在することを確認
- artifacts.json更新: 全Phaseのステータスを完了に更新
- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後にPRを作成
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名                       | パス                                                                                  | 説明                               |
| ---------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11/12ガイド            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`           | 手動テスト・ドキュメント作成ガイド |
| 仕様更新フロー               | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`        | 仕様更新ワークフロー               |
| 成果物命名規則               | `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md` | ファイル命名                       |
| 設計書                       | `phase-2-design.md`                                                                   | 設計仕様                           |
| 実装サマリー                 | `phase-5-implementation.md`                                                           | 実装サマリー                       |
| 最終レビュー結果             | `outputs/phase-10/final-review-report.md`                                             | Phase 10成果物                     |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                              | Phase 11成果物                     |
| 発見課題リスト               | `outputs/phase-11/discovered-issues.md`                                               | Phase 11成果物                     |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                            | Phase 12成果物                     |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`                                             | Phase 12成果物                     |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                         | Phase 12成果物                     |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                       | Phase 12成果物                     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                           | Phase 12成果物                     |
| Phase 6 成果物               | `outputs/phase-6/coverage-report.md`                                                  | テスト拡充結果                     |
| Phase 7 成果物               | `outputs/phase-7/coverage-report.md`                                                  | カバレッジ検証結果                 |
| Phase 8 成果物               | `outputs/phase-8/refactoring-log.md`                                                  | リファクタリング記録               |
| Phase 9 成果物               | `outputs/phase-9/quality-report.md`                                                   | 品質レポート                       |

---

## 実行手順

### 1. 成果物確認【必須】

Phase 1-12の全成果物が存在することを確認する。

手動で以下のファイルの存在を確認する:

| Phase | 成果物パス                                      | 必須 |
| ----- | ----------------------------------------------- | ---- |
| 1     | `phase-1-requirements.md`                       | Yes  |
| 2     | `phase-2-design.md`                             | Yes  |
| 3     | `phase-3-design-review.md`                      | Yes  |
| 4     | `phase-4-test-creation.md`                      | Yes  |
| 5     | `phase-5-implementation.md`                     | Yes  |
| 6     | `phase-6-test-expansion.md`                     | Yes  |
| 7     | `phase-7-coverage-check.md`                     | Yes  |
| 8     | `phase-8-refactoring.md`                        | Yes  |
| 9     | `phase-9-quality-assurance.md`                  | Yes  |
| 10    | `outputs/phase-10/final-review-report.md`       | Yes  |
| 11    | `outputs/phase-11/manual-test-result.md`        | Yes  |
| 11    | `outputs/phase-11/discovered-issues.md`         | Yes  |
| 12    | `outputs/phase-12/implementation-guide.md`      | Yes  |
| 12    | `outputs/phase-12/spec-update-summary.md`       | Yes  |
| 12    | `outputs/phase-12/documentation-changelog.md`   | Yes  |
| 12    | `outputs/phase-12/unassigned-task-detection.md` | Yes  |
| 12    | `outputs/phase-12/skill-feedback-report.md`     | Yes  |

### 2. artifacts.json 更新

全Phaseのステータスを `completed` に更新する。

### 3. ブランチ名規則

```
docs/task-043c-store-lifecycle-integration-design
```

プレフィックスは `docs/`（仕様策定のみのため）。

### 4. コミットメッセージ

```
docs(store-lifecycle): Store駆動ライフサイクル統合設計 Phase 1-13 仕様書

- selector設計: imported / available / filtered の算出責務を定義
- action設計: import実行中フラグ・成功後再読込・失敗時エラー保持
- 競合回避: TASK-10A-F境界の責務分離を定義
- P31対策: 個別selector優先・合成Hook禁止条件を定義
```

### 5. PR作成

```bash
gh pr create \
  --title "docs(store-lifecycle): TASK-10A-E-C Store駆動ライフサイクル統合設計" \
  --body "$(cat <<'EOF'
## Summary
- selector設計: imported / available / filtered の算出責務を定義
- action設計: import実行中フラグ・成功後再読込・失敗時エラー保持の状態遷移
- TASK-10A-F境界の責務分離とP31無限ループ回避条件を定義

## Test plan
- [ ] 全13 Phase仕様書の存在確認
- [ ] Phase 1-9 の内容整合性確認
- [ ] Phase 10-13 の内容整合性確認
- [ ] artifacts.json のPhaseステータス確認
- [ ] index.md のメタ情報確認

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 6. CI確認

PRのCIチェックが通過したことを確認する。

---

## 統合テスト連携

| 観点         | 検証内容                                               |
| ------------ | ------------------------------------------------------ |
| 成果物完全性 | Phase 1-12の全成果物が存在し、artifacts.jsonと一致する |
| ブランチ命名 | `docs/` プレフィックスでPR作成規則に準拠               |

---

## 多角的チェック観点

| カテゴリ      | チェック項目                                |
| ------------- | ------------------------------------------- |
| 成果物完全性  | 全Phase仕様書と出力ファイルが存在すること   |
| artifacts同期 | artifacts.json と実ファイルの整合性         |
| PR品質        | タイトル70文字以内・Summary + Test Plan含む |
| CI通過        | PRのCIチェックが全て通過していること        |

---

## 成果物

| 成果物       | パス                                    | 説明         |
| ------------ | --------------------------------------- | ------------ |
| 完了レポート | `outputs/phase-13/completion-report.md` | 完了レポート |

---

## 完了条件

- [ ] Phase 1-12の全成果物が存在することを確認した
- [ ] `artifacts.json` の全Phaseステータスを更新した
- [ ] ユーザーの明示的な許可を得た
- [ ] PRを作成した
- [ ] CIが通過したことを確認した

## 次のPhase

なし（ワークフロー完了）
