# Phase 2: 設計

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

コンポーネントテストのアーキテクチャ（モック戦略、テストデータファクトリ、共通ユーティリティ）を設計し、実装可能な構造に落とし込む。

## 実行タスク

- モック戦略設計: Zustand Storeのモック方法、vi.mockパターンの統一
- テストデータファクトリ設計: 各コンポーネントで使用するテストデータの生成関数
- 共通ユーティリティ設計: renderWithProviders等の共通テストヘルパー
- テストファイル構造設計: describe/itブロックの階層構造

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                     |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| テスト戦略           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | React Testing Library ベストプラクティス |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | テストパターン・品質メトリクス           |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand Slice設計原則                    |

## 実行手順

### ステップ1: Storeモック戦略の設計

既存テストパターンに基づき、Storeモック方法を統一する:

```typescript
// パターン: vi.mock + mockReturnValue
const mockUseSkillStore = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  useSkillStore: () => mockUseSkillStore(),
}));

// 各テスト内でStoreの状態をオーバーライド
beforeEach(() => {
  mockUseSkillStore.mockReturnValue(defaultStoreState);
  vi.clearAllMocks();
});
```

**設計判断ポイント**:

- `useSkillStore` のセレクタパターン（`useSkillStore(selector)`）をモック可能にする
- `useAppStore` との統合モック（一部コンポーネントが`useAppStore`を使用する場合）
- Store状態の部分オーバーライド（`...defaultStoreState` + 差分）

### ステップ2: テストデータファクトリの設計

各コンポーネントに必要なテストデータの生成関数を定義:

| ファクトリ名                   | 返却型                   | 用途                 |
| ------------------------------ | ------------------------ | -------------------- |
| `createMockSkillMetadata`      | `SkillMetadata`          | SkillImportDialog用  |
| `createMockImportedSkill`      | `ImportedSkill`          | SkillSelector用      |
| `createMockPermissionRequest`  | `SkillPermissionRequest` | PermissionDialog用   |
| `createMockStreamMessage`      | `SkillStreamMessage`     | SkillStreamingView用 |
| `createDefaultSkillStoreState` | `SkillSliceState`        | 全コンポーネント共通 |

### ステップ3: テストファイル構造の設計

各テストファイルの`describe`ブロック構造を設計:

**SkillSelector.test.tsx**:

```
describe("SkillSelector")
  ├── describe("rendering") → 3ケース
  ├── describe("dropdown interaction") → 4ケース
  ├── describe("skill selection") → 2ケース
  ├── describe("keyboard navigation") → 2ケース
  ├── describe("rescan") → 2ケース
  └── describe("accessibility") → 2ケース
```

**SkillImportDialog.test.tsx**:

```
describe("SkillImportDialog")
  ├── describe("rendering") → 6ケース
  ├── describe("import action") → 3ケース
  └── describe("close action") → 3ケース
```

**PermissionDialog.test.tsx**:

```
describe("PermissionDialog")
  ├── describe("rendering") → 6ケース
  ├── describe("deny action") → 2ケース
  ├── describe("approve once action") → 1ケース
  ├── describe("approve action") → 2ケース
  └── describe("remember checkbox") → 2ケース (※1ケースはrerender必要)
```

**SkillStreamingView.test.tsx**:

```
describe("SkillStreamingView")
  ├── describe("rendering") → 7ケース
  ├── describe("status badge") → 5ケース
  ├── describe("abort button") → 3ケース
  └── describe("tool execution history") → 2ケース（※1ケースは複合メッセージ）
```

### ステップ4: アサーション戦略の設計

| アサーション種別 | 使用ライブラリ                   | 用途                           |
| ---------------- | -------------------------------- | ------------------------------ |
| DOM存在確認      | `screen.getByRole/getByText`     | コンポーネントの表示確認       |
| DOM非存在確認    | `screen.queryByRole/queryByText` | 非表示/未レンダリング確認      |
| 属性確認         | `toHaveAttribute`                | ARIA属性の検証                 |
| 関数呼び出し確認 | `toHaveBeenCalledWith`           | Store アクションの呼び出し検証 |
| 状態変化確認     | `waitFor` + assertion            | 非同期状態変化の検証           |
| フォーカス確認   | `document.activeElement`         | キーボードナビゲーションの検証 |

## 統合テスト連携【必須】

| 統合ポイント           | 契約定義                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Store → コンポーネント | `useSkillStore` セレクタの返却型に準拠したモックデータ                                |
| Props → コンポーネント | `SkillMetadata`, `SkillPermissionRequest` 型に準拠したProps                           |
| コンポーネント → Store | `selectSkillByName`, `importSkill`, `respondToSkillPermission` 等のアクション呼び出し |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                               | 仕様参照先                                                         |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------ |
| UI/UX            | フロントエンドテスト実装 → **適用**    | `aiworkflow-requirements: ui-ux-design-principles.md`              |
| アクセシビリティ | UIコンポーネントテスト → **適用**      | `aiworkflow-requirements: ui-ux-design-principles.md`              |
| セキュリティ     | テストコードのみ → **適用外**          | -                                                                  |
| データ整合性     | Storeモック設計に関連 → **限定的適用** | `aiworkflow-requirements: architecture-implementation-patterns.md` |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                         |
| -------------------------- | -------------------------------- |
| フロントエンド（Renderer） | コンポーネントテスト → **適用**  |
| バックエンド（Main）       | テスト対象外 → **適用外**        |
| IPC通信                    | Storeレベルでモック → **適用外** |
| Preload/セキュリティ       | テスト対象外 → **適用外**        |

## 成果物

| 成果物           | パス                                          | 説明                         |
| ---------------- | --------------------------------------------- | ---------------------------- |
| テスト設計書     | `outputs/phase-2/test-architecture-design.md` | モック戦略・ファクトリ・構造 |
| テストデータ仕様 | `outputs/phase-2/test-data-specification.md`  | ファクトリ関数の仕様         |

## 完了条件

- [ ] Storeモック戦略が定義されている（`vi.mock` パターン統一）
- [ ] テストデータファクトリが5つ設計されている
- [ ] 4テストファイルの`describe`ブロック構造が設計されている
- [ ] アサーション戦略が定義されている
- [ ] 既存テストパターンとの整合性が確認されている
- [ ] 統合ポイント（Store↔コンポーネント）の契約が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（既存テストパターンの調査）
2. Storeモック戦略の設計
3. テストデータファクトリの設計
4. テストファイル構造の設計
5. アサーション戦略の設計
6. 成果物の作成・配置

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
