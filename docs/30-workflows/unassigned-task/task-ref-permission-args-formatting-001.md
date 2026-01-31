# PermissionDialog引数フォーマット改善 - タスク指示書

## メタ情報

```yaml
issue_number: 607
```

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | task-ref-permission-args-formatting-001                                 |
| タスク名     | PermissionDialog引数フォーマット改善                                    |
| 分類         | リファクタリング                                                        |
| 対象機能     | PermissionDialog（formatArgsヘルパー）、permissionDescriptions          |
| 優先度       | 中                                                                      |
| 見積もり規模 | 小規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | システム仕様書分析（ui-ux-agent-execution.md formatArgs仕様の拡張余地） |
| 発見日       | 2026-01-31                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ui-ux-agent-execution.mdの「formatArgsヘルパー」セクションでは、引数タイプ別の表示形式が定義されている（command→直接表示、path→直接表示、その他→JSON.stringify）。また、permissionDescriptionsのsafeStringヘルパーでは100文字超過時の切り詰め処理が行われている。しかし、現在の実装では引数の種類に関わらず一律の切り詰め処理が適用されており、ファイルパスの切り詰めではディレクトリ構造の情報が失われる問題がある。

### 1.2 問題点・課題

- 長いファイルパス（例: `/Users/user/projects/very-long-project-name/src/components/deeply/nested/Component.tsx`）が先頭100文字で切られ、ファイル名が見えない
- 複雑なJSON引数（ネストされたオブジェクト）がJSON.stringifyで1行表示され、可読性が低い
- command引数で長いコマンドチェーン（`&&`で連結）が途中で切れると、実行内容の全体像が把握困難
- 引数の種類に応じた最適な表示形式が適用されていない

### 1.3 放置した場合の影響

- ユーザーが権限確認で重要な情報（実行ファイル名、最終コマンド等）を見落とすリスク
- 「詳細を表示」を毎回展開する操作負荷が増加し、Progressive Disclosureの効果が低減
- 初見ユーザーの理解度が低下し、不適切な権限判断につながる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

引数の種類（パス、コマンド、JSON）に応じた最適なフォーマット・切り詰め処理を実装し、権限確認時の情報可読性を向上する。

### 2.2 最終ゴール

- ファイルパスは「ベースネーム表示 + ホバーでフルパス」形式
- コマンドは「最初のコマンド + パイプ/チェーン数表示」形式
- JSON引数は「キーのみ表示 + 展開でフル構造」形式
- 切り詰め処理が引数タイプ別に最適化されている

### 2.3 スコープ

#### 含むもの

- formatArgsヘルパーのリファクタリング
- safeStringの引数タイプ別分岐追加
- パス表示のベースネーム抽出ロジック
- コマンド表示のチェーン解析ロジック
- ユニットテスト

#### 含まないもの

- シンタックスハイライト（別タスク候補）
- 引数のコピー機能
- 引数の検索機能

### 2.4 成果物

| 成果物             | パス                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| formatArgs改善     | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`      |
| safeString拡張     | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts` |
| ユニットテスト追加 | 既存テストファイルにテストケース追加                                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-readable-ui-001が完了していること
- permissionDescriptions.tsのsafeString、PermissionDialog.tsxのformatArgsが存在すること

### 3.2 依存タスク

| タスクID                            | 状態 | 依存内容                         |
| ----------------------------------- | ---- | -------------------------------- |
| task-imp-permission-readable-ui-001 | 完了 | safeString、formatArgsベース実装 |

### 3.3 必要な知識

- TypeScript文字列操作
- Node.js path APIの概念（basename, dirname）
- JSON構造解析

### 3.4 推奨アプローチ

