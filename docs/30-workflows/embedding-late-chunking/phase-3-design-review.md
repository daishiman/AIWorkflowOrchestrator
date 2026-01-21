# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 3                       |
| Phase名    | 設計レビューゲート      |
| 前提Phase  | Phase 2（設計）         |
| 後続Phase  | Phase 4（テスト作成）   |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | embedding-late-chunking |

---

## 目的

設計ドキュメントが要件およびシステム仕様に準拠していることを確認する。

## 背景

Late ChunkingはEmbeddingPipelineに影響するため、設計段階でAPI/型/パフォーマンス要件との整合性をレビューする必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 設計レビュー

**目的**: 設計の妥当性と整合性を確認する

**実行手順**:

1. Phase 2成果物（アーキテクチャ設計、インターフェース設計、境界検出設計）を確認
2. EmbeddingPipeline/ChunkingService/API仕様との整合を確認
3. プーリング戦略/境界検出の制約が要件に合致しているか確認
4. 指摘事項を `outputs/phase-3/design-review-result.md` に記録

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                                    | パス                                                                                   | 内容                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| Embedding Generation Pipelineアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | パイプライン構成とチャンキング/埋め込みの責務 |
| Embedding Generation API                    | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | EmbeddingPipeline/ChunkingServiceのAPI仕様    |
| チャンク・埋め込み型定義                    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`  | チャンク/埋め込みエンティティと設定値         |

**前Phase成果物**

| 参照資料             | パス                                          | 内容            |
| -------------------- | --------------------------------------------- | --------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`      | 処理フロー設計  |
| インターフェース設計 | `outputs/phase-2/interface-design.md`         | 型/設定設計     |
| 境界検出設計         | `outputs/phase-2/chunk-boundary-algorithm.md` | 境界/プール仕様 |
| ベンチマーク計画     | `outputs/phase-2/benchmark-plan.md`           | 評価指標        |

**依存Phase成果物**

| 参照資料             | パス                                         | 内容     |
| -------------------- | -------------------------------------------- | -------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件整理 |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否基準 |

---

## 成果物

| 成果物           | パス                                      | 内容           |
| ---------------- | ----------------------------------------- | -------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 指摘と判定結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト観点（データフロー/エラーハンドリング/プロバイダー制約）をレビュー項目に含める
- ベンチマーク指標が統合テストで再現可能かを確認

---

## 完了条件

- [ ] 設計レビューが完了している
- [ ] 指摘事項と対応方針が記録されている
- [ ] レビュー判定が明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 3
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

### 実行タスク

- タスク1:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 2（設計）の完了
- **後続**: Phase 4（テスト作成）へ進む

---

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト作成） |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-4-test-creation.md`
