# UT-FIX-EP-01-EXECUTE-PLAN-ACK-TYPE-GUARD-TEST: isExecutePlanAck 型ガードの専用ユニットテスト

## メタ情報

```yaml
issue_number: 1913
```

## メタ情報

| 項目         | 値                                                       |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-FIX-EP-01-EXECUTE-PLAN-ACK-TYPE-GUARD-TEST            |
| タスク名     | isExecutePlanAck 型ガード関数の専用ユニットテスト追加    |
| 優先度       | 低                                                       |
| 分類         | テスト拡充                                               |
| 見積もり規模 | 小規模                                                   |
| 検出元       | TASK-FIX-EP-01 Phase 3（テスト網羅性レビュー）, Phase 10 |
| 作成日       | 2026-04-04                                               |
| ステータス   | 未着手                                                   |

## 概要

Renderer 側の `isExecutePlanAck()` 型ガード関数に対する独立した単体テストが未実装。現在は `SkillLifecyclePanel` テスト内で間接的にカバーされているが、型ガード自体の境界値テスト（null、undefined、部分的なオブジェクト、accepted: false 等）が不足している。

## 影響範囲

- `isExecutePlanAck` 関数の定義箇所（`packages/shared/src/types/` 配下または `SkillLifecyclePanel.tsx` 内）
- テストファイル: 新規作成

## 対応方針

1. `isExecutePlanAck` の定義箇所を特定
2. 以下のテストケースを作成:
   - `{ accepted: true, planId: "plan-1" }` → `true`
   - `{ accepted: false, planId: "plan-1" }` → `false`
   - `{ accepted: true }` (planId なし) → `false`
   - `null` → `false`
   - `undefined` → `false`
   - `{}` → `false`
   - `{ accepted: true, planId: 123 }` (planId が number) → `false`
3. 既存テストとの重複がないことを確認

## 苦戦箇所（TASK-FIX-EP-01 からの知見）

- **間接カバレッジの限界**: SkillLifecyclePanel テストで `isExecutePlanAck` が間接的に使われているが、型ガードのエッジケース（不正な入力値）は網羅されていない
- **推奨**: 型ガード関数は shared パッケージに配置されている場合、shared のテストとして追加するのが適切

## 参照

- TASK-FIX-EP-01 Phase 3 テスト網羅性レビュー: MINOR 指摘
- `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/unassigned-task-detection.md`: U-3
