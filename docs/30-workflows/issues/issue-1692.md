# [#1692] [UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001] SkillExecutor.convertToStreamMessage と sdkMessageNormalizer の型ガード重複解消

## メタ情報

```yaml
issue_number: 1692
task_id: UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001
task_name: SkillExecutor.convertToStreamMessage と sdkMessageNormalizer の型ガード重複解消
category: リファクタリング
target_feature: SkillExecutor / sdkMessageNormalizer
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-RT-06 Phase 8 調査
created_date: 2026-03-29
dependencies:
  - TASK-RT-06 が completed 状態
spec_path: docs/30-workflows/unassigned-task/UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001.md
parent_workflow: docs/30-workflows/completed-tasks/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md
```

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001  |
| タスク名     | SkillExecutor / sdkMessageNormalizer 型ガード重複解消 |
| 分類         | リファクタリング                                      |
| 対象機能     | `SkillExecutor.ts` / `sdkMessageNormalizer.ts`        |
| 優先度       | 低                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | TASK-RT-06 Phase 8 調査                               |
| 発見日       | 2026-03-29                                            |

---

## 目的

`SkillExecutor.ts` の `convertToStreamMessage()` が SDK 生メッセージを独自に変換しており、`sdkMessageNormalizer.ts` の normalizer と二重に変換ロジックが存在する状態を解消する。

---

## 背景

TASK-RT-06 の実装で `sdkMessageNormalizer.ts` を新設した結果、SDK メッセージ変換ロジックが以下の2箇所に存在するようになった:

| 箇所                      | 関数                       | 出力型                 | 用途                |
| ------------------------- | -------------------------- | ---------------------- | ------------------- |
| `SkillExecutor.ts`        | `convertToStreamMessage()` | `SkillStreamMessage`   | 既存スキル実行 lane |
| `sdkMessageNormalizer.ts` | `normalizeSdkMessage()`    | `SkillCreatorSdkEvent` | skill-creator lane  |

出力型が異なるため即時統合は不可だが、型ガード・メッセージ分岐ロジックの重複を解消することで将来の SDK バージョンアップ時のメンテナンスコストを削減できる。

---

## スコープ

### 含むもの

- `convertToStreamMessage()` と `normalizeSdkMessage()` の重複ロジック調査
- 型ガード（`isValidSDKMessage`）の共通化または統合方針の決定
- リファクタリング実施（または見送りの意思決定記録）

### 含まないもの

- `SkillStreamMessage` 型を `SkillCreatorSdkEvent` に統一すること（別タスク）
- `SkillExecutor` の実行フロー全体のリアーキテクト

---

## 実行手順

1. 両関数のメッセージ分岐ロジックを比較し、共通部分を特定する
2. 型ガード `isValidSDKMessage` を `sdkMessageNormalizer.ts` へ移動し re-export する案を検討
3. 共通ロジックを抽出できる場合は shared utility 関数として切り出す
4. `SkillExecutor.ts` が共通ロジックを利用するよう更新
5. `pnpm typecheck && pnpm lint && pnpm test` で品質確認

---

## 完了条件

- [ ] 型ガードの定義が1箇所に集約されているか、または統合不可の理由が記録されていること
- [ ] 既存テスト (`sdkMessageNormalizer.test.ts`) が全件 PASS すること
- [ ] `SkillExecutor` の既存動作に変化がないこと（回帰テスト PASS）
- [ ] `pnpm typecheck` が PASS すること

---

## 参照

- spec: `docs/30-workflows/unassigned-task/UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001.md`
- detection: `docs/30-workflows/completed-tasks/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/src/main/services/runtime/SkillExecutor.ts`
- `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`
