# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase番号  | 8                               |
| Phase名    | リファクタリング                |
| 目的       | TDD: Refactor（品質改善）       |
| 前提Phase  | Phase 7（テストカバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）             |
| ステータス | 未実施                          |

---

## 目的

テストで保護された状態でコードの品質を改善する（TDD Refactor状態）。

---

## 使用スキル

| スキル名             | パス                                           | 選定理由                                              |
| -------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| refactoring-patterns | `.claude/skills/refactoring-patterns/SKILL.md` | リファクタリングパターン（Trigger: リファクタリング） |
| clean-code-practices | `.claude/skills/clean-code-practices/SKILL.md` | クリーンコード原則（Trigger: コード品質）             |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | コードスメル検出（Trigger: コードスメル）             |
| solid-principles     | `.claude/skills/solid-principles/SKILL.md`     | SOLID原則（Trigger: SOLID、オブジェクト指向）         |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物               | 説明                   | 配置先                                  |
| -------------------- | ---------------------- | --------------------------------------- |
| リファクタリング計画 | 改善対象・改善方針     | `outputs/phase-8/refactoring-plan.md`   |
| リファクタリング結果 | 実施内容・Before/After | `outputs/phase-8/refactoring-report.md` |

---

## 実行手順

### Step 1: コードスメル検出

code-smell-detectionスキルを使用して、改善対象を特定する。

**検出観点**:

| コードスメル         | 検出方法           | 改善パターン               |
| -------------------- | ------------------ | -------------------------- |
| 長いメソッド         | 行数 > 20行        | Extract Method             |
| 重複コード           | 類似コードブロック | Extract Function           |
| 長いパラメータリスト | パラメータ > 3個   | Introduce Parameter Object |
| 複雑な条件分岐       | ネスト > 3レベル   | Replace Nested Conditional |

### Step 2: リファクタリング計画

refactoring-patternsスキルを参照し、リファクタリング計画を作成する。

**リファクタリング候補**:

| 対象ファイル         | スメル | 改善パターン | 優先度 |
| -------------------- | ------ | ------------ | ------ |
| `agent-client.ts`    | TBD    | TBD          | TBD    |
| `session-manager.ts` | TBD    | TBD          | TBD    |
| `agent-handler.ts`   | TBD    | TBD          | TBD    |

### Step 3: リファクタリング実施

**リファクタリング原則**:

1. **小さなステップ**: 1回のリファクタリングは1つの改善のみ
2. **テスト実行**: 各ステップ後にテストを実行
3. **コミット**: 各ステップをコミット

**実施手順**:

```bash
# 1. リファクタリング実施
# 2. テスト実行
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# 3. 全テストがパスすることを確認
```

### Step 4: SOLID原則の適用

solid-principlesスキルを参照し、設計原則を適用する。

**SOLID原則チェックリスト**:

- [ ] 単一責任原則（SRP）: 各クラスは1つの責務のみ
- [ ] 開放閉鎖原則（OCP）: 拡張に対して開かれ、修正に対して閉じている
- [ ] リスコフの置換原則（LSP）: 派生クラスは基底クラスと置換可能
- [ ] インターフェース分離原則（ISP）: クライアント固有のインターフェース
- [ ] 依存性逆転原則（DIP）: 抽象に依存、具象に依存しない

---

## 完了条件

- [ ] コードスメルが検出・改善されている
- [ ] リファクタリング後も全テストがパス
- [ ] SOLID原則に準拠している
- [ ] コードの可読性が向上している
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

リファクタ後の統合テスト継続成功を確認:

- [ ] リファクタリング後の統合テスト実行
- [ ] 全テストがパスすることを確認
- [ ] パフォーマンス劣化がないことを確認

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                    | 内容                  |
| ---------------- | ----------------------------------------------------------------------- | --------------------- |
| architecture-rag | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | RAGアーキテクチャ設計 |

---

## スキルフィードバック記録

| スキル               | 結果    | 備考              |
| -------------------- | ------- | ----------------- |
| refactoring-patterns | pending | Phase完了後に記録 |
| clean-code-practices | pending | Phase完了後に記録 |
| code-smell-detection | pending | Phase完了後に記録 |
| solid-principles     | pending | Phase完了後に記録 |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
pnpm test:integration

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] 統合テストが継続成功
# - [ ] パフォーマンス劣化がない
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. refactoring-patternsスキルの実行
3. clean-code-practicesスキルの実行
4. code-smell-detectionスキルの実行
5. solid-principlesスキルの実行
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. TDD検証の実施（リファクタリング後テスト確認）
9. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 8
```

---

## 次のPhase

Phase 9: 品質保証

---

## 備考

- リファクタリングは機能を変更しない
- テストが失敗した場合は即座にロールバック
