# PermissionSettingsリスクレベル表示 - タスク指示書

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | task-permission-settings-risk-display             |
| タスク名     | PermissionSettingsリスクレベル表示                |
| 分類         | 改善                                              |
| 対象機能     | PermissionSettings / toolMetadata                 |
| 優先度       | 低                                                |
| 見積もり規模 | 小規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | Phase 12（task-imp-permission-tool-metadata-001） |
| 発見日       | 2026-01-31                                        |
| issue_number | 626                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-tool-metadata-001でPermissionDialogにツールのリスクレベルバッジが表示されるようになった。しかし、ユーザーが全ツールのリスクレベルを一覧で確認できる画面は存在しない。設定画面のPermissionSettingsセクションにリスクレベル一覧を表示することで、ユーザーの理解を向上させる。

### 1.2 問題点・課題

- リスクレベルはPermissionDialog表示時にしか確認できない
- 全ツールのリスクレベルを俯瞰的に確認する手段がない
- セキュリティ設定の透明性が不足している

### 1.3 放置した場合の影響

- ユーザーがツールの使用時に初めてリスクレベルを知ることになる
- 影響度は低い（PermissionDialogで個別確認は可能）

---

## 2. 何を達成するか（What）

### 2.1 目的

設定画面のPermissionSettingsセクションに全ツールのリスクレベル一覧テーブルを表示する。

### 2.2 最終ゴール

- PermissionSettings画面にツール名・リスクレベル・セキュリティ影響テキストの一覧が表示される
- リスクレベルバッジはPermissionDialogと同じスタイル（RISK_LEVEL_STYLES）を使用
- ソート・フィルタ機能は不要（12ツール程度のため）

### 2.3 スコープ

#### 含むもの

- PermissionSettingsコンポーネントへのリスクレベル一覧テーブル追加
- toolMetadata.tsのデータ活用
- RISK_LEVEL_STYLESの共有化（必要に応じて）

#### 含まないもの

- リスクレベルの編集機能（別タスク: task-permission-risk-level-dynamic-change）
- 自動拒否設定UI（別タスク: task-permission-risk-level-auto-deny）

### 2.4 成果物

- PermissionSettings UIコンポーネント修正
- リスクレベル一覧表示コンポーネント
- ユニットテスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-tool-metadata-001が完了していること（完了済み）
- PermissionSettingsコンポーネントの構造を理解していること

### 3.2 依存タスク

- task-imp-permission-tool-metadata-001（完了済み）

### 3.3 必要な知識

- TypeScript、React
- Tailwind CSS
- toolMetadata.tsの公開API

### 3.4 推奨アプローチ

1. TOOL_METADATAの全エントリを取得する関数を追加（または既存APIを活用）
2. リスクレベル一覧テーブルコンポーネントを作成
3. PermissionSettingsに統合
4. TDDで実装

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PermissionSettings画面にリスクレベル一覧が表示される
- [ ] リスクレベルバッジがPermissionDialogと同じスタイル
- [ ] 全12ツール＋デフォルト情報が表示される

### 品質要件

- [ ] ユニットテストのカバレッジ80%以上
- [ ] 既存テスト（258テスト）が全てPASS
- [ ] WCAG 2.1 AA準拠のコントラスト比

### ドキュメント要件

- [ ] 実装ガイド

---

## 6. 検証方法

### テストケース

- リスクレベル一覧が全ツール分表示される
- バッジスタイルがPermissionDialogと一致する
- レスポンシブ表示の確認

### 検証手順

1. ユニットテスト実行
2. PermissionSettings画面の目視確認

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                 |
| ------------------------- | ------ | -------- | -------------------- |
| RISK_LEVEL_STYLES重複定義 | 低     | 中       | 共通モジュールに抽出 |

---

## 8. 参照情報

### 関連ドキュメント

- toolMetadata実装: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`
- PermissionDialog: `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`
- システム仕様: `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
元タスク仕様書（task-imp-permission-tool-metadata-001）のスコープ外項目として検出
```

### 補足事項

PermissionDialogで個別確認は既に可能であるため、優先度は低い。UX向上の観点での改善タスク。
