# Phase 9: 品質保証 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 9                                               |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 8 完了                                    |

## 目的

line budget・型チェック・テスト・lint の一括判定を行い、PR 前の品質ゲートを通過する。

## 品質チェックリスト

### TypeScript 型チェック

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

期待: エラー 0 件

### ESLint

```bash
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

期待: エラー 0 件

### テスト

```bash
# adapter-status グループ
pnpm --filter @repo/desktop test -- --testPathPattern="adapter-status"

# 全 RuntimeSkillCreatorFacade テスト（リグレッション確認）
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

期待: 全 PASS

### line budget 確認

| ファイル                               | 変更前行数  | 変更後行数 | 差分                              |
| -------------------------------------- | ----------- | ---------- | --------------------------------- |
| `RuntimeSkillCreatorFacade.ts`         | ~1961行     | ~2001行    | +40行（2ガードブロック）          |
| `skillCreator.ts`                      | ~820行付近  | ~836行     | +16行（型追加）                   |
| `index.ts`                             | ~220行付近  | ~221行     | +1行（新型エクスポート）          |
| `adapter-status.test.ts`               | ~387行      | ~570行     | +183行（テスト追加）              |
| `SkillCreateWizard.tsx`                | ~360行付近  | ~378行     | +18行（error response narrowing） |
| `SkillLifecyclePanel.tsx`              | ~2050行付近 | ~2070行    | +20行（error response narrowing） |
| `skillCreator.contract-parity.test.ts` | ~70行付近   | ~72行      | +2行（契約期待値更新）            |

### mirror parity 確認

```bash
# .agents mirror と .claude 正本の差分を確認
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator 2>/dev/null || echo "mirror 更新が必要"
```

## 成果物

- Phase 9 品質保証書（本ファイル）
- 全チェック結果の記録

## 完了条件

- [ ] `pnpm typecheck` が shared/desktop 両方でエラー 0
- [ ] `pnpm lint` が shared/desktop 両方でエラー 0
- [ ] `adapter-status.test.ts` の全テストが PASS
- [ ] `RuntimeSkillCreatorFacade` 全テストがリグレッションなし
- [ ] line budget が許容範囲内（+300行以内、consumer compatibility 含む）

## 次のPhase

Phase 10: 最終レビュー
