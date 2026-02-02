# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 4                            |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

4つのUIコンポーネントに対する55のテストケースを作成する。テストは設計レビューで承認されたモック戦略・テストデータファクトリ・構造に基づいて実装する。

## 実行タスク

- SkillSelectorテスト作成: 15テストケースの実装
- SkillImportDialogテスト作成: 12テストケースの実装
- PermissionDialogテスト作成: 12テストケースの実装（※既存テスト拡張含む）
- SkillStreamingViewテスト作成: 16テストケースの実装

## 参照資料

| 資料名           | パス                                                                           | 説明             |
| ---------------- | ------------------------------------------------------------------------------ | ---------------- |
| テスト設計書     | `outputs/phase-2/test-architecture-design.md`                                  | Phase 2成果物    |
| テストデータ仕様 | `outputs/phase-2/test-data-specification.md`                                   | Phase 2成果物    |
| 設計レビュー     | `outputs/phase-3/design-review-result.md`                                      | Phase 3成果物    |
| TASK-8B元仕様    | `docs/30-workflows/skill-import-agent-system/tasks/task-8b-component-tests.md` | テストケース定義 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                           |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| テスト戦略           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | React Testing Library使用法    |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`   | WAI-ARIA Listbox、テストケース |

## 実行手順

### ステップ1: SkillSelector.test.tsx の作成

**ファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`

**15テストケース**:

| No  | describe             | it                           | 検証内容                              |
| --- | -------------------- | ---------------------------- | ------------------------------------- |
| 1   | rendering            | スキル未選択時の表示         | 「スキルを選択」ボタンと「なし」表示  |
| 2   | rendering            | 選択中スキル名表示           | `selectedSkillName`の表示             |
| 3   | rendering            | スキャン中の状態表示         | `isScanning=true`で「スキャン中」表示 |
| 4   | dropdown interaction | クリックで開く               | `listbox`ロールの存在確認             |
| 5   | dropdown interaction | 外側クリックで閉じる         | `listbox`ロールの非存在確認           |
| 6   | dropdown interaction | インポート済みセクション表示 | 「インポート済み」テキスト確認        |
| 7   | dropdown interaction | 利用可能セクション表示       | 「利用可能なスキル」テキスト確認      |
| 8   | skill selection      | スキル選択                   | `selectSkill("imported-skill")`呼出   |
| 9   | skill selection      | スキル選択解除               | `selectSkill(null)`呼出               |
| 10  | keyboard navigation  | Escapeで閉じる               | `{Escape}`後に`listbox`非表示         |
| 11  | keyboard navigation  | 矢印キーナビゲーション       | `activeElement`のrole="option"確認    |
| 12  | rescan               | 再スキャン実行               | `rescanSkills()`呼出確認              |
| 13  | rescan               | スキャン中はボタン無効       | `disabled`属性確認                    |
| 14  | accessibility        | ARIA属性                     | `aria-haspopup`、`aria-expanded`確認  |
| 15  | accessibility        | aria-expanded更新            | クリック後`aria-expanded="true"`確認  |

**実装パターン**:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillSelector } from "../SkillSelector";

const mockUseAppStore = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe("SkillSelector", () => {
  const defaultStoreState = {
    availableSkills: [
      {
        name: "available-skill",
        description: "...",
        agents: [],
        references: [],
      },
    ],
    importedSkills: [
      {
        name: "imported-skill",
        description: "...",
        agents: [{ filename: "agent1.md" }],
        references: [{ filename: "ref1.md" }],
      },
    ],
    selectedSkillName: null,
    isLoadingSkills: false,
    isScanning: false,
    selectSkill: vi.fn(),
    rescanSkills: vi.fn(),
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(defaultStoreState);
    vi.clearAllMocks();
  });
  // ... テストケース
});
```

### ステップ2: SkillImportDialog.test.tsx の作成

**ファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx`

**12テストケース**:

