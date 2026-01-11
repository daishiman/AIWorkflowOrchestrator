# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 6                   |
| Phase名    | テスト拡充          |
| 前提Phase  | Phase 5             |
| 後続Phase  | Phase 7             |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

Phase 5（実装）完了後、カバレッジ目標達成に向けてテストを拡充する。フロントエンド・バックエンド統合テストを追加し、接続不良による不具合を事前に防止する。

## 背景

Phase 5で基本実装が完了した状態を前提に、以下の目標を達成するためのテストを追加する:

- ユニットテスト: Line 80%+, Branch 60%+, Function 80%+
- 結合テスト: API 100%, 正常系シナリオ 100%, 異常系 80%+

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ現状確認

**目的**: 現在のテストカバレッジを測定し、不足領域を特定する

**実行手順**:

1. カバレッジレポートを生成:

```bash
pnpm --filter @repo/desktop test:coverage
```

2. カバレッジレポートを確認し、不足領域を特定
3. 不足領域リストを作成

**期待される成果物**:

- カバレッジ分析レポート（`outputs/phase-6/coverage-analysis.md`）

---

### タスク2: エッジケーステストの追加

**目的**: 境界値・エラーケースのテストを追加する

**実行手順**:

1. 以下のエッジケーステストを追加:

**SkillCard エッジケース**:

```typescript
describe('SkillCard Edge Cases', () => {
  it('should handle empty triggers array', () => {
    const skill = { ...mockSkill, triggers: [] };
    render(<SkillCard skill={skill} isSelected={false} onClick={jest.fn()} />);
    // トリガーバッジが表示されないことを確認
    expect(screen.queryByTestId('trigger-badge')).not.toBeInTheDocument();
  });

  it('should truncate long description', () => {
    const skill = { ...mockSkill, description: 'a'.repeat(200) };
    render(<SkillCard skill={skill} isSelected={false} onClick={jest.fn()} />);
    const description = screen.getByTestId('skill-description');
    expect(description).toHaveClass('line-clamp-2');
  });

  it('should handle special characters in name', () => {
    const skill = { ...mockSkill, name: 'skill-with-特殊文字' };
    render(<SkillCard skill={skill} isSelected={false} onClick={jest.fn()} />);
    expect(screen.getByText('skill-with-特殊文字')).toBeInTheDocument();
  });

  it('should handle undefined category', () => {
    const skill = { ...mockSkill, category: undefined };
    render(<SkillCard skill={skill} isSelected={false} onClick={jest.fn()} />);
    expect(screen.queryByTestId('category-badge')).not.toBeInTheDocument();
  });
});
```

**SkillList エッジケース**:

```typescript
describe('SkillList Edge Cases', () => {
  it('should handle large number of skills (100+)', () => {
    const manySkills = Array.from({ length: 100 }, (_, i) => ({
      ...mockSkill,
      id: `skill-${i}`,
      name: `skill-${i}`,
    }));
    render(
      <SkillList
        skills={manySkills}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter=""
        category={null}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(100);
  });

  it('should handle filter with no matches', () => {
    render(
      <SkillList
        skills={mockSkills}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter="zzzznonexistent"
        category={null}
      />
    );
    expect(screen.getByText('スキルがインポートされていません')).toBeInTheDocument();
  });

  it('should handle combined filter and category with no matches', () => {
    render(
      <SkillList
        skills={mockSkills}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter="tdd"
        category="security"
      />
    );
    expect(screen.getByText('スキルがインポートされていません')).toBeInTheDocument();
  });
});
```

2. テストを実行して成功することを確認

**期待される成果物**:

- エッジケーステストファイル（各コンポーネントに追加）

---

### タスク3: エラーハンドリングテストの追加

**目的**: エラー状態のテストを追加する

**実行手順**:

1. 以下のエラーハンドリングテストを追加:

