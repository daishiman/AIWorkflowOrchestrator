# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 9                         |
| Phase名    | 品質保証                  |
| 前提Phase  | Phase 8                   |
| 後続Phase  | Phase 10                  |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

全テスト実行・ESLint・TypeScript型チェックを一括実行し、品質ゲートを通過することを確認する。

## 背景

小規模バグ修正でも、静的解析と全テストスイートを通過することで品質を担保する。

---

## 実行タスク

### タスク1: 全テスト実行

**目的**: 変更による既存機能への影響がないことを確認する。

**実行手順**:

1. `@repo/desktop` の全テストを実行する
2. 全テストがPASSすることを確認する
3. 結果を `outputs/phase-9/quality-report.md` に記録する

```bash
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- テスト実行結果（全PASS）

---

### タスク2: ESLint実行

**目的**: 変更ファイルにESLintエラーがないことを確認する（AC-5充足）。

**実行手順**:

1. 修正ファイルとテストファイルにESLintを実行する
2. エラーがないことを確認する

```bash
pnpm --filter @repo/desktop lint
```

**期待される成果物**:

- ESLint実行結果（エラーなし）

---

### タスク3: TypeScript型チェック

**目的**: 型エラーがないことを確認する（AC-5充足）。

**実行手順**:

1. `@repo/desktop` の型チェックを実行する
2. 型エラーがないことを確認する

```bash
pnpm --filter @repo/desktop typecheck
```

**期待される成果物**:

- TypeScript型チェック結果（エラーなし）

---

## 参照資料

| 参照資料       | パス                                                                                                  | 内容             |
| -------------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| 修正ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | 品質チェック対象 |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | テスト対象       |
| 受入条件       | `outputs/phase-1/acceptance-criteria.md`                                                              | AC-5（型・Lint） |

---

## 成果物

| 成果物           | パス                                | 内容                                 |
| ---------------- | ----------------------------------- | ------------------------------------ |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 全テスト・ESLint・型チェック実行結果 |

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] `SkillLifecyclePanel` 関連テスト全PASS

#### コード品質

- [ ] Lintエラーなし（AC-5充足）
- [ ] 型エラーなし（AC-5充足）
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] `onWorkflowStateChanged` のカバレッジ 90%以上（Phase 7で確認済み）

---

## 統合テスト連携

- 品質保証でテスト結果を確認する

---

## 完了条件

- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] 全テストPASS（`pnpm --filter @repo/desktop test` 成功）
- [ ] ESLintエラーなし（`pnpm --filter @repo/desktop lint` 成功）
- [ ] TypeScript型エラーなし（`pnpm --filter @repo/desktop typecheck` 成功）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 品質保証レポートが生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-10-final-review.md`
