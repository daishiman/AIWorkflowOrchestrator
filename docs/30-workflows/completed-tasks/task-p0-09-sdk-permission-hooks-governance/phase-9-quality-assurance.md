# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 9                                  |
| 名称       | 品質保証                           |
| タスクID   | TASK-P0-09                         |
| ステータス | 未実施                             |
| 依存       | Phase 8 完了                       |
| 完了条件   | 全品質チェックが PASS していること |

---

## 目的

実装・テスト・リファクタリングが完了した governance 基盤の品質を最終確認する。
typecheck / lint / 全テスト / カバレッジを一括で検証し、Phase 10 の最終レビューに向けて
品質証跡を整備する。

---

## 実行タスク

### T-09-1: 全テスト実行

```bash
# governance 関連テストの全実行
pnpm --filter @repo/desktop test -- \
  --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" \
  --run

# desktop パッケージ全テスト（リグレッション確認）
pnpm --filter @repo/desktop test -- --run
```

**確認観点**:

- Phase 4 で定義した全テスト（TC-PP / TC-HF / TC-AS / TC-FG）が PASS しているか
- Phase 6 で追加した fail path / edge case / 回帰ガードテストが PASS しているか
- 既存テスト（governance 以外）へのリグレッションが発生していないか

**完了条件**:

- [ ] governance テストが全て PASS している
- [ ] 既存テストへのリグレッションがない

---

### T-09-2: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

**確認観点**:

- `SkillCreatorGovernancePhase` / `SkillCreatorSdkPolicy` 等の型定義が整合している
- `SkillCreatorAuditSink` / `SkillCreatorHooks` の型が正しく使用されている
- `RuntimeSkillCreatorFacade.ts` の governance 統合で型エラーがない

**完了条件**:

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなし

---

### T-09-3: Lint チェック

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

**完了条件**:

- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `pnpm --filter @repo/shared lint` がエラーなし

---

### T-09-4: カバレッジ最終確認

```bash
pnpm --filter @repo/desktop test -- --run --coverage \
  --coverage.include="apps/desktop/src/main/services/runtime/governance/**" \
  --coverage.include="apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts"
```

**確認観点**（Phase 7 の目標値を再確認）:

- `SkillCreatorPermissionPolicy.ts`: Line 90%以上 / Branch 80%以上
- `SkillCreatorHooksFactory.ts`: Line 90%以上 / Branch 80%以上
- `SkillCreatorAuditSink.ts`: Line 90%以上 / Branch 80%以上（**必達**）
- `RuntimeSkillCreatorFacade.ts`（governance 部分）: Line 80%以上

**完了条件**:

- [ ] 全ファイルでカバレッジ目標を達成している

---

### T-09-5: 品質保証チェックリストの完成

以下の全項目を確認し、品質証跡として記録する。

#### 機能要件チェック

- [ ] plan / execute / verify / improve の全 phase で `permissionMode` が SDK に正しく渡される設計になっている
- [ ] 全 phase で `allowedTools` / `disallowedTools` が定義されている
- [ ] `createHooks(phase, auditSink)` が全 4 phase に対応している
- [ ] `SkillCreatorAuditSink` が session 単位でツール呼び出し履歴を記録する
- [ ] `RuntimeSkillCreatorFacade.ts` の全 phase `query()` 呼び出し前に governance hooks が設定される
- [ ] `DESTRUCTIVE_TOOLS`（NotebookEdit 等）が全 phase で拒否される

#### 品質要件チェック

- [ ] 全ユニットテストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `SkillCreatorAuditSink` の branch coverage が 80% 以上

#### 設計品質チェック

- [ ] U1 carry-forward の TODO コメントが適切な箇所に記載されている
- [ ] hooks のコード側固定理由がコメントで説明されている
- [ ] 将来の永続化スコープが TODO コメントとして記録されている
- [ ] TASK-P0-09-U1 サブタスクの前提条件が整っていることが確認できる

---

## 参照資料

- `phase-8-refactoring.md`
- `phase-7-coverage-check.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`

---

## 成果物

| 成果物名         | パス                                          | 必須 |
| ---------------- | --------------------------------------------- | ---- |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] 全テスト（governance + 全体）が PASS している
- [ ] typecheck がエラーなし（desktop + shared）
- [ ] lint がエラーなし（desktop + shared）
- [ ] 全ファイルでカバレッジ目標を達成している
- [ ] 機能・品質・設計の全チェック項目が PASS している
- [ ] `outputs/phase-9/quality-assurance-report.md` が作成されている