```typescript
// SkillManagement.error.test.tsx
describe('SkillManagement Error Handling', () => {
  describe('API Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      jest.spyOn(window.skillAPI, 'listImported').mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/エラーが発生しました/i);
      });
    });

    it('should allow retry after error', async () => {
      const listImported = jest.spyOn(window.skillAPI, 'listImported');
      listImported.mockRejectedValueOnce(new Error('Network error'));

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      listImported.mockResolvedValueOnce(mockSkills);
      fireEvent.click(screen.getByRole('button', { name: /再試行/i }));

      await waitFor(() => {
        expect(screen.getByText('tdd-principles')).toBeInTheDocument();
      });
    });

    it('should handle timeout gracefully', async () => {
      jest.spyOn(window.skillAPI, 'listImported').mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText(/タイムアウト/i)).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle invalid skill data gracefully', async () => {
      jest.spyOn(window.skillAPI, 'listImported').mockResolvedValueOnce([
        { id: 'invalid' } as any, // 不完全なデータ
      ]);

      render(<AgentView />);

      await waitFor(() => {
        // エラーなく表示されることを確認（またはフォールバック表示）
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Import Error Handling', () => {
    it('should show error toast on import failure', async () => {
      jest.spyOn(window.skillAPI, 'import').mockRejectedValueOnce(
        new Error('Import failed')
      );

      render(<AgentView />);

      fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('tdd-principles'));
        fireEvent.click(screen.getByRole('button', { name: /インポート/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/インポートに失敗しました/i)).toBeInTheDocument();
      });
    });

    it('should rollback state on partial import failure', async () => {
      // 部分的なインポート失敗時の状態ロールバックをテスト
    });
  });

  describe('Delete Error Handling', () => {
    it('should show error toast on delete failure', async () => {
      jest.spyOn(window.skillAPI, 'remove').mockRejectedValueOnce(
        new Error('Delete failed')
      );

      render(<AgentView />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('tdd-principles'));
      });

      fireEvent.click(screen.getByRole('button', { name: /削除/i }));
      fireEvent.click(screen.getByRole('button', { name: /はい/i }));

      await waitFor(() => {
        expect(screen.getByText(/削除に失敗しました/i)).toBeInTheDocument();
      });
    });
  });
});
```

2. テストを実行して成功することを確認

**期待される成果物**:

- エラーハンドリングテストファイル

---

### タスク4: 統合テストの拡充

**目的**: 結合テストカバレッジを向上させる

**実行手順**:

1. 以下のカテゴリで統合テストを追加:

**API接続テスト**:

```typescript
describe('API Connection Tests', () => {
  it('should call listAvailable on import dialog open', async () => {
    const listAvailable = jest.spyOn(window.skillAPI, 'listAvailable');
    render(<AgentView />);

    fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

    await waitFor(() => {
      expect(listAvailable).toHaveBeenCalledTimes(1);
    });
  });

  it('should call import with correct skill IDs', async () => {
    const importFn = jest.spyOn(window.skillAPI, 'import');
    render(<AgentView />);

    fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('tdd-principles'));
      fireEvent.click(screen.getByLabelText('code-review'));
    });

    fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

    expect(importFn).toHaveBeenCalledWith(['skill-1', 'skill-2']);
  });

  it('should call remove with correct skill ID', async () => {
    const removeFn = jest.spyOn(window.skillAPI, 'remove');
    render(<AgentView />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('tdd-principles'));
    });

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));
    fireEvent.click(screen.getByRole('button', { name: /はい/i }));

    expect(removeFn).toHaveBeenCalledWith('skill-1');
  });
});
```

**データフローテスト**:

```typescript
describe('Data Flow Tests', () => {
  it('should update UI after successful import', async () => {
    render(<AgentView />);

    // 初期状態
    expect(screen.queryByText('new-skill')).not.toBeInTheDocument();

    // インポート
    jest.spyOn(window.skillAPI, 'listAvailable').mockResolvedValueOnce([
      { id: 'new-skill', name: 'new-skill', description: 'New', triggers: [], anchors: [], path: '', slug: '' },
    ]);
    jest.spyOn(window.skillAPI, 'import').mockResolvedValueOnce(undefined);
    jest.spyOn(window.skillAPI, 'listImported').mockResolvedValueOnce([
      ...mockSkills,
      { id: 'new-skill', name: 'new-skill', description: 'New', triggers: [], anchors: [], path: '', slug: '' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('new-skill'));
      fireEvent.click(screen.getByRole('button', { name: /インポート/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('new-skill')).toBeInTheDocument();
    });
  });

  it('should update UI after successful delete', async () => {
    render(<AgentView />);

    await waitFor(() => {
      expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    });

    jest.spyOn(window.skillAPI, 'remove').mockResolvedValueOnce(undefined);
    jest.spyOn(window.skillAPI, 'listImported').mockResolvedValueOnce(
      mockSkills.filter(s => s.id !== 'skill-1')
    );

    fireEvent.click(screen.getByText('tdd-principles'));
    fireEvent.click(screen.getByRole('button', { name: /削除/i }));
    fireEvent.click(screen.getByRole('button', { name: /はい/i }));

    await waitFor(() => {
      expect(screen.queryByText('tdd-principles')).not.toBeInTheDocument();
    });
  });
});
```

**状態同期テスト**:

