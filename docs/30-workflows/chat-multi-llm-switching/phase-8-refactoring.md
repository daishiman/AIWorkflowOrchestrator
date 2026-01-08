# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 8                        |
| Phase名    | リファクタリング         |
| 前提Phase  | Phase 7                  |
| 後続Phase  | Phase 9                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

TDDのRefactor段階。テストが成功している状態でコード品質を改善する。

## 背景

テストによる安全網がある状態で、コードの可読性、保守性、パフォーマンスを改善する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: refactoring-patterns

**パス**: `.claude/skills/refactoring-patterns/SKILL.md`

**Trigger条件**:
コード品質改善のリファクタリングが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### スキル2: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:
クリーンコード原則に基づくコード改善が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-8/clean-code-report.md`

---

## 参照資料

| 参照資料      | パス                                        | 内容               |
| ------------- | ------------------------------------------- | ------------------ |
| Phase 2成果物 | `outputs/phase-2/architecture-design.md`    | アーキテクチャ設計 |
| Phase 5成果物 | `outputs/phase-5/implementation-summary.md` | 実装サマリー       |
| Phase 7成果物 | `outputs/phase-7/coverage-verification.md`  | カバレッジ検証結果 |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                | 内容     |
| ---------- | ------------------------------------------------------------------- | -------- |
| コード品質 | `.claude/skills/aiworkflow-requirements/references/code-quality.md` | 品質基準 |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "refactoring"`

---

## 成果物

| 成果物                 | パス                                   | 内容                         |
| ---------------------- | -------------------------------------- | ---------------------------- |
| リファクタリング記録   | `outputs/phase-8/refactoring-log.md`   | 実施したリファクタリング一覧 |
| クリーンコードレポート | `outputs/phase-8/clean-code-report.md` | コード品質改善結果           |
| 改善コード             | `packages/*/src/**/*`                  | リファクタ後のコード         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8の統合テスト連携アクション**: リファクタ後の統合テスト継続成功を確認

具体的な確認項目:

- [ ] リファクタリング後も全テストが成功している
- [ ] 統合テストが変わらず成功している
- [ ] パフォーマンスが低下していない

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/ui test:run
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## リファクタリング観点

| 観点               | 確認内容                         |
| ------------------ | -------------------------------- |
| 命名               | 意図が明確な変数・関数・クラス名 |
| 関数サイズ         | 1関数1責務、適切な行数           |
| 重複排除           | DRY原則に従った重複コードの統合  |
| 抽象化             | 適切なレベルの抽象化             |
| 依存関係           | 依存性注入、結合度の低減         |
| エラーハンドリング | 一貫したエラー処理パターン       |

---

## 完了条件

- [ ] リファクタリングが完了している
- [ ] 全テストが成功している（Green状態維持）
- [ ] コード品質が改善されている
- [ ] 統合テストが継続して成功している
- [ ] リファクタリング記録が作成されている
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
2. refactoring-patternsスキルの実行
3. clean-code-practicesスキルの実行
4. 統合テスト連携の実施（リファクタ後のテスト継続成功確認）
5. 成果物の作成・配置
6. TDD検証（テスト継続成功確認）
7. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 8
```

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 使用スキル

- refactoring-patterns: {{result}}
- clean-code-practices: {{result}}

### リファクタリング概要

- 実施したリファクタリング数: {{number}}
- 主な改善点:

### テスト状態

- リファクタリング前: Green
- リファクタリング後: {{Green/Red}}

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

`docs/30-workflows/chat-multi-llm-switching/phase-9-quality.md`
