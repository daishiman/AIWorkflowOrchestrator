# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| Phase名    | 品質保証                                   |
| 前提Phase  | Phase 8                                    |
| 後続Phase  | Phase 10                                   |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

lint / typecheck / 全テストが通ることを確認し、PR 準備が整っているか検証する。

---

## 品質チェックリスト

### 機能検証

- [ ] 全 governance テスト（TC-PATH-01〜TC-PATH-06 + 既存90件）が PASS している
- [ ] path-scoped deny が `execute` phase で機能している
- [ ] `improve` phase の対応（Phase 2 設計に従う）が機能している

### コード品質

- [ ] Lint エラーなし
- [ ] TypeScript 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] `RuntimeSkillCreatorFacade.ts` の branch coverage が 80%+ 達成

---

## 実行タスク

### タスク1: lint チェック

**実行コマンド**:

```bash
pnpm --filter @repo/desktop lint --quiet
```

**成功条件**: Exit code 0（errors なし、warnings のみ許容）

**期待される成果物**:

- lint 結果記録

### タスク2: typecheck

**実行コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
```

**成功条件**: Exit code 0（型エラーなし）

**期待される成果物**:

- typecheck 結果記録

### タスク3: 全 governance テスト実行

**実行コマンド**:

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**成功条件**: 全テスト PASS（既存90件 + TC-PATH-01〜06 の合計96件以上）

**期待される成果物**:

- テスト結果記録

### タスク4: 品質保証サマリー作成

**目的**: Phase 9 の結果を記録し、Phase 10 レビューの材料を準備する

**実行手順**:

1. lint、typecheck、テスト結果を `outputs/phase-9/quality-report.md` にまとめる
2. 全チェック PASS の場合は Phase 10 へ進む
3. 失敗がある場合は Phase 8（リファクタリング）へ戻る

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## 参照資料

| 参照資料           | パス                                  | 内容           |
| ------------------ | ------------------------------------- | -------------- |
| Phase 8 リファクタ | `outputs/phase-8/refactoring-log.md`  | リファクタ内容 |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.txt` | カバレッジ結果 |

---

## 成果物

| 成果物            | パス                                | 内容                      |
| ----------------- | ----------------------------------- | ------------------------- |
| quality-report.md | `outputs/phase-9/quality-report.md` | lint/typecheck/テスト結果 |

---

## 統合テスト連携

品質保証で統合テスト結果を確認する（governance 全体の PASS）。

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint --quiet` が EXIT:0
- [ ] `pnpm --filter @repo/desktop typecheck` が EXIT:0
- [ ] 全 governance テストが PASS（既存90件 + TC-PATH-01〜06）
- [ ] `RuntimeSkillCreatorFacade.ts` branch coverage が 80%+
- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-10-final-review.md`
