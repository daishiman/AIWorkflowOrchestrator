# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 4                              |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

TDDのRedフェーズとして、toolIconsアイコン表示機能の失敗するテストを先に作成する。実装前にテストを書くことで、期待する動作を明確化する。

## 実行タスク

- Task 1: アイコン表示テストの作成 — 定義済みツールのアイコン表示テスト
- Task 2: デフォルトアイコンテストの作成 — 未定義ツールのフォールバックテスト
- Task 3: アクセシビリティテストの作成 — aria-hidden属性の検証テスト
- Task 4: 既存テストの実行確認 — 全既存テストがPASSすることを確認

## 参照資料

| 資料名          | パス                                                                             | 説明               |
| --------------- | -------------------------------------------------------------------------------- | ------------------ |
| Phase 2設計書   | `outputs/phase-2/architecture-design.md`                                         | テストケース設計   |
| Phase 3レビュー | `outputs/phase-3/design-review-result.md`                                        | レビュー結果       |
| 既存テスト      | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | 既存テストパターン |
| テスト戦略      | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`          | テスト方針         |

## 実行手順

### ステップ1: 既存テストの実行確認

まず既存テストが全てPASSすることを確認する。

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

全テストがPASSすることを確認してからステップ2に進む。

### ステップ2: テストグループの追加

既存テストファイル `PermissionDialog.test.tsx` に以下のdescribeブロックを追加する。

追加位置: 既存の `describe` ブロックの後（ファイル末尾付近）

```typescript
describe("ツールアイコン表示", () => {
  // テストケースをここに追加
});
```

### ステップ3: 定義済みツールのアイコン表示テスト

```typescript
describe('ツールアイコン表示', () => {
  it('Bashツールのアイコン（💻）が表示される', () => {
    // mockPendingPermissionにtoolName: 'Bash'を設定
    // renderしてDOMに💻が含まれることを検証
    mockPendingPermission = {
      executionId: 'exec-1',
      requestId: 'req-1',
      toolName: 'Bash',
      args: { command: 'ls -la' },
    };
    render(<PermissionDialog />);
    expect(screen.getByText('💻')).toBeInTheDocument();
  });

  it('Readツールのアイコン（📖）が表示される', () => {
    mockPendingPermission = {
      executionId: 'exec-1',
      requestId: 'req-1',
      toolName: 'Read',
      args: { path: '/tmp/test.txt' },
    };
    render(<PermissionDialog />);
    expect(screen.getByText('📖')).toBeInTheDocument();
  });

  it('Writeツールのアイコン（✏️）が表示される', () => {
    mockPendingPermission = {
      executionId: 'exec-1',
      requestId: 'req-1',
      toolName: 'Write',
      args: { path: '/tmp/output.txt' },
    };
    render(<PermissionDialog />);
    expect(screen.getByText('✏️')).toBeInTheDocument();
  });
});
```

### ステップ4: デフォルトアイコンテスト

```typescript
it('未定義ツールにデフォルトアイコン（🔧）が表示される', () => {
  mockPendingPermission = {
    executionId: 'exec-1',
    requestId: 'req-1',
    toolName: 'UnknownTool',
    args: {},
  };
  render(<PermissionDialog />);
  expect(screen.getByText('🔧')).toBeInTheDocument();
});
```

### ステップ5: アクセシビリティテスト

```typescript
it('アイコン要素にaria-hidden="true"が付与されている', () => {
  mockPendingPermission = {
    executionId: 'exec-1',
    requestId: 'req-1',
    toolName: 'Bash',
    args: { command: 'echo test' },
  };
  const { container } = render(<PermissionDialog />);
  const iconElement = container.querySelector('[aria-hidden="true"]');
  expect(iconElement).toBeInTheDocument();
  expect(iconElement?.textContent).toBe('💻');
});

it('アイコンがツール名の前に配置されている', () => {
  mockPendingPermission = {
    executionId: 'exec-1',
    requestId: 'req-1',
    toolName: 'Bash',
    args: { command: 'echo test' },
  };
  const { container } = render(<PermissionDialog />);
  // バッジ要素のテキストコンテンツがアイコン→ツール名の順であることを検証
  const badge = container.querySelector('.font-mono');
  expect(badge?.textContent).toMatch(/💻.*Bash/);
});
```

### ステップ6: テスト実行（Red確認）

追加したテストが**失敗する**ことを確認する（TDD Redフェーズ）。

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

**期待結果**: 新規テストが失敗（FAIL）し、既存テストはPASSする。

## 統合テスト連携

| テストカテゴリ   | 影響 | 対応                                           |
| ---------------- | ---- | ---------------------------------------------- |
| UIレンダリング   | あり | アイコン表示テストを追加                       |
| a11y             | あり | aria-hidden属性テストを追加                    |
| スナップショット | 確認 | スナップショットテストがあれば更新が必要か確認 |

## 多角的チェック観点

| 観点               | 該当 | 確認内容                                               |
| ------------------ | ---- | ------------------------------------------------------ |
| UI/UX              | ✅   | 表示テストがUI要件をカバーしているか                   |
| アクセシビリティ   | ✅   | aria-hidden テストが含まれているか                     |
| エラーハンドリング | ✅   | 未定義ツールのデフォルトアイコンテストが含まれているか |

## アーキテクチャ層別テスト（AIが判断）

| 層               | テスト観点                 | テストファイル配置                       | 該当 |
| ---------------- | -------------------------- | ---------------------------------------- | ---- |
| Renderer Process | UIコンポーネント、状態管理 | `apps/desktop/src/renderer/**/*.test.ts` | ✅   |
| Main Process     | サービス、ビジネスロジック | `apps/desktop/src/main/**/*.test.ts`     | -    |
| IPC通信          | Main-Renderer連携          | `*.ipc.test.ts`                          | -    |
| Preload          | API公開、型安全性          | `apps/desktop/src/preload/**/*.test.ts`  | -    |
| Shared           | ユーティリティ、型定義     | `packages/shared/**/*.test.ts`           | -    |

→ 本タスクはRenderer Process層のUIコンポーネントテストのみ対象。

## 成果物

| 成果物       | パス                                    | 説明                 |
| ------------ | --------------------------------------- | -------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テスト一覧と期待結果 |

## 完了条件

- [ ] 既存テストが全てPASSしている
- [ ] アイコン表示テスト（TC-101〜TC-103）が作成されている
- [ ] デフォルトアイコンテスト（TC-104）が作成されている
- [ ] アクセシビリティテスト（TC-105〜TC-106）が作成されている
- [ ] 新規テストが全て失敗（Red）していることを確認
- [ ] テスト仕様書が `outputs/phase-4/` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 既存テストの実行確認（Task 4）
3. アイコン表示テストの作成（Task 1）
4. デフォルトアイコンテストの作成（Task 2）
5. アクセシビリティテストの作成（Task 3）
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
