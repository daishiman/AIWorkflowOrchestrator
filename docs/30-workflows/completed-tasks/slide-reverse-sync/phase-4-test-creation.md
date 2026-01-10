# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成（TDD: Red） |
| 前提Phase  | Phase 3                |
| 後続Phase  | Phase 5                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | slide-reverse-sync     |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。逆同期機能の全ての受け入れ基準に対応するテストを作成する。

## 背景

TDDアプローチに従い、実装前にテストを作成することで、要件を正確に反映した実装を保証する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**選定理由**: TDDのRed-Green-Refactorサイクルに従い、失敗するテストを先に作成するため。

**Trigger条件**:

- TDDサイクルの実行、テストファースト開発を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 受け入れ基準からテストシナリオを導出

**期待される成果物**:

- `outputs/phase-4/test-specification.md` - テスト仕様書
- テストファイル（プロジェクトディレクトリに配置）

---

### スキル2: integration-testing

**パス**: `.claude/skills/integration-testing/SKILL.md`

**選定理由**: file-watcher、sync-manager、skill-executor間の統合テストを設計するため。

**Trigger条件**:

- 統合テストの設計・実装、コンポーネント間連携の検証を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 統合テストシナリオを作成

**期待される成果物**:

- `outputs/phase-4/integration-test-design.md` - 統合テスト設計書
- 統合テストファイル（プロジェクトディレクトリに配置）

---

### スキル3: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**選定理由**: エッジケースのテストを網羅するため。

**Trigger条件**:

- 境界値分析、エッジケーステストの設計を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 境界値テストケースを追加

**期待される成果物**:

- `outputs/phase-4/test-cases.md` - テストケース一覧（境界値含む）

---

## 参照資料

| 参照資料     | パス                                         | 内容          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照してください。

| 参照資料      | パス                                                                        | 内容                      |
| ------------- | --------------------------------------------------------------------------- | ------------------------- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | Agent連携インターフェース |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略                |

---

## 成果物

| 成果物         | パス                                         | 内容               |
| -------------- | -------------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース   | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル | `apps/desktop/src/main/slide/**/*.test.ts`   | 実際のテストコード |

**注意**: テストファイル（コード成果物）は `outputs/` ではなくプロジェクトディレクトリに配置すること。

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                            | テストファイル                        |
| -------------------- | ----------------------------------- | ------------------------------------- |
| ファイル監視テスト   | index.html変更検知・イベント発火    | `file-watcher.integration.test.ts`    |
| 同期フローテスト     | watcher→sync→executor→Agentの往復   | `sync-flow.integration.test.ts`       |
| エラーハンドリング   | Agent API障害時のエラー伝播・UI通知 | `error-handling.integration.test.ts`  |
| 無限ループ防止テスト | changeContextMapの双方向動作        | `loop-prevention.integration.test.ts` |
| 状態同期テスト       | SyncStatusIndicatorへの状態通知     | `status-sync.integration.test.ts`     |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1-3成果物の確認
2. tdd-principlesスキルの実行
3. ユニットテストの作成
4. integration-testingスキルの実行
5. 統合テストシナリオの作成
6. boundary-value-analysisスキルの実行
7. 境界値テストの追加
8. テスト実行・Red状態確認
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] テストがRed状態であることを確認
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 4
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- integration-testing: {{result}}
- boundary-value-analysis: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）

`docs/30-workflows/slide-reverse-sync/phase-5-implementation.md`
