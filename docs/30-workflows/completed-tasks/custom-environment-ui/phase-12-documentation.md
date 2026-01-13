# Phase 12: ドキュメント作成

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 12                    |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

開発者向けおよびユーザー向けのドキュメントを作成する。

## 実行タスク

- 技術ドキュメント作成: コンポーネントAPI、型定義、使用方法
- スキル作成ガイド更新: 環境設定の記述方法
- セキュリティドキュメント: sandbox/CSP設定の説明
- 未タスク検出: 残課題の検出と記録

## 参照資料

| 資料名         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-results.md` | Phase 11成果物 |
| 設計書         | `outputs/phase-2/architecture-design.md`  | コンポーネント |
| 型定義         | `outputs/phase-2/type-definitions.md`     | TypeScript型   |

### システム仕様（aiworkflow-requirements）

> ドキュメント作成時に以下のシステム仕様を参照してください。

| 参照資料               | パス                                                                        | 内容               |
| ---------------------- | --------------------------------------------------------------------------- | ------------------ |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | Atomic Design準拠  |
| Agent SDK仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | agentSlice拡張仕様 |

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

---

## 作成するドキュメント

### 1. コンポーネントAPIドキュメント

```markdown
# ExecutionEnvironment

## 概要

エージェント実行時のカスタム環境を表示するコンポーネント。

## Props

| Prop            | 型              | 必須 | デフォルト | 説明               |
| --------------- | --------------- | ---- | ---------- | ------------------ |
| environmentType | EnvironmentType | ✓    | -          | 表示する環境タイプ |
| content         | PreviewContent  | -    | null       | 表示するコンテンツ |
| onRefresh       | () => void      | -    | undefined  | 更新ボタンハンドラ |

## 使用例

\`\`\`tsx
<ExecutionEnvironment
  environmentType="html"
  content={previewContent}
  onRefresh={handleRefresh}
/>
\`\`\`
```

### 2. スキル環境設定ガイド

```markdown
# スキルに環境設定を追加する

## SKILL.md での設定方法

スキルのSKILL.mdファイルに以下のセクションを追加します:

\`\`\`markdown

## Environment

| 項目        | 値   |
| ----------- | ---- |
| Type        | html |
| AutoRefresh | true |
| Debounce    | 500  |

\`\`\`

## 利用可能な環境タイプ

| タイプ   | 説明                           |
| -------- | ------------------------------ |
| none     | プレビューなし（デフォルト）   |
| html     | HTMLプレビュー                 |
| markdown | Markdownプレビュー             |
| terminal | ターミナル（将来実装予定）     |
| code     | コード実行環境（将来実装予定） |

## 設定オプション

| オプション  | 型      | デフォルト | 説明                     |
| ----------- | ------- | ---------- | ------------------------ |
| Type        | string  | "none"     | 環境タイプ               |
| AutoRefresh | boolean | true       | 自動更新を有効にする     |
| Debounce    | number  | 500        | 更新のデバウンス時間(ms) |
```

### 3. セキュリティドキュメント

```markdown
# HTMLプレビューのセキュリティ

## iframe sandboxによる分離

HTMLプレビューはsandbox付きiframe内で表示されます。

### sandbox属性

\`\`\`html

<iframe sandbox="allow-same-origin" ...>
\`\`\`

**許可されている機能:**

- allow-same-origin: CSSの読み込みに必要

**明示的に禁止されている機能:**

- スクリプト実行
- ポップアップ
- 親ウィンドウへのナビゲーション
- フォーム送信

## Content Security Policy

\`\`\`
default-src 'self';
script-src 'none';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'none';
frame-ancestors 'none';
form-action 'none';
\`\`\`

## HTMLサニタイズ

DOMPurifyを使用して危険なコンテンツを除去:

- `<script>`タグ
- `<iframe>`タグ
- `<object>`タグ
- `<embed>`タグ
- イベントハンドラ属性（onerror, onload等）
- javascript: URL
```

---

## ドキュメント配置先

| ドキュメント             | パス                                      |
| ------------------------ | ----------------------------------------- |
| コンポーネントAPI        | `docs/components/ExecutionEnvironment.md` |
| 型定義リファレンス       | `docs/types/environment.md`               |
| スキル環境設定ガイド     | `docs/guides/skill-environment-config.md` |
| セキュリティドキュメント | `docs/security/html-preview-security.md`  |

---

## 統合テスト連携【必須】

統合ポイントのドキュメントを作成する:

| 統合ポイント               | ドキュメント内容                  |
| -------------------------- | --------------------------------- |
| agentSlice拡張             | 新しい状態とアクションのAPI説明   |
| SplitLayout                | Props、使用方法、カスタマイズ方法 |
| ExecutionEnvironment       | 環境タイプごとの動作説明          |
| HTMLPreviewEnvironment     | セキュリティ設定、制限事項        |
| MarkdownPreviewEnvironment | Markdownレンダリングの仕様        |

---

## 成果物

| 成果物                   | パス                                           | 必須 | 説明                      |
| ------------------------ | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| コンポーネントAPI        | `outputs/phase-12/component-api.md`            |      | API説明                   |
| 型定義リファレンス       | `outputs/phase-12/type-reference.md`           |      | 型定義説明                |
| スキル環境設定ガイド     | `outputs/phase-12/skill-environment-guide.md`  |      | 設定ガイド                |
| セキュリティドキュメント | `outputs/phase-12/security-documentation.md`   |      | セキュリティ説明          |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書       | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] コンポーネントAPIドキュメントが作成されている
- [ ] 型定義リファレンスが作成されている
- [ ] スキル環境設定ガイドが作成されている
- [ ] セキュリティドキュメントが作成されている
- [ ] 統合ポイントのドキュメントが含まれている
- [ ] コード例が含まれている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 実装ガイド作成（Part 1: 概念的説明）
2. 実装ガイド作成（Part 2: 技術的詳細）
3. コンポーネントAPIドキュメント作成
   - SplitLayout
   - EnvironmentSelector
   - ExecutionEnvironment
   - HTMLPreviewEnvironment
   - MarkdownPreviewEnvironment
4. 型定義リファレンス作成
   - EnvironmentType
   - EnvironmentConfig
   - PreviewContent
5. スキル環境設定ガイド作成
6. セキュリティドキュメント作成
7. 統合ポイントのドキュメント作成
8. コード例の追加
9. システムドキュメント更新（aiworkflow-requirements等）
10. 未タスク検出レポート作成【必須】
11. 未完了タスク指示書作成（該当する場合）
12. 成果物の作成・配置
13. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 12
```

## 次のPhase

Phase 13: PR作成
