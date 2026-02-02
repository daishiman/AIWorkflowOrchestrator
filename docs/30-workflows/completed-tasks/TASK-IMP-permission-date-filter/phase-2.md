# Phase 2: 設計

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

Phase 1で定義した要件を実現するための型拡張・UIコンポーネント設計・フィルタロジック設計を行う。

## 実行タスク

- インターフェース設計: PermissionHistoryFilter型にdateRangeフィールドを追加する設計
- UIコンポーネント設計: 期間選択UIのコンポーネント構造とレイアウト設計
- フィルタロジック設計: timestampベースのフィルタリングアルゴリズム設計

## 参照資料

| 資料名                       | パス                                                          | 説明                       |
| ---------------------------- | ------------------------------------------------------------- | -------------------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`                  | Phase 1成果物              |
| 状態管理仕様                 | `aiworkflow-requirements: arch-state-management.md` L333-L434 | permissionHistorySlice仕様 |
| 権限履歴UI仕様               | `aiworkflow-requirements: ui-ux-settings.md` L251-L309        | 既存UI仕様                 |
| interfaces-agent-sdk-history | `aiworkflow-requirements: interfaces-agent-sdk-history.md`    | 完了記録・型定義           |

## 実行手順

### 1. インターフェース設計

#### PermissionHistoryFilter型の拡張

現在の`PermissionHistoryFilter`型:

| フィールド | 型                              | 説明             |
| ---------- | ------------------------------- | ---------------- |
| toolName   | `string` (optional)             | ツール名フィルタ |
| decision   | `PermissionDecision` (optional) | 判断結果フィルタ |

拡張後の`PermissionHistoryFilter`型:

| フィールド | 型                              | 説明             |
| ---------- | ------------------------------- | ---------------- |
| toolName   | `string` (optional)             | ツール名フィルタ |
| decision   | `PermissionDecision` (optional) | 判断結果フィルタ |
| dateRange  | `DateRangeFilter` (optional)    | 期間フィルタ     |

#### 新規型: DateRangeFilter

| フィールド | 型                  | 説明                                |
| ---------- | ------------------- | ----------------------------------- |
| preset     | `DatePreset`        | プリセット選択値                    |
| start      | `string` (optional) | カスタム範囲の開始日（ISO8601形式） |
| end        | `string` (optional) | カスタム範囲の終了日（ISO8601形式） |

#### 新規型: DatePreset

| 値         | 説明         |
| ---------- | ------------ |
| `"all"`    | 全期間       |
| `"today"`  | 今日         |
| `"week"`   | 過去7日      |
| `"month"`  | 過去30日     |
| `"custom"` | カスタム範囲 |

### 2. UIコンポーネント設計

#### PermissionHistoryFilter.tsx の拡張

既存のフィルタUI（ツール名セレクト + 判断結果セレクト）に期間フィルタUIを追加する。

**レイアウト構成:**

```
┌─────────────────────────────────────────────┐
│ [ツール名 ▼]  [判断結果 ▼]  [期間 ▼]       │
│                                             │
│ （「カスタム範囲」選択時のみ表示）          │
│ [開始日 📅]  ～  [終了日 📅]               │
└─────────────────────────────────────────────┘
```

**期間セレクトボックスの選択肢:**

| 表示テキスト | 値       |
| ------------ | -------- |
| 全期間       | `all`    |
| 今日         | `today`  |
| 過去7日      | `week`   |
| 過去30日     | `month`  |
| カスタム範囲 | `custom` |

**日付入力の仕様:**

| 項目               | 仕様                                                    |
| ------------------ | ------------------------------------------------------- |
| 入力タイプ         | `<input type="date" />`（ネイティブ日付ピッカー）       |
| 表示条件           | preset === "custom" の場合のみ表示                      |
| start のデフォルト | 空（指定なし = 制限なし）                               |
| end のデフォルト   | 空（指定なし = 制限なし）                               |
| バリデーション     | start <= end（start と end の両方が指定されている場合） |

### 3. フィルタロジック設計

#### PermissionHistoryPanel.tsx のフィルタロジック拡張

既存のフィルタロジック（toolName、decision）に加え、dateRangeフィルタを追加する。

**フィルタ適用順序:**

1. toolName フィルタ（既存）
2. decision フィルタ（既存）
3. dateRange フィルタ（新規追加）

**dateRange フィルタロジック:**

| preset 値 | フィルタ条件                                                             |
| --------- | ------------------------------------------------------------------------ |
| `all`     | フィルタなし（全エントリを通過）                                         |
| `today`   | `entry.timestamp >= 本日00:00:00のISO8601文字列`                         |
| `week`    | `entry.timestamp >= 7日前00:00:00のISO8601文字列`                        |
| `month`   | `entry.timestamp >= 30日前00:00:00のISO8601文字列`                       |
| `custom`  | `entry.timestamp >= start（指定時）AND entry.timestamp <= end（指定時）` |

**日付比較の実装方針:**

- `entry.timestamp`はISO8601形式の文字列（例: `2026-02-01T10:30:00.000Z`）
- プリセット日付の算出は`new Date()`でローカル日付を取得し、`setHours(0,0,0,0)`で日の開始に設定
- 比較は`new Date(entry.timestamp).getTime() >= targetDate.getTime()`で行う
- ヘルパー関数`getDateRangeStartDate(preset: DatePreset): Date | null`を作成して日付算出を分離

## 統合テスト連携【必須】

| 統合ポイント         | 契約定義                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| フロント→Store       | `setHistoryFilter(filter: PermissionHistoryFilter)` 既存IF利用          |
| Store→フロント       | `historyFilter`状態の購読（既存）                                       |
| コンポーネント間連携 | PermissionHistoryFilter → PermissionHistoryPanel のfilterプロパティ経由 |

## アーキテクチャ層別設計（AIが判断）

| 層                         | 設計観点                                                           | 仕様参照先                                             |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| フロントエンド（Renderer） | PermissionHistoryFilter.tsxのUI拡張、dateRange状態管理             | `aiworkflow-requirements: ui-ux-settings.md` L286-L291 |
| バックエンド（Main）       | 対象外                                                             | -                                                      |
| IPC通信                    | 対象外                                                             | -                                                      |
| Preload                    | 対象外                                                             | -                                                      |
| データ                     | historyFilter.dateRangeは非永続化（Zustand persist excludeリスト） | `aiworkflow-requirements: arch-state-management.md`    |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                               |
| ------------------ | -------- | -------------------------------------------------------- |
| UI/UX              | 適用     | `aiworkflow-requirements: ui-ux-settings.md` L251-L309   |
| アクセシビリティ   | 適用     | select要素のlabel/aria属性、date inputのアクセシビリティ |
| パフォーマンス     | 適用     | フィルタ処理は1000件に対してO(n)で十分高速               |
| エラーハンドリング | 適用     | 無効な日付入力時のバリデーション                         |

## 成果物

| 成果物         | パス                                     | 説明                       |
| -------------- | ---------------------------------------- | -------------------------- |
| 設計書         | `outputs/phase-2/architecture-design.md` | UI・型・ロジック設計       |
| ドメインモデル | `outputs/phase-2/domain-model.md`        | DateRangeFilter/DatePreset |

## 完了条件

- [ ] PermissionHistoryFilter型の拡張設計が完了している
- [ ] DateRangeFilter、DatePreset型が定義されている
- [ ] UIコンポーネントのレイアウト設計が完了している
- [ ] フィルタロジックの設計が完了している
- [ ] 日付比較の実装方針が決定している
- [ ] 要件との整合性が確認されている
- [ ] アーキテクチャ層別の設計が完了している（Renderer層のみ）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. インターフェース設計（型拡張）
3. UIコンポーネント設計
4. フィルタロジック設計
5. 設計書の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
