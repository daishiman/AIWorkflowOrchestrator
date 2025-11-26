# スキルリソースセクション修正ガイド

**目的**: 4つのスキルSKILL.mdファイルに正しいリソースセクションを追加/修正する

---

## 修正対象ファイル

### 1. test-data-management/SKILL.md

**場所**: 行216-224
**現状**: 「将来追加予定」となっているが、実際にはすべてファイルが存在
**修正方法**: 行216-224を以下に置換

```markdown
## リソース

- [resources/seeding-strategies.md](resources/seeding-strategies.md) - Seeding戦略詳細
- [resources/cleanup-patterns.md](resources/cleanup-patterns.md) - クリーンアップパターン
- [resources/data-isolation-techniques.md](resources/data-isolation-techniques.md) - データ分離技術
- [scripts/generate-test-data.mjs](scripts/generate-test-data.mjs) - テストデータ生成スクリプト
- [templates/fixture-template.ts](templates/fixture-template.ts) - Fixtureテンプレート
```

---

### 2. flaky-test-prevention/SKILL.md

**場所**: 行167 (「## 関連スキル」の直前)
**現状**: リソースセクションが存在しない
**修正方法**: 行167の前に以下を挿入

```markdown
## リソース

- [resources/non-determinism-patterns.md](resources/non-determinism-patterns.md) - 非決定性パターン詳細
- [resources/retry-strategies.md](resources/retry-strategies.md) - リトライ戦略詳細
- [resources/stability-checklist.md](resources/stability-checklist.md) - 安定性チェックリスト
- [scripts/detect-flaky-tests.mjs](scripts/detect-flaky-tests.mjs) - フレーキーテスト検出スクリプト
- [templates/stable-test-template.ts](templates/stable-test-template.ts) - 安定したテストテンプレート

```

---

### 3. visual-regression-testing/SKILL.md

**場所**: 行139 (「## 関連スキル」の直前)
**現状**: リソースセクションが存在しない
**修正方法**: 行139の前に以下を挿入

```markdown
## リソース

- [resources/screenshot-strategies.md](resources/screenshot-strategies.md) - スクリーンショット戦略詳細
- [resources/visual-testing-best-practices.md](resources/visual-testing-best-practices.md) - ビジュアルテストベストプラクティス
- [scripts/update-baseline-screenshots.mjs](scripts/update-baseline-screenshots.mjs) - ベースラインスクリーンショット更新スクリプト
- [templates/visual-test-template.ts](templates/visual-test-template.ts) - ビジュアルテストテンプレート

```

---

### 4. api-mocking/SKILL.md

**場所**: 行190 (「## 関連スキル」の直前)
**現状**: リソースセクションが存在しない
**修正方法**: 行190の前に以下を挿入

```markdown
## リソース

- [resources/mock-patterns.md](resources/mock-patterns.md) - モックパターン詳細
- [resources/msw-integration-guide.md](resources/msw-integration-guide.md) - MSW統合ガイド
- [scripts/generate-mock-handlers.mjs](scripts/generate-mock-handlers.mjs) - モックハンドラー生成スクリプト
- [templates/mock-handler-template.ts](templates/mock-handler-template.ts) - モックハンドラーテンプレート

```

---

## 自動修正スクリプト

以下のスクリプトを使用して一括修正することも可能です:

```bash
#!/bin/bash

SKILLS_DIR=".claude/skills"

# 1. test-data-management の修正
sed -i.bak '216,224d' "${SKILLS_DIR}/test-data-management/SKILL.md"
sed -i.bak '216i\
## リソース\
\
- [resources/seeding-strategies.md](resources/seeding-strategies.md) - Seeding戦略詳細\
- [resources/cleanup-patterns.md](resources/cleanup-patterns.md) - クリーンアップパターン\
- [resources/data-isolation-techniques.md](resources/data-isolation-techniques.md) - データ分離技術\
- [scripts/generate-test-data.mjs](scripts/generate-test-data.mjs) - テストデータ生成スクリプト\
- [templates/fixture-template.ts](templates/fixture-template.ts) - Fixtureテンプレート\
' "${SKILLS_DIR}/test-data-management/SKILL.md"

# 2. flaky-test-prevention の修正
sed -i.bak '167i\
## リソース\
\
- [resources/non-determinism-patterns.md](resources/non-determinism-patterns.md) - 非決定性パターン詳細\
- [resources/retry-strategies.md](resources/retry-strategies.md) - リトライ戦略詳細\
- [resources/stability-checklist.md](resources/stability-checklist.md) - 安定性チェックリスト\
- [scripts/detect-flaky-tests.mjs](scripts/detect-flaky-tests.mjs) - フレーキーテスト検出スクリプト\
- [templates/stable-test-template.ts](templates/stable-test-template.ts) - 安定したテストテンプレート\
\
' "${SKILLS_DIR}/flaky-test-prevention/SKILL.md"

# 3. visual-regression-testing の修正
sed -i.bak '139i\
## リソース\
\
- [resources/screenshot-strategies.md](resources/screenshot-strategies.md) - スクリーンショット戦略詳細\
- [resources/visual-testing-best-practices.md](resources/visual-testing-best-practices.md) - ビジュアルテストベストプラクティス\
- [scripts/update-baseline-screenshots.mjs](scripts/update-baseline-screenshots.mjs) - ベースラインスクリーンショット更新スクリプト\
- [templates/visual-test-template.ts](templates/visual-test-template.ts) - ビジュアルテストテンプレート\
\
' "${SKILLS_DIR}/visual-regression-testing/SKILL.md"

# 4. api-mocking の修正
sed -i.bak '190i\
## リソース\
\
- [resources/mock-patterns.md](resources/mock-patterns.md) - モックパターン詳細\
- [resources/msw-integration-guide.md](resources/msw-integration-guide.md) - MSW統合ガイド\
- [scripts/generate-mock-handlers.mjs](scripts/generate-mock-handlers.mjs) - モックハンドラー生成スクリプト\
- [templates/mock-handler-template.ts](templates/mock-handler-template.ts) - モックハンドラーテンプレート\
\
' "${SKILLS_DIR}/api-mocking/SKILL.md"

echo "修正完了"
```

---

## 検証方法

修正後、以下のコマンドで各スキルのリソースセクションを確認:

```bash
# 各スキルのリソースセクションを表示
grep -A 10 "## リソース" .claude/skills/test-data-management/SKILL.md
grep -A 10 "## リソース" .claude/skills/flaky-test-prevention/SKILL.md
grep -A 10 "## リソース" .claude/skills/visual-regression-testing/SKILL.md
grep -A 10 "## リソース" .claude/skills/api-mocking/SKILL.md
```

期待される出力: 各スキルで実際に存在するリソースファイルが正しくリンクされていること

---

## 完了確認

修正後、以下を確認:

- [ ] test-data-management: リソースセクションが実ファイルを参照
- [ ] flaky-test-prevention: リソースセクションが追加されている
- [ ] visual-regression-testing: リソースセクションが追加されている
- [ ] api-mocking: リソースセクションが追加されている
- [ ] すべてのリソースファイルパスが相対パス形式
- [ ] リンク切れがないこと（実ファイルが存在）

---

**推定作業時間**: 5-10分（手動） / 1分（スクリプト使用）
