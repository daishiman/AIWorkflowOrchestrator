# 未完了タスク一覧

## 概要

このディレクトリには、各ワークフロー実装時に発見された未完了タスクが記録されています。

**発見元ワークフロー:**

- Embedding Generation Pipeline実装（Phase 5-9）

各タスクは**MIDASC形式**（Why-What-How）のタスク指示書として記述されており、100人中100人が同じ理解でタスクを実行できる粒度で記述されています。

---

## タスク一覧

### 優先度別サマリー

| 優先度   | タスク数 | 合計見積もり       |
| -------- | -------- | ------------------ |
| 高       | 1件      | 大規模             |
| 中       | 3件      | 中規模×3           |
| 低       | 5件      | 小規模×3、中規模×2 |
| **合計** | **9件**  | -                  |

---

## 優先度High（1件）

### UNASSIGNED-EMB-005: Late Chunking実装

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| ファイル     | [未タスク-embedding-late-chunking.md](task-embedding-late-chunking.md) |
| 分類         | 要件                                                                   |
| 優先度       | **高**                                                                 |
| 見積もり規模 | **大規模**                                                             |
| 発見元       | Phase 8: 手動テスト検証                                                |

**目的**: チャンク境界での文脈損失を防ぎ、検索品質を10-30%向上

**効果**:

- 検索精度の大幅向上
- 特に長文書（>2048トークン）で効果大
- ユーザー体験の向上

**技術的な内容**:

- トークンレベル埋め込みの取得
- チャンク境界検出器の実装
- 3種類のプーリング戦略（mean, max, cls）
- パイプラインへの統合

---

## 優先度Medium（2件）

### UNASSIGNED-EMB-004: 追加埋め込みプロバイダー実装

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| ファイル     | [未タスク-embedding-additional-providers.md](task-embedding-additional-providers.md) |
| 分類         | 要件                                                                                 |
| 優先度       | 中                                                                                   |
| 見積もり規模 | 中規模                                                                               |
| 発見元       | Phase 8: 手動テスト検証                                                              |

**目的**: Voyage AI、BGE-M3、EmbeddingGemmaの3プロバイダーを追加実装

**効果**:

- コード検索の精度向上（Voyage AI）
- プライバシー重視環境対応（BGE-M3セルフホスト）
- オフライン環境対応（EmbeddingGemma）

**技術的な内容**:

- Voyage AI: voyage-code-2（1536次元、コード特化）
- BGE-M3: セルフホスト、多言語対応（100+言語）
- EmbeddingGemma: オンデバイス、Transformers.js使用

---

### UNASSIGNED-EMB-006: 埋め込みキャッシュRedis統合

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| ファイル     | [未タスク-embedding-cache-redis-integration.md](task-embedding-cache-redis-integration.md) |
| 分類         | 改善                                                                                       |
| 優先度       | 中                                                                                         |
| 見積もり規模 | 中規模                                                                                     |
| 発見元       | Phase 8: 手動テスト検証                                                                    |

**目的**: キャッシュをRedisに統合し、永続化と分散キャッシュを実現

**効果**:

- アプリケーション再起動後もキャッシュ維持
- 複数インスタンス間でキャッシュ共有
- スケーラビリティ向上

**技術的な内容**:

- IEmbeddingCacheインターフェース定義
- RedisEmbeddingCache実装
- TTL（自動期限切れ）機能
- バッチ操作（mget/mset）

---

### UT-RT-02-M03-WIZARD-LIFECYCLE-TEXT-PARITY-001: Wizard/Lifecycle plan error 表示文言パリティ確認

| 項目         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| ファイル     | [UT-RT-02-M03-WIZARD-LIFECYCLE-TEXT-PARITY-001.md](UT-RT-02-M03-WIZARD-LIFECYCLE-TEXT-PARITY-001.md) |
| 分類         | 改善                                                                                                 |
| 優先度       | 中                                                                                                   |
| 見積もり規模 | 中規模                                                                                               |
| 発見元       | TASK-RT-02 Phase 11: 手動テスト未検証項目 M-03                                                       |

**目的**: `SkillCreateWizard.tsx` と `SkillLifecyclePanel.tsx` の plan error 表示文言・コンポーネントのパリティを確認・修正

**効果**:

- 同一エラーに対するユーザー体験の一貫性確保
- 将来の i18n 対応（UT-RT-02-I18N-ERROR-MESSAGE-001）の前提整備

**技術的な内容**:

- `handleLlmGenerate` と `handlePrepare` 内の plan error 表示ロジック比較
- 非意図的差異の修正とテストケース追加

---

## 優先度Low（4件）

