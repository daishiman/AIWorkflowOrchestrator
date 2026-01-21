# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| Phase名    | 実装                                  |
| 前提Phase  | Phase 4（テスト作成）                 |
| 後続Phase  | Phase 6（テスト拡充）                 |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

GraphSearchStrategyにtimeoutMsとエラーコード体系を実装し、テストをGreenにする。

## 背景

Phase 4で作成したテストを通すために、GraphStore/Embeddingのタイムアウトとエラーコード処理を実装する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: timeoutMsの実装

**目的**: GraphSearchOptionsのtimeoutMsをGraphSearchStrategyで利用できるようにする

**実行手順**:

1. GraphSearchOptionsにtimeoutMsを追加
2. timeoutMsが未指定の場合のデフォルト値を設定
3. GraphSearchStrategy内でtimeoutMsを参照できるようにする
4. `outputs/phase-5/implementation-summary.md` に変更内容を記載

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク2: タイムアウト制御の実装

**目的**: GraphStore/Embedding呼び出しにタイムアウト制御を追加する

**実行手順**:

1. AbortController/Promise.raceを用いたタイムアウト制御を実装
2. GraphStore/Embedding呼び出しに適用
3. タイムアウト時に後続処理が継続しないことを確認
4. 実装サマリーを更新

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク3: エラーコード実装

**目的**: タイムアウト時のエラーコード付与を実装する

**実行手順**:

1. error-handling.mdに準拠したエラーコードを決定
2. createRAGErrorを用いてコードとコンテキストを付与
3. GraphSearchStrategyの戻り値に反映
4. 実装サマリーを更新

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク4: テストGreen確認

**目的**: Phase 4で作成したテストをGreenにする

**実行手順**:

1. GraphSearchStrategy関連テストを実行
2. Green状態を確認し `outputs/phase-5/test-green-status.md` に記録

**期待される成果物**:

- `outputs/phase-5/test-green-status.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| GraphSearchStrategy仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | GraphSearchOptions/インターフェース仕様 |
| Knowledge Graph Store仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | GraphStoreインターフェースとエラー処理  |
| Embedding API仕様         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`               | 埋め込み生成のタイムアウト設定          |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系と分類                  |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | 検索パイプライン全体像                  |

**前Phase成果物**

| 参照資料     | パス                                    | 内容       |
| ------------ | --------------------------------------- | ---------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テスト観点 |
| Red状態確認  | `outputs/phase-4/test-red-status.md`    | Red記録    |

---

## 成果物

| 成果物        | パス                                        | 内容           |
| ------------- | ------------------------------------------- | -------------- |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md` | 実装内容まとめ |
| Green状態確認 | `outputs/phase-5/test-green-status.md`      | Green結果記録  |

---

## 統合テスト連携（Phase 1〜11は必須）

- GraphSearchタイムアウト時にHybridRAGが継続する統合テストを実行
- エラーコードが統合ログに記録されることを確認

---

## 完了条件

- [ ] timeoutMsが実装されている
- [ ] GraphStore/Embeddingタイムアウト処理が実装されている
- [ ] エラーコードが付与されている
- [ ] テストがGreenになっている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 5
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 4（テスト作成）の完了
- **後続**: Phase 6（テスト拡充）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm test -- --filter="GraphSearchStrategy"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-6-test-expansion.md`
