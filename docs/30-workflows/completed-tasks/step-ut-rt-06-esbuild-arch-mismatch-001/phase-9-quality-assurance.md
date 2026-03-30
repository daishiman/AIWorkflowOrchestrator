# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 9                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

環境修正とドキュメント更新が、品質ゲートと依存関係整合を壊していないことを確認する。

## 実行タスク

- 品質ゲート確認
- runtime / binary 整合確認
- drift と doc 品質確認

## 参照資料

| 資料名           | パス                                                 | 説明                 |
| ---------------- | ---------------------------------------------------- | -------------------- |
| 要件定義         | `phase-1-requirements.md`                            | AC 定義              |
| 実装             | `phase-5-implementation.md`                          | 復旧手順             |
| リファクタリング | `phase-8-refactoring.md`                             | ドキュメント整理結果 |
| 再発防止ガイド   | `docs/40-guides/esbuild-arch-mismatch-prevention.md` | 最終 docs            |

## 実行手順

### Step 1: 品質ゲート

```bash
pnpm lint
pnpm typecheck
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### Step 2: 環境整合性

```bash
node -p "process.platform + '-' + process.arch"
pnpm ls esbuild @esbuild/darwin-arm64 @esbuild/darwin-x64 2>/dev/null || true
```

### Step 3: ドリフト確認

```bash
git diff --name-only | grep -E "(preload|channels|ipc)" || echo "IPC関連差分なし"
```

### Step 4: ドキュメント品質

| 検証項目           | 基準                                                                |
| ------------------ | ------------------------------------------------------------------- |
| runtime 確認       | active runtime を確認する exact command がある                      |
| 最小修正           | `pnpm install --force` が主手順になっている                         |
| fallback           | `node_modules` 再生成と `pnpm rebuild esbuild` が補助手順としてある |
| worktree checklist | 新規 worktree の再発防止がある                                      |

## 統合テスト連携

- Phase 9 は `lint / typecheck / targeted test / docs` をまとめて品質ゲートとして扱う。

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

## 完了条件

- [ ] lint が通過している
- [ ] typecheck が通過している
- [ ] 対象テストが通過している
- [ ] runtime と esbuild の整合確認ができている
- [ ] IPC / preload に意図しない差分がない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