### UNASSIGNED-EMB-001: ファクトリーの型安全性改善

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| ファイル     | [未タスク-embedding-factory-type-safety.md](task-embedding-factory-type-safety.md) |
| 分類         | 改善                                                                               |
| 優先度       | 低                                                                                 |
| 見積もり規模 | 小規模                                                                             |
| 発見元       | Phase 7: 最終レビューゲート                                                        |

**目的**: exhaustive checkパターン適用で実装漏れをコンパイル時に検出

**効果**: 保守性向上、ランタイムエラー防止

---

### UNASSIGNED-EMB-002: チャンキングストラテジー動的切り替え

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| ファイル     | [未タスク-embedding-strategy-switching.md](task-embedding-strategy-switching.md) |
| 分類         | 改善                                                                             |
| 優先度       | 低                                                                               |
| 見積もり規模 | 小規模                                                                           |
| 発見元       | Phase 7: 最終レビューゲート                                                      |

**目的**: ランタイムでチャンキング戦略を動的に切り替え可能に

**効果**: 柔軟性向上、メモリ効率化

---

### UNASSIGNED-EMB-003: BatchProcessor設定外部化

| 項目         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| ファイル     | [未タスク-embedding-batch-config-externalization.md](task-embedding-batch-config-externalization.md) |
| 分類         | 改善                                                                                                 |
| 優先度       | 低                                                                                                   |
| 見積もり規模 | 小規模                                                                                               |
| 発見元       | Phase 7: 最終レビューゲート                                                                          |

**目的**: 設定を環境変数で管理（12-Factor App準拠）

**効果**: 運用性向上、環境ごとの最適化

---

### UNASSIGNED-EMB-007: モデル変更時の自動再埋め込み

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| ファイル     | [未タスク-embedding-auto-reembedding.md](task-embedding-auto-reembedding.md) |
| 分類         | 改善                                                                         |
| 優先度       | 低                                                                           |
| 見積もり規模 | 中規模                                                                       |
| 発見元       | Phase 8: 手動テスト検証                                                      |

**目的**: モデル変更を検出し、自動的に再埋め込みをトリガー

**効果**: 運用自動化、データ整合性維持

---

