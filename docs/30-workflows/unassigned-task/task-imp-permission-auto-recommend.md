# 権限履歴に基づく自動推奨ロジック - タスク指示書

## メタ情報

```yaml
issue_number: 633
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | task-imp-permission-auto-recommend       |
| タスク名     | 権限履歴に基づく自動推奨ロジック         |
| 分類         | 改善                                     |
| 対象機能     | PermissionDialog, permissionHistorySlice |
| 優先度       | 低                                       |
| 見積もり規模 | 中規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 1（スコープ外項目）                |
| 発見日       | 2026-02-01                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-history-001で権限履歴が記録されるようになったが、この履歴データを活用した推奨機能はスコープ外とされた。

### 1.2 問題点・課題

- 同じツールに対して毎回同じ判断をするユーザーが、繰り返し同じ操作を求められる
- 履歴データが蓄積されても、判断支援に活用されていない

### 1.3 放置した場合の影響

- ユーザー体験が最適化されない（操作の繰り返し）
- 蓄積された履歴データが分析目的で活用されない

---

## 2. 何を達成するか（What）

### 2.1 目的

権限履歴の統計情報に基づいて、PermissionDialogに推奨アクションを表示する。

### 2.2 最終ゴール

「このツールは過去N回中M回許可されています」のような情報がPermissionDialogに表示され、ユーザーの判断を支援する。

### 2.3 スコープ

#### 含むもの

- 履歴統計計算ロジック（ツール別の許可/拒否率）
- PermissionDialogへの推奨表示UI
- 推奨表示のオン/オフ設定

#### 含まないもの

- 自動許可/自動拒否（ユーザーの明示的判断を維持）
- 機械学習ベースの推奨

### 2.4 成果物

- 統計計算ユーティリティ
- PermissionDialogの推奨表示UI
- 設定項目の追加
- テストコード

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-history-001が完了していること

### 3.2 依存タスク

- task-imp-permission-history-001（完了済み）

### 3.3 必要な知識

- React, TypeScript, Zustand
- PermissionDialog / permissionHistorySlice の実装

### 3.4 推奨アプローチ

1. permissionHistoryからツール別の統計を計算するセレクター作成
2. PermissionDialogに「過去の判断: N回許可 / M回拒否」情報バーを追加
3. 高確率パターン（90%以上が同一判断）の場合にハイライト表示

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルのPhase 1-13に従って実行。主要ステップは以下の通り。

### Phase 1-2: 要件定義・設計

#### 目的

統計計算ロジックの設計とPermissionDialog推奨UI設計を確定する。

#### 手順

1. 統計計算のインターフェース設計: `getToolStatistics(toolName: string): { total: number; approved: number; denied: number; approvedOnce: number; approvalRate: number }`
2. 推奨表示の閾値設計: 履歴5件以上で表示、90%以上の偏りでハイライト
3. 設定項目の設計: `showRecommendation: boolean`（デフォルト: true）をskillSliceまたは専用settingsSliceに追加
4. 仕様書参照: `arch-state-management.md` L362-L368（permissionHistorySliceアクション定義）、`ui-ux-settings.md` L251-L309（Permission History Panel仕様）

#### 成果物

- 要件定義書（Phase 1）
- 設計書（Phase 2）

### Phase 4-5: テスト作成・実装

#### 目的

TDDで統計計算・推奨UI・設定機能を実装する。

#### 手順

1. `permissionHistory.ts`に`getToolStatistics()`関数を追加（メモ化セレクター対応）
2. `PermissionDialog.tsx`に推奨情報バーを追加（「このツールは過去N回中M回許可されています」形式）
3. 高確率パターン（90%以上が同一判断）の場合にバッジ色を変更するロジック追加
4. 設定項目をsliceに追加し、PermissionSettingsに推奨表示オン/オフトグルを追加
5. テスト: 各統計パターンの計算結果、表示/非表示の切り替え、閾値境界テスト、履歴0件時の非表示

#### 成果物

- `permissionHistory.ts`（統計計算ユーティリティ追加）
- `PermissionDialog.tsx`（推奨UIコンポーネント追加）
- 設定Slice拡張
- 対応テストファイル

### Phase 8-9: リファクタリング・品質保証

#### 手順

1. 統計計算のメモ化が正しく機能していることをパフォーマンステストで確認
2. ESLint / TypeScript strict / カバレッジ基準の確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ツール別の統計情報が正しく計算される
- [ ] PermissionDialogに推奨情報が表示される
- [ ] 推奨表示のオン/オフが切り替え可能

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

- 履歴にBash:10回approved/2回deniedがある場合、「83%が許可」と表示されること
- 履歴が0件のツールでは推奨情報が表示されないこと
- 設定オフ時に推奨情報が非表示になること

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                       |
| -------------------------- | ------ | -------- | ------------------------------------------ |
| ユーザーが推奨に頼りすぎる | 中     | 低       | 推奨はあくまで情報表示、自動判断は行わない |
| パフォーマンス             | 低     | 低       | メモ化セレクターで統計計算をキャッシュ     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-IMP-permission-history-001/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`（PermissionDialog仕様）
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`（L333-L434: permissionHistorySlice仕様・Cross-Sliceアクセスパターン）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`（L251-L309: Permission History Panel仕様）

### 参考資料

- Zustand selector / メモ化パターン

---

## 9. 備考

### 補足事項

- Phase 1スコープ外項目#2「履歴に基づく自動推奨ロジック」として検出
