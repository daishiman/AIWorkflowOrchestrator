#!/bin/bash

# E2E Tester スキルのリソースセクション修正スクリプト

SKILLS_DIR=".claude/skills"

echo "🔧 E2E Tester スキルのリソースセクション修正を開始..."

# 1. test-data-management: リソースセクション更新
echo ""
echo "📝 1/4: test-data-management のリソースセクションを更新中..."

cat > "${SKILLS_DIR}/test-data-management/SKILL_RESOURCE_SECTION.tmp" << 'EOF'
## リソース

- [resources/seeding-strategies.md](resources/seeding-strategies.md) - Seeding戦略詳細
- [resources/cleanup-patterns.md](resources/cleanup-patterns.md) - クリーンアップパターン
- [resources/data-isolation-techniques.md](resources/data-isolation-techniques.md) - データ分離技術
- [scripts/generate-test-data.mjs](scripts/generate-test-data.mjs) - テストデータ生成スクリプト
- [templates/fixture-template.ts](templates/fixture-template.ts) - Fixtureテンプレート
EOF

# 2. flaky-test-prevention: リソースセクション追加
echo "📝 2/4: flaky-test-prevention にリソースセクションを追加中..."

cat > "${SKILLS_DIR}/flaky-test-prevention/SKILL_RESOURCE_SECTION.tmp" << 'EOF'

## リソース

- [resources/non-determinism-patterns.md](resources/non-determinism-patterns.md) - 非決定性パターン詳細
- [resources/retry-strategies.md](resources/retry-strategies.md) - リトライ戦略詳細
- [resources/stability-checklist.md](resources/stability-checklist.md) - 安定性チェックリスト
- [scripts/detect-flaky-tests.mjs](scripts/detect-flaky-tests.mjs) - フレーキーテスト検出スクリプト
- [templates/stable-test-template.ts](templates/stable-test-template.ts) - 安定したテストテンプレート
EOF

# 3. visual-regression-testing: リソースセクション追加
echo "📝 3/4: visual-regression-testing にリソースセクションを追加中..."

cat > "${SKILLS_DIR}/visual-regression-testing/SKILL_RESOURCE_SECTION.tmp" << 'EOF'

## リソース

- [resources/screenshot-strategies.md](resources/screenshot-strategies.md) - スクリーンショット戦略詳細
- [resources/visual-testing-best-practices.md](resources/visual-testing-best-practices.md) - ビジュアルテストベストプラクティス
- [scripts/update-baseline-screenshots.mjs](scripts/update-baseline-screenshots.mjs) - ベースラインスクリーンショット更新スクリプト
- [templates/visual-test-template.ts](templates/visual-test-template.ts) - ビジュアルテストテンプレート
EOF

# 4. api-mocking: リソースセクション追加
echo "📝 4/4: api-mocking にリソースセクションを追加中..."

cat > "${SKILLS_DIR}/api-mocking/SKILL_RESOURCE_SECTION.tmp" << 'EOF'

## リソース

- [resources/mock-patterns.md](resources/mock-patterns.md) - モックパターン詳細
- [resources/msw-integration-guide.md](resources/msw-integration-guide.md) - MSW統合ガイド
- [scripts/generate-mock-handlers.mjs](scripts/generate-mock-handlers.mjs) - モックハンドラー生成スクリプト
- [templates/mock-handler-template.ts](templates/mock-handler-template.ts) - モックハンドラーテンプレート
EOF

echo ""
echo "✅ 一時ファイルの作成完了"
echo ""
echo "📋 次のステップ:"
echo "   各SKILL.mdファイルを手動で編集し、生成された.tmpファイルの内容を適切な位置に挿入してください。"
echo ""
echo "生成されたファイル:"
echo "  - ${SKILLS_DIR}/test-data-management/SKILL_RESOURCE_SECTION.tmp"
echo "  - ${SKILLS_DIR}/flaky-test-prevention/SKILL_RESOURCE_SECTION.tmp"
echo "  - ${SKILLS_DIR}/visual-regression-testing/SKILL_RESOURCE_SECTION.tmp"
echo "  - ${SKILLS_DIR}/api-mocking/SKILL_RESOURCE_SECTION.tmp"
