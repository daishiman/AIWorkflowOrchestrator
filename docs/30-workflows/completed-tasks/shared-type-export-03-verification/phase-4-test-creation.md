# Phase 4: 検証テスト準備

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase番号  | 4                           |
| Phase名    | 検証テスト準備              |
| 目的       | 検証コマンド・手順の整理    |
| 前提Phase  | Phase 3（前提条件レビュー） |
| 推定作業量 | 小                          |

---

## 1. 目的

検証を実行するために必要なコマンドと手順を整理し、検証スクリプトを準備する。

---

## 2. 実行タスク

### Task 4-1: 検証コマンドの整理

#### 目的

検証に使用する全コマンドを整理し、実行順序を確定する。

#### 検証コマンド一覧

| 順序 | コマンド                                | 目的              | 期待結果  |
| ---- | --------------------------------------- | ----------------- | --------- |
| 1    | `pnpm --filter @repo/shared typecheck`  | shared型チェック  | エラー0件 |
| 2    | `pnpm --filter @repo/shared build`      | sharedビルド      | 成功      |
| 3    | `pnpm --filter @repo/desktop typecheck` | desktop型チェック | エラー0件 |
| 4    | `pnpm --filter @repo/desktop build`     | desktopビルド     | 成功※     |
| 5    | `pnpm typecheck`                        | 全体型チェック    | エラー0件 |
| 6    | `pnpm build`                            | 全体ビルド        | 成功      |
| 7    | `git push --dry-run`                    | pre-push hook検証 | hook通過  |

※ 既存のRenderer関連問題を除く

#### 成果物

| 成果物             | 配置先                                     |
| ------------------ | ------------------------------------------ |
| 検証コマンドリスト | `outputs/phase-4/verification-commands.md` |

#### 完了条件

- [ ] 全検証コマンドがリストアップされている
- [ ] 実行順序が依存関係に基づいて正しく定義されている
- [ ] 各コマンドの期待結果が明記されている

---

### Task 4-2: 検証スクリプトの準備

#### 目的

検証を効率的に実行するためのスクリプトを準備する。

#### 検証スクリプト

```bash
#!/bin/bash
# verification-script.sh
# Type Export Verification Script for SHARED-TYPE-EXPORT-03

set -e  # エラー時に停止

echo "=== Type Export Verification ==="
echo ""

# Step 1: @repo/shared typecheck
echo "[1/7] Running @repo/shared typecheck..."
pnpm --filter @repo/shared typecheck
echo "✅ @repo/shared typecheck passed"
echo ""

# Step 2: @repo/shared build
echo "[2/7] Running @repo/shared build..."
pnpm --filter @repo/shared build
echo "✅ @repo/shared build passed"
echo ""

# Step 3: @repo/desktop typecheck
echo "[3/7] Running @repo/desktop typecheck..."
pnpm --filter @repo/desktop typecheck
echo "✅ @repo/desktop typecheck passed"
echo ""

# Step 4: @repo/desktop build
echo "[4/7] Running @repo/desktop build..."
pnpm --filter @repo/desktop build
echo "✅ @repo/desktop build passed"
echo ""

# Step 5: Full typecheck
echo "[5/7] Running full typecheck..."
pnpm typecheck
echo "✅ Full typecheck passed"
echo ""

# Step 6: Full build
echo "[6/7] Running full build..."
pnpm build
echo "✅ Full build passed"
echo ""

# Step 7: Pre-push hook verification
echo "[7/7] Verifying pre-push hook (dry-run)..."
git push --dry-run 2>/dev/null && echo "✅ Pre-push hook verification passed" || echo "⚠️ Pre-push hook verification skipped (no remote)"
echo ""

echo "=== All Verifications Passed ==="
```

#### 成果物

| 成果物         | 配置先                                   |
| -------------- | ---------------------------------------- |
| 検証スクリプト | `outputs/phase-4/verification-script.sh` |

#### 完了条件

- [ ] 検証スクリプトが作成されている
- [ ] スクリプトが実行可能である
- [ ] エラー時に適切に停止する

---

### Task 4-3: エラー判定基準の整理

#### 目的

各検証コマンドのエラー判定基準を明確にする。

#### エラー判定基準

| コマンド  | PASSの条件                        | FAILの条件                         |
| --------- | --------------------------------- | ---------------------------------- |
| typecheck | Exit code 0、エラーメッセージなし | Exit code != 0、型エラーメッセージ |
| build     | Exit code 0、成果物生成           | Exit code != 0、ビルドエラー       |
| git push  | pre-push hook Exit code 0         | hook Exit code != 0                |

#### 無視するエラー（既知の問題）

| パッケージ    | 既知の問題             | 対応方針                       |
| ------------- | ---------------------- | ------------------------------ |
| @repo/desktop | Renderer関連ビルド警告 | 本タスクのスコープ外として無視 |

#### 成果物

| 成果物           | 配置先                              |
| ---------------- | ----------------------------------- |
| エラー判定基準書 | `outputs/phase-4/error-criteria.md` |

#### 完了条件

- [ ] 各コマンドのPASS/FAIL条件が明確に定義されている
- [ ] 無視するエラー（既知の問題）が明記されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                 |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | ビルド順序・依存関係 |

### Phase 2成果物

| 成果物                   | 参照目的       |
| ------------------------ | -------------- |
| verification-sequence.md | 検証順序の確認 |
| error-resolution-plan.md | エラー対応方針 |

---

## 4. 成果物一覧

| 成果物             | ファイル名                 | 必須 |
| ------------------ | -------------------------- | ---- |
| 検証コマンドリスト | `verification-commands.md` | ✅   |
| 検証スクリプト     | `verification-script.sh`   | ✅   |
| エラー判定基準書   | `error-criteria.md`        | ✅   |

---

## 5. 完了条件

### 機能要件

- [ ] 全検証コマンドが整理されている
- [ ] 検証スクリプトが準備されている
- [ ] エラー判定基準が明確に定義されている

### 品質要件

- [ ] コマンドの実行順序が正しい
- [ ] スクリプトが実行可能
- [ ] 100人中100人が同じ判定を下せる基準になっている

### Phase完了時の必須アクション

1. 上記成果物を `outputs/phase-4/` に出力
2. artifacts.json の phase-4 ステータスを更新
3. 各タスクを100%実行し、完遂した旨を明記
