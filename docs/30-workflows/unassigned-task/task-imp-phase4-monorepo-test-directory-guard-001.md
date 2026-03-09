# Phase 4 テスト仕様テンプレートのモノレポ実行ディレクトリガード - タスク指示書

## メタ情報

```yaml
issue_number: 1106
```

## メタ情報

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE4-MONOREPO-TEST-DIRECTORY-GUARD-001                                    |
| タスク名     | Phase 4 テスト仕様テンプレートへのモノレポテスト実行ディレクトリガード追加         |
| 分類         | 改善（ワークフローテンプレート）                                                   |
| 対象機能     | task-specification-creator Phase 4 テンプレート                                    |
| 優先度       | 低                                                                                 |
| 見積もり規模 | 小規模                                                                             |
| ステータス   | 未実施                                                                             |
| 発見元       | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 Phase 6 テスト実行時の P40 再発 |
| 発見日       | 2026-03-09                                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 の Phase 6（テスト拡充）で、プロジェクトルートから `pnpm vitest run --coverage` を実行した際、`apps/desktop/vitest.config.ts` の `environment: "happy-dom"` 設定が読み込まれず、`ReferenceError: window is not defined` で全テストが失敗した。これは P40（テスト実行ディレクトリ依存）の再発であり、Phase 4 テスト仕様テンプレートに実行ディレクトリの注意書きがないことが根本原因。

### 1.2 問題点・課題

- Phase 4 テスト仕様テンプレートにモノレポ環境でのテスト実行ディレクトリ制約が明記されていない
- サブエージェントがテスト実行を委譲された際、プロジェクトルートから実行して P40 を再発させやすい
- `06-known-pitfalls.md` に P40 は記載済みだが、Phase 4 テンプレートからの参照がない

### 1.3 放置した場合の影響

- 新しいタスク仕様書が生成される度に、テスト実行で P40 再発のリスクが残る
- サブエージェントの実行失敗→リトライで時間を浪費する
- 特に `apps/desktop` の happy-dom 依存テストで頻発する

---

## 2. 何を達成するか（What）

### 2.1 目的

task-specification-creator の Phase 4 テスト仕様テンプレートに、モノレポ環境でのテスト実行ディレクトリガードを標準セクションとして追加する。

### 2.2 最終ゴール

- Phase 4 テスト仕様書に「テスト実行ディレクトリ」セクションが自動生成される
- `cd apps/desktop && pnpm vitest run` の形式がテンプレートに含まれる
- P40 への参照リンクが含まれる

### 2.3 スコープ

#### 含むもの

- `task-specification-creator` の Phase 4 テンプレート（`references/phase-templates.md` または該当テンプレートファイル）の更新
- Phase 4 仕様書の「実行手順」セクションに「テスト実行環境」サブセクションを追加
- P40 参照リンクの追加

#### 含まないもの

- 既存の Phase 4 仕様書の遡及修正
- Phase 4 以外のテンプレート修正
- vitest.config.ts の変更

### 2.4 成果物

- 更新された Phase 4 テンプレート
- 変更内容の documentation-changelog 記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-specification-creator のテンプレート構造を理解していること
- P40（テスト実行ディレクトリ依存）の内容を理解していること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- task-specification-creator の Phase テンプレート構造
- モノレポ環境での vitest 実行パターン
- P40 の原因と解決策

### 3.4 推奨アプローチ

1. `task-specification-creator` の Phase 4 関連テンプレートファイルを特定
2. テスト実行手順セクションに以下を追加：

   ````markdown
   ### テスト実行環境（P40準拠）

   > **重要**: モノレポ環境では、テスト実行ディレクトリに注意してください。
   > プロジェクトルートからの実行は `vitest.config.ts` の環境設定が適用されません。

   ```bash
   # 正しい実行方法
   cd apps/desktop && pnpm vitest run <テストファイルパス>

   # 間違い（P40 違反）
   pnpm vitest run apps/desktop/src/...  # プロジェクトルートから実行
   ```
   ````

   参照: [P40: テスト実行ディレクトリ依存](../../.claude/rules/06-known-pitfalls.md#P40)

   ```

   ```

3. SKILL.md の変更履歴を更新

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                     | 発見経緯                                     | 解決策                               | この未タスクでの適用                             |
| ------------------------ | -------------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| P40 再発                 | Phase 6 でプロジェクトルートから vitest 実行 | `cd apps/desktop` を必須化           | テンプレートに実行ディレクトリを明記             |
| サブエージェント実行失敗 | テスト委譲時にディレクトリを指定しなかった   | テスト実行コマンドにフルパスを含める | テンプレートにサブエージェント向け注意書きを追加 |

---

## 4. 実行手順

### Phase A: テンプレート特定と更新

1. `task-specification-creator` の Phase 4 テンプレートファイルを特定
2. テスト実行環境セクションを追加
3. P40 参照リンクを追加

### Phase B: 検証

1. テンプレートの構文チェック
2. 生成されるPhase 4仕様書にセクションが含まれることを確認

### Phase C: 仕様同期

1. SKILL.md 変更履歴更新
2. LOGS.md 更新

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 4 テンプレートに「テスト実行環境」セクションが追加されている
- [ ] P40 への参照リンクが含まれている
- [ ] `cd apps/desktop && pnpm vitest run` 形式のコマンド例が含まれている

### 品質要件

- [ ] テンプレートの Markdown 構文が正しい
- [ ] 既存のテンプレート構造と一貫している

### ドキュメント要件

- [ ] SKILL.md 変更履歴が更新されている
- [ ] LOGS.md が更新されている

---

## 6. 検証方法

### テストケース

- TC-01: 更新されたテンプレートで新しい Phase 4 仕様書を生成し、テスト実行環境セクションが含まれることを確認
- TC-02: P40 参照リンクが有効であることを確認

### 検証手順

1. テンプレートファイルを目視確認
2. 可能であれば task-specification-creator で新規タスクを生成し、Phase 4 出力を確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                           |
| ---------------------------------- | ------ | -------- | ---------------------------------------------- |
| テンプレート変更で既存生成物に影響 | 低     | 低       | 追加セクションのみで既存構造を変更しない       |
| P40 以外のモノレポ制約の見落とし   | 中     | 低       | P40 の内容を確認し、必要に応じて他の制約も追加 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/06-known-pitfalls.md` — P40: テスト実行ディレクトリ依存
- `.claude/skills/task-specification-creator/SKILL.md` — テンプレート管理
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-CONCURRENCY-GUARD 教訓
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S31 パターン

### 参考資料

- `apps/desktop/vitest.config.ts` — happy-dom 環境設定
- `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-6-test-expansion.md` — P40 再発箇所

---

## 9. 備考

### 補足事項

- P40 は `.claude/rules/06-known-pitfalls.md` に既に記載済みだが、Phase 4 テンプレートからの参照がないため再発した
- テンプレートレベルでガードすることで、仕様書生成時に自動的に注意喚起される仕組みにする
