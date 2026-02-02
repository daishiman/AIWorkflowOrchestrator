# 権限履歴の期間別フィルタリング - タスク指示書

## メタ情報

```yaml
issue_number: 632
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-imp-permission-date-filter     |
| タスク名     | 権限履歴の期間別フィルタリング      |
| 分類         | 改善                                |
| 対象機能     | PermissionHistoryPanel              |
| 優先度       | 中                                  |
| 見積もり規模 | 小規模                              |
| ステータス   | 完了                                |
| 発見元       | Phase 1（スコープ外項目）/ Phase 11 |
| 発見日       | 2026-02-01                          |
| 完了日       | 2026-02-02                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-history-001で権限履歴トラッキングUIが実装されたが、期間別フィルタリング（日付範囲指定）はスコープ外とされた。現在はツール名と判断結果のみでフィルタ可能。

### 1.2 問題点・課題

- 履歴が1000件まで蓄積されるため、特定期間の履歴を探すのに時間がかかる
- 「昨日の操作」「今週の操作」など時間ベースの検索ができない

### 1.3 放置した場合の影響

- 履歴が増えるにつれ、ユーザーが目的のエントリを見つけにくくなる
- ただし既存のツール名・判断結果フィルタで最低限の検索は可能

---

## 2. 何を達成するか（What）

### 2.1 目的

PermissionHistoryFilterに期間別フィルタリング機能を追加する。

### 2.2 最終ゴール

「今日」「過去7日」「過去30日」「カスタム範囲」の期間フィルタが動作する。

### 2.3 スコープ

#### 含むもの

- PermissionHistoryFilterに期間選択UIを追加
- PermissionHistoryFilterインターフェースにdateRange追加
- フィルタロジックの拡張

#### 含まないもの

- カレンダーピッカーUIの新規作成（既存ライブラリを使用）
- バックエンド/Main Processの変更

### 2.4 成果物

- PermissionHistoryFilter.tsx の拡張
- permissionHistory.ts のフィルタ型拡張
- PermissionHistoryPanel.tsx のフィルタロジック更新
- テストコード追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-history-001が完了していること

### 3.2 依存タスク

- task-imp-permission-history-001（完了済み）

### 3.3 必要な知識

- React, TypeScript, Zustand
- PermissionHistoryFilter/PermissionHistoryPanelの実装

### 3.4 推奨アプローチ

1. PermissionHistoryFilterインターフェースにdateRange?: { start?: string; end?: string }を追加
2. プリセット（今日/7日/30日/全て）と日付入力の2段階UI
3. PermissionHistoryPanelのフィルタロジックでtimestampベースのフィルタリングを追加

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルのPhase 1-13に従って実行。主要ステップは以下の通り。

### Phase 1-2: 要件定義・設計

#### 目的

PermissionHistoryFilter型の拡張設計とUI設計を確定する。

#### 手順

1. `PermissionHistoryFilter`インターフェースに`dateRange?: { start?: string; end?: string }`フィールドを追加する設計を定義
2. プリセット選択肢を決定: 全期間（デフォルト）/ 今日 / 過去7日 / 過去30日 / カスタム範囲
3. UIワイヤーフレーム作成: PermissionHistoryFilter.tsxに期間セレクトボックス1つ + カスタム時の日付入力2つを追加
4. 仕様書参照: `arch-state-management.md` L355-L368（permissionHistorySlice状態定義・アクション定義）、`ui-ux-settings.md` L286-L291（フィルタ仕様）

#### 成果物

- 要件定義書（Phase 1）
- 設計書（Phase 2）

### Phase 4-5: テスト作成・実装

#### 目的

TDDでフィルタ拡張を実装する。

#### 手順

1. `permissionHistory.ts`の`PermissionHistoryFilter`型に`dateRange`フィールドを追加
2. `PermissionHistoryFilter.tsx`にプリセット選択セレクトと日付入力UIを追加（プリセット選択時は日付入力を非表示）
3. `PermissionHistoryPanel.tsx`のフィルタロジック内で`entry.timestamp`を`dateRange.start`/`dateRange.end`と比較するロジックを追加
4. テスト: プリセット「今日」で今日のエントリのみ表示、カスタム範囲でstart/end境界テスト、他フィルタとの複合条件テスト

#### 成果物

- `permissionHistory.ts`（型拡張）
- `PermissionHistoryFilter.tsx`（UI拡張）
- `PermissionHistoryPanel.tsx`（ロジック拡張）
- 対応テストファイル

### Phase 8-9: リファクタリング・品質保証

#### 手順

1. 日付比較ユーティリティの共通化を検討（他コンポーネントでの再利用性）
2. ISO8601タイムスタンプのタイムゾーン処理が一貫していることを確認
3. ESLint / TypeScript strict / カバレッジ基準の確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 期間プリセット選択が動作する
- [ ] カスタム日付範囲指定が動作する
- [ ] 既存フィルタ（ツール名・判断結果）との複合フィルタが動作する

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

- プリセット「今日」で今日のエントリのみ表示されること
- プリセット「過去7日」で7日以内のエントリのみ表示されること
- カスタム範囲で指定期間のエントリのみ表示されること
- 他のフィルタとの複合条件が正しく動作すること

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/settings/PermissionSettings/
```

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                                                            |
| ---------------- | ------ | -------- | --------------------------------------------------------------- |
| タイムゾーン差異 | 中     | 中       | ISO8601形式のタイムスタンプを使用し、ローカル時間での比較を行う |
| UIの複雑化       | 低     | 中       | プリセットをデフォルトにし、カスタム範囲は折りたたみで提供      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-IMP-permission-history-001/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`（L251-L309: 権限要求履歴パネル UI仕様）
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`（L333-L434: permissionHistorySlice仕様）
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`（L18-L77: task完了記録・未タスク一覧）

### 参考資料

- @tanstack/react-virtual ドキュメント

---

## 9. 備考

### 補足事項

- Phase 1スコープ外項目#5「期間別フィルタリング（日付範囲指定）」として検出
- Phase 11手動テスト結果でも同項目が発見されている
