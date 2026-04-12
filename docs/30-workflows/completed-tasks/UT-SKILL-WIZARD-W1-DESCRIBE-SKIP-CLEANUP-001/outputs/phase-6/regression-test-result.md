# 回帰テスト結果

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## テスト実行環境

worktree 環境の esbuild バイナリバージョン不一致（0.21.5 vs 0.25.12）により
`pnpm --filter @repo/desktop test:run` は起動エラーとなるため、
`node_modules/.bin/vitest run` で直接実行した。

## 旧 testid 残存確認（TC-1/TC-2）

```bash
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

**結果**: マッチ 0件（AC-1/AC-2 充足）

## describe.skip ブロック維持確認（TC-5/TC-6）

```bash
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# → 12件（変更前と同数）
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# → 6件（変更前と同数）
```

## テスト実行結果（TC-3）

```
Test Files: 1 failed | 2 passed (3)
Tests: 3 failed | 62 passed | 18 skipped (83)
```

**失敗テスト一覧**:

| テスト名                                               | 失敗理由                       | 本タスク起因か |
| ------------------------------------------------------ | ------------------------------ | -------------- |
| TASK-RT-05: multi_select 未選択時バリデーション        | 変更前から失敗（pre-existing） | いいえ         |
| TASK-RT-05: request kind 切り替えで state 持ち越さない | 変更前から失敗（pre-existing） | いいえ         |
| U-20: getVerifyDetail 失敗時の error banner            | 変更前から失敗（pre-existing） | いいえ         |

**確認方法**: git stash で変更前の状態でテストを実行し、同一の3テストが失敗することを確認した。

## TC-7: 旧 testid の完全削除確認

```bash
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/
```

**結果**:

- 対象2ファイル: 0件 ✅
- `SkillLifecyclePanel.test.tsx`: 2件（`queryByTestId` による「存在しないこと」確認テスト、本タスク対象外）

## 結論

- **本タスクによる回帰**: なし
- **既存の失敗テスト**: 3件（pre-existing、本タスクとは無関係）
- **AC-4 判定**: 本タスクに起因するテスト失敗は0件。Pre-existing の失敗は別タスクで対応が必要。

---

_作成日: 2026-04-11_