| No  | describe      | it                     | 検証内容                                |
| --- | ------------- | ---------------------- | --------------------------------------- |
| 1   | rendering     | isOpen=falseで非表示   | `dialog`ロールの非存在確認              |
| 2   | rendering     | スキル名・説明表示     | `test-skill`テキスト確認                |
| 3   | rendering     | 許可ツール表示         | `Bash`, `Read`, `Write`表示確認         |
| 4   | rendering     | agents一覧表示         | 「サブエージェント…2件」確認            |
| 5   | rendering     | references一覧表示     | 「参照資料…1件」確認                    |
| 6   | rendering     | 空セクション非表示     | `scripts: []`の場合「スクリプト」非表示 |
| 7   | import action | インポート実行         | `importSkill("test-skill")`呼出         |
| 8   | import action | ローディング状態       | `isImporting=true`でボタン無効          |
| 9   | import action | 成功後ダイアログ閉じる | `onClose()`呼出確認                     |
| 10  | close action  | キャンセルボタン       | `onClose()`呼出確認                     |
| 11  | close action  | 閉じるボタン           | `onClose()`呼出確認                     |
| 12  | close action  | インポート中は無効     | キャンセルボタン`disabled`確認          |

**テストデータ**:

```typescript
const mockSkill: SkillMetadata = {
  name: "test-skill",
  description: "Test skill description",
  allowedTools: ["Bash", "Read", "Write"],
  agents: [
    {
      filename: "agent1.md",
      relativePath: "agents/agent1.md",
      description: "Agent 1",
    },
    {
      filename: "agent2.md",
      relativePath: "agents/agent2.md",
      description: "Agent 2",
    },
  ],
  references: [
    {
      filename: "ref1.md",
      relativePath: "references/ref1.md",
      description: "Reference 1",
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};
```

### ステップ3: PermissionDialog.test.tsx の作成

**ファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`

**12テストケース**:

| No  | describe            | it                             | 検証内容                                    |
| --- | ------------------- | ------------------------------ | ------------------------------------------- |
| 1   | rendering           | pendingPermission nullで非表示 | `dialog`ロールの非存在確認                  |
| 2   | rendering           | ツール名表示                   | `Bash`テキスト確認                          |
| 3   | rendering           | Bashコマンド引数表示           | `ls -la /home/user`テキスト確認             |
| 4   | rendering           | ファイルパス引数表示           | Read+`/path/to/file.txt`確認                |
| 5   | rendering           | JSON引数表示                   | WebSearch+`"query": "test query"`確認       |
| 6   | rendering           | 理由表示                       | `List files in user directory`確認          |
| 7   | deny action         | 拒否ボタン                     | `respondToPermission(false, false)`呼出     |
| 8   | deny action         | 閉じるボタン                   | `respondToPermission(false, false)`呼出     |
| 9   | approve once action | 1回許可                        | `respondToPermission(true, false)`呼出      |
| 10  | approve action      | 許可（rememberなし）           | `respondToPermission(true, false)`呼出      |
| 11  | approve action      | 許可（rememberあり）           | チェック後`respondToPermission(true, true)` |
| 12  | remember checkbox   | チェックボックスリセット       | rerender後`not.toBeChecked()`確認           |

### ステップ4: SkillStreamingView.test.tsx の作成

**ファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`

**16テストケース**:

