# Phase 1: スコープ定義書

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | task-imp-permission-tool-metadata-001 |
| Issue  | #606                                  |
| 作成日 | 2026-01-31                            |

---

## スコープ境界

### 含むもの（In Scope）

| 項目                                  | 成果物パス                                                        |
| ------------------------------------- | ----------------------------------------------------------------- |
| リスクレベルデータ定義モジュール      | `apps/desktop/src/renderer/components/skill/toolMetadata.ts`      |
| PermissionDialog UIリスクバッジ追加   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` |
| リスクレベル別色定義（Tailwind CSS）  | PermissionDialog.tsx内のRISK_LEVEL_STYLESマッピング               |
| 各ツールの1行セキュリティ影響テキスト | toolMetadata.ts内のTOOL_METADATAマッピング                        |
| ユニットテスト                        | `__tests__/toolMetadata.test.ts`                                  |
| コンポーネントテスト                  | `__tests__/PermissionDialog.metadata.test.tsx`                    |

### 含まないもの（Out of Scope）

| 項目                                         | 理由                     |
| -------------------------------------------- | ------------------------ |
| リスクレベルの動的変更機能                   | 別タスクとして管理       |
| リスクレベルに基づく自動拒否ロジック         | 別タスクとして管理       |
| PermissionSettingsページへのリスクレベル表示 | 別タスクとして管理       |
| Main Process側の変更                         | Renderer Process内のみ   |
| IPC通信の追加                                | 静的データ定義のため不要 |
| SQLite/ファイルストレージ変更                | データ永続化対象外       |

---

## リスクレベル定義の確定

### 確定版テーブル

permissionDescriptions.tsの12ツールを基準とし、security-skill-execution.mdの値を基本に適用。

| ツール名     | リスクレベル | 根拠                                |
| ------------ | ------------ | ----------------------------------- |
| Bash         | High         | security-skill-execution.md: High   |
| Read         | Low          | security-skill-execution.md: Low    |
| Write        | Medium       | security-skill-execution.md: Medium |
| Edit         | Medium       | security-skill-execution.md: Medium |
| Glob         | Low          | security-skill-execution.md: Low    |
| Grep         | Low          | security-skill-execution.md: Low    |
| WebSearch    | Low          | security-skill-execution.md: Low    |
| Task         | Medium       | security-skill-execution.md: Medium |
| NotebookEdit | Medium       | 未定義 → デフォルト値Medium適用     |
| WebFetch     | Medium       | security-skill-execution.md: Medium |
| Skill        | Medium       | 未定義 → デフォルト値Medium適用     |
| AskUser      | Low          | 未定義 → ユーザー確認のみのため Low |

### デフォルト値

未定義ツールのデフォルトリスクレベル: **Medium**
デフォルトセキュリティ影響テキスト: **「ツールを実行します」**

---

## 影響範囲

### Electron層別影響

| 層                         | 影響有無 | 詳細                                      |
| -------------------------- | -------- | ----------------------------------------- |
| フロントエンド（Renderer） | あり     | toolMetadata.ts新規、PermissionDialog修正 |
| バックエンド（Main）       | なし     | 変更なし                                  |
| IPC通信                    | なし     | 新規IPC不要                               |
| Preload                    | なし     | contextBridge変更なし                     |
| ローカルストレージ         | なし     | SQLite/ファイル操作なし                   |

---

## リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                  |
| -------------------------------------- | ------ | -------- | ------------------------------------- |
| リスクレベル定義がsecurity仕様と不整合 | 高     | 低       | security-skill-execution.md準拠で統一 |
| リスクバッジが視覚的ノイズになる       | 中     | 中       | コンパクトデザイン採用                |
| 色覚多様性への対応不足                 | 中     | 中       | 色+テキストの2重表現                  |
| 既存テストの回帰                       | 中     | 低       | 既存テストスイート全件実行で確認      |
