# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 4                                                              |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 3（設計レビューPASS）                                    |
| 後続Phase  | Phase 5                                                        |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

AC-1〜AC-5を検証するテストケースを定義し、TDD Red段階のテストスイートを作成する。

## 事前確認（TDD Red前）

| 確認項目                     | 確認方法                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| 既存テストファイルの命名規則 | `SkillCreateWizard.test.tsx` / `CompleteStep.test.tsx`の命名確認 |
| `fetchSkills`のモック方法    | 既存テストでのモックパターンを確認                               |
| `CompleteStep`のprops型定義  | `skillPath`プロパティの型（`string \| null`）を確認              |

## テストケース一覧

### AC-1/AC-2対応: fetchSkills呼び出し確認

#### TC-FEEDBACK-001: LLMモード成功時にfetchSkillsが呼ばれる

```typescript
describe("SkillCreateWizard - handleExecutePlan", () => {
  it("TC-FEEDBACK-001: LLMモード成功時にfetchSkillsが呼ばれる", async () => {
    // Arrange
    const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
    // ... セットアップ ...

    // Act
    await handleExecutePlan(); // LLMモード実行

    // Assert
    expect(mockFetchSkills).toHaveBeenCalledTimes(1); // fetchSkillsが1回呼ばれること
  });
});
```

#### TC-FEEDBACK-002: LLMモード失敗時にfetchSkillsが呼ばれない

```typescript
it("TC-FEEDBACK-002: LLMモード失敗時にfetchSkillsは呼ばれない", async () => {
  // Arrange
  // LLM実行が失敗するようにモック設定

  // Act
  await handleExecutePlan();

  // Assert
  expect(mockFetchSkills).not.toHaveBeenCalled();
});
```

#### TC-FEEDBACK-003: templateモードの既存動作が維持される（回帰）

```typescript
it("TC-FEEDBACK-003: [回帰] templateモード成功時のfetchSkills呼び出しが維持される", async () => {
  // Arrange
  // templateモードのセットアップ

  // Act
  await handleTemplateSubmit(); // templateモード実行

  // Assert
  expect(mockFetchSkills).toHaveBeenCalledTimes(1);
});
```

### AC-3対応: skillPath=null時のエラー表示

#### TC-FEEDBACK-004: skillPath=nullの場合エラーメッセージが表示される

```typescript
describe('CompleteStep', () => {
  it('TC-FEEDBACK-004: skillPath=nullの場合エラーメッセージが表示される', () => {
    // Arrange
    render(<CompleteStep skillPath={null} />);

    // Assert
    expect(screen.getByText(/スキルの生成に失敗しました/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /もう一度試す/ })).toBeInTheDocument();
  });
});
```

#### TC-FEEDBACK-005: skillPath=nullの場合成功ヘッダーが表示されない

```typescript
it('TC-FEEDBACK-005: skillPath=nullの場合成功ヘッダーが表示されない', () => {
  // Arrange
  render(<CompleteStep skillPath={null} />);

  // Assert
  expect(screen.queryByText(/スキルの骨格を生成しました/)).not.toBeInTheDocument();
});
```

### AC-4対応: skillPath=null時の成功ヘッダー非表示

上記TC-FEEDBACK-005で兼ねる。

### AC-5対応: skillPath正常値時の成功表示

#### TC-FEEDBACK-006: skillPathが正常値の場合成功ヘッダーが表示される

```typescript
it('TC-FEEDBACK-006: skillPathが正常値の場合成功ヘッダーが表示される', () => {
  // Arrange
  render(<CompleteStep skillPath="/path/to/skill.ts" />);

  // Assert
  expect(screen.getByText(/✓.*スキルの骨格を生成しました/)).toBeInTheDocument();
  expect(screen.queryByText(/スキルの生成に失敗しました/)).not.toBeInTheDocument();
});
```

#### TC-FEEDBACK-007: skillPathが正常値の場合エラーボタンが表示されない

```typescript
it('TC-FEEDBACK-007: skillPathが正常値の場合エラーボタンが表示されない', () => {
  // Arrange
  render(<CompleteStep skillPath="/path/to/skill.ts" />);

  // Assert
  expect(screen.queryByRole('button', { name: /もう一度試す/ })).not.toBeInTheDocument();
});
```

## テストコマンドスイート

```bash
# CompleteStepのテストのみ実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx

# SkillCreateWizardのテストのみ実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/SkillCreateWizard.test.tsx

# 両ファイルをまとめて実行
pnpm vitest run --reporter=verbose \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.test.tsx \
  apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx

# カバレッジ付き実行
pnpm vitest run --coverage --reporter=verbose \
  apps/desktop/src/renderer/components/skill/wizard/CompleteStep.test.tsx
```

## TDD実行手順

1. 既存テストファイル（`SkillCreateWizard.test.tsx` / `CompleteStep.test.tsx`）にTC-FEEDBACK-001〜007を追加する
2. Red状態（テスト失敗）で実行し、失敗を確認する
3. Phase 5（実装）で修正を行いGreenにする
4. Phase 6でエッジケースを追加する

## 参照資料

| 資料名               | パス                                      | 用途                   |
| -------------------- | ----------------------------------------- | ---------------------- |
| Phase 2 設計書       | `outputs/phase-2/design-spec.md`          | テストケース設計の参照 |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-report.md` | 設計確定内容の確認     |
| 既存ウィザードテスト | （Phase実行時に調査・特定）               | 命名規則・パターン確認 |

## 成果物

| 成果物                 | パス                                    | 説明                          |
| ---------------------- | --------------------------------------- | ----------------------------- |
| テストケース定義書     | `outputs/phase-4/test-cases.md`         | TC-FEEDBACK-001〜007 詳細定義 |
| テストコマンドスイート | `outputs/phase-4/test-command-suite.md` | 実行コマンド一覧              |

## 完了条件

- [ ] TC-FEEDBACK-001〜007がRed状態で実行確認されていること
- [ ] テスト命名規則が既存コードと整合していること
- [ ] テストコマンドスイートが記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