| No  | describe               | it                     | 検証内容                              |
| --- | ---------------------- | ---------------------- | ------------------------------------- |
| 1   | rendering              | スキル名表示           | `test-skill`テキスト確認              |
| 2   | rendering              | アシスタントメッセージ | テキスト内容の表示確認                |
| 3   | rendering              | パーシャルメッセージ   | `▌`カーソルの表示確認                 |
| 4   | rendering              | ツール使用通知         | 「ツール使用: Bash」表示確認          |
| 5   | rendering              | ツール結果（成功）     | 「完了」テキスト確認                  |
| 6   | rendering              | ツール結果（失敗）     | 「エラー: Command failed」確認        |
| 7   | rendering              | エラーメッセージ       | 「エラーが発生しました」+詳細確認     |
| 8   | status badge           | running表示            | 「実行中」テキスト確認                |
| 9   | status badge           | permission_pending表示 | 「権限確認」テキスト確認              |
| 10  | status badge           | completed表示          | 「完了」テキスト確認                  |
| 11  | status badge           | error表示              | 「エラー」テキスト確認                |
| 12  | status badge           | idleでバッジなし       | 「実行中/権限確認/完了/エラー」非表示 |
| 13  | abort button           | running時に表示        | 「停止」ボタン存在確認                |
| 14  | abort button           | completed時に非表示    | 「停止」ボタン非存在確認              |
| 15  | abort button           | クリックで実行         | `abortExecution()`呼出確認            |
| 16  | tool execution history | ツール履歴表示/非表示  | 「ツール実行履歴…1件」確認            |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                  | テストファイル                  |
| ------------------ | ----------------------------------------- | ------------------------------- |
| Store → UI         | Store状態変更に伴うUI再レンダリング       | 各 `*.test.tsx`                 |
| UI → Store         | ユーザー操作によるStoreアクション呼び出し | 各 `*.test.tsx`                 |
| エラーハンドリング | インポート失敗、実行エラー時のUI表示      | SkillImportDialog/StreamingView |
| 状態遷移           | `SkillExecutionStatus` 全状態のUI変化     | SkillStreamingView              |

## アーキテクチャ層別テスト（Renderer Process）

| 層               | テスト観点                                           | テストファイル配置                                      |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Renderer Process | UIコンポーネント描画、ユーザーインタラクション、a11y | `apps/desktop/src/renderer/components/skill/__tests__/` |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                        | 確認項目                             |
| ---------------- | ------------------------------- | ------------------------------------ |
| UI/UX            | テストでUI品質を検証 → **適用** | テストがUI仕様を正しく検証しているか |
| アクセシビリティ | a11yテストの品質 → **適用**     | WCAG基準のテストが十分か             |
| セキュリティ     | テストコードのみ → **適用外**   | -                                    |
| パフォーマンス   | テスト実行速度 → **限定的適用** | テスト実行時間が10秒以内か           |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                               |
| -------------------------- | --------------------------------- | -------------------------------------- |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Process内のテスト実装が適切か |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                      |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                      |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                      |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                      |

## 成果物

| 成果物                      | パス                                                                               | 説明             |
| --------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書                | `outputs/phase-4/test-specification.md`                                            | テスト設計の詳細 |
| テストケース一覧            | `outputs/phase-4/test-cases.md`                                                    | 55ケース一覧     |
| SkillSelector.test.tsx      | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`      | 15テストケース   |
| SkillImportDialog.test.tsx  | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx`  | 12テストケース   |
| PermissionDialog.test.tsx   | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`   | 12テストケース   |
| SkillStreamingView.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` | 16テストケース   |

## 完了条件

- [ ] SkillSelector.test.tsx に15テストケースが実装されている
- [ ] SkillImportDialog.test.tsx に12テストケースが実装されている
- [ ] PermissionDialog.test.tsx に12テストケースが実装されている
- [ ] SkillStreamingView.test.tsx に16テストケースが実装されている
- [ ] 各テストファイルが`vi.mock`でStoreをモックしている
- [ ] `userEvent.setup()` パターンが統一されている
- [ ] 非同期操作に`waitFor`が使用されている
- [ ] テストケース一覧ドキュメントが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド（Redステータスの場合もある：既存コンポーネントがあればGreenの可能性あり）
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/

# 確認項目
# - [ ] 55テストケースが認識されている
# - [ ] テスト結果を確認（既存コンポーネントが正しく実装されていればGreen）
```

## サブタスク管理

1. 参照資料の確認（Phase 2/3成果物、元タスク仕様のテストコード参照）
2. SkillSelector.test.tsx の実装（15ケース）
3. SkillImportDialog.test.tsx の実装（12ケース）
4. PermissionDialog.test.tsx の実装（12ケース）
5. SkillStreamingView.test.tsx の実装（16ケース）
6. テスト仕様書・ケース一覧の作成
7. 全テスト実行と結果確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
