# TASK-RALLY-002 - restoredPendingRequest合成ルール明確化

## メタ情報

| 項目                | 値                                                                 |
| ------------------- | ------------------------------------------------------------------ |
| タスクID            | TASK-RALLY-002                                                     |
| 機能名              | restored-pending-request-clarification                             |
| 作成日              | 2026-04-21                                                         |
| ステータス          | blocked（Phase 12 close-out 完了 / Phase 13 は user approval待ち） |
| 総Phase数           | 13                                                                 |
| 衝突ドメイン        | ConversationalInterview                                            |
| 実行形態            | seq（ConversationalInterviewドメインの先頭）                       |
| タスク間依存        | なし（Wave 0: RALLY-001, RALLY-002, RALLY-004 が並列実行可）       |
| implementation_mode | new                                                                |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

### タスク間の直列/並列

```
Wave 0（並列）: RALLY-001, RALLY-002, RALLY-004 は同時実行可（ファイル衝突なし）
↓
Wave 1（直列・ConversationalInterview.tsx内）:
  RALLY-002 → RALLY-010 → RALLY-011 → RALLY-012 → RALLY-013
  （ConversationalInterview.tsxへの変更は必ず直列で実施）
```

### Phase内の直列/並列

```
Phase 1内:
  SubAgent-A（現状コード解析: pendingRequest合成式の確認）┐ 並列
  SubAgent-B（期待動作定義: セッション復元フローの整理）  ┘
  ↓
  SubAgent-C（統合・矛盾チェック: 変更方針の最終確認）← 直列

Phase 2〜13: 各Phase内は直列
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/wave0-par-RALLY-002 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 検証4条件

| 条件         | 本workflowでの判定観点                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| 矛盾なし     | `pendingRequest` 優先ルール、コメント、テスト期待値、後続タスク前提が相互に矛盾しない    |
| 漏れなし     | Phase 1〜13 の必須セクション、Phase 12 の canonical 6成果物、Phase 13 blocked 条件が揃う |
| 整合性あり   | `wave0-par-RALLY-002` を正本パスとして参照し、成果物名と `artifacts.json` を一致させる   |
| 依存関係整合 | Wave 0 並列と Wave 1 直列、Phase 間依存、RALLY-010 以降への handoff を破綻なく保つ       |

## 成果物

| Phase | 主要成果物                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, P50チェック結果, 合成ロジック現状分析                                                                                                 |
| 2     | 変更設計書（コメント内容・useEffect設計）, 検証方法                                                                                                             |
| 3     | 設計レビュー結果, ゲート判定, リスク評価表                                                                                                                      |
| 4     | テスト仕様書（シナリオテスト計画）                                                                                                                              |
| 5     | 実装サマリー, 変更ファイル一覧                                                                                                                                  |
| 6     | 回帰テスト結果, シナリオテスト結果                                                                                                                              |
| 7     | カバレッジ確認結果                                                                                                                                              |
| 8     | リファクタリング計画                                                                                                                                            |
| 9     | 品質レポート                                                                                                                                                    |
| 10    | 最終レビュー結果, ゲート判定                                                                                                                                    |
| 11    | 手動テスト結果                                                                                                                                                  |
| 12    | implementation-guide, system-spec-update-summary, documentation-changelog, unassigned-task-detection, skill-feedback-report, phase12-task-spec-compliance-check |
| 13    | local-check-result, change-summary, PR blocked 理由または承認後のPR作成結果                                                                                     |
