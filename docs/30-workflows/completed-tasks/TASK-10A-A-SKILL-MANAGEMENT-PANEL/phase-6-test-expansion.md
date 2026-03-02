# Phase 6: テスト拡充

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 6                                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 5（実装）                                                                      |
| 次 Phase       | Phase 7（カバレッジ確認）                                                            |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

Phase 4-5 で作成したテスト（23 件）に対して、エッジケース・エラー状態・統合テスト・パフォーマンスのテストを追加し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の充足を目指す。

---

## 実行タスク

以下のタスクを順番に実行する。

---

### タスク 1: エッジケーステストの追加

**目的**: 境界値と特殊入力に対するコンポーネントの振る舞いを検証する

**追加テストケース（5 件）**:

```typescript
describe("エッジケース", () => {
  it("TC-024: スキル 0 件の場合、空状態メッセージが表示される", () => {
    currentStoreState = {
      ...defaultStoreState,
      importedSkills: [],
    };
    render(<SkillManagementPanel />);
    // 「スキルがありません」または同等のメッセージが表示されることを検証
  });

  it("TC-025: 検索結果 0 件の場合、該当なしメッセージが表示される", () => {
    render(<SkillManagementPanel />);
    const input = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(input, { target: { value: "存在しないスキル名" } });
    // 「検索結果がありません」または同等のメッセージが表示されることを検証
  });

  it("TC-026: 非常に長いスキル名（100文字）でもレイアウトが崩れない", () => {
    const longName = "a".repeat(100);
    currentStoreState = {
      ...defaultStoreState,
      importedSkills: [
        {
          ...defaultStoreState.importedSkills[0],
          name: longName,
        },
      ],
    };
    render(<SkillManagementPanel />);
    // longName がテキストとして存在し、コンポーネントがエラーなくレンダリングされることを検証
  });

  it("TC-027: description が空文字列のスキルが正常に表示される", () => {
    currentStoreState = {
      ...defaultStoreState,
      importedSkills: [
        {
          ...defaultStoreState.importedSkills[0],
          description: "",
        },
      ],
    };
    render(<SkillManagementPanel />);
    // スキル名が表示され、説明部分が空であってもエラーが発生しないことを検証
  });

  it("TC-028: 検索クエリに特殊文字（.*+?）を含めてもエラーが発生しない", () => {
    render(<SkillManagementPanel />);
    const input = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(input, { target: { value: ".*+?" } });
    // エラーが発生せず、結果（0件含む）が表示されることを検証
  });
});
```

---

### タスク 2: エラー状態テストの追加

**目的**: 非同期操作の失敗時のコンポーネント挙動を検証する

**追加テストケース（3 件）**:

```typescript
describe("エラー状態", () => {
  it("TC-029: fetchSkills が reject した場合、コンポーネントがクラッシュしない", async () => {
    mockFetchSkills.mockRejectedValueOnce(new Error("Network error"));
    await act(async () => {
      render(<SkillManagementPanel />);
    });
    // コンポーネントがエラーなくレンダリングされていることを検証
    // ヘッダー「スキル管理」が表示されていることを確認
  });

  it("TC-030: removeSkill が reject した場合、コンポーネントがクラッシュしない", async () => {
    mockRemoveSkill.mockRejectedValueOnce(new Error("Remove failed"));
    render(<SkillManagementPanel />);
    // 削除操作を実行
    const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    fireEvent.click(deleteButtons[0]);
    // 確認ダイアログの「削除する」ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /削除する/ }));
    });
    // コンポーネントがクラッシュしていないことを検証
  });

  it("TC-031: isLoadingSkills が true から false に変わるとスキル一覧が表示される", () => {
    currentStoreState = { ...defaultStoreState, isLoadingSkills: true };
    const { rerender } = render(<SkillManagementPanel />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();

    currentStoreState = { ...defaultStoreState, isLoadingSkills: false };
    rerender(<SkillManagementPanel />);
    expect(screen.getByText("skill-alpha")).toBeInTheDocument();
  });
});
```

---

### タスク 3: 統合テストの追加

**目的**: SkillCard と SkillManagementPanel の連携が正しく動作することを検証する

**追加テストケース（3 件）**:

```typescript
describe("統合テスト", () => {
  it("TC-032: SkillCard の onEdit が正しいスキル情報を渡す", () => {
    render(<SkillManagementPanel />);
    // skill-beta の編集ボタンをクリック
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    fireEvent.click(editButtons[1]); // 2番目のスキル（skill-beta）
    // エディタビューに skill-beta の情報が渡されていることを検証
    // （SkillEditor に skill prop が渡されるか、ビュー内に skill-beta の名前が表示されるかで判定）
  });

  it("TC-033: 削除後にリストビューが維持される", async () => {
    render(<SkillManagementPanel />);
    const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    fireEvent.click(deleteButtons[0]);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /削除する/ }));
    });
    // 現在のビューが list のままであることを検証（ヘッダー「スキル管理」が表示されている）
    expect(screen.getByText("スキル管理")).toBeInTheDocument();
  });

  it("TC-034: 検索後にビュー遷移して戻ると検索クエリがリセットされない", () => {
    render(<SkillManagementPanel />);
    const input = screen.getByPlaceholderText("スキルを検索...");
    fireEvent.change(input, { target: { value: "alpha" } });

    // 編集ビューに遷移
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    fireEvent.click(editButtons[0]);

    // リストビューに戻る（閉じる操作）
    // → 検索クエリが維持されていることを検証
  });
});
```

