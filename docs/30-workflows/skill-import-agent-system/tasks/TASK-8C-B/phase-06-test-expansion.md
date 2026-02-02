# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 6                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 目的

E2Eテストの品質を向上させ、エッジケースや追加シナリオをカバーする。

## 実行タスク

- エッジケーステスト追加: 境界値・異常系のテスト追加
- 安定性向上: フレーキーテスト対策、待機処理の改善
- アクセシビリティ検証: WAI-ARIA準拠の検証強化

## 参照資料

| 資料名            | パス                                               | 説明             |
| ----------------- | -------------------------------------------------- | ---------------- |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillSelection.e2e.ts` | Phase 4成果物    |
| UI/UX仕様         | `aiworkflow-requirements: ui-ux-design-system.md`  | アクセシビリティ |

## 実行手順

### 1. エッジケーステスト追加

**追加候補テストケース**:

| No  | テストケース                     | 検証内容                       |
| --- | -------------------------------- | ------------------------------ |
| 7   | スキルがない状態での表示         | スキル0件時のUI表示            |
| 8   | 複数回の選択切り替え             | 連続操作の安定性               |
| 9   | 長いスキル名の表示               | テキスト切り詰め・ツールチップ |
| 10  | Escapeキーでのドロップダウン閉じ | キーボード操作の網羅           |

### 2. テスト安定性向上

**フレーキーテスト対策**:

```typescript
// 明示的な待機を追加
await page.waitForSelector('[aria-label="スキルを選択"]', { state: "visible" });

// アニメーション完了待機
await page.waitForTimeout(100);

// 状態安定化待機
await page.waitForFunction(() => {
  const selector = document.querySelector('[aria-label="スキルを選択"]');
  return selector && !selector.classList.contains("loading");
});
```

### 3. アクセシビリティ検証強化

**ARIA属性検証**:

```typescript
it("should have proper ARIA attributes", async () => {
  const selector = page.locator('[aria-label="スキルを選択"]');

  // aria-haspopup
  await expect(selector).toHaveAttribute("aria-haspopup", "listbox");

  // aria-expanded（閉じた状態）
  await expect(selector).toHaveAttribute("aria-expanded", "false");

  // クリック後
  await selector.click();
  await expect(selector).toHaveAttribute("aria-expanded", "true");
});
```

## 統合テスト連携【必須】

| テストカテゴリ   | 検証項目                 | 目標 |
| ---------------- | ------------------------ | ---- |
| E2Eシナリオ      | スキル選択フローの全パス | 100% |
| エッジケース     | 境界値・異常系           | 80%+ |
| アクセシビリティ | ARIA属性・キーボード操作 | 100% |

## 成果物

| 成果物             | パス                                 | 説明           |
| ------------------ | ------------------------------------ | -------------- |
| 拡充テストレポート | `outputs/phase-6/test-expansion.md`  | 追加テスト一覧 |
| 安定性改善記録     | `outputs/phase-6/stability-fixes.md` | フレーキー対策 |

## 完了条件

- [ ] エッジケーステストが追加されている（最低2件）
- [ ] テストの安定性が向上している
- [ ] アクセシビリティ検証が含まれている
- [ ] 全テストが成功している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
