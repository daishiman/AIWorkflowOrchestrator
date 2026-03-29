# 未タスク指示書: UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                          |
| 由来       | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001 Phase 12 調査       |
| ステータス | 未着手                                                                   |
| 優先度     | low                                                                      |
| 作成日     | 2026-03-29                                                               |
| 関連タスク | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001（Phase 12未タスク） |

---

## 目的

`SkillStreamMessage`（既存スキル実行 lane）と `SkillCreatorSdkEvent`（skill-creator lane）の
2つの出力型が存在する状態を統一し、SDK バージョンアップ時の保守コストをさらに削減する。

---

## 背景

UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001 にて、SDK メッセージ前処理の共通化
（`asSdkMessageRecord()` / `getSdkMessageType()`）を完了した。
しかし、両 lane の出力型は以下のとおり依然として分離した状態が残っている:

| 箇所                      | 関数                       | 出力型                 | 用途                |
| ------------------------- | -------------------------- | ---------------------- | ------------------- |
| `SkillExecutor.ts`        | `convertToStreamMessage()` | `SkillStreamMessage`   | 既存スキル実行 lane |
| `sdkMessageNormalizer.ts` | `normalizeSdkMessage()`    | `SkillCreatorSdkEvent` | skill-creator lane  |

出力型の統一は、型定義の変更と両 lane 全体の変換ロジック整合が必要なため、前回タスクのスコープ外と
して除外された。本タスクで別途取り組む。

---

## スコープ

### 含むもの

- `SkillStreamMessage` と `SkillCreatorSdkEvent` の型定義の統合方針の策定
- 統合型定義の設計（または段階的統合の計画）
- 両 lane の出力型を統一する実装
- 既存テストの回帰確認

### 含まないもの

- SDK 内部契約の変更
- `SkillExecutor` の実行フロー全体のリアーキテクト
- lane 固有のビジネスロジック変更

---

## 前提条件

- `UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001` が完了していること
- `sdkMessageUtils.ts` が `apps/desktop/src/main/services/runtime/` に存在すること

---

## 対象ファイル（想定）

| ファイル                                                               | 役割                              | 変更種別                       |
| ---------------------------------------------------------------------- | --------------------------------- | ------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                            | `SkillCreatorSdkEvent` 型定義     | 修正（統合型 or 継承関係定義） |
| `packages/shared/src/types/skill.ts`（またはinterfaces-agent-sdk関連） | `SkillStreamMessage` 型定義       | 修正（統合型 or 継承関係定義） |
| `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`       | normalizer 出力型                 | 修正                           |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                | `convertToStreamMessage()` 出力型 | 修正                           |

---

## 完了条件

- [ ] 統合型定義または共通基底型が1箇所に集約されていること
- [ ] 既存テスト（`sdkMessageNormalizer.test.ts`、`sdkMessageUtils.test.ts`）が全件 PASS すること
- [ ] `SkillExecutor` の既存動作に変化がないこと（回帰テスト PASS）
- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm lint` が PASS すること
