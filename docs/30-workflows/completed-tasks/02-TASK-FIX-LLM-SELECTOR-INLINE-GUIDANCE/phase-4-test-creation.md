# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase番号  | 4                                                  |
| 機能名     | LLMモデル選択インラインガイダンス追加              |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE              |
| 作成日     | 2026-03-20                                         |
| ステータス | 作成済み                                           |
| 依存       | [Phase 3 設計レビュー](./phase-3-design-review.md) |

## 目的

Phase 2 設計に基づき、LLMGuidanceBanner コンポーネント・ChatView統合・WorkspaceChatPanel GuidanceBlock改善のテストケースを設計し、テストコードを作成する。TDD原則（Red → Green → Refactor）に従い、実装前にテストを完成させる。

## 実行タスク

### Task 1: テスト対象の特定

以下のファイルに対してテストを作成する:

| テスト対象                                                             | テストファイルパス                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       | `apps/desktop/src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx`                |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                   | `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx`                |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` |

**注意**: 既存テストの配置パターン確認:

- `ChatView.test.tsx` は `ChatView/` 直下（`__tests__/` ではない）
- `WorkspaceChatPanel.runtime.test.tsx` は `__tests__/` 配下、import は `from "../WorkspaceChatPanel"`
- 新規テストは `__tests__/` に配置し、既存パターンに合わせた import パスを使用する

### Task 2: LLMGuidanceBanner テストケース設計

#### TC-1: 表示/非表示制御

| テストID | テスト名                                 | 前提条件                                      | 期待結果                     |
| -------- | ---------------------------------------- | --------------------------------------------- | ---------------------------- |
| TC-1-1   | モデル未選択時にバナーが表示される       | selectedModelId=null, selectedProviderId=null | バナーが DOM に存在する      |
| TC-1-2   | modelIdのみ未選択でバナーが表示される    | selectedModelId=null, selectedProviderId="p1" | バナーが DOM に存在する      |
| TC-1-3   | providerIdのみ未選択でバナーが表示される | selectedModelId="m1", selectedProviderId=null | バナーが DOM に存在する      |
| TC-1-4   | 両方選択済みの場合バナーが表示されない   | selectedModelId="m1", selectedProviderId="p1" | バナーが DOM に存在しない    |
| TC-1-5   | 未選択→選択に変わった場合バナーが消える  | 初期: null → 更新: "m1"                       | 再レンダー後にバナーが消える |

#### TC-2: バナーコンテンツ

| テストID | テスト名                               | 前提条件             | 期待結果                                       |
| -------- | -------------------------------------- | -------------------- | ---------------------------------------------- |
| TC-2-1   | バナーに警告メッセージが表示される     | selectedModelId=null | "AIモデルが選択されていません"のテキストが存在 |
| TC-2-2   | バナーに設定画面へのボタンが存在する   | selectedModelId=null | ボタン要素が存在する                           |
| TC-2-3   | バナーに role="alert" が設定されている | selectedModelId=null | `role="alert"` 属性が存在する                  |

#### TC-3: インタラクション

| テストID | テスト名                                             | 前提条件             | 期待結果                           |
| -------- | ---------------------------------------------------- | -------------------- | ---------------------------------- |
| TC-3-1   | 設定ボタンクリックで onNavigateToSettings が呼ばれる | selectedModelId=null | onNavigateToSettings が1回呼ばれる |
| TC-3-2   | ボタンがキーボードフォーカス可能である               | selectedModelId=null | tab キーでフォーカス可能           |

### Task 3: ChatView 統合テストケース設計

#### TC-4: ChatView での統合

| テストID | テスト名                                                   | 前提条件                             | 期待結果                                |
| -------- | ---------------------------------------------------------- | ------------------------------------ | --------------------------------------- |
| TC-4-1   | モデル未選択時 ChatView に LLMGuidanceBanner が表示される  | selectedModelId=null                 | LLMGuidanceBanner がレンダリングされる  |
| TC-4-2   | バナーの設定ボタンで setCurrentView("settings") が呼ばれる | selectedModelId=null, ボタンクリック | setCurrentView が "settings" で呼ばれる |

### Task 4: WorkspaceChatPanel GuidanceBlock テストケース設計

#### TC-5: GuidanceBlock 改善

| テストID | テスト名                                              | 前提条件         | 期待結果                                |
| -------- | ----------------------------------------------------- | ---------------- | --------------------------------------- |
| TC-5-1   | モデル未選択時 GuidanceBlock に設定ボタンが表示される | モデル未選択状態 | 設定画面を開くボタンが DOM に存在する   |
| TC-5-2   | 設定ボタンクリックで設定画面へ遷移する                | ボタンをクリック | setCurrentView が "settings" で呼ばれる |

### Task 5: テストコード作成

**重要**: 作成前に同ディレクトリの既存テストファイルのインポートパスを必ず確認する（P63対策）。

```bash
# 既存テストのインポートパス確認
find apps/desktop/src/renderer/views/ChatView -name "*.test.tsx" | head -5
find apps/desktop/src/renderer/views/WorkspaceView -name "*.test.tsx" | head -5

