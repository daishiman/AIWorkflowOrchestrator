# Phase 5: 実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 4                      |
| 後続Phase  | Phase 6                      |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

Phase 2 の設計通りに `ConversationalInterview.tsx` を変更し、Phase 4 で Red になったテストを Green にする。

## 直列/並列情報

- **本タスク（RALLY-013）は ConversationalInterview ドメインのチェーン末尾**
- 完了後は同一ファイルへの後続変更タスクなし

## 実装手順

1. `useInterviewState.ts` を読み、`interview` オブジェクトが `steps`・`canUndo`・`currentStepIndex` のどのフィールドを持つか確認する
2. `undoableStepCount` の計算式を確定する（`steps.filter` または専用フィールド）
3. `undoableStepCount` 変数をコンポーネント内に追加する
4. UndoボタンのJSXを変更し、ラッパー `div` とインジケーター `span` を追加する
5. `disabled` 条件を `undoableStepCount === 0 || isSubmitting` に更新する
6. `data-testid="interview-undo-hint"` を追加する
7. `pnpm typecheck` と `pnpm lint` を実行しエラーがないことを確認する
8. `pnpm test` で Green になることを確認する

## 主な変更点

- `undoableStepCount` 変数の追加（L44付近）
- UndoボタンのJSXをラッパー `div` + ボタン + インジケーター `span` に変更
- `disabled` 条件の更新（`!interview.canUndo` → `undoableStepCount === 0`）
- `data-testid="interview-undo-hint"` の追加

## 参照資料

| 資料名               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| インジケーター設計書 | `outputs/phase-2/indicator-design.md`    | Phase 2 成果物 |
| テスト仕様書         | `outputs/phase-4/test-specification.md`  | Phase 4 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイル一覧 |

## 完了条件

- [ ] `undoableStepCount` 変数が実装されていること
- [ ] インジケーター `span`（`data-testid="interview-undo-hint"`）が実装されていること
- [ ] `disabled` 条件が更新されていること
- [ ] `pnpm typecheck` でエラー 0 件
- [ ] `pnpm lint` でエラー 0 件
- [ ] Phase 4 のテストが Green になっていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p13-seq-RALLY-013
```

## 次のPhase

Phase 6: テスト拡充