### EMB-005-B: XenovaTransformerEncoder Electron E2E 検証

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| ファイル     | [EMB-005-B-electron-e2e.md](EMB-005-B-electron-e2e.md)                   |
| 分類         | 検証                                                                     |
| 優先度       | 低                                                                       |
| 見積もり規模 | 中規模                                                                   |
| 発見元       | UNASSIGNED-EMB-005-A Phase 12 未タスク検出                               |
| 関連Issue    | [#2359](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2359) |

**目的**: Electron レンダラー（`contextIsolation`）下での `XenovaTransformerEncoder` 動作実証

**効果**: 本番 Electron 環境での動作保証、問題発生時の切り分け迅速化

---

## 推奨実装順序

### フェーズ1: 品質向上（優先度High）

1. **UNASSIGNED-EMB-005: Late Chunking**
   - 検索品質の大幅向上
   - ユーザー価値に直結

### フェーズ2: 機能拡張（優先度Medium）

2. **UNASSIGNED-EMB-004: 追加プロバイダー**
   - ユースケースの拡大
   - Voyage AI でコード検索強化

3. **UNASSIGNED-EMB-006: Redis統合**
   - スケーラビリティ
   - 本番環境対応

### フェーズ3: 保守性向上（優先度Low）

4. **UNASSIGNED-EMB-001: 型安全性改善**
   - 実装時間が短い（小規模）
   - 将来の拡張に備える

5. **UNASSIGNED-EMB-002: ストラテジー切り替え**
   - 実装時間が短い（小規模）
   - 柔軟性向上

6. **UNASSIGNED-EMB-003: 設定外部化**
   - 実装時間が短い（小規模）
   - 12-Factor App準拠

7. **UNASSIGNED-EMB-007: 自動再埋め込み**
   - 他のタスクに依存
   - 運用自動化

---

## 依存関係

```
UNASSIGNED-EMB-001 (型安全性)
    ↓ 推奨
UNASSIGNED-EMB-004 (追加プロバイダー)
    ↓ 必須（BGE-M3等が必要）
UNASSIGNED-EMB-005 (Late Chunking)

UNASSIGNED-EMB-003 (設定外部化)
    ↓ 推奨
UNASSIGNED-EMB-007 (自動再埋め込み)

UNASSIGNED-EMB-006 (Redis統合)
    ↓ 推奨
UNASSIGNED-EMB-007 (自動再埋め込み)
```

---

## MIDASC形式について

すべてのタスクは以下の構造に従っています:

```
## メタ情報
- タスクID、タスク名、分類、対象機能
- 優先度、見積もり規模、ステータス
- 発見元、発見日

## 1. なぜこのタスクが必要か（Why）
- 背景
- 問題点・課題
- 放置した場合の影響

## 2. 何を達成するか（What）
- 目的
- 最終ゴール
- スコープ（含むもの/含まないもの）
- 成果物

## 3. どのように実行するか（How）
- 前提条件
- 依存タスク
- 必要な知識・スキル
- 推奨アプローチ

## 4. 実行手順
- Phase構成
- 各Phaseの詳細

## 5. 完了条件チェックリスト
- 機能要件
- 品質要件
- ドキュメント要件

## 6. 検証方法
- テストケース
- 検証手順

## 7. リスクと対策

## 8. 参照情報
- 関連ドキュメント
- 参考資料

## 9. 備考
- レビュー指摘の原文
- 補足事項
```

---

## 関連ドキュメント

- [Phase 7 最終レビュー結果](../embedding-generation-pipeline/review-final.md)
- [Phase 8 手動テスト結果](../embedding-generation-pipeline/manual-test-execution.md)
- [Phase 8 パフォーマンステスト結果](../embedding-generation-pipeline/performance-test-manual.md)
- [Phase 9 完了レポート](../embedding-generation-pipeline/phase9-completion.md)
- [Embedding Generation Pipeline 実装ガイド](../embedding-generation-pipeline/implementation-guide.md)

---

**作成日**: 2025-12-26
**最終更新**: 2026-04-20
**ステータス**: 全9件作成完了（うち2件は完了タスク由来の follow-up）

---

## 完了化された未タスク（完了化ログ）

本節は、unassigned-task として配置された後、別 wave/task で実装されて完了化した未タスクの履歴を記録する。
完了化した未タスク本体は `docs/30-workflows/completed-tasks/` へ移動し、当該ファイルのメタ情報 `status: completed` および末尾「完了記録」セクションで詳細を管理する。

### TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE（2026-04-19 完了）

TASK-EVALS-CONSUMER-AUDIT-001 Phase-12 close-out に続く skill 反映 wave で、`system-spec-update-summary.md` の 3 件の UPDATE-SPEC 提案が aiworkflow-requirements skill へ反映され、対応する 3 件の unassigned-task が完了化された。

| 完了日     | 元 unassigned-task                                                                                                      | 実装場所                                                                                           | UPDATE-SPEC ID  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| 2026-04-19 | [task-evals-spec-snake-case-v1-document-001.md](../completed-tasks/task-evals-spec-snake-case-v1-document-001.md)       | `aiworkflow-requirements/references/evals-schema-spec.md` §3                                       | UPDATE-SPEC-001 |
| 2026-04-19 | [task-evals-spec-quality-insights-document-001.md](../completed-tasks/task-evals-spec-quality-insights-document-001.md) | `aiworkflow-requirements/references/evals-schema-spec.md` §6                                       | UPDATE-SPEC-002 |
| 2026-04-19 | [task-evals-spec-validator-zero-document-001.md](../completed-tasks/task-evals-spec-validator-zero-document-001.md)     | `aiworkflow-requirements/references/claude-code-overview.md` §272 直下 + `evals-schema-spec.md` §7 | UPDATE-SPEC-003 |

**根拠**: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/system-spec-update-summary.md`

**未完了保持タスク（対象外・同 Phase-12 由来）**:

- `task-evals-schema-dialect-unification-001.md`（方言統一は将来の設計判断要）
- `task-mirror-resource-map-cross-root-link-001.md`（ミラー構造別件）
- `task-skill-fixture-runner-evals-schema-validate-001.md`（validator 実装は別タスク）
- `task-skill-scanner-evals-content-validate-001.md`（SkillScanner 強化は別タスク）

### UNASSIGNED-EMB-005-A-xenova-transformer-encoder（2026-04-20 完了）

UNASSIGNED-EMB-005-A Phase-12 close-out により、`XenovaTransformerEncoder` 実装タスクが完了し、タスク仕様書ディレクトリが `completed-tasks/` へ移動された。

| 完了日     | タスク仕様書ディレクトリ                                                                                               | 実装場所                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2026-04-20 | [UNASSIGNED-EMB-005-A-xenova-transformer-encoder](../completed-tasks/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/) | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` |

**成果**: `IEncoder` インターフェース実装、全テスト35件 PASS、`@xenova/transformers ^2.17.2` 統合完了

**follow-up 未タスク（本タスク由来）**:

- `EMB-005-B-electron-e2e.md`（Electron レンダラー E2E 検証、Issue [#2359](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2359)）
