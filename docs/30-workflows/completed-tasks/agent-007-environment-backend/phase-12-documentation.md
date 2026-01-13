# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 12                            |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- 未タスク検出: 残課題の検出と記録

## 参照資料

| 資料名       | パス                                         | 説明           |
| ------------ | -------------------------------------------- | -------------- |
| テスト結果   | `outputs/phase-11/manual-test-result.md`     | Phase 11成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物  |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物  |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物  |
| 品質レポート | `outputs/phase-9/quality-report.md`          | Phase 9成果物  |
| 最終レビュー | `outputs/phase-10/final-review-result.md`    | Phase 10成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                         | 内容               |
| -------------- | ---------------------------------------------------------------------------- | ------------------ |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Facadeパターン設計 |
| IPC設計        | `.claude/skills/aiworkflow-requirements/references/electron-ipc-design.md`   | IPC仕様            |

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的な説明

- Environment Backendとは何か（比喩を使った説明）
- なぜ必要なのか（XSS対策の重要性）
- どのように動作するか（データフロー図）

#### Part 2: 技術的な詳細

##### 型定義ドキュメント

```typescript
// ContentType - サポートするコンテンツタイプ
export type ContentType = "html" | "markdown" | "css" | "javascript" | "text";

// ExtractedContent - 抽出されたコンテンツ
export interface ExtractedContent {
  id: string;
  type: ContentType;
  content: string;
  language?: string;
  order: number;
  extractedAt: Date;
}

// SanitizedContent - サニタイズ済みコンテンツ
export interface SanitizedContent {
  id: string;
  type: ContentType;
  originalContent: string;
  sanitizedContent: string;
  removedElements: string[];
  sanitizedAt: Date;
}

// PreviewContent - プレビュー用コンテンツ
export interface PreviewContent {
  executionId: string;
  contents: SanitizedContent[];
  tempFilePath?: string;
  createdAt: Date;
}
```

##### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              AgentStateManager                   │    │
│  │                                                  │    │
│  │    preloadAPI.agent.extractContent()            │    │
│  │    preloadAPI.agent.getPreviewContent()         │    │
│  │    preloadAPI.agent.cleanupTempFiles()          │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │ IPC                              │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│                       ▼                                   │
│                 Main Process                              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │           EnvironmentService (Facade)            │    │
│  │                                                  │    │
│  │   ┌───────────────┐  ┌───────────────────────┐  │    │
│  │   │ContentExtractor│  │   ContentSanitizer    │  │    │
│  │   │               │  │   (DOMPurify)         │  │    │
│  │   └───────────────┘  └───────────────────────┘  │    │
│  │                                                  │    │
│  │   ┌───────────────┐  ┌───────────────────────┐  │    │
│  │   │TempFileManager │  │     PreviewCache      │  │    │
│  │   │               │  │                       │  │    │
│  │   └───────────────┘  └───────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

##### 使用例

```typescript
// コンテンツ抽出
const content = await preloadAPI.agent.extractContent(agentOutput);

// プレビュー取得
const preview = await preloadAPI.agent.getPreviewContent(executionId);

// クリーンアップ
await preloadAPI.agent.cleanupTempFiles();
```

##### セキュリティガイドライン

1. **XSS対策**: 全HTMLコンテンツはDOMPurifyでサニタイズ
2. **一時ファイル**: パーミッション0o600で作成
3. **クリーンアップ**: アプリ終了時に自動実行

### Phase 12-2: システムドキュメント更新

#### 更新対象

| 対象             | パス                                                                       | 更新条件     |
| ---------------- | -------------------------------------------------------------------------- | ------------ |
| 要件定義         | `docs/00-requirements/` 配下                                               | 新機能追加時 |
| システム仕様     | `.claude/skills/aiworkflow-requirements/references/`                       | 実装変更時   |
| Electron IPC仕様 | `.claude/skills/aiworkflow-requirements/references/electron-ipc-design.md` | IPC追加時    |

#### 更新原則

1. **整合性の確保**: 既存セクションと同等の詳細レベルで記述
2. **Single Source of Truth**: 概要のみ記載し、詳細は実装コードを参照
3. **構造の一貫性**: 既存フォーマットに従った記述形式

#### 本タスクで更新が必要な箇所

| 更新対象ファイル           | 必須更新内容                           |
| -------------------------- | -------------------------------------- |
| `architecture-patterns.md` | EnvironmentService追加（該当する場合） |
| `electron-ipc-design.md`   | 3つのIPCチャネル追加                   |

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      | Grepパターン例                                                                  |
| --- | ---------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                                              |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                                                             |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                                             |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                                      |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/environment/` |

#### 未タスク検出手順

```bash
# レビュー結果からMINOR指摘を抽出
grep -r "MINOR" outputs/phase-3/ outputs/phase-10/

# コードベースのTODO/FIXMEを検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/environment/

# 成果物から将来対応項目を抽出
grep -r "将来対応\|TODO\|FIXME" outputs/
```

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 関連ドキュメントが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実装ガイドPart 1作成（概念的説明）
3. 実装ガイドPart 2作成（技術的詳細）
4. システムドキュメント更新
5. aiworkflow-requirements更新確認
6. 未タスク検出
7. 未タスク検出レポート作成
8. 未タスク指示書作成（該当時）
9. 成果物の配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 12
```

## 次のPhase

Phase 13: PR作成