```typescript
describe('State Synchronization Tests', () => {
  it('should sync filter state across components', async () => {
    render(<AgentView />);

    fireEvent.change(screen.getByPlaceholderText('スキルを検索...'), { target: { value: 'tdd' } });

    await waitFor(() => {
      expect(useStore.getState().skillFilter).toBe('tdd');
      expect(screen.getByText('tdd-principles')).toBeInTheDocument();
      expect(screen.queryByText('code-review')).not.toBeInTheDocument();
    });
  });

  it('should sync category state across components', async () => {
    render(<AgentView />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'testing' } });

    await waitFor(() => {
      expect(useStore.getState().skillCategory).toBe('testing');
    });
  });

  it('should sync selected skill state', async () => {
    render(<AgentView />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('tdd-principles'));
    });

    expect(useStore.getState().selectedSkill?.id).toBe('skill-1');
    expect(screen.getByRole('heading', { name: 'tdd-principles' })).toBeInTheDocument();
  });
});
```

2. テストを実行して成功することを確認

**期待される成果物**:

- 統合テストファイル（拡充版）

---

### タスク5: アクセシビリティテストの追加

**目的**: アクセシビリティ要件のテストを追加する

**実行手順**:

1. 以下のアクセシビリティテストを追加:

```typescript
describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<AgentView />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation through skill cards', async () => {
    render(<AgentView />);

    await waitFor(() => {
      expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    });

    // Tabでフォーカス移動
    userEvent.tab();
    expect(screen.getByText('tdd-principles').closest('button')).toHaveFocus();

    // Tabで次へ
    userEvent.tab();
    expect(screen.getByText('code-review').closest('button')).toHaveFocus();

    // Enterで選択
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(useStore.getState().selectedSkill?.name).toBe('code-review');
  });

  it('should trap focus in import dialog', async () => {
    render(<AgentView />);

    fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // 最後の要素からTabで最初へ戻る
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
      userEvent.tab();
      expect(focusableElements[0]).toHaveFocus();
    });
  });

  it('should announce loading state to screen readers', async () => {
    render(<AgentView />);

    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
  });

  it('should announce errors to screen readers', async () => {
    jest.spyOn(window.skillAPI, 'listImported').mockRejectedValueOnce(new Error('Error'));
    render(<AgentView />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });
});
```

2. テストを実行して成功することを確認

**期待される成果物**:

- アクセシビリティテストファイル

---

### タスク6: カバレッジレポート生成

**目的**: 最終カバレッジを測定し、目標達成を確認する

**実行手順**:

1. カバレッジレポートを生成:

```bash
pnpm --filter @repo/desktop test:coverage
```

2. カバレッジレポートを確認:
   - Line: 80%+ 達成確認
   - Branch: 60%+ 達成確認
   - Function: 80%+ 達成確認

3. カバレッジレポートを保存

**期待される成果物**:

- カバレッジレポート（`outputs/phase-6/coverage-report.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容           |
| ------------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| Phase 4成果物 | テストファイル群                                                            | 基本テスト     |
| Phase 5成果物 | 実装ファイル群                                                              | 実装           |

---

## 成果物

| 成果物                   | パス                                             | 内容             |
| ------------------------ | ------------------------------------------------ | ---------------- |
| カバレッジ分析レポート   | `outputs/phase-6/coverage-analysis.md`           | 不足領域分析     |
| エッジケーステスト       | 各コンポーネントテストに追加                     | 境界値テスト     |
| エラーハンドリングテスト | `__tests__/SkillManagement.error.test.tsx`       | エラーケース     |
| 統合テスト拡充           | `__tests__/SkillManagement.integration.test.tsx` | API/データフロー |
| アクセシビリティテスト   | `__tests__/SkillManagement.a11y.test.tsx`        | A11yテスト       |
| カバレッジレポート       | `outputs/phase-6/coverage-report.md`             | 最終カバレッジ   |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 6での統合テスト連携アクション

- 統合テストの拡充（全カテゴリのカバレッジ向上）:
  - API接続テスト: 100%
  - データフローテスト: 100%
  - エラーハンドリングテスト: 80%+
  - 状態同期テスト: 100%

---

## テストカバレッジ基準

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 | 現在 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -    |
| Branch Coverage   | 60%      | 70%      | -    |
| Function Coverage | 80%      | 90%      | -    |

### 結合テスト

| 指標                         | 目標 | 現在 |
| ---------------------------- | ---- | ---- |
| APIエンドポイント            | 100% | -    |
| モジュール間インターフェース | 100% | -    |
| 正常系シナリオ               | 100% | -    |
| 異常系シナリオ               | 80%+ | -    |
| 外部連携ポイント             | 100% | -    |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] エッジケーステストが追加されている
- [ ] エラーハンドリングテストが追加されている
- [ ] アクセシビリティテストが追加されている
- [ ] カバレッジレポートが出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-7-coverage-check.md`
