# Phase 9: 品質保証

## メタ情報

| 項目            | 値                                 |
| --------------- | ---------------------------------- |
| Phase           | 9                                  |
| タスクID        | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| 機能名          | esbuild-arch-mismatch-fix          |
| 種別            | 品質保証                           |
| 前Phase         | Phase 8                            |
| 次Phase         | Phase 10                           |
| 作成日          | 2026-03-30                         |
| ステータス      | 未実施                             |
| IS_QUALITY_GATE | true                               |

---

## 目的

最終品質ゲートとして、環境修正後の全品質基準を満たしていることを検証する。
機能検証・コード品質・ドキュメント品質・セキュリティの4観点で網羅的にチェックする。

---

## 実行タスク

### 1. 機能検証（環境修正の正常動作確認）

Phase 4 で定義した検証スイートの全項目を再実行する。

- [ ] `node -e "console.log(process.arch)"` → `x64` を出力
- [ ] `ls node_modules/@esbuild/darwin-x64/` → darwin-x64 バイナリが存在
- [ ] esbuild バイナリロードエラーが発生しない
- [ ] RT-06 対象テストが結果を生成する（PASS または FAIL、エラーではない）

```bash
# 一括検証
node -e "console.assert(process.arch === 'x64', 'Not x64'); console.log('arch:', process.arch)"
test -d node_modules/@esbuild/darwin-x64 && echo "OK: darwin-x64 binary exists" || echo "FAIL: missing"
pnpm vitest run --reporter=verbose 2>&1 | head -20
```

### 2. コード品質（post-reinstall 全体検証）

- [ ] `pnpm lint` → 0 errors（全パッケージ）
- [ ] `pnpm typecheck` → 0 errors（全パッケージ）
- [ ] フォーマット違反なし

```bash
# Lint 検証
pnpm lint

# TypeScript 型チェック（全パッケージ）
pnpm typecheck

# フォーマット確認
pnpm prettier --check "**/*.{ts,tsx,js,jsx,json,md}" 2>/dev/null || echo "Prettier check skipped"
```

### 3. ドキュメント品質

- [ ] 予防手順書（`outputs/phase-5/prevention-procedure.md`）が明確かつ実行可能
- [ ] 曖昧な表現が含まれていない
- [ ] 全コマンドがコピー&ペーストでそのまま実行可能
- [ ] 手順の前提条件が明記されている

**曖昧表現チェック**:

```bash
# 予防手順書内の曖昧表現を検索
grep -n "表現" outputs/phase-5/prevention-procedure.md || echo "OK: 表現確認済み"
```

### 4. セキュリティ

- [ ] ドキュメントにシークレット（APIキー、トークン等）が露出していない
- [ ] 安全でないコマンド（パスガードなしの `rm -rf` 等）が含まれていない
- [ ] 環境変数の直接値がハードコードされていない

```bash
# シークレット漏洩チェック
grep -rn "api_key\|secret\|token\|password" outputs/ docs/30-workflows/esbuild-arch-mismatch-fix/ --include="*.md" || echo "OK: シークレットなし"

# 危険コマンドチェック
grep -rn "rm -rf [^/]" outputs/ docs/30-workflows/esbuild-arch-mismatch-fix/ --include="*.md" || echo "OK: 危険コマンドなし"
```

---

## 参照資料

| 資料名               | パス                                    | 説明                 |
| -------------------- | --------------------------------------- | -------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-result.md` | Phase 8 成果物       |
| 検証スイート定義     | Phase 4 テスト設計書                    | 環境検証コマンド一覧 |
| コード品質ルール     | `.claude/rules/02-code-quality.md`      | Lint/型チェック基準  |

### 前提Phase成果物

| Phase | 成果物               | パス                                      |
| ----- | -------------------- | ----------------------------------------- |
| 4     | テスト設計書         | `phase-4-test-creation.md`                |
| 5     | 予防手順書           | `outputs/phase-5/prevention-procedure.md` |
| 7     | カバレッジ確認書     | `outputs/phase-7/coverage-report.md`      |
| 8     | リファクタリング記録 | `outputs/phase-8/refactoring-result.md`   |

---

## 統合テスト連携【必須】

Lint / TypeScript型チェック / Vitest 全テスト実行で品質基準を確認:

```bash
# 統合品質検証（全て成功すること）
pnpm lint && echo "=== Lint PASS ==="
pnpm typecheck && echo "=== Typecheck PASS ==="
pnpm vitest run && echo "=== Vitest PASS ==="
```

---

## 成果物

| 成果物       | パス                                | 説明               |
| ------------ | ----------------------------------- | ------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質チェック結果 |

---

## 完了条件

- [ ] 機能検証: 全環境検証コマンドが成功
- [ ] コード品質: `pnpm lint` + `pnpm typecheck` が 0 errors
- [ ] ドキュメント品質: 曖昧表現なし、全コマンドがコピペ実行可能
- [ ] セキュリティ: シークレット漏洩・危険コマンドなし
- [ ] 統合テスト: vitest 全テスト成功

---

## 完了時テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 品質チェックリスト

| カテゴリ     | 項目                     | 結果          | 備考          |
| ------------ | ------------------------ | ------------- | ------------- |
| 機能検証     | process.arch = x64       | {{PASS/FAIL}} |               |
| 機能検証     | darwin-x64 binary exists | {{PASS/FAIL}} |               |
| 機能検証     | esbuild ロードエラーなし | {{PASS/FAIL}} |               |
| 機能検証     | RT-06 テスト結果生成     | {{PASS/FAIL}} |               |
| コード品質   | pnpm lint                | {{PASS/FAIL}} | errors: {{N}} |
| コード品質   | pnpm typecheck           | {{PASS/FAIL}} | errors: {{N}} |
| コード品質   | フォーマット             | {{PASS/FAIL}} |               |
| ドキュメント | 曖昧表現なし             | {{PASS/FAIL}} |               |
| ドキュメント | コマンド実行可能         | {{PASS/FAIL}} |               |
| セキュリティ | シークレットなし         | {{PASS/FAIL}} |               |
| セキュリティ | 危険コマンドなし         | {{PASS/FAIL}} |               |

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### 次Phaseへの引き継ぎ事項

- {{HANDOVER_ITEMS}}
```

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 10: 最終レビューゲート
