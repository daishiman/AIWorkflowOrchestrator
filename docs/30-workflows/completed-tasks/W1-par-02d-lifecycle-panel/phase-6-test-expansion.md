# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| Phase名    | テスト拡充                                               |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 5: 実装                                            |
| 次Phase    | Phase 7: カバレッジ確認                                  |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

Phase 4 で作成したテストに加え、エッジケース・回帰テスト・アクセシビリティテストを拡充する。

## 実行タスク

### Task 1: エッジケーステスト追加

```typescript
describe("エッジケース", () => {
  it("onOpenSkillWizardが複数回クリックされても正常動作する", async () => {
    const onOpenSkillWizard = vi.fn();
    // ウィザードボタンを3回クリック → onOpenSkillWizard が3回呼ばれる
  });

  it("onCloseとonOpenSkillWizardが同時に渡されても干渉しない", () => {
    const onClose = vi.fn();
    const onOpenSkillWizard = vi.fn();
    // 両方のpropsを持つコンポーネントが正常にレンダリングされる
  });

  it("コンポーネントが再レンダリングされてもウィザードボタンが保持される", () => {
    // rerender でpropsを変更しても skill-lifecycle-open-wizard-button が存在する
  });
});
```

### Task 2: 回帰テスト追加（削除要素の永続的非存在確認）

削除した要素が将来的に誤って再追加されないよう、回帰テストとして明示する。

```typescript
describe("回帰テスト: 削除要素の永続的非存在", () => {
  it("[回帰] テキストエリアが復活していない", () => {
    // queryByTestId("skill-lifecycle-request-input") が null
    // ※ 誤って再追加されることを防止する回帰テスト
  });

  it("[回帰] 「スキルを生成する」ボタンが復活していない", () => {
    // queryByTestId("skill-lifecycle-create-button") が null
  });

  it("[回帰] 「方針を決める」ボタンが復活していない", () => {
    // queryByTestId("skill-lifecycle-prepare-button") が null
  });
});
```

### Task 3: アクセシビリティテスト追加

```typescript
describe("アクセシビリティ", () => {
  it("ウィザードボタンに type='button' が付与されている", () => {
    // skill-lifecycle-open-wizard-button の type 属性が "button"
  });

  it("セクション見出しが適切な heading レベルで表示される", () => {
    // 「1. スキルを作成する」が h3 要素として存在する
  });

  it("説明テキストが視覚的に区別可能なスタイルで表示される", () => {
    // 説明テキストが text-[var(--text-secondary)] クラスを持つ
  });
});
```

### Task 4: 既存セクションの保持確認テスト追加

「1. スキルを作成する」の変更が他のセクションに影響を与えていないことを確認する。

```typescript
describe("既存セクションの保持確認", () => {
  it("「2. スキルを確認する」セクションが存在する（影響なし）", () => {
    // 「スキルを確認する」または同等のテキストが存在する
  });

  it("SkillLifecyclePanelの全体構造が崩れていない", () => {
    // ルートコンテナが存在し、期待する子要素を持つ
  });
});
```

### Task 5: テスト実行・確認

```bash
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel
```

## 参照資料

| 資料名         | パス                                                                                 | 説明       |
| -------------- | ------------------------------------------------------------------------------------ | ---------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx` | 拡充対象   |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                 | 実装確認用 |

## 成果物

| 成果物         | パス                                                                                 | 説明                         |
| -------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| 拡充済みテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx` | エッジケース・回帰テスト含む |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md`                                                  | 追加テストケースの説明       |

## 完了条件

- [ ] エッジケーステストが追加されている（3件以上）
- [ ] 回帰テスト（削除要素の永続的非存在確認）が追加されている（3件）
- [ ] アクセシビリティテストが追加されている（3件以上）
- [ ] 既存セクションの保持確認テストが追加されている
- [ ] 全テストがpassしている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage.md)
