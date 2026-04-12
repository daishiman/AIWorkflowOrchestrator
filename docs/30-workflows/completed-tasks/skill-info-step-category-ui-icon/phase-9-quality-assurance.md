# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 9                                    |
| 名称       | 品質保証                             |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- lint / typecheck / test の全項目を一括判定する
- Phase 10 最終レビューへ進める品質水準に達しているかを確認する
- `[FB-UI-02-1]` 対応: 削除確認は「削除 OR stub 化かつ live import ゼロ」を PASS 基準とする

---

## 実行タスク

### Task 1: 品質チェックコマンド一括実行

```bash
# 1. TypeScript 型チェック
pnpm typecheck

# 2. ESLint
pnpm lint

# 3. テスト全件実行
pnpm vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx

# 4. ファイル削除確認（本タスクでは削除ファイルなし）
# 削除がある場合: git status で確認 + grep -rn "import.*削除ファイル名" src/ でゼロ件確認
```

### Task 2: 品質基準チェックリスト

| チェック項目                                 | 期待結果     | 実行コマンド              |
| -------------------------------------------- | ------------ | ------------------------- |
| TypeScript 型チェック                        | エラー 0件   | `pnpm typecheck`          |
| ESLint                                       | エラー 0件   | `pnpm lint`               |
| 全テスト（TC-IC/TT/A1/RG/EC/A2 計 20件）     | 全 PASS      | `pnpm vitest run ...`     |
| `CategoryOption` 型整合                      | 型エラーなし | `pnpm typecheck` 内で確認 |
| `aria-label` / `title` / `aria-hidden` 全5件 | DOM に存在   | テスト結果で確認          |
| 不要インポート・未使用変数                   | 0件          | ESLint で確認             |

### Task 3: link parity 確認

本タスクは IPC 変更・Props 変更・shared 型変更がないため、mirror parity 確認は不要。

確認項目：

- [ ] `CATEGORY_OPTIONS` 変数名が `phase-2-design.md` 設計と一致
- [ ] `CategoryOption` インターフェース名が `phase-2-design.md` 設計と一致
- [ ] 変更ファイルが inventory（phase-1-requirements.md Task 5）と一致

### Task 4: 品質保証サマリー記録

```
## 品質保証サマリー
実行日: YYYY-MM-DD

### typecheck
結果: PASS / FAIL
エラー件数: 0

### lint
結果: PASS / FAIL
警告件数: 0

### テスト
結果: PASS / FAIL
テスト件数: XX件
PASS: XX件 / FAIL: 0件

### 総合判定
PASS（Phase 10 へ進行可能）
```

---

## 参照資料

- `phase-8-refactoring.md` - リファクタリング後の状態
- `phase-4-test-creation.md` / `phase-6-test-expansion.md` - テストケース一覧

---

## 統合テスト連携

- 品質保証で全テスト結果（typecheck / lint / test）を確認
- 全項目 PASS で Phase 10 へ進める

---

## 成果物

| 成果物                           | 配置先                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Phase 9 品質保証書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-9-quality-assurance.md`      |
| 品質保証サマリー                 | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-9/quality-report.md` |

---

## 完了条件

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] 全テスト（20件）PASS
- [ ] 品質保証サマリーを `outputs/phase-9/quality-report.md` に記録

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: 品質チェックコマンド一括実行
- [ ] Task 2 完了: 品質基準チェックリスト確認
- [ ] Task 3 完了: link parity 確認
- [ ] Task 4 完了: 品質保証サマリー記録

---

## 次Phase

Phase 9 完了後 → **Phase 10: 最終レビューゲート** へ進む