1. `formatArgValue(key: string, value: unknown): FormattedArg`関数を新規作成
2. key名からタイプ推定: file_path/path→パス型、command→コマンド型、その他→汎用型
3. パス型: `path.basename()`相当のブラウザ実装 + title属性でフルパス表示
4. コマンド型: `&&`/`|`で分割し先頭コマンド + 残数表示
5. 汎用型: Object.keys()表示 + 展開でフル構造
6. 既存テストを拡張し、新フォーマット処理のテストを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                                  |
| ----- | ---------------- | ------------------------------------- |
| 1-3   | 要件定義・設計   | フォーマットルール設計、UIモック      |
| 4     | テスト作成       | TDD: 各引数タイプのフォーマットテスト |
| 5     | 実装             | formatArgValue、safeString拡張        |
| 6-9   | テスト拡充・品質 | エッジケーステスト、リファクタリング  |
| 10-12 | レビュー・文書化 | 最終レビュー、仕様書更新              |

### Phase 4-5: テスト・実装

#### 目的

引数タイプ別のフォーマット処理を実装する。

#### 手順

1. `FormattedArg`型を定義: `{ display: string; full: string; type: 'path' | 'command' | 'json' | 'text' }`
2. `formatArgValue`関数を実装（key名ベースのタイプ推定）
3. パス型フォーマット: ブラウザ環境での`basename`相当処理
4. コマンド型フォーマット: チェーン解析（`&&`, `||`, `|`で分割）
5. PermissionDialogのformatArgs内で`formatArgValue`を使用
6. ホバー表示用のtitle属性またはTooltipコンポーネントを追加

#### 成果物

- formatArgValue関数
- PermissionDialog修正
- テストケース追加

#### 完了条件

- 各引数タイプで適切なフォーマットが適用されること
- フルパス/フルコマンドがホバーで確認可能なこと
- 既存テストが全てPASSすること

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイルパス引数がベースネーム形式で表示される
- [ ] コマンド引数がチェーン解析形式で表示される
- [ ] JSON引数がキーサマリー形式で表示される
- [ ] ホバーでフル情報が確認可能
- [ ] 既存の100文字切り詰めと互換性がある

### 品質要件

- [ ] テストカバレッジ Lines 95%以上
- [ ] 既存テスト全PASS（後方互換性）
- [ ] TypeScript strict modeでエラーなし

### ドキュメント要件

- [ ] ui-ux-agent-execution.mdのformatArgs仕様テーブルを更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                                  | 期待結果                                     |
| --- | --------------------------------------------- | -------------------------------------------- |
| 1   | パス `/a/b/c/d/very-long-name.tsx`            | 表示: `very-long-name.tsx`、ホバー: フルパス |
| 2   | コマンド `cd /tmp && ls -la && echo done`     | 表示: `cd /tmp (+ 2 commands)`               |
| 3   | JSON `{"key1": "value1", "nested": {"a": 1}}` | 表示: `{key1, nested}` 、展開でフル構造      |
| 4   | 短いパス `src/index.ts`                       | 表示: `src/index.ts`（切り詰めなし）         |
| 5   | null/undefined引数                            | 空文字列表示（safeString互換）               |

### 検証手順

1. `pnpm vitest run`で全テストがPASSすることを確認
2. 各引数タイプでPermissionDialogを目視確認
3. ホバー表示が正しく動作することを確認

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                   |
| ------------------------------------ | ------ | -------- | -------------------------------------- |
| 既存テストとの互換性破壊             | 高     | 中       | 後方互換性を維持するフォールバック処理 |
| パス解析のクロスプラットフォーム問題 | 低     | 低       | `/`と`\`の両方をセパレータとして認識   |
| ホバー表示がモバイル環境で機能しない | 低     | 低       | Electron環境のためモバイル考慮は不要   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| formatArgs仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` L164-L170 |
| safeString仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` L230-L240 |
| permissionDescriptions実装 | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`                 |
| PermissionDialog実装       | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                      |

### 参考資料

- Node.js path.basename() ドキュメント
- MDN: title属性によるツールチップ表示

---

## 9. 備考

### 補足事項

- Electron環境（Chromium）で動作するため、ブラウザAPI制約は最小限
- safeString()の100文字制限は維持しつつ、切り詰め方法をタイプ別に最適化する方針
- formatArgValue()はpermissionDescriptions.tsに配置し、getDescription()と同じモジュールで管理
