# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| 前提Phase  | Phase 3                  |
| 後続Phase  | Phase 5                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

TDDのRed状態を確立する。期待される動作を検証するテストを実装より先に作成する。

## 背景

テストファーストで開発することで、要件を満たすコードの実装を保証する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**:
TDDサイクルの開始、テストファーストの実践

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### スキル2: test-data-management

**パス**: `.claude/skills/test-data-management/SKILL.md`

**Trigger条件**:
テストデータの設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-data-design.md`

---

### スキル3: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**:
LLM APIのモック設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/mock-design.md`

---

## 参照資料

| 参照資料      | パス                                     | 内容            |
| ------------- | ---------------------------------------- | --------------- |
| Phase 1成果物 | `outputs/phase-1/acceptance-criteria.md` | 受け入れ基準    |
| Phase 2成果物 | `outputs/phase-2/api-specification.md`   | API仕様         |
| Phase 2成果物 | `outputs/phase-2/schema-design.md`       | Zodスキーマ定義 |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                 | 内容       |
| ---------- | -------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/test-strategy.md` | テスト方針 |
| API仕様    | `.claude/skills/aiworkflow-requirements/references/api-design.md`    | API設計    |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "test"`

---

## 成果物

| 成果物           | パス                                    | 内容                               |
| ---------------- | --------------------------------------- | ---------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | テストケース一覧                   |
| テストデータ設計 | `outputs/phase-4/test-data-design.md`   | テストデータ定義                   |
| モック設計       | `outputs/phase-4/mock-design.md`        | LLM APIモック設計                  |
| テストコード     | `packages/shared/src/**/*.test.ts`      | ユニットテスト（プロジェクト配置） |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4の統合テスト連携アクション**: 統合テストシナリオを全カテゴリで作成

### 統合テストシナリオ設計【必須】

| シナリオカテゴリ   | 検証内容                                 |
| ------------------ | ---------------------------------------- |
| API接続テスト      | 各LLM APIへの疎通・レスポンス形式        |
| データフローテスト | LLM選択→API呼び出し→レスポンス表示の往復 |
| エラーハンドリング | API障害時のエラー表示・フォールバック    |
| 認証連携テスト     | APIキー検証・無効キー時の処理            |
| 状態同期テスト     | LLM切り替え後の会話履歴維持              |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] LLM APIモックが設計されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. tdd-principlesスキルの実行
3. test-data-managementスキルの実行
4. test-doublesスキルの実行
5. 統合テスト連携の実施（統合テストシナリオ作成）
6. 成果物の作成・配置
7. TDD検証（Red状態確認）
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 4
```

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- test-data-management: {{result}}
- test-doubles: {{result}}

### TDD状態

- 作成したテスト数: {{number}}
- 失敗テスト数: {{number}}（Red状態確認）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-multi-llm-switching/phase-5-implementation.md`