---

### タスク 4: アクセシビリティ拡充テストの追加

**目的**: キーボード操作とスクリーンリーダー対応を検証する

**追加テストケース（3 件）**:

```typescript
describe("アクセシビリティ拡充", () => {
  it("TC-035: 各スキルカードに role=listitem が付与されている", () => {
    render(<SkillManagementPanel />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2); // 2件のスキル
  });

  it("TC-036: 削除ボタンの aria-label にスキル名が含まれる", () => {
    render(<SkillManagementPanel />);
    expect(
      screen.getByRole("button", { name: "skill-alpha を削除" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "skill-beta を削除" })
    ).toBeInTheDocument();
  });

  it("TC-037: 検索入力フィールドに type=text が設定されている", () => {
    render(<SkillManagementPanel />);
    const input = screen.getByPlaceholderText("スキルを検索...");
    expect(input).toHaveAttribute("type", "text");
  });
});
```

---

### タスク 5: パフォーマンステストの追加

**目的**: 大量データでのレンダリングが正常に完了することを検証する

**追加テストケース（1 件）**:

```typescript
describe("パフォーマンス", () => {
  it("TC-038: 100件のスキルでエラーなくレンダリングされる", () => {
    const manySkills = Array.from({ length: 100 }, (_, i) => ({
      name: `skill-${String(i).padStart(3, "0")}`,
      description: `Description for skill ${i}`,
      path: `/skills/skill-${i}`,
      allowedTools: [],
      updatedAt: new Date("2026-01-01"),
      importedAt: new Date("2026-02-01"),
      status: "active" as const,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    }));
    currentStoreState = { ...defaultStoreState, importedSkills: manySkills };
    render(<SkillManagementPanel />);
    expect(screen.getAllByRole("listitem")).toHaveLength(100);
  });
});
```

---

### タスク 6: テスト実行と結果確認

**目的**: 追加テストを含む全テストが PASS することを確認する

**実行手順**:

1. 以下のコマンドでテストを実行する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

2. Phase 4 の 23 件 + Phase 6 の 15 件 = 合計 38 件が全て PASS であることを確認する
3. テスト実行結果を `outputs/phase-6/test-expansion-result.md` に記録する

**記録フォーマット**:

```markdown
# Phase 6 テスト拡充結果

## テスト件数

| カテゴリ                 | 件数   |
| ------------------------ | ------ |
| Phase 4（初期）          | 23     |
| Phase 6 エッジケース     | 5      |
| Phase 6 エラー状態       | 3      |
| Phase 6 統合テスト       | 3      |
| Phase 6 アクセシビリティ | 3      |
| Phase 6 パフォーマンス   | 1      |
| **合計**                 | **38** |

## 実行結果

- PASS: 38
- FAIL: 0
- 実行日時: YYYY-MM-DD HH:mm:ss（実行時に記録）
```

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装           | `phase-5-implementation.md`                                                                 | 実装済み仕様への回帰確認         |
| UI コンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | スキル管理 UI 仕様               |
| UI 機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能別テスト観点の補完           |
| UI デザイン原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG                        |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill, SkillMetadata 型  |
| IPC API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 統合テストの呼び出し契約確認     |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand 個別セレクタ設計         |
| テスト方針             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準                   |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | fireEvent 使い分けパターン       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P9, P31, P39, P40, P44, P45, P47 |

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物                     | パス                                                                                 | 説明                       |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| テストファイル（拡充済み） | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` | 38 件のテストケース        |
| テスト拡充レポート         | `outputs/phase-6/test-expansion-result.md`                                           | テスト件数と実行結果の記録 |

---

## 完了条件

- [ ] エッジケーステスト 5 件を追加した（TC-024〜TC-028）
- [ ] エラー状態テスト 3 件を追加した（TC-029〜TC-031）
- [ ] 統合テスト 3 件を追加した（TC-032〜TC-034）
- [ ] アクセシビリティ拡充テスト 3 件を追加した（TC-035〜TC-037）
- [ ] パフォーマンステスト 1 件を追加した（TC-038）
- [ ] 全 38 件のテストが PASS している
- [ ] テスト間で状態リーク（P9）が発生していない
- [ ] happy-dom 環境で fireEvent のみ使用している（P39 対策）
- [ ] `outputs/phase-6/test-expansion-result.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）
