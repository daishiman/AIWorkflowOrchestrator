# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 1                              |
| Phase名   | 要件定義                       |
| カテゴリ  | 要件                           |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | なし（TASK-7A/7B/7C 完了）     |
| 後続Phase | Phase 2                        |

## 目的

ChatPanel 統合に必要な要件を明確化し、既存コンポーネントの現状分析を行う。TASK-7A（SkillSelector）、TASK-7B（SkillImportDialog）、TASK-7C（PermissionDialog）の実装成果物を確認し、ChatPanel への統合要件を定義する。

## 実行タスク

### タスク1: 既存 ChatPanel コンポーネントの現状分析

**目的**: 統合対象となる ChatPanel の現在の構造・Props・依存関係を把握する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/` ディレクトリ内の全ファイルを確認する
2. ChatPanel.tsx が存在する場合はその構造を分析する（存在しない場合は新規作成要件として記録する）
3. StreamingMessage.tsx の Props とインターフェースを確認する
4. ChatPanel が依存しているストア（useAppStore）の状態・アクションを一覧化する
5. 既存のヘッダー構成（ModelSelector の配置位置）を確認する

**期待される成果物**:

- 既存 ChatPanel 構造分析レポート（`outputs/phase-1/chatpanel-analysis.md`）

### タスク2: TASK-7A/7B/7C 成果物の確認

**目的**: 統合対象コンポーネントのインターフェースと依存関係を正確に把握する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` を読み込み、Props を確認する
   - `onImportRequest` コールバックの型定義: `(skill: SkillMetadata) => void`
2. `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx` を読み込み、Props を確認する
   - `skill: SkillMetadata | null`、`isOpen: boolean`、`onClose: () => void`
3. `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` を読み込み、Props を確認する
   - Store-direct パターン（Props なし、useAppStore 内部使用）
4. `apps/desktop/src/renderer/components/skill/index.ts` のエクスポート内容を確認する
5. 各コンポーネントのテストファイルを確認し、テスト済みインターフェースを記録する

**期待される成果物**:

- コンポーネントインターフェース一覧（`outputs/phase-1/component-interfaces.md`）

### タスク3: SkillSlice の状態・アクション確認

**目的**: ChatPanel が使用する Zustand ストアの状態とアクションを明確化する。

**手順**:

1. `apps/desktop/src/renderer/store/slices/skillSlice.ts` を読み込む
2. ChatPanel 統合に必要な状態を特定する:
   - `selectedSkillName: string | null` — 選択中のスキル名表示
   - `streamingMessages: SkillStreamMessage[]` — ストリーミング表示
   - `isExecuting: boolean` — 実行中判定
   - `skillExecutionStatus: SkillExecutionStatus | null` — ステータスバッジ
   - `pendingPermission: SkillPermissionRequest | null` — 権限ダイアログ表示判定
3. ChatPanel 統合に必要なアクションを特定する:
   - `fetchSkills()` — スキル一覧取得（useEffect で初回呼び出し）
   - `abortExecution()` — 実行中止
4. `packages/shared/src/types/skill.ts` の型定義を確認する:
   - `SkillStreamMessage`（discriminated union: assistant/tool_use/tool_result/status/error）
   - `SkillExecutionStatus`（idle/running/permission_pending/completed/cancelled/error）
   - `SkillMetadata`

**期待される成果物**:

- ストア依存関係マップ（`outputs/phase-1/store-dependencies.md`）

### タスク4: UI/UX 仕様の要件抽出

**目的**: specification.md および aiworkflow-requirements から ChatPanel 統合の UI/UX 要件を抽出する。

**手順**:

1. `docs/30-workflows/skill-import-agent-system/specification.md` のセクション 4.1（既存チャット画面へのスキルセレクター統合）を読み込む
2. 同セクション 4.4.1（実行中ストリーミング表示）を読み込む
3. 同セクション 4.7（複数ツール実行時のUIフロー）を読み込む
4. `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md` を読み込む
5. `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` を読み込む
6. 以下の要件を抽出・文書化する:
   - SkillSelector の配置位置（ModelSelector の右隣）
   - ストリーミング表示のレイアウト（ステップベース表示、Apple HIG 準拠）
   - ステータスバッジの色・ラベル定義
   - ツール実行履歴の折りたたみ UI
   - 実行中止ボタンの表示条件

