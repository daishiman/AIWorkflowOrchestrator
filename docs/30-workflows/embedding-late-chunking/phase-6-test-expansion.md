# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-18                |
| 機能名     | embedding-late-chunking   |

---

## 目的

Late Chunking実装に対してテストを拡充し、カバレッジ目標を達成する。

## 背景

初期実装のテストだけでは境界条件や性能面の検証が不足するため、追加テストが必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステストの追加

**目的**: 小規模/大規模文書・境界条件のテストを追加する

**実行手順**:

1. 短文/長文/境界サイズのケースを追加
2. オーバーラップ/境界保持の特殊ケースを追加
3. `outputs/phase-6/additional-test-notes.md` に追記

**期待される成果物**:

- `outputs/phase-6/additional-test-notes.md`

---

### タスク2: 統合テスト拡充

**目的**: Pipeline統合のシナリオを拡充する

**実行手順**:

1. Late Chunking有効/無効の双方で複数戦略を検証
2. 非対応モデル時のフォールバックを検証
3. 統合テスト結果を `outputs/phase-6/integration-test.md` に記録

**期待される成果物**:

- `outputs/phase-6/integration-test.md`

---

### タスク3: カバレッジ分析

**目的**: テストカバレッジ不足箇所を特定し補完する

**実行手順**:

1. `pnpm test:coverage` を実行
2. 未到達の分岐/関数を特定して追加テストを作成
3. `outputs/phase-6/coverage-report.md` に記録

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

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

| 参照資料     | パス                                        | 内容     |
| ------------ | ------------------------------------------- | -------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装要点 |

---

## 成果物

| 成果物             | パス                                       | 内容               |
| ------------------ | ------------------------------------------ | ------------------ |
| 追加テストノート   | `outputs/phase-6/additional-test-notes.md` | 追加テストの要点   |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`      | 統合テスト実行結果 |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`       | カバレッジ分析     |

---

## 統合テスト連携（Phase 1〜11は必須）

- 追加した統合テストでLate Chunking切り替えシナリオを網羅
- 非対応プロバイダー時のフォールバック検証を追加

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 統合テストが拡充されている
- [ ] カバレッジ不足が補完されている
- [ ] カバレッジレポートが出力されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 6
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 実行タスク

- タスク1:
- タスク2:
- タスク3:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 5（実装）の完了
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-7-coverage-check.md`
