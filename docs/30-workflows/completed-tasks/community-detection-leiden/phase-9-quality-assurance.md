# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 9                          |
| Phase名    | 品質保証                   |
| 前提Phase  | Phase 8 (リファクタリング) |
| 後続Phase  | Phase 10 (最終レビュー)    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

コード品質の自動チェック（Lint/型チェック）を実施し、品質基準を満たすことを確認する。

## 背景

リファクタリング完了後、最終レビューに進む前に自動化された品質チェックを実施する。これにより、人的レビューの負荷を軽減し、一貫した品質基準を維持する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: linting-formatting-automation

**パス**: `.claude/skills/linting-formatting-automation/SKILL.md`

**Trigger条件**:
ESLint/Prettierによるコード品質チェックが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-9/lint-report.md`（Lintレポート）

---

### スキル2: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:
TypeScriptの型安全性を検証する必要がある場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 型エラーがないことを確認

**期待される成果物**:

- `outputs/phase-9/type-check-report.md`（型チェックレポート）

---

## 参照資料

| 参照資料      | パス                                                       | 内容           |
| ------------- | ---------------------------------------------------------- | -------------- |
| Phase 8成果物 | `outputs/phase-8/refactoring-log.md`                       | リファクタ履歴 |
| 実装コード    | `packages/shared/src/services/graph/leiden-algorithm.ts`   | チェック対象   |
| 実装コード    | `packages/shared/src/services/graph/community-detector.ts` | チェック対象   |

---

## 成果物

| 成果物             | パス                                   | 内容             |
| ------------------ | -------------------------------------- | ---------------- |
| Lintレポート       | `outputs/phase-9/lint-report.md`       | ESLint実行結果   |
| 型チェックレポート | `outputs/phase-9/type-check-report.md` | TypeScript型検証 |
| 品質サマリー       | `outputs/phase-9/quality-summary.md`   | 品質チェック総括 |

---

## 統合テスト連携【必須】

品質保証後の統合テスト最終確認:

```bash
# 全テスト再実行
pnpm --filter @repo/shared test
pnpm --filter @repo/shared test:integration

# Lint実行
pnpm --filter @repo/shared lint

# 型チェック
pnpm --filter @repo/shared typecheck
```

---

## 品質チェック項目

### 1. ESLint チェック

```bash
pnpm --filter @repo/shared lint
```

- [ ] エラーが0件
- [ ] 警告が許容範囲内（10件以下）

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/shared typecheck
```

- [ ] 型エラーが0件
- [ ] 暗黙のany使用がない
- [ ] strictモードで合格

### 3. Prettier フォーマット

```bash
pnpm --filter @repo/shared format:check
```

- [ ] フォーマット違反が0件

### 4. テスト再実行

```bash
pnpm --filter @repo/shared test
```

- [ ] 全テストが成功
- [ ] カバレッジ基準を維持

---

## 品質基準

| チェック項目       | 基準        | 判定 |
| ------------------ | ----------- | ---- |
| ESLintエラー       | 0件         |      |
| ESLint警告         | 10件以下    |      |
| TypeScript型エラー | 0件         |      |
| Prettierエラー     | 0件         |      |
| テスト成功率       | 100%        |      |
| Line Coverage      | 80%以上維持 |      |

---

## 完了条件

- [ ] ESLintエラーが0件
- [ ] TypeScript型エラーが0件
- [ ] Prettierフォーマット違反が0件
- [ ] 全テストが成功
- [ ] カバレッジ基準を維持
- [ ] 品質サマリーが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                        | 結果 | 備考 |
| ----------------------------- | ---- | ---- |
| linting-formatting-automation |      |      |
| type-safety-patterns          |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-10-final-review.md`