**期待される成果物**:

- UI/UX 要件定義書（`outputs/phase-1/ui-ux-requirements.md`）

### タスク5: 要件定義書の統合

**目的**: タスク1〜4の分析結果を統合し、Phase 2（設計）への入力となる要件定義書を作成する。

**手順**:

1. タスク1〜4の成果物を統合する
2. 機能要件（FR）を列挙する:
   - FR-1: SkillSelector を ChatPanel ヘッダーに配置する
   - FR-2: SkillStreamingView で実行結果をリアルタイム表示する
   - FR-3: StatusBadge でステータスを表示する
   - FR-4: ToolExecutionHistory でツール実行履歴を表示する
   - FR-5: SkillImportDialog をインポート要求時に表示する
   - FR-6: PermissionDialog を権限確認時に表示する
   - FR-7: 実行中止ボタンで abortExecution を呼び出す
3. 非機能要件（NFR）を列挙する:
   - NFR-1: 既存チャット機能に影響を与えない
   - NFR-2: アクセシビリティ（WCAG 2.1 AA）準拠
   - NFR-3: TypeScript 型安全性の維持

**期待される成果物**:

- 統合要件定義書（`outputs/phase-1/requirements-definition.md`）

## 参照資料

| 参照資料                 | パス                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| タスク定義書             | `docs/30-workflows/skill-import-agent-system/tasks/task-7d-chat-panel-integration.md` |
| 機能仕様書               | `docs/30-workflows/skill-import-agent-system/specification.md`                        |
| UI/UX SkillStreamDisplay | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`     |
| UI/UX エージェント実行   | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`          |
| インターフェース仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`     |
| 状態管理アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`          |
| UI/UX デザイン原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`        |

## 統合テスト連携

### このフェーズで特定すべき統合テスト観点

| カテゴリ           | テスト観点                                                         |
| ------------------ | ------------------------------------------------------------------ |
| データフロー       | SkillSlice → ChatPanel → SkillStreamingView のデータフロー         |
| 状態同期           | skillExecutionStatus/isExecuting の状態変更が UI に反映されるか    |
| コンポーネント連携 | SkillSelector の onImportRequest が SkillImportDialog を表示するか |
| 権限フロー         | pendingPermission 発生時に PermissionDialog が表示されるか         |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点             | 確認項目                                                         |
| ---------------- | ---------------------------------------------------------------- |
| UI/UX            | Apple HIG 準拠のレイアウト・ステップベース表示が要件に含まれるか |
| アクセシビリティ | WCAG 2.1 AA 準拠（aria-live、aria-busy、フォーカス管理）         |
| 状態管理         | useAppStore からの状態取得パターンが既存と一貫しているか         |

## 成果物

| 成果物               | パス                                         | 種別     |
| -------------------- | -------------------------------------------- | -------- |
| ChatPanel 構造分析   | `outputs/phase-1/chatpanel-analysis.md`      | document |
| コンポーネントIF一覧 | `outputs/phase-1/component-interfaces.md`    | document |
| ストア依存関係マップ | `outputs/phase-1/store-dependencies.md`      | document |
| UI/UX 要件定義書     | `outputs/phase-1/ui-ux-requirements.md`      | document |
| 統合要件定義書       | `outputs/phase-1/requirements-definition.md` | document |

## 完了条件

- [ ] 既存 ChatPanel の構造が分析され文書化されている
- [ ] TASK-7A/7B/7C の全コンポーネントの Props/インターフェースが確認されている
- [ ] SkillSlice の必要な状態・アクションが特定されている
- [ ] UI/UX 仕様から ChatPanel 統合要件が抽出されている
- [ ] 統合要件定義書が作成され、機能要件・非機能要件が列挙されている
- [ ] 統合テスト観点が特定されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 既存 ChatPanel コンポーネントの現状分析
3. タスク2: TASK-7A/7B/7C 成果物の確認
4. タスク3: SkillSlice の状態・アクション確認
5. タスク4: UI/UX 仕様の要件抽出
6. タスク5: 要件定義書の統合
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 1
```

## 次のPhase

Phase 2: 設計 → [phase-2-design.md](phase-2-design.md)
