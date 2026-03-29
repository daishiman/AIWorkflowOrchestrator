# タスク仕様書: SkillExecutor と sdkMessageNormalizer の SDK メッセージ前処理重複解消

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001    |
| タスク名   | SkillExecutor/sdkMessageNormalizer 型ガード重複解消     |
| タイプ     | refactor                                                |
| 優先度     | low                                                     |
| 関連Issue  | #1692                                                   |
| 由来       | TASK-RT-06 Phase 8 調査（unassigned-task-detection.md） |
| 作成日     | 2026-03-29                                              |
| ステータス | Phase 1-12 完了（Phase 13 未実施）                      |

## 目的

TASK-RT-06 の実装で `sdkMessageNormalizer.ts` を新設した結果、SDK 生メッセージの「unknown から record へ落とす前処理」と「type フィールドの安全な読取り」が2箇所に分散した状態を解消する。実際の重複だけを shared helper に寄せ、lane 固有の変換責務は維持したまま保守コストを下げる。

## 背景

| 箇所                      | 関数                       | 出力型                 | 用途                |
| ------------------------- | -------------------------- | ---------------------- | ------------------- |
| `SkillExecutor.ts`        | `convertToStreamMessage()` | `SkillStreamMessage`   | 既存スキル実行 lane |
| `sdkMessageNormalizer.ts` | `normalizeSdkMessage()`    | `SkillCreatorSdkEvent` | skill-creator lane  |

出力型が異なるため normalizer 全体の統合は対象外とし、以下の前処理だけを共通化する:

- `unknown` 値を SDK メッセージ候補の record に落とす判定
- `type` フィールドの安全な抽出

各 lane の分岐・出力マッピングは維持する。`SkillStreamMessage` と `SkillCreatorSdkEvent` を無理に共通化しない。

## タスク分類

- [x] リファクタリング（インターフェース不変）
- [ ] UI task
- [ ] docs-only task

## スコープ

### 含むもの

- `sdkMessageUtils.ts` への最小 shared helper 抽出
- `unknown -> Record<string, unknown> | null` 判定の共通化
- `type` フィールド読取りヘルパーの共通化
- `SkillExecutor.ts` の `convertToStreamMessage()` が shared helper を利用するよう更新
- `sdkMessageNormalizer.ts` が shared helper を利用するよう更新
- 既存テストの回帰確認

### 含まないもの

- `SkillStreamMessage` 型を `SkillCreatorSdkEvent` 型に統一すること
- lane 固有のメッセージ分岐・出力変換の統合
- SDK 由来メッセージ shape を単一 interface に押し込める再設計
- `SkillExecutor` の実行フロー全体のリアーキテクト
- SDK 内部契約の変更

## 受け入れ基準

- AC-1: `unknown -> record` 判定と `type` 抽出が1箇所（`sdkMessageUtils.ts`）に集約され、両モジュールがその helper を利用していること
- AC-2: `sdkMessageNormalizer.test.ts` が全件 PASS すること
- AC-3: `SkillExecutor.sdk-types.test.ts` が全件 PASS すること（回帰なし）
- AC-4: `pnpm typecheck` が PASS すること
- AC-5: `pnpm lint` が PASS すること
- AC-6: 共通ユーティリティに JSDoc が記述されていること
- AC-7: lane 固有の出力型 (`SkillStreamMessage` / `SkillCreatorSdkEvent`) に変更がないこと

## 前提条件

- TASK-RT-06 が `completed` 状態であること
- `sdkMessageNormalizer.ts` が `apps/desktop/src/main/services/runtime/` に存在すること
- `SkillExecutor.ts` が `apps/desktop/src/main/services/skill/` に存在すること

## 対象ファイル

| ファイル                                                                   | 役割                             | 変更種別                 |
| -------------------------------------------------------------------------- | -------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`           | SDK メッセージ正規化             | 修正（共通ロジック利用） |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                    | スキル実行                       | 修正（共通ロジック利用） |
| `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`                | SDK メッセージ前処理 helper      | 新規作成                 |
| `apps/desktop/src/main/services/runtime/__tests__/sdkMessageUtils.test.ts` | 共通ユーティリティテスト（新規） | 新規作成                 |

## 多角的分析観点（30思考法）

本タスクでは 30 思考法を Phase 3 と Phase 10 の判定観点へ落とし込む。

- 論理分析系: 「本当に重複しているのは何か」を切り分け、偽の共通化を排除する
- 構造分解系: `前処理` と `lane 固有変換` を責務分離する
- メタ・抽象系: SDK shape を単一 interface に押し込む前提を疑い、より低い抽象へ戻す
- 発想・拡張系: re-export 統合、現状維持、shared helper の3案を比較する
- システム系: runtime lane と skill lane の依存方向を崩さない
- 戦略・価値系: 最小差分で将来の SDK 変更点を1箇所へ寄せる
- 問題解決系: 根本原因を「normalizer 重複」ではなく「前処理の散在」と定義する

## Phase一覧

| Phase | 名称                 | カテゴリ     | 仕様書                                                       |
| ----- | -------------------- | ------------ | ------------------------------------------------------------ |
| 1     | 要件定義             | 要件         | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計                 | 設計         | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビュー         | ゲート       | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | テスト作成           | TDD-Red      | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装                 | TDD-Green    | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | テスト拡充           | 品質         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | テストカバレッジ確認 | 品質         | [phase-7-coverage.md](phase-7-coverage.md)                   |
| 8     | リファクタリング     | TDD-Refactor | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | 品質保証             | 品質         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | 最終レビュー         | ゲート       | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | 手動テスト           | 検証         | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | ドキュメント更新     | 文書化       | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | PR作成               | 完了         | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

## 関連タスク

| タスクID   | 名称                                             | ステータス | 関係                       |
| ---------- | ------------------------------------------------ | ---------- | -------------------------- |
| TASK-RT-06 | SDKMessage → SkillCreatorSdkEvent 正規化契約実装 | completed  | 親タスク（本タスクの由来） |

## 未タスク候補

| 候補ID | 内容                                                    | 備考                                 |
| ------ | ------------------------------------------------------- | ------------------------------------ |
| -      | `SkillStreamMessage` と `SkillCreatorSdkEvent` の型統一 | 出力型の完全統一は別タスクとして検討 |
