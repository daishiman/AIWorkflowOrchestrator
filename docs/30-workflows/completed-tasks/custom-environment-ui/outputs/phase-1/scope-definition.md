# スコープ定義: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 1                               |
| 作成日   | 2026-01-13                      |

---

## スコープ内（In Scope）

### 実装コンポーネント

| コンポーネント             | 階層      | 実装場所                                          |
| -------------------------- | --------- | ------------------------------------------------- |
| SplitLayout                | Organisms | `apps/desktop/src/renderer/components/organisms/` |
| ExecutionEnvironment       | Organisms | `apps/desktop/src/renderer/components/organisms/` |
| HTMLPreviewEnvironment     | Organisms | `apps/desktop/src/renderer/components/organisms/` |
| MarkdownPreviewEnvironment | Organisms | `apps/desktop/src/renderer/components/organisms/` |
| EnvironmentSelector        | Molecules | `apps/desktop/src/renderer/components/molecules/` |

### 状態管理

| 拡張対象   | 追加内容                                        |
| ---------- | ----------------------------------------------- |
| agentSlice | previewContent, selectedEnvironment, splitRatio |
| 永続化     | splitRatioのlocalStorage保存                    |

### 型定義

| 型名              | 定義場所                             |
| ----------------- | ------------------------------------ |
| EnvironmentType   | `packages/shared/src/types/agent.ts` |
| EnvironmentConfig | `packages/shared/src/types/agent.ts` |
| PreviewContent    | `packages/shared/src/types/agent.ts` |

### ユーティリティ

| ユーティリティ | 実装場所                                      |
| -------------- | --------------------------------------------- |
| sanitizeHTML   | `apps/desktop/src/renderer/utils/sanitize.ts` |

### セキュリティ機能

| 機能           | 実装内容                                  |
| -------------- | ----------------------------------------- |
| iframe sandbox | HTMLPreviewEnvironmentでsandbox属性を設定 |
| CSP            | iframe内でContent Security Policy適用     |
| HTMLサニタイズ | DOMPurifyによるXSS対策                    |

### サポートする環境タイプ

| 環境タイプ | 実装Phase | 説明                         |
| ---------- | --------- | ---------------------------- |
| none       | AGENT-006 | プレビューなし（デフォルト） |
| html       | AGENT-006 | HTMLプレビュー               |
| markdown   | AGENT-006 | Markdownプレビュー           |

---

## スコープ外（Out of Scope）

### 将来実装予定（AGENT-007以降）

| 環境タイプ | 説明                        | 予定Phase |
| ---------- | --------------------------- | --------- |
| terminal   | ターミナルエミュレータ      | AGENT-007 |
| code       | コード実行環境（Jupyter風） | AGENT-008 |

### 本Phaseでは実装しない機能

| 機能                             | 理由                        |
| -------------------------------- | --------------------------- |
| バックエンド環境管理API          | AGENT-007で実装予定         |
| Main Process連携                 | Renderer内で完結（現Phase） |
| ファイル保存機能                 | 本機能のスコープ外          |
| 複数プレビュータブ               | 本機能のスコープ外          |
| プレビュー履歴                   | 本機能のスコープ外          |
| プレビュー内でのインタラクション | セキュリティ上sandbox維持   |

---

## 依存関係

### 前提タスク（依存先）

| タスクID  | タスク名        | 依存内容                             |
| --------- | --------------- | ------------------------------------ |
| AGENT-004 | Skill Registry  | スキルにenvironmentConfig追加        |
| AGENT-005 | Agent Execution | agentSliceの基盤、ストリーミング機能 |

### 後続タスク（依存元）

| タスクID  | タスク名                   | 依存内容                        |
| --------- | -------------------------- | ------------------------------- |
| AGENT-007 | Backend Environment API    | terminal/code環境のバックエンド |
| AGENT-008 | Code Execution Environment | Jupyter風コード実行             |

---

## 制約事項

### 技術的制約

| 制約                        | 理由                 |
| --------------------------- | -------------------- |
| sandbox属性でスクリプト禁止 | セキュリティ要件     |
| CSPでconnect-src 'none'     | 外部通信の禁止       |
| Renderer内完結              | AGENT-006ではIPC不要 |

### リソース制約

| 制約                   | 対応                     |
| ---------------------- | ------------------------ |
| 100KB以上のHTML        | パフォーマンステスト必須 |
| 連続更新（デバウンス） | 500ms間隔でバッチ処理    |

---

## 実装優先度

### 高優先度（必須）

1. SplitLayout（分割レイアウト）
2. HTMLPreviewEnvironment（HTMLプレビュー + sandbox/CSP）
3. agentSlice拡張（状態管理）
4. sanitizeHTML（DOMPurifyサニタイズ）

### 中優先度（推奨）

5. EnvironmentSelector（環境切り替え）
6. MarkdownPreviewEnvironment（Markdownプレビュー）
7. キーボードアクセシビリティ
8. 分割比率の永続化

### 低優先度（Nice to Have）

9. アニメーション効果
10. ツールチップ

---

## 影響範囲

### 変更対象ファイル

| ファイル/ディレクトリ                                  | 変更内容                |
| ------------------------------------------------------ | ----------------------- |
| `packages/shared/src/types/agent.ts`                   | 型定義追加              |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 状態・アクション追加    |
| `apps/desktop/src/renderer/views/AgentExecutionView/`  | SplitLayout統合         |
| `apps/desktop/src/renderer/components/organisms/`      | 新規コンポーネント追加  |
| `apps/desktop/src/renderer/components/molecules/`      | EnvironmentSelector追加 |
| `apps/desktop/src/renderer/utils/`                     | sanitizeHTML追加        |

### 影響を受けない領域

| 領域               | 理由            |
| ------------------ | --------------- |
| Main Process       | Renderer内完結  |
| Web アプリ         | Desktop専用機能 |
| 既存のチャット機能 | 後方互換性維持  |
| スキル管理機能     | 独立機能        |

---

## 完了確認

- [x] スコープ内の実装対象が明確化されている
- [x] スコープ外の機能が明確化されている
- [x] 依存関係（前提・後続タスク）が整理されている
- [x] 制約事項が文書化されている
- [x] 実装優先度が定義されている
