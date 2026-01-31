# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 6                              |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

Phase 5の基本実装テストに加え、エッジケース・境界値・追加ツールのテストを拡充し、品質を高める。

## 実行タスク

- Task 1: 残りのツールアイコンテスト追加 — 全10ツールの網羅テスト
- Task 2: エッジケーステスト追加 — 空文字列、大文字小文字
- Task 3: 複数回レンダリングテスト — アイコン表示の安定性確認

## 参照資料

| 資料名         | パス                                                                             | 説明           |
| -------------- | -------------------------------------------------------------------------------- | -------------- |
| Phase 4テスト  | `outputs/phase-4/test-specification.md`                                          | 基本テスト仕様 |
| Phase 5実装    | `outputs/phase-5/implementation-summary.md`                                      | 実装内容       |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | 既存テスト     |

## 実行手順

### ステップ1: 残りの定義済みツールテスト追加

Phase 4ではBash, Read, Writeの3ツールのみテストした。残り7ツールのテストを追加する。

```typescript
describe('全定義済みツールのアイコン表示', () => {
  const toolIconTestCases = [
    { toolName: 'Edit', expectedIcon: '📝' },
    { toolName: 'Glob', expectedIcon: '🔍' },
    { toolName: 'Grep', expectedIcon: '🔎' },
    { toolName: 'LS', expectedIcon: '📁' },
    { toolName: 'Task', expectedIcon: '📋' },
    { toolName: 'WebSearch', expectedIcon: '🌐' },
    { toolName: 'WebFetch', expectedIcon: '🌐' },
  ];

  it.each(toolIconTestCases)(
    '$toolNameツールのアイコン（$expectedIcon）が表示される',
    ({ toolName, expectedIcon }) => {
      mockPendingPermission = {
        executionId: 'exec-1',
        requestId: 'req-1',
        toolName,
        args: {},
      };
      render(<PermissionDialog />);
      expect(screen.getByText(expectedIcon)).toBeInTheDocument();
    }
  );
});
```

### ステップ2: エッジケーステスト追加

```typescript
describe('ツールアイコン エッジケース', () => {
  it('空文字列のツール名にデフォルトアイコンが表示される', () => {
    mockPendingPermission = {
      executionId: 'exec-1',
      requestId: 'req-1',
      toolName: '',
      args: {},
    };
    render(<PermissionDialog />);
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('大文字小文字が異なるツール名（bash）にデフォルトアイコンが表示される', () => {
    // TOOL_ICONSはケースセンシティブ（'Bash'のみ対応）
    mockPendingPermission = {
      executionId: 'exec-1',
      requestId: 'req-1',
      toolName: 'bash',
      args: {},
    };
    render(<PermissionDialog />);
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('非常に長いツール名でもアイコンが表示される', () => {
    mockPendingPermission = {
      executionId: 'exec-1',
      requestId: 'req-1',
      toolName: 'VeryLongToolNameThatDoesNotExistInMapping',
      args: {},
    };
    render(<PermissionDialog />);
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });
});
```

### ステップ3: WebSearchとWebFetchの同一アイコンテスト

```typescript
it('WebSearchとWebFetchは同じアイコン（🌐）を表示する', () => {
  // WebSearch
  mockPendingPermission = {
    executionId: 'exec-1',
    requestId: 'req-1',
    toolName: 'WebSearch',
    args: {},
  };
  const { unmount } = render(<PermissionDialog />);
  expect(screen.getByText('🌐')).toBeInTheDocument();
  unmount();

  // WebFetch
  mockPendingPermission = {
    executionId: 'exec-1',
    requestId: 'req-1',
    toolName: 'WebFetch',
    args: {},
  };
  render(<PermissionDialog />);
  expect(screen.getByText('🌐')).toBeInTheDocument();
});
```

### ステップ4: テスト実行

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

**期待結果**: 全テスト（既存+Phase 4+Phase 6追加分）がPASSする。

## 統合テスト連携

| テストカテゴリ | 影響 | 対応                       |
| -------------- | ---- | -------------------------- |
| UIレンダリング | あり | エッジケース含む網羅テスト |
| パラメトライズ | あり | it.eachによる網羅テスト    |

## 統合テストカバレッジ基準

### ユニットテストカバレッジ基準

| 指標     | 最低基準 | 推奨基準 |
| -------- | -------- | -------- |
| Line     | 80%+     | 90%+     |
| Branch   | 60%+     | 70%+     |
| Function | 80%+     | 90%+     |

### 結合テストカバレッジ基準

| 指標                 | 目標 |
| -------------------- | ---- |
| APIエンドポイント    | 100% |
| モジュール間接続     | 100% |
| 正常シナリオフロー   | 100% |
| エラーシナリオフロー | 80%+ |
| 外部連携ポイント     | 100% |

### カバレッジ測定コマンド

```bash
pnpm test:coverage      # ユニットテストカバレッジ
pnpm test:integration   # 統合テスト
```

## 多角的チェック観点（AIが判断）

| 観点               | 該当 | 確認内容                                               |
| ------------------ | ---- | ------------------------------------------------------ |
| テスト網羅性       | ✅   | 全10ツール＋エッジケースが網羅されているか             |
| UI/UX              | ✅   | テストがUI表示（アイコン位置、aria属性）を正しく検証か |
| エッジケース       | ✅   | 境界値（空文字列、大文字小文字、長い名前）が網羅的か   |
| パラメトライズ品質 | ✅   | it.eachテストケースが適切に構成されているか            |
| セキュリティ       | -    | 表示のみの変更、セキュリティテスト不要                 |
| パフォーマンス     | -    | テスト実行時間に問題がないか（軽微）                   |

## 成果物

| 成果物             | パス                                 | 説明                 |
| ------------------ | ------------------------------------ | -------------------- |
| テスト拡充レポート | `outputs/phase-6/coverage-report.md` | 追加テスト一覧と結果 |

## 完了条件

- [ ] 全10ツールのアイコン表示テストが存在する
- [ ] エッジケーステスト（空文字列、大文字小文字、長い名前）が追加されている
- [ ] WebSearch/WebFetch同一アイコンテストが追加されている
- [ ] 全テストがPASSしている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 残りのツールアイコンテスト追加（Task 1）
3. エッジケーステスト追加（Task 2）
4. 複数回レンダリングテスト（Task 3）
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
