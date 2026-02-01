# ツールアイコンの動的解決メカニズム - タスク指示書

## メタ情報

```yaml
issue_number: 635
```

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | task-imp-tool-icon-resolver             |
| タスク名     | ツールアイコンの動的解決メカニズム      |
| 分類         | 改善                                    |
| 対象機能     | PermissionDialog, PermissionHistoryItem |
| 優先度       | 低                                      |
| 見積もり規模 | 小規模                                  |
| ステータス   | 未実施                                  |
| 発見元       | Phase 11（手動テスト結果）              |
| 発見日       | 2026-02-01                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在、ツールアイコンはTOOL_ICONSという静的マッピング（10種類のemoji）で管理されている。未登録ツールはデフォルトの🔧が表示される。新しいツールが追加された場合、手動でマッピングを更新する必要がある。

### 1.2 問題点・課題

- 新しいツール追加時にTOOL_ICONS定数の手動更新が必要
- MCP経由で追加されるカスタムツールにはアイコンがない
- アイコン管理が分散している（PermissionDialogとPermissionHistoryItemで別々に参照）

### 1.3 放置した場合の影響

- ツール追加のたびにコード変更が必要
- カスタムツールの視認性が低い

---

## 2. 何を達成するか（What）

### 2.1 目的

ツールアイコンの動的解決メカニズムを実装し、新規ツールの自動アイコン割り当てを可能にする。

### 2.2 最終ゴール

- 登録済みツール: 既存のemoji表示
- 未登録ツール: ツール名のカテゴリ推定による自動アイコン選択
- カスタムアイコン設定可能

### 2.3 スコープ

#### 含むもの

- ToolIconResolverサービス作成
- カテゴリベースのフォールバックロジック
- PermissionDialog・PermissionHistoryItemでの統一利用

#### 含まないもの

- SVGカスタムアイコンのアップロード機能
- アイコンの永続化設定

### 2.4 成果物

- ToolIconResolver関数
- 既存コンポーネントのリファクタリング
- テストコード

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-tool-icons-001が完了していること（完了済み）
- task-imp-permission-history-001が完了していること（完了済み）

### 3.2 依存タスク

- task-imp-permission-tool-icons-001（完了済み）
- task-imp-permission-history-001（完了済み）

### 3.3 必要な知識

- TypeScript, React
- TOOL_ICONS定数の構造

### 3.4 推奨アプローチ

1. resolveToolIcon(toolName: string): string 関数を作成
2. 優先度: 静的マッピング → カテゴリ推定 → デフォルト
3. カテゴリ推定: ツール名にread/write/search等のキーワードが含まれる場合に関連アイコンを返す

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルのPhase 1-13に従って実行。主要ステップは以下の通り。

### Phase 1-2: 要件定義・設計

#### 目的

ToolIconResolver関数の設計とアイコン解決戦略を確定する。

#### 手順

1. 関数シグネチャ設計: `resolveToolIcon(toolName: string): string`（emoji文字列を返す）
2. 解決優先度設計: ① 静的TOOL_ICONSマッピング → ② カテゴリキーワード推定 → ③ デフォルト🔧
3. カテゴリキーワードマッピング設計: read/get→📖、write/create→✏️、search/find→🔍、delete/remove→🗑️ 等
4. 仕様書参照: `ui-ux-settings.md` L284（ツールアイコン表示仕様）、`interfaces-agent-sdk-ui.md`（TOOL_ICONS定数定義）

#### 成果物

- 要件定義書（Phase 1）
- 設計書（Phase 2）

### Phase 4-5: テスト作成・実装

#### 目的

TDDでResolver関数を実装し、既存コンポーネントを統合する。

#### 手順

1. `resolveToolIcon.ts`を`apps/desktop/src/renderer/components/skill/`に作成
2. 静的マッピング（既存TOOL_ICONS）→ カテゴリ推定 → デフォルトの3段階フォールバック実装
3. `PermissionDialog.tsx`の直接TOOL_ICONSアクセスを`resolveToolIcon()`呼び出しに置換
4. `PermissionHistoryItem.tsx`の直接TOOL_ICONSアクセスを`resolveToolIcon()`呼び出しに置換
5. テスト: 登録済みツール解決、カテゴリキーワード推定、デフォルトフォールバック、両コンポーネントでの統一性

#### 成果物

- `resolveToolIcon.ts`（Resolver関数）
- `PermissionDialog.tsx`（リファクタリング）
- `PermissionHistoryItem.tsx`（リファクタリング）
- 対応テストファイル

### Phase 8-9: リファクタリング・品質保証

#### 手順

1. TOOL_ICONS定数の重複排除が完了していることを確認
2. ESLint / TypeScript strict / カバレッジ基準の確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 登録済みツールに正しいアイコンが表示される
- [ ] 未登録ツールにカテゴリベースのアイコンが表示される
- [ ] PermissionDialogとPermissionHistoryItemで統一されたアイコンが表示される

### 品質要件

- [ ] Line Coverage 80%以上
- [ ] TypeScript strict PASS
- [ ] ESLint PASS

### ドキュメント要件

- [ ] 実装ガイド作成
- [ ] システム仕様書更新

---

## 6. 検証方法

### テストケース

- "Bash"に💻が返ること
- "CustomReadTool"に📖系のアイコンが返ること
- "UnknownTool"にデフォルトアイコンが返ること
- PermissionDialogとPermissionHistoryItemで同一アイコンが表示されること

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                                     |
| ------------------ | ------ | -------- | ---------------------------------------- |
| カテゴリ推定の誤り | 低     | 中       | フォールバックにデフォルトアイコンを設定 |
| 既存コードへの影響 | 中     | 低       | 既存のTOOL_ICONS互換性を維持             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`（TOOL_ICONS定数定義）
- `docs/30-workflows/TASK-IMP-permission-history-001/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`（L284: ツールアイコン表示仕様）
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`（L333-L434: permissionHistorySlice仕様）

### 参考資料

- Emojiカテゴリ分類パターン

---

## 9. 備考

### 補足事項

- Phase 11手動テスト結果#2「未登録ツールのデフォルトアイコン改善」として検出
- 現在の静的TOOL_ICONSマッピングは interfaces-agent-sdk-ui.md v1.3.1 で定義
