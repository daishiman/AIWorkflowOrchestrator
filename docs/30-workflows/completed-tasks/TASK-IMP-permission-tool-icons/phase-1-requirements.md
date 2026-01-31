# Phase 1: 要件定義

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 1                              |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

PermissionDialogのツール名表示にEmojiアイコンを追加する機能の要件を明確化し、実装範囲・受入基準・制約を定義する。

## 実行タスク

- Task 1: 要件定義書の作成 — 機能要件・非機能要件を定義
- Task 2: 受入基準の作成 — テスト可能な受入基準を定義
- Task 3: スコープ定義の確認 — 含まれるもの・含まれないものを明確化

## 参照資料

| 資料名                     | パス                                                                                            | 説明                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| 未タスク指示書             | `docs/30-workflows/unassigned-task/task-imp-permission-tool-icons-001.md`                       | タスクの背景・目的・スコープ    |
| 元タスク仕様書             | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7c-permission-dialog.md` | toolIcons定義の出典             |
| PermissionDialog実装ガイド | `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md`          | 現在の実装状態の参照            |
| UI/UXデザインシステム      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                      | デザイントークン・8pxグリッド   |
| UI/UXデザイン原則          | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                  | Apple HIG準拠、アクセシビリティ |
| インターフェース仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | PermissionRequest型定義         |

## 実行手順

### ステップ1: 現状分析

現在のPermissionDialogのツール表示を確認する。

**現状**: ツール名はテキストバッジ（`bg-gray-200`背景、`font-mono`）で表示されており、視覚的なアイコンはない。

```tsx
// 現在のツール表示（PermissionDialog.tsx:152-164）
<div className="flex items-center gap-2 mb-2">
  <span className="text-xs text-gray-500">ツール:</span>
  <span className="px-2 py-0.5 bg-gray-200 rounded text-sm font-mono font-medium">
    {pendingPermission.toolName}
  </span>
