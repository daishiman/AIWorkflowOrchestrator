# Phase 5: 実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 5                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 4                   |
| 後続Phase  | Phase 6                   |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

esbuild platform mismatch を解消するために node_modules を完全削除し、クリーンな状態で pnpm install を再実行する。新機能追加ではなく、品質保証を成立させるための実行環境再構築をこの Phase の実装として扱い、Vitest が正常起動することを確認してから次の Phase へ進む。

## 実行タスク

### タスク1: 事前状態確認

**目的**: esbuild の現在の状態を診断する

**実行手順**:

1. esbuild バイナリの状態確認
   ```bash
   node -e "require('esbuild')"
   ```
2. Vitest 起動テスト
   ```bash
   pnpm exec vitest --version
   ```
3. 状態を記録する（エラー有無）

### タスク2: node_modules 完全削除

**目的**: esbuild バイナリの不整合を根本から除去する

**実行手順**:

```bash
rm -rf node_modules \
       apps/desktop/node_modules \
       packages/shared/node_modules \
       packages/ui/node_modules
```

**⚠️ 注意**: `apps/web/node_modules` も存在する場合は追加で削除する

### タスク3: pnpm install 実行

**目的**: クリーンな状態でバイナリを再インストールする

**実行手順**:

```bash
pnpm install
```

```bash
pnpm --filter @repo/shared build
```

**フォールバック**（インストール後もエラーが残る場合）:

```bash
pnpm store prune
pnpm install
```

### タスク4: 環境確認

**目的**: 環境が正常に再構築されたことを確認する

**実行手順**:

```bash
# esbuild 動作確認
node -e "require('esbuild')"

# Vitest 起動確認
cd apps/desktop && pnpm exec vitest --version
```

**成功条件**: 両コマンドがエラーなしで完了する

**注意**: desktop の renderer テストは `apps/desktop` を cwd にして実行する。repo root から `pnpm exec vitest run apps/desktop/...` を叩くと `setupFiles` 解決がずれ、`@testing-library/jest-dom` matcher が未適用に見える false negative が起きうる。

## 参照資料

| 資料名             | パス                                                             | 内容                               |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| 元の未タスク指示書 | `docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md` | 苦戦箇所1（esbuild 解消手順）      |
| Phase 2 設計       | `phase-2-design.md`                                              | 環境クリーンアップ設計             |
| task-spec-creator  | `.claude/skills/task-specification-creator/SKILL.md`             | worktree作成後のpnpm install注意点 |

## 成果物

| 成果物           | パス                                          | 内容                        |
| ---------------- | --------------------------------------------- | --------------------------- |
| 実装仕様         | `phase-5-implementation.md`                   | 実行手順                    |
| セットアップ結果 | `outputs/phase-5/environment-setup-result.md` | 実行前後の esbuild 状態記録 |

## 統合テスト連携

- この Phase で環境が正常になって初めて Phase 9 の品質保証が可能になる
- 環境 FAIL の場合は根本原因を記録し、ユーザーに報告する

## 完了条件

- [ ] 事前状態（esbuild エラー有無）が記録されている
- [ ] node_modules 完全削除が完了している
- [ ] pnpm install が完了している
- [ ] `pnpm --filter @repo/shared build` が完了している
- [ ] 環境確認（esbuild 動作・Vitest 起動）が PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-5/environment-setup-result.md` を作成し、実行前後の状態と結果を記録する
- `artifacts.json` の Phase 5 ステータスを `completed` に更新する
