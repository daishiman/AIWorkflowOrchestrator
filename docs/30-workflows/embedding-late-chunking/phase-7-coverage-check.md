# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 7                           |
| Phase名    | カバレッジ確認              |
| 前提Phase  | Phase 6（テスト拡充）       |
| 後続Phase  | Phase 8（リファクタリング） |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | embedding-late-chunking     |

---

## 目的

カバレッジ基準と統合テスト結果を満たすことを確認する。

## 背景

Phase 6で拡充したテストが品質基準を満たしているか検証する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ再測定

**目的**: カバレッジ基準を満たしているか確認する

**実行手順**:

1. `pnpm test:coverage` を実行
2. カバレッジ結果を `outputs/phase-7/coverage-report.md` に記録

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: 統合テスト再実行

**目的**: 統合テストが全て成功することを確認する

**実行手順**:

1. `pnpm --filter @repo/shared test:run -- src/**/__tests__/*integration*.test.ts` を実行
2. 結果を `outputs/phase-7/integration-test.md` に記録

**期待される成果物**:

- `outputs/phase-7/integration-test.md`

---

### タスク3: 未達時の差し戻し判断

**目的**: 未達の場合の戻り先を明確化する

**実行手順**:

1. カバレッジ/統合テストの未達項目を記録
2. Phase 6へ戻る必要があるかを判定
3. 記録をレポートに追記

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

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

| 参照資料           | パス                                       | 内容           |
| ------------------ | ------------------------------------------ | -------------- |
| 追加テストノート   | `outputs/phase-6/additional-test-notes.md` | 追加観点       |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`      | 統合テスト結果 |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`       | カバレッジ分析 |

**依存Phase成果物**

| 参照資料     | パス                                        | 内容         |
| ------------ | ------------------------------------------- | ------------ |
| Phase 5 実装 | `outputs/phase-5/implementation-summary.md` | 実装サマリー |

---

## 成果物

| 成果物             | パス                                  | 内容               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト結果を再確認し、ゲート判定を記録
- 未達の場合はPhase 6へ戻って拡充する

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成している
- [ ] 統合テストが全て成功している
- [ ] カバレッジレポートが出力されている
- [ ] 失敗時の差し戻し判断が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 7
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

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

- **前提**: Phase 6（テスト拡充）の完了
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-8-refactoring.md`