# 既存テストのimport文を確認
grep -n "^import" apps/desktop/src/renderer/views/ChatView/__tests__/*.test.tsx 2>/dev/null || \
  grep -n "^import" apps/desktop/src/renderer/views/ChatView/*.test.tsx 2>/dev/null

# happy-dom環境確認（P39対策: userEvent禁止確認）
grep -n "environment\|testEnvironment" apps/desktop/vitest.config.ts
```

**P39対策**: happy-dom環境では `userEvent` を使用せず `fireEvent` を使用する。

**テストモック設計**:

```typescript
// セレクタは store/index.ts からエクスポートされている
vi.mock("@/renderer/store", () => ({
  useSelectedModelId: vi.fn(() => null),
  useSelectedProviderId: vi.fn(() => null),
  useSetCurrentView: vi.fn(() => mockSetCurrentView),
}));
```

## 参照資料

### システム仕様

| ファイル                                                                              | 用途                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------- |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-1-requirements.md`  | 受入条件・UI要件・アクセシビリティ基準   |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md`        | 設計仕様（テスト対象の定義）             |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-3-design-review.md` | レビュー指摘、未タスク化対象、ゲート判定 |
| `.claude/rules/02-code-quality.md`                                                    | テスト設計原則・カバレッジ基準           |

### プロジェクトルール

| ファイル                                 | 用途                                     |
| ---------------------------------------- | ---------------------------------------- |
| `.claude/rules/06-known-pitfalls.md#P39` | happy-dom環境でのuserEvent非互換対策     |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ依存（モノレポ）   |
| `.claude/rules/06-known-pitfalls.md#P63` | サブエージェントのインポートパス誤り防止 |

## 実行手順

### Step 1: 既存テスト環境の確認

```bash
# テストディレクトリ確認
ls apps/desktop/src/renderer/views/ChatView/
ls apps/desktop/src/renderer/views/WorkspaceView/

# 既存テストのインポートパターン確認（P63対策）
find apps/desktop/src/renderer/views -name "*.test.tsx" | head -10 | \
  xargs -I{} head -5 {}

# 既存テストのインポートパターン確認（P63対策）
grep -n "^import" apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx 2>/dev/null
grep -n "^import" apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.runtime.test.tsx 2>/dev/null
```

### Step 2: LLMGuidanceBanner テスト作成

TC-1〜TC-3 のテストケースを `LLMGuidanceBanner.test.tsx` に実装する。

```bash
# テストファイル作成後、実行確認
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx
```

### Step 3: ChatView 統合テスト作成

TC-4 のテストケースを `ChatView.guidance.test.tsx` に実装する。

### Step 4: WorkspaceChatPanel テスト作成

TC-5 のテストケースを `WorkspaceChatPanel.guidance.test.tsx` に実装する。

### Step 5: テスト実行（Red確認）

```bash
# 全テスト実行して Red になることを確認
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/__tests__/
```

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                        | パス                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| LLMGuidanceBanner テスト      | `apps/desktop/src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx`                |
| ChatView 統合テスト           | `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx`                |
| WorkspaceChatPanel 統合テスト | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` |

## 完了条件

- [ ] TC-1-1〜TC-1-5 のテストコードが作成されている
- [ ] TC-2-1〜TC-2-3 のテストコードが作成されている
- [ ] TC-3-1〜TC-3-2 のテストコードが作成されている
- [ ] TC-4-1〜TC-4-2 のテストコードが作成されている
- [ ] TC-5-1〜TC-5-2 のテストコードが作成されている
- [ ] happy-dom環境で `fireEvent` を使用している（userEvent不使用、P39対策）
- [ ] テストを `cd apps/desktop` から実行している（P40対策）
- [ ] テスト実行時に Red（失敗）になることが確認されている

## 次Phase

[Phase 5: 実装](./phase-5-implementation.md)
