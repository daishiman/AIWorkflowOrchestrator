# 未タスク指示書: UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| タスクID   | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001    |
| 由来       | TASK-RT-06 Phase 8 調査（unassigned-task-detection.md） |
| ステータス | unassigned                                              |
| 優先度     | low                                                     |
| 作成日     | 2026-03-29                                              |
| Issue番号  | #1692                                                   |
| 関連仕様書 | sdkMessageNormalizer.ts, SkillExecutor.ts               |

---

## 目的

`SkillExecutor.ts` の `convertToStreamMessage()` が SDK 生メッセージを独自に変換しており、
`sdkMessageNormalizer.ts` の normalizer と二重に変換ロジックが存在する状態を解消する。

---

## 背景

TASK-RT-06 の実装で `sdkMessageNormalizer.ts` を新設した結果、SDK メッセージ変換ロジックが
以下の2箇所に存在するようになった:

| 箇所                      | 関数                       | 出力型                 | 用途                |
| ------------------------- | -------------------------- | ---------------------- | ------------------- |
| `SkillExecutor.ts`        | `convertToStreamMessage()` | `SkillStreamMessage`   | 既存スキル実行 lane |
| `sdkMessageNormalizer.ts` | `normalizeSdkMessage()`    | `SkillCreatorSdkEvent` | skill-creator lane  |

出力型が異なるため即時統合は不可だが、型ガード・メッセージ分岐ロジックの重複を解消することで
将来の SDK バージョンアップ時のメンテナンスコストを削減できる。

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

## 前提条件

- TASK-RT-06 が `completed` 状態であること
- `sdkMessageNormalizer.ts` が `apps/desktop/src/main/services/runtime/` に存在すること

---

## 実行手順

1. 両関数のメッセージ分岐ロジックを比較し、共通部分を特定する
   ```
   SkillExecutor.ts: convertToStreamMessage() (L899-938)
   sdkMessageNormalizer.ts: normalizeSdkMessage()
   ```
2. 型ガード `isValidSDKMessage` を `sdkMessageNormalizer.ts` へ移動し re-export する案を検討
3. 共通ロジックを抽出できる場合は shared utility 関数として `sdkMessageUtils.ts` 等に切り出す
4. `SkillExecutor.ts` が共通ロジックを利用するよう更新
5. `pnpm typecheck && pnpm lint && pnpm test` で品質確認

---

## 完了条件

- [ ] 型ガードの定義が1箇所に集約されているか、または統合不可の理由が記録されていること
- [ ] 既存テスト (`sdkMessageNormalizer.test.ts`) が全件 PASS すること
- [ ] `SkillExecutor` の既存動作に変化がないこと（回帰テスト PASS）
- [ ] `pnpm typecheck` が PASS すること
