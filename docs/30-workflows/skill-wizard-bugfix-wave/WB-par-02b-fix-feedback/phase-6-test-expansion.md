# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 6                                                              |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 5（実装完了・TC-FEEDBACK-001〜007 Green）                |
| 後続Phase  | Phase 7                                                        |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

Phase 4で定義したテストに加え、フェイルパス・エッジケース・回帰ガードを追加し、
修正の安全性を広範に担保するテストスイートを完成させる。

## 追加テストケース

### フェイルパス（異常系）

#### TC-FEEDBACK-008: fetchSkillsが失敗してもステップ遷移が行われる

```typescript
it("TC-FEEDBACK-008: fetchSkills失敗時もステップ遷移は継続される", async () => {
  // Arrange
  const mockFetchSkills = vi.fn().mockRejectedValue(new Error("fetch failed"));
  // ...

  // Act
  await handleExecutePlan();

  // Assert
  expect(mockSetCurrentStep).toHaveBeenCalledWith("complete"); // 遷移は行われること
  // エラーログが出力されること（コンソールモックで確認）
});
```

#### TC-FEEDBACK-009: skillPathが空文字の場合の扱い

```typescript
it('TC-FEEDBACK-009: skillPathが空文字の場合はエラー表示される', () => {
  // Arrange
  render(<CompleteStep skillPath="" />);

  // Assert
  // 空文字はfalsyのため、nullと同等の扱いになることを確認
  // （実装仕様に応じて期待値を調整）
});
```

### エッジケース

#### TC-FEEDBACK-010: fetchSkillsがundefinedを返す場合でも正常動作する

```typescript
it("TC-FEEDBACK-010: fetchSkillsがundefinedを返す場合でも正常動作する", async () => {
  // Arrange
  const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
  // ...

  // Act
  await handleExecutePlan();

  // Assert
  expect(mockFetchSkills).toHaveBeenCalledTimes(1);
  expect(mockSetCurrentStep).toHaveBeenCalledWith("complete");
});
```

#### TC-FEEDBACK-011: CompleteStepがonRetryなしでもクラッシュしない

```typescript
it('TC-FEEDBACK-011: onRetryプロパティが未定義でもクラッシュしない', () => {
  // Arrange & Act
  expect(() => render(<CompleteStep skillPath={null} />)).not.toThrow();

  // Assert
  expect(screen.getByText(/スキルの生成に失敗しました/)).toBeInTheDocument();
});
```

### 回帰ガード

#### TC-FEEDBACK-012: LLMモードとtemplateモードのfetchSkills呼び出し回数

```typescript
it("TC-FEEDBACK-012: [回帰] LLMモード・templateモードそれぞれで1回ずつfetchSkillsが呼ばれる", async () => {
  // LLMモード
  await handleExecutePlan();
  expect(mockFetchSkills).toHaveBeenCalledTimes(1);

  mockFetchSkills.mockClear();

  // templateモード（回帰確認）
  await handleTemplateSubmit();
  expect(mockFetchSkills).toHaveBeenCalledTimes(1);
});
```

#### TC-FEEDBACK-013: 既存の完了画面コンテンツが維持される

```typescript
it('TC-FEEDBACK-013: [回帰] skillPath正常値時の既存完了画面コンテンツが維持される', () => {
  // Arrange
  render(<CompleteStep skillPath="/path/to/skill.ts" />);

  // Assert
  // 既存の完了画面で表示されていた要素が引き続き表示されること
  expect(screen.getByText(/✓.*スキルの骨格を生成しました/)).toBeInTheDocument();
});
```

## 回帰影響確認コマンド

```bash
# 変更ファイル関連テスト全件実行
pnpm vitest run --reporter=verbose \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.test.tsx \
  apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx

# 全テスト実行（回帰なし確認）
pnpm --filter @repo/desktop vitest run --reporter=verbose
```

## 参照資料

| 資料名               | パス                                       | 用途                   |
| -------------------- | ------------------------------------------ | ---------------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`            | 拡充対象のベーステスト |
| Phase 5 実装記録     | `outputs/phase-5/implementation-record.md` | 実装内容の確認         |

## 成果物

| 成果物             | パス                                     | 説明                          |
| ------------------ | ---------------------------------------- | ----------------------------- |
| 拡充テストケース書 | `outputs/phase-6/expanded-test-cases.md` | TC-FEEDBACK-008〜013 詳細定義 |

## 完了条件

- [ ] TC-FEEDBACK-008〜013が追加されていること
- [ ] 全テストケース（TC-FEEDBACK-001〜013）がGreen（PASS）であること
- [ ] 既存テストへの回帰影響がゼロであること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
