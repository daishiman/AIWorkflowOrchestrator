# Time-based Permission Expiration - タスク指示書

## メタ情報

```yaml
issue_number: 524
```

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| タスクID     | TASK-PERM-EXP-001            |
| タスク名     | 時間ベースの権限有効期限機能 |
| 分類         | 改善                         |
| 対象機能     | PermissionStore              |
| 優先度       | 低                           |
| 見積もり規模 | 中規模                       |
| ステータス   | 未実施                       |
| 発見元       | Phase 12（TASK-3-1-E）       |
| 発見日       | 2026-01-26                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-Eで実装されたPermissionStoreは、ユーザーが「次回から確認しない」を選択した権限設定を永続化する。現在の実装では、一度許可されたツールは明示的に取り消さない限り永久に許可された状態が続く。

### 1.2 問題点・課題

- 長期間放置されたデスクトップアプリで、古い権限設定が残り続ける
- セキュリティポリシーの変更に伴う権限見直しが手動でしか行えない
- ユーザーが過去に許可した設定を忘れる可能性がある

### 1.3 放置した場合の影響

- セキュリティリスク: 不要になった権限が残存し、意図しない操作が許可される可能性
- ユーザビリティ低下: 権限リストが肥大化し、管理が困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

ツール権限に有効期限を設定し、期限切れ後は再度確認ダイアログを表示する仕組みを実装する。

### 2.2 最終ゴール

- 権限エントリに有効期限（expiresAt）フィールドを追加
- 期限切れ権限の自動失効機能
- 設定画面での有効期限選択UI

### 2.3 スコープ

#### 含むもの

- AllowedToolEntryスキーマへのexpiresAtフィールド追加
- isToolAllowed()での有効期限チェック
- 期限切れ権限のクリーンアップ機能
- 設定画面での有効期限選択（1日/7日/30日/永久）

#### 含まないもの

- ツールごとの個別有効期限設定
- 外部認証サービスとの連携
- 権限更新の自動通知機能

### 2.4 成果物

| 成果物              | 説明                               |
| ------------------- | ---------------------------------- |
| PermissionStore更新 | expiresAt対応のAPI実装             |
| 型定義更新          | AllowedToolEntryへの expiresAt追加 |
| 設定UI更新          | 有効期限選択UIコンポーネント       |
| 単体テスト          | 有効期限チェックのテストケース     |
| ドキュメント更新    | security-skill-execution.md更新    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-E（PermissionStore基盤）が完了していること
- electron-storeのマイグレーション機構の理解

### 3.2 依存タスク

| タスクID   | タスク名                 | 状態 |
| ---------- | ------------------------ | ---- |
| TASK-3-1-E | rememberChoice機能永続化 | 完了 |

### 3.3 必要な知識

- TypeScript/Electron開発
- electron-storeのスキーママイグレーション
- React コンポーネント開発
- Vitest テスト記述

### 3.4 推奨アプローチ

1. スキーマバージョンを2に上げ、expiresAtフィールドを追加
2. isToolAllowed()内で現在時刻との比較ロジックを追加
3. 期限切れエントリを自動削除するcleanupExpired()メソッドを追加
4. 設定画面に有効期限ドロップダウンを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 成果物                       |
| ----- | ------------ | ---------------------------- |
| 1     | スキーマ設計 | 型定義・マイグレーション計画 |
| 2     | Store実装    | PermissionStore API更新      |
| 3     | UI実装       | 設定画面更新                 |
| 4     | テスト       | 単体・統合テスト             |
| 5     | ドキュメント | 仕様書更新                   |

### Phase 1: スキーマ設計

#### 目的

有効期限対応のデータ構造を設計する。

#### 手順

1. AllowedToolEntry型にオプショナルなexpiresAtフィールドを追加
2. PermissionStoreSchemaのversionを2に更新
3. v1→v2マイグレーション関数を実装

#### 成果物

```typescript
interface AllowedToolEntry {
  toolName: string;
  allowedAt: string;
  expiresAt?: string; // ISO 8601, undefined = 永久
}
```

#### 完了条件

- 型定義が更新されている
- マイグレーション関数が実装されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] expiresAtフィールドが追加されている
- [ ] isToolAllowed()が期限切れを検出する
- [ ] cleanupExpired()が期限切れエントリを削除する
- [ ] 設定UIで有効期限を選択できる

### 品質要件

- [ ] 単体テストカバレッジ90%以上
- [ ] TypeScriptエラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] security-skill-execution.md更新
- [ ] ui-ux-settings.md更新
- [ ] interfaces-agent-sdk.md更新

---

## 6. 検証方法

### テストケース

| ケース                 | 期待結果                           |
| ---------------------- | ---------------------------------- |
| 期限内のツール         | isToolAllowed() = true             |
| 期限切れのツール       | isToolAllowed() = false            |
| expiresAt未設定        | isToolAllowed() = true（永久許可） |
| cleanupExpired()実行後 | 期限切れエントリが削除されている   |

### 検証手順

1. 有効期限1秒後のエントリを作成
2. 2秒待機後にisToolAllowed()を呼び出し
3. falseが返ることを確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                           |
| -------------------- | ------ | -------- | ------------------------------ |
| マイグレーション失敗 | 高     | 低       | ロールバック機構の実装         |
| タイムゾーン問題     | 中     | 中       | UTC統一、ISO 8601形式使用      |
| UXの複雑化           | 中     | 中       | デフォルト値（30日）を推奨表示 |

---

## 8. 参照情報

### 関連ドキュメント

- [security-skill-execution.md](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md)
- [ui-ux-settings.md](/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md)
- [interfaces-agent-sdk.md](/.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md)
- [permission-control.md](/.claude/skills/claude-agent-sdk/references/permission-control.md)

### 参考資料

- [electron-store マイグレーション](https://github.com/sindresorhus/electron-store#migrations)
- [Date-fns 日付操作](https://date-fns.org/)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Future Enhancement Candidates (Not Unassigned Tasks):
- Time-based permission expiration (Low priority, Documented in implementation guide)
```

### 補足事項

- このタスクは優先度「低」であり、他の優先タスク完了後に実施を検討
- 実装時はelectron-storeのマイグレーション機構を活用すること