</div>
```

### ステップ2: 機能要件の定義

以下の機能要件を定義する。

**FR-001: toolIconsマッピング定数**

- `toolIcons`定数をコンポーネント外にRecord<string, string>型で定義する
- 以下の10ツールに対応するEmoji アイコンを含める:

| ツール名  | アイコン | 意味         |
| --------- | -------- | ------------ |
| Bash      | 💻       | ターミナル   |
| Read      | 📖       | ファイル読取 |
| Write     | ✏️       | ファイル書込 |
| Edit      | 📝       | ファイル編集 |
| Glob      | 🔍       | パターン検索 |
| Grep      | 🔎       | 内容検索     |
| LS        | 📁       | ディレクトリ |
| Task      | 📋       | タスク実行   |
| WebSearch | 🌐       | Web検索      |
| WebFetch  | 🌐       | Webフェッチ  |

**FR-002: アイコン表示ロジック**

- ツール名の左側にアイコンを表示する
- アイコンとツール名の間に適切なギャップ（gap-1 = 4px）を設ける
- アイコンはインライン表示とし、バッジ内に収める

**FR-003: デフォルトアイコン**

- toolIconsに定義されていないツール名には🔧（レンチ）をデフォルト表示する
- ヘルパー関数 `getToolIcon(toolName: string): string` を定義する

### ステップ3: 非機能要件の定義

**NFR-001: アクセシビリティ**

- アイコンは装飾的要素とし、`aria-hidden="true"`を付与する
- スクリーンリーダーにはツール名テキストのみ読み上げられる
- WCAG 2.1 AA準拠を維持する

**NFR-002: パフォーマンス**

- toolIconsマッピングはモジュールスコープの定数として定義（再レンダリング時に再生成しない）
- 既存のレンダリングパフォーマンスに影響を与えない

**NFR-003: UI/UX整合性**

- 8pxグリッドシステムに準拠する（デザインシステム仕様）
- 既存のバッジスタイル（`bg-gray-200 rounded text-sm font-mono font-medium`）を維持する
- Apple HIG準拠のインタラクション設計を維持する

### ステップ4: 制約の定義

| 制約           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| 実装範囲       | PermissionDialog.tsxのみ修正（他コンポーネントは対象外） |
| アイコン形式   | Emojiのみ使用（カスタムSVGは対象外）                     |
| テスト環境     | Vitest + React Testing Library（jsdom環境）              |
| Electron互換性 | Chromiumベースのため絵文字表示は標準対応                 |

### ステップ5: 受入基準の作成

以下の受入基準を `outputs/phase-1/acceptance-criteria.md` に記載する。

| AC-ID  | 基準                                                     | 検証方法       |
| ------ | -------------------------------------------------------- | -------------- |
| AC-001 | Bashツール表示時に💻アイコンがツール名左側に表示される   | 自動テスト     |
| AC-002 | Readツール表示時に📖アイコンがツール名左側に表示される   | 自動テスト     |
| AC-003 | 未定義ツール表示時に🔧デフォルトアイコンが表示される     | 自動テスト     |
| AC-004 | 10種類のツールすべてにアイコンマッピングが定義されている | コードレビュー |
| AC-005 | アイコンにaria-hidden="true"が付与されている             | 自動テスト     |
| AC-006 | 既存の全テストがPASSする                                 | CI             |
| AC-007 | TypeScriptエラーが0件である                              | CI             |
| AC-008 | ESLintエラーが0件である                                  | CI             |

## 統合テスト連携

本タスクは既存コンポーネントの表示改善であり、新規IPCチャネルやAPI変更はない。統合テスト影響は最小限。

| テストカテゴリ   | 影響 | 対応                               |
| ---------------- | ---- | ---------------------------------- |
| UIレンダリング   | あり | 既存テストでアイコン表示を追加検証 |
| IPC通信          | なし | 変更なし                           |
| 状態管理         | なし | Zustand storeへの変更なし          |
| アクセシビリティ | あり | aria-hidden属性のテスト追加        |

## 多角的チェック観点

| 観点               | 該当 | 確認内容                                           |
| ------------------ | ---- | -------------------------------------------------- |
| セキュリティ       | -    | 表示のみの変更、入力処理なし                       |
| UI/UX（Apple HIG） | ✅   | アイコンサイズ・配置がHIG準拠か、8pxグリッド整合性 |
| アーキテクチャ     | -    | Rendererプロセス内の変更のみ                       |
| API設計            | -    | API変更なし                                        |
| データ整合性       | -    | データ変更なし                                     |
| エラーハンドリング | ✅   | 未定義ツール名に対するフォールバック               |
| インターフェース   | -    | 既存インターフェース変更なし                       |

## アーキテクチャ層別要件（AIが判断）

| 層                         | 確認観点                                       | 該当 |
| -------------------------- | ---------------------------------------------- | ---- |
| フロントエンド（Renderer） | UI要件、状態管理要件、UX要件                   | ✅   |
| バックエンド（Main）       | ビジネスロジック要件、システムアクセス要件     | -    |
| IPC通信                    | Main-Renderer間の通信要件                      | -    |
| セキュリティ               | 認証・認可、入力検証、Electronセキュリティ要件 | -    |
| データ                     | 永続化要件、データフロー要件                   | -    |

→ 本タスクはRenderer層（UI表示改善）のみに影響。他層への影響なし。

## 成果物

| 成果物     | パス                                         | 説明             |
| ---------- | -------------------------------------------- | ---------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受入基準   | `outputs/phase-1/acceptance-criteria.md`     | テスト可能な基準 |

## 完了条件

- [ ] 機能要件（FR-001〜FR-003）が定義されている
- [ ] 非機能要件（NFR-001〜NFR-003）が定義されている
- [ ] 受入基準（AC-001〜AC-008）が定義されている
- [ ] スコープ（含むもの・含まないもの）が明確化されている
- [ ] 制約が文書化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 要件定義書の作成（Task 1）
3. 受入基準の作成（Task 2）
4. スコープ定義の確認（Task 3）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 1
```

## 次のPhase

Phase 2: 設計
