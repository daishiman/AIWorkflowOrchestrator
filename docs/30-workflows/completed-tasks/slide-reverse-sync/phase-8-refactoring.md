# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| 前提Phase  | Phase 7                           |
| 後続Phase  | Phase 9                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-10                        |
| 機能名     | slide-reverse-sync                |

---

## 目的

テストを維持しながらコード品質を改善する。動作を変えずに可読性・保守性・拡張性を向上させる。

## 背景

Phase 5で最小限の実装を行い、Phase 6-7でテストカバレッジを確保した。この段階でコードの品質改善を行う。TDDサイクルのRefactorフェーズとして、テストが保護された状態で安全にリファクタリングを行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: refactoring-patterns

**パス**: `.claude/skills/refactoring-patterns/SKILL.md`

**選定理由**: Martin Fowlerのリファクタリングカタログに基づき、安全なコード改善を行うため。

**Trigger条件**:

- コード品質の改善、リファクタリングパターンの適用を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 適用可能なリファクタリングパターンを特定・実行

**期待される成果物**:

- リファクタリング適用後のコード

---

### スキル2: code-smell-detection

**パス**: `.claude/skills/code-smell-detection/SKILL.md`

**選定理由**: コードスメルを検出し、リファクタリング対象を特定するため。

**Trigger条件**:

- コードスメルの検出、リファクタリング対象の特定を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 検出されたコードスメルを改善

**期待される成果物**:

- `outputs/phase-8/code-smell-report.md` - コードスメル検出結果

---

### スキル3: solid-principles

**パス**: `.claude/skills/solid-principles/SKILL.md`

**選定理由**: SOLID原則に基づいてコード設計を改善するため。

**Trigger条件**:

- SOLID原則の適用、設計品質の向上を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. SOLID原則に違反している箇所を改善

**期待される成果物**:

- SOLID原則に準拠したコード

---

## 参照資料

| 参照資料       | パス                                        | 内容          |
| -------------- | ------------------------------------------- | ------------- |
| カバレッジ結果 | `outputs/phase-7/coverage-report.md`        | Phase 7成果物 |
| 統合テスト結果 | `outputs/phase-7/integration-test.md`       | Phase 7成果物 |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | Phase 5成果物 |
| 既存実装       | `apps/desktop/src/main/slide/`              | 対象コード    |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様を参照し、コーディング規約を遵守してください。

| 参照資料         | パス                                                                    | 内容           |
| ---------------- | ----------------------------------------------------------------------- | -------------- |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/coding-standards.md` | コード品質基準 |

---

## リファクタリング対象

| ファイル             | リファクタリング観点                     |
| -------------------- | ---------------------------------------- |
| `file-watcher.ts`    | 責務分離、イベント処理の最適化           |
| `sync-manager.ts`    | 状態管理の改善、エラーハンドリングの統一 |
| `skill-executor.ts`  | 依存性注入、テスタビリティ向上           |
| `skills/modifier.ts` | 単一責務原則の適用、インターフェース抽出 |

---

## 成果物

| 成果物                   | パス                                   | 内容             |
| ------------------------ | -------------------------------------- | ---------------- |
| リファクタリングログ     | `outputs/phase-8/refactoring-log.md`   | 実施内容の記録   |
| コードスメルレポート     | `outputs/phase-8/code-smell-report.md` | 検出・改善結果   |
| リファクタリング後コード | `apps/desktop/src/main/slide/`         | 改善されたコード |

**注意**: コード成果物は `outputs/` ではなくプロジェクトディレクトリに配置すること。

---

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

| 確認項目          | 基準     | 結果       |
| ----------------- | -------- | ---------- |
| ユニットテスト    | 全て成功 | {{RESULT}} |
| 統合テスト        | 全て成功 | {{RESULT}} |
| カバレッジLine    | 80%維持  | {{RESULT}} |
| カバレッジBranch  | 60%維持  | {{RESULT}} |
| Main/Renderer接続 | 成功     | {{RESULT}} |

---

## 完了条件

- [ ] テストが継続成功（Green状態維持）
- [ ] コードスメルが改善されている
- [ ] 重複コードが排除されている
- [ ] SOLID原則に準拠している
- [ ] 統合テストが継続成功
- [ ] カバレッジが維持されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 7成果物の確認
2. code-smell-detectionスキルの実行
3. コードスメルの特定
4. refactoring-patternsスキルの実行
5. リファクタリング実施
6. solid-principlesスキルの実行
7. SOLID原則適用
8. テスト実行・継続成功確認
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] カバレッジが維持されていることを確認
```

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] テストがGreen状態であることを確認
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 8
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 8 実行記録

### 使用スキル

- refactoring-patterns: {{result}}
- code-smell-detection: {{result}}
- solid-principles: {{result}}

### リファクタリング内容

- 実施項目:
- 改善効果:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 9: 品質保証

`docs/30-workflows/slide-reverse-sync/phase-9-quality.md`
