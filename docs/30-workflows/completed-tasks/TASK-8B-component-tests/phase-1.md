# Phase 1: 要件定義

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

4つのUIコンポーネント（SkillSelector, SkillImportDialog, PermissionDialog, SkillStreamingView）に対するコンポーネントテストの機能要件・非機能要件・受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: 各コンポーネントのテスト要件（レンダリング、インタラクション、アクセシビリティ）を抽出
- 受け入れ基準作成: 55テストケースそれぞれに検証可能な受け入れ基準を定義
- FR/NFR分類: テストの機能要件（テストケース合格）と非機能要件（カバレッジ、実行速度）を分類

## 参照資料

| 資料名                | パス                                                                                                 | 説明                         |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------- |
| タスク定義            | `docs/30-workflows/skill-import-agent-system/tasks/task-8b-component-tests.md`                       | TASK-8B元タスク仕様          |
| SkillSelector仕様     | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7a-skill-selector.md`         | SkillSelectorの実装仕様      |
| SkillImportDialog仕様 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7b-skill-import-dialog.md`    | SkillImportDialogの実装仕様  |
| PermissionDialog仕様  | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7c-permission-dialog.md`      | PermissionDialogの実装仕様   |
| ChatPanel統合仕様     | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7d-chat-panel-integration.md` | SkillStreamingViewの実装仕様 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                                        | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| テスト戦略・品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テストピラミッド・カバレッジ目標       |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | SkillSelector 28テストケース、WAI-ARIA |
| UI/UXデザイン原則          | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | WCAG 2.1 AA、キーボードナビゲーション  |
| エージェント実行UI         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                | PermissionDialog仕様、ストリーミングUI |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand Slice、forwardRef パターン     |

## 実行手順

### ステップ1: コンポーネント仕様の確認

各コンポーネントの実装ファイルを読み、以下を確認する:

1. **SkillSelector** (`apps/desktop/src/renderer/components/skill/SkillSelector.tsx`)
   - Props定義とデフォルト値
   - 使用しているStoreの状態・アクション（`useSkillStore`）
   - ARIA属性とキーボードナビゲーション
   - 条件付きレンダリングロジック

2. **SkillImportDialog** (`apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`)
   - Props: `skill: SkillMetadata`, `isOpen: boolean`, `onClose: () => void`
   - サブリソース表示（agents, references, scripts, assets, schemas, indexes）
   - インポートアクション（Store経由）

3. **PermissionDialog** (`apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`)
   - 依存: `permissionDescriptions.ts`, `toolMetadata.ts`
   - 3アクションボタン（拒否・1回許可・許可）
   - rememberChoiceチェックボックス
   - リスクレベル表示

4. **SkillStreamingView** (`apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`)
   - Props: `skillName`, `messages`, `status`
   - メッセージ種別（assistant, tool_use, tool_result, error）
   - ステータスバッジ表示
   - 停止ボタン

### ステップ2: 要件の分類

| カテゴリ         | 要件種別 | テストケース例                    |
| ---------------- | -------- | --------------------------------- |
| レンダリング     | FR       | コンポーネントが正しく表示される  |
| インタラクション | FR       | ユーザー操作に正しく反応する      |
| 状態管理         | FR       | Store状態の変更が正しく反映される |
| アクセシビリティ | NFR      | ARIA属性が正しく設定されている    |
| キーボード操作   | NFR      | キーボードのみで操作可能          |
| パフォーマンス   | NFR      | テスト実行時間が10秒以内          |
| カバレッジ       | NFR      | Line/Function/Statement 80%以上   |

### ステップ3: 受け入れ基準の定義

各コンポーネントのテストケースごとに以下の形式で受け入れ基準を定義する:

```
Given: [前提条件]
When: [操作/イベント]
Then: [期待結果]
```

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                                         |
| ---------------- | ---------------------------------------------------------------- |
| Store接続        | `useSkillStore` / `useAppStore` のモック戦略定義                 |
| IPC通信          | `window.electronAPI.skill.*` のモック不要（Storeレベルでモック） |
| 型定義           | `@repo/shared` の型（SkillMetadata, SkillPermissionRequest等）   |

## アーキテクチャ層別要件（Renderer Process）

本タスクはRenderer Processのみに関係する:

| 層                         | 確認観点                                                        |
| -------------------------- | --------------------------------------------------------------- |
| フロントエンド（Renderer） | UIレンダリング、ユーザーインタラクション、状態表示              |
| 状態管理（Zustand）        | Storeモック戦略、セレクタパターンのテスト                       |
| アクセシビリティ           | WCAG 2.1 AA、WAI-ARIA Listboxパターン、キーボードナビゲーション |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                            | 確認項目                                       |
| ---------------- | ----------------------------------- | ---------------------------------------------- |
| UI/UX            | コンポーネントテスト要件 → **適用** | テスト要件がUI仕様を正しく反映しているか       |
| アクセシビリティ | a11yテスト要件 → **適用**           | WCAG 2.1 AA準拠のテスト要件が含まれているか    |
| セキュリティ     | テストコードのみ → **適用外**       | -                                              |
| パフォーマンス   | テスト実行速度 → **限定的適用**     | テスト実行時間が10秒以内の要件が含まれているか |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                               |
| -------------------------- | --------------------------------- | -------------------------------------- |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Process内のテスト要件が明確か |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                      |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                      |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                      |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                      |

## 成果物

| 成果物       | パス                                         | 説明                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 55テストケースの要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | テストケース別AC     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | テスト範囲と除外事項 |

## 完了条件

- [ ] 4コンポーネント×テストカテゴリの要件マトリックスが作成されている
- [ ] 55テストケースそれぞれにGiven/When/Then形式の受け入れ基準がある
- [ ] FR/NFRが分類されている（FR: テストケース合格、NFR: カバレッジ・速度・a11y）
- [ ] テスト対象のStore依存関係が特定されている
- [ ] 使用する型定義（@repo/shared）が列挙されている
- [ ] 接続要件（Storeモック・型定義）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（コンポーネント実装ファイル4件の読み込み）
2. SkillSelector要件抽出（15ケース分）
3. SkillImportDialog要件抽出（12ケース分）
4. PermissionDialog要件抽出（12ケース分）
5. SkillStreamingView要件抽出（16ケース分）
6. 受け入れ基準作成（55ケース分のGiven/When/Then）
7. FR/NFR分類と優先度設定
8. 成果物の作成・配置

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 1
```

## 次のPhase

Phase 2: 設計
