# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 7                                  |
| Phase名    | テストカバレッジ確認               |
| 前提Phase  | Phase 6 (テスト拡充)               |
| 後続Phase  | Phase 8 (リファクタリング)         |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| タスク名   | SkillExecutorのIPCチャネル名定数化 |
| 分類       | リファクタリング（小規模）         |

---

## 目的

Phase 6 の結果を検証し、リファクタリングが正常に完了したことをゲートとして確認する。

## 背景

本タスクは小規模リファクタリングであり、以下の確認で完了とする:

1. 既存テストの全PASS
2. TypeScriptコンパイル成功
3. ESLint警告なし

---

## 実行コマンド

### テスト実行

```bash
# SkillExecutor関連の全テスト実行
pnpm --filter @repo/desktop test -- SkillExecutor

# または全テスト実行
pnpm --filter @repo/desktop test
```

### 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

---

## ゲート判定

| 判定 | 条件                                 | 次のアクション |
| ---- | ------------------------------------ | -------------- |
| PASS | 全テストPASS + 型チェックOK + LintOK | Phase 8へ進行  |
| FAIL | いずれかの条件を満たさない           | Phase 5へ戻る  |

---

## チェックリスト

### テスト結果

- [ ] `SkillExecutor.test.ts` が全てPASS
- [ ] `hooks.test.ts` が全てPASS
- [ ] `SkillExecutor.retry.test.ts` が全てPASS
- [ ] `SkillExecutor.auth.test.ts` が全てPASS（存在する場合）
- [ ] `SkillExecutor.integration.test.ts` が全てPASS（存在する場合）
- [ ] `SkillExecutor.permission.test.ts` が全てPASS（存在する場合）

### 品質チェック

- [ ] TypeScriptコンパイルエラーなし
- [ ] ESLint警告・エラーなし
- [ ] Prettier フォーマット済み

### コード確認

- [ ] L918 が `SKILL_CHANNELS.SKILL_STREAM` に変更されている
- [ ] L1214 が `SKILL_CHANNELS.SKILL_STREAM` に変更されている
- [ ] `"skill:stream"` のハードコードがプロダクションコードに残っていない

---

## 最終確認コマンド

```bash
# ハードコードが残っていないか確認
grep -n '"skill:stream"' apps/desktop/src/main/services/skill/SkillExecutor.ts

# 期待結果: 出力なし（ハードコードが存在しない）
```

---

## 統合テスト連携

**該当なし**: 本タスクは動作変更を伴わないリファクタリング（IPCチャネル名の定数化）のため、統合テストへの影響はありません。既存のテストスイートがPASSすることで動作互換性を確認します。

---

## 成果物

| 成果物                 | パス                                                                                               | 内容                   |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| カバレッジ検証レポート | `docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/outputs/phase-7/coverage-verification-report.md` | ゲート判定・テスト結果 |

---

## 完了条件

- [ ] 全テストがPASS
- [ ] TypeScriptコンパイル成功
- [ ] ESLint警告なし
- [ ] ハードコード `"skill:stream"` がプロダクションコードに残っていない
- [ ] **本Phase内の全作業を100%完了**

---

## 依存関係

- **前提**: Phase 5, 6 が完了していること
- **後続**: Phase 8 へ進む（PASS判定の場合）

---

## Phase 7 実行記録テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### テスト結果

- SkillExecutor.test.ts: {{PASS/FAIL}} ({{数}} tests)
- hooks.test.ts: {{PASS/FAIL}} ({{数}} tests)
- SkillExecutor.retry.test.ts: {{PASS/FAIL}} ({{数}} tests)

### 品質チェック結果

- TypeScriptコンパイル: {{OK/NG}}
- ESLint: {{OK/NG}}

### ゲート判定

- 結果: {{PASS/FAIL}}

### 備考

-
```

---

## 次のPhase

完了後、以下のPhaseへ進んでください:

**Phase 8 (リファクタリング)**: 本タスクは純粋なリファクタリングのため、Phase 8 はスキップ可能

**Phase 9 (品質検証)** へ直接進むことを推奨:
`docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/phase-9-quality-verification.md` （別途作成が必要な場合）

---

## 備考

本タスクは小規模リファクタリングのため、Phase 8-10 は簡略化可能。Phase 7 完了後、直接 Phase 13 (完了・PR作成) に進んでも問題なし。
