---
task_id: UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
task_name: SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ
category: 改善
target_feature: SkillLifecyclePanel auth回帰テスト（auth-regression.test.tsx）
priority: 中
scale: 小規模
status: completed
issue_number: 2237
created_date: 2026-04-18
dependencies:
  - UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
---

# UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 - タスク実行仕様書

## タスクID

`UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001`

## タスク名

SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ

## 背景

`SkillLifecyclePanel.auth-regression.test.tsx` に 5 件の `describe.skip` が存在し、スキップされた状態のまま放置されている。
これらのテストは `auth:login` IPC 呼び出しの不正な発生を回帰検出するためのセキュリティ重要テストであり、スキップ状態はセキュリティリスクを意味する。

- TC-03（行305）: skill generation completes without auth:login timeout
- TC-05（行431）: skill generation does not call auth:login when user is unauthenticated
- TC-06（行501）: rapid skill generation clicks do not trigger multiple auth:login
- TC-07（行590）: auth:login is not triggered on component re-render during skill flow
- TC-08（行686）: authModeSlice state changes do not trigger unexpected auth:login

なお TC-03/TC-05/TC-06/TC-07 のテスト内部では `fillCreateRequest()` および `clickPrepareButton()` を使用しているが、
`fillCreateRequest()` は UI リファクタリング（遷移ボタン化）により no-op 化されており、
また `SkillLifecyclePanel` コンポーネントの props に `isOpen` / `defaultTab` が存在しない可能性がある。
これらが skip 原因である可能性が高い。

依存タスク `UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001` が完了済みであるため、本タスクではその成果を引き継ぎ、
`describe.skip` の原因を調査・修正または削除してテストスイートを有効な状態に戻す。

## 目的

- `SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` を 0 件にする
- `auth:login` IPC 呼び出しの回帰検出テストを有効化する
- 廃止済み props / testid に依存するテストコードを現行 UI に合わせて修正または削除する
- クリーンアップ後の全テストが PASS であることを確認する

## スコープ

| 対象               | パス                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| 主対象ファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` |
| 参照コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                |
| 参照Slice          | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                           |
| スコープ外         | UIコンポーネント本体の変更、他テストファイルの変更                                                  |

## タスク分類

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスク種別 | NON_VISUAL                        |
| 作業種別   | cleanup                           |
| 変更範囲   | テストファイル中心、UI変更なし    |
| 証跡方針   | Phase 11 は非視覚証跡のみを扱う   |
| PR方針     | Phase 13 は承認待ちのため blocked |

## Phase 構成テーブル

| Phase | 名称                 | 仕様書                                               | ステータス |
| ----- | -------------------- | ---------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)   | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)               | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md) | completed  |
| 4     | テスト作成           | `phase-4-test-creation.md`                           | completed  |
| 5     | 実装                 | `phase-5-implementation.md`                          | completed  |
| 6     | テスト拡充           | `phase-6-test-expansion.md`                          | completed  |
| 7     | テストカバレッジ確認 | `phase-7-coverage-check.md`                          | completed  |
| 8     | リファクタリング     | `phase-8-refactoring.md`                             | completed  |
| 9     | 品質保証             | `phase-9-quality-assurance.md`                       | completed  |
| 10    | 最終レビューゲート   | `phase-10-final-review.md`                           | completed  |
| 11    | 手動テスト検証       | `phase-11-manual-test.md`                            | completed  |
| 12    | ドキュメント更新     | `phase-12-documentation.md`                          | completed  |
| 13    | PR作成               | `phase-13-pr-creation.md`                            | blocked    |

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

## 成果物一覧

| Phase | 主要成果物                                                                                 |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果                                                     |
| 2     | 設計書, テスト戦略（処置方針・モック整合設計）                                             |
| 3     | 設計レビュー結果, ゲート判定                                                               |
| 4     | テスト仕様書, Red 結果                                                                     |
| 5     | 実装サマリー, 変更ファイル一覧                                                             |
| 6     | 拡張テストケース, 回帰テスト結果                                                           |
| 7     | カバレッジ計画, トレーサビリティ網羅率                                                     |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                               |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                   |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                               |
| 11    | 手動テスト結果（非視覚シナリオ）, 証跡インデックス（N/A明記）                              |
| 12    | 実装ガイド（中学生向け概念説明含む）, 仕様更新サマリー, 未タスク検出, スキルフィードバック |
| 13    | PR準備メモ, 引き継ぎサマリー, 承認チェック                                                 |

## 完了条件チェックリスト

- [ ] `describe.skip` が対象ファイルで 0 件であることを確認
- [ ] `auth:login` IPC 回帰検出テストが最低 1 件有効化されていることを確認
- [ ] 廃止済み props（`isOpen` / `defaultTab`）の参照が修正または削除されていることを確認
- [ ] `fillCreateRequest()` の no-op 化に伴う影響を考慮した修正が完了していることを確認
- [ ] Vitest 全件 PASS であることを確認
- [ ] TypeScript 型エラーが 0 件であることを確認
- [ ] ESLint エラー・警告が 0 件であることを確認
- [ ] Phase 8〜13 の全成果物が作成されていることを確認
- [ ] Phase 12 の中学生レベル概念説明（describe.skip）が含まれていることを確認
- [ ] Phase 11 の NON_VISUAL 判定根拠が明記されていることを確認
- [ ] artifacts.json が最終ステータスに更新されていることを確認

---

## Phase 完了時の必須アクション

1. **タスク 100% 実行**: Phase 内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json 更新**: `complete-phase.js` で Phase 完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase 完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

_このファイルは task-specification-creator によって生成されました。_
_最終更新: 2026-04-18T00:00:00.000Z_
