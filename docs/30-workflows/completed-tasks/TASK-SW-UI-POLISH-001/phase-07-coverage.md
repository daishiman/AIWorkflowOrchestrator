# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 7                                                                              |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 6 完了済み（全テスト Green）                                             |
| 状態     | 未着手                                                                         |

## 目的

テストカバレッジを測定し、未カバーの分岐や dependency edge を可視化する。特に `handleCategoryClick` の全分岐とアニメーションクラスの確認が網羅されていることを検証する。

---

## 実行タスク

- カバレッジレポートの取得
- `handleCategoryClick` の全分岐カバレッジ確認
- ProgressBar transition クラスのカバレッジ確認
- CSS 変数監査の grep ベース静的テストのカバレッジ確認
- 未カバー箇所の特定と対応方針の決定

---

## カバレッジ取得コマンド

```bash
# SkillInfoStep のカバレッジ取得
pnpm --filter @repo/desktop test -- --testPathPattern="SkillInfoStep" --coverage

# ConversationRoundStep のカバレッジ取得
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep" --coverage

# 関連ファイル全体のカバレッジ
pnpm --filter @repo/desktop test -- --coverage --collectCoverageFrom="apps/desktop/src/renderer/components/skill/**/*.tsx"
```

---

## カバレッジ確認項目

### handleCategoryClick の分岐カバレッジ

```typescript
const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category.includes(value)) {
    // ← 分岐A: 選択済みカテゴリのクリック
    const next = formData.category.filter((c) => c !== value);
    onFormDataChange({ ...formData, category: next });
  } else if (formData.category.length < MAX_CATEGORY_COUNT) {
    // ← 分岐B: 上限未満
    const next = [...formData.category, value];
    onFormDataChange({ ...formData, category: next });
  }
  // ← 分岐C: 上限到達時（暗黙 else = 何もしない）
};
```

| 分岐 | 内容                   | テストケース        | カバレッジ |
| ---- | ---------------------- | ------------------- | ---------- |
| A    | 選択済みカテゴリを解除 | TC-04, TC-05, TC-11 | -          |
| B    | 上限未満で新規追加     | TC-02, TC-12        | -          |
| C    | 上限到達時に何もしない | TC-02, TC-03        | -          |

### isAtLimit フラグのカバレッジ

| 状態            | テストケース        | カバレッジ |
| --------------- | ------------------- | ---------- |
| isAtLimit=true  | TC-03, TC-04, TC-13 | -          |
| isAtLimit=false | TC-10, TC-11        | -          |

### アニメーションクラスのカバレッジ

| 確認項目                        | テストケース | カバレッジ |
| ------------------------------- | ------------ | ---------- |
| カテゴリボタン `transition-all` | TC-06        | -          |
| カテゴリボタン `duration-200`   | TC-06        | -          |
| ProgressBar `transition-all`    | TC-07        | -          |
| ProgressBar `duration-300`      | TC-07        | -          |
| ProgressBar 遷移後クラス保持    | TC-16        | -          |

---

## カバレッジ目標

| 対象ファイル                | 目標ライン | 目標ブランチ | 理由                             |
| --------------------------- | ---------- | ------------ | -------------------------------- |
| `SkillInfoStep.tsx`         | ≥ 85%      | ≥ 85%        | UI コンポーネント                |
| `ConversationRoundStep.tsx` | ≥ 80%      | ≥ 80%        | ProgressBar を含むコンポーネント |

---

## 未カバー箇所の対応方針

| 未カバー箇所            | 対応方針                                   |
| ----------------------- | ------------------------------------------ |
| E2E フロー全体（TC-10） | Phase 11 手動テストで目視確認              |
| CSS アニメーション実動  | Phase 11 で ライトテーマ・ダークテーマ確認 |
| hover 状態の CSS        | CSS 定義は静的確認、動的確認は Phase 11    |

---

## Phase 7 完了条件

- [ ] カバレッジレポートが取得済み
- [ ] `handleCategoryClick` の分岐A・B・C がすべてカバーされている
- [ ] `isAtLimit=true` / `isAtLimit=false` 両方がテストされている
- [ ] アニメーションクラス（transition-all、duration-200、duration-300）の存在確認テストがカバーされている
- [ ] CSS 変数監査の静的テストが実行済み
- [ ] ラインカバレッジが目標値（SkillInfoStep: 85%、ConversationRoundStep: 80%）を達成している
- [ ] 未カバー箇所の対応方針が記録済み
