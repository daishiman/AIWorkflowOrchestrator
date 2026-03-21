# UT-TASK06-007-EXT-006-new-function-test-expansion - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| 機能名     | UT-TASK06-007-EXT-006-new-function-test-expansion    |
| タスクID   | UT-TASK06-007-EXT-006                                |
| 作成日     | 2026-03-21                                           |
| ステータス | completed（Phase 1-12 completed / Phase 13 blocked） |
| 総Phase数  | 13                                                   |
| 分類       | テスト品質改善                                       |
| 優先度     | 高                                                   |
| 規模       | 小規模                                               |
| 親タスク   | UT-TASK06-007                                        |
| Issue      | #1393                                                |

---

## 概要

linter（Hook）が `check-ipc-contracts.ts` に自動追加した5つの新関数・パターンに対し、境界値・エッジケーステストを拡充する。

**対象関数/パターン:**

1. `normalizeTypeAnnotation()` - 型アノテーション正規化
2. `isPrimitiveTypeAnnotation()` - プリミティブ型判定
3. `mergeChannelMaps()` - 複数ファイルからのチャンネル定数マージ
4. `CHANNEL_OBJECT_PATTERN` - 複数オブジェクト対応正規表現
5. `PRELOAD_CALL_START_PATTERN` - multi-line preload呼び出し検出正規表現

**テスト戦略:** export追加 + 直接テスト（Phase 4で20件追加。既存49件と合わせて69件に到達し、Phase 6では追加不要と判断）

## Canonical Facts

| 項目                | 正本                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象1               | `normalizeTypeAnnotation()` - 型アノテーション正規化                                                                                                                                          |
| 対象2               | `isPrimitiveTypeAnnotation()` - プリミティブ型判定                                                                                                                                            |
| 対象3               | `mergeChannelMaps()` - 複数ファイルからのチャンネル定数マージ                                                                                                                                 |
| 対象4               | `CHANNEL_OBJECT_PATTERN` - 複数オブジェクト対応正規表現                                                                                                                                       |
| 対象5               | `PRELOAD_CALL_START_PATTERN` - multi-line preload呼び出し検出正規表現                                                                                                                         |
| テストID            | `T-N-01..05`, `T-P-01..06`, `T-M-01..04`, `T-R-01..05`                                                                                                                                        |
| テスト件数          | 69件（既存49件 + 新規20件）                                                                                                                                                                   |
| 品質基準            | Line Coverage 95%以上、Branch Coverage 70%以上、Function Coverage 90%以上                                                                                                                     |
| Phase 12 必須成果物 | `implementation-guide.md`, `system-spec-update-summary.md`, `documentation-changelog.md`, `unassigned-task-detection.md`, `skill-feedback-report.md`, `phase12-task-spec-compliance-check.md` |

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

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/requirements.md                                                                                                                                                                                                                                                                                 |
| 2     | outputs/phase-2/design.md                                                                                                                                                                                                                                                                                       |
| 3     | outputs/phase-3/gate-decision.md                                                                                                                                                                                                                                                                                |
| 4     | outputs/phase-4/test-design.md, apps/desktop/scripts/**tests**/check-ipc-contracts.test.ts（テスト追加）                                                                                                                                                                                                        |
| 5     | outputs/phase-5/green-confirmation.md, apps/desktop/scripts/check-ipc-contracts.ts（export追加）                                                                                                                                                                                                                |
| 6     | apps/desktop/scripts/**tests**/check-ipc-contracts.test.ts（追加テスト）                                                                                                                                                                                                                                        |
| 7     | outputs/phase-7/coverage-report.md                                                                                                                                                                                                                                                                              |
| 8     | outputs/phase-8/refactoring-report.md                                                                                                                                                                                                                                                                           |
| 9     | outputs/phase-9/quality-report.md                                                                                                                                                                                                                                                                               |
| 10    | outputs/phase-10/final-review-result.md                                                                                                                                                                                                                                                                         |
| 11    | outputs/phase-11/manual-test-checklist.md, outputs/phase-11/manual-test-result.md                                                                                                                                                                                                                               |
| 12    | outputs/artifacts.json, outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |
| 13    | PR（GitHub）                                                                                                                                                                                                                                                                                                    |

---

## 参照資料

| 資料名                       | パス                                                                                                                      | 説明                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| タスク指示書                 | `docs/30-workflows/completed-tasks/ut-task06-007-ext-006-new-function-test-expansion.md`                                  | 元タスク指示書             |
| 対象スクリプト               | `apps/desktop/scripts/check-ipc-contracts.ts`                                                                             | テスト対象（584行）        |
| 既存テスト                   | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                                              | 既存49テスト               |
| 親タスク成果物               | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/`                                         | 親タスクの仕様書・成果物群 |
| GitHub Issue                 | #1393                                                                                                                     | タスクIssue                |
| IPC drift detection パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md` | テスト戦略セクション       |
