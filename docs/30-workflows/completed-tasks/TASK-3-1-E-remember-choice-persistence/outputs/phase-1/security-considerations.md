# セキュリティ考慮事項 - PermissionStore

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 1                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

PermissionStore実装におけるセキュリティリスクと対策を整理します。

---

## リスク分析

### リスク1: 危険なツールの自動許可

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| リスクレベル | 高                                                                           |
| 説明         | Bash等の危険なツールが自動許可されると、意図しないコマンド実行のリスクがある |
| 影響         | システムファイルの破壊、機密情報の漏洩                                       |

**対策**:

1. **危険ツールの警告表示**（推奨）
   - Bash等の危険なツールを許可する際に追加の警告を表示
   - 「このツールは危険なコマンドを実行する可能性があります」

2. **危険ツール除外オプション**（オプション）
   - 設定画面から「危険なツールは自動許可しない」オプションを提供
   - デフォルトは有効（危険ツールは除外）

```typescript
// 危険ツールリスト（参考）
const HIGH_RISK_TOOLS = ["Bash"] as const;

// 自動許可前のチェック
function shouldAutoAllow(toolName: string, excludeHighRisk: boolean): boolean {
  if (excludeHighRisk && HIGH_RISK_TOOLS.includes(toolName as any)) {
    return false;
  }
  return permissionStore.isToolAllowed(toolName);
}
```

### リスク2: 設定ファイルの改ざん

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| リスクレベル | 中                                                       |
| 説明         | 設定ファイルを直接編集して不正なツールを許可リストに追加 |
| 影響         | 許可していないツールが自動承認される                     |

**対策**:

1. **ファイルパーミッション**
   - electron-storeのデフォルト設定（ユーザー専用）を使用
   - ファイルパーミッションは600（owner read/write only）

2. **スキーマバリデーション**
   - 読み込み時にスキーマをバリデーション
   - 不正なデータは破棄してデフォルト値で初期化

3. **ツールホワイトリストチェック**
   - 許可リストのツール名が有効なツール名かチェック

```typescript
import { ALLOWED_TOOLS_WHITELIST } from "@repo/shared/constants";

function validateToolName(toolName: string): boolean {
  return ALLOWED_TOOLS_WHITELIST.includes(toolName as any);
}
```

### リスク3: 設定ファイルの破損

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| リスクレベル | 低                                                     |
| 説明         | JSONパースエラー、ディスク障害等による設定ファイル破損 |
| 影響         | アプリケーション起動失敗または設定消失                 |

**対策**:

1. **グレースフルデグラデーション**
   - 読み込みエラー時はデフォルト値で初期化
   - アプリケーション起動は継続

2. **エラーログ出力**
   - 破損検出時は警告ログを出力
   - ユーザーに「設定がリセットされました」を通知（オプション）

```typescript
try {
  const data = store.store;
  if (!validateSchema(data)) {
    console.warn("[PermissionStore] Invalid schema, resetting to defaults");
    store.clear();
    store.set(DEFAULT_SCHEMA);
  }
} catch (error) {
  console.warn(
    "[PermissionStore] Failed to load store, using defaults:",
    error,
  );
}
```

### リスク4: 権限エスカレーション

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| リスクレベル | 低                                 |
| 説明         | 一度許可したツールを使って権限昇格 |
| 影響         | 意図しない権限での操作             |

**対策**:

1. **ツール単位の許可**
   - 許可はツール名単位（引数は考慮しない）
   - 各ツール実行時のセキュリティチェック（PreToolUse Hook）は維持

2. **危険コマンドチェックの維持**
   - Bashが自動許可されても、危険コマンドはPreToolUseでブロック
   - `isDangerousCommand()`のチェックは永続化設定に関係なく実行

```typescript
// PreToolUseフック内（SkillExecutor.ts）
// 自動許可されても危険コマンドチェックは実行される
if (input.toolName === "Bash") {
  const command = (input.args.command as string) || "";
  if (isDangerousCommand(command)) {
    return { proceed: false, message: "危険なコマンドをブロックしました" };
  }
}
```

---

## 危険ツール定義

### HIGH_RISK_TOOLS

自動許可を制限すべき危険なツール：

| ツール名 | リスクレベル | 理由                           |
| -------- | ------------ | ------------------------------ |
| Bash     | 高           | 任意のシェルコマンドを実行可能 |

### MEDIUM_RISK_TOOLS

注意が必要なツール（現時点では制限なし）：

| ツール名 | リスクレベル | 理由                             |
| -------- | ------------ | -------------------------------- |
| Write    | 中           | 任意のファイルを作成可能         |
| Edit     | 中           | 任意のファイルを編集可能         |
| WebFetch | 中           | 外部URLからデータを取得          |
| Task     | 中           | サブタスク実行（連鎖的なリスク） |

### LOW_RISK_TOOLS

安全なツール：

| ツール名  | リスクレベル | 理由                 |
| --------- | ------------ | -------------------- |
| Read      | 低           | 読み取り専用         |
| Glob      | 低           | ファイル検索のみ     |
| Grep      | 低           | テキスト検索のみ     |
| LS        | 低           | ディレクトリ一覧のみ |
| WebSearch | 低           | Web検索のみ          |
| TodoWrite | 低           | TODOリスト操作のみ   |

---

## 設定ファイル保護

### ファイルパス

```
{userData}/permission-store.json
```

### パーミッション設定

electron-storeのデフォルト設定を使用：

| OS      | パーミッション | 説明                            |
| ------- | -------------- | ------------------------------- |
| Windows | ユーザー専用   | %APPDATA%内に保存               |
| macOS   | 600            | ~/Library/Application Support内 |
| Linux   | 600            | ~/.config内                     |

### アクセス制御

1. **Main Process専用**
   - PermissionStoreはMain Processでのみインスタンス化
   - RendererからはIPCを経由してアクセス

2. **直接ファイルアクセス禁止**
   - Rendererから設定ファイルパスを取得するAPIは提供しない

---

## 監査ログ

### ログ出力項目

| イベント           | ログレベル | 出力内容           |
| ------------------ | ---------- | ------------------ |
| ツール自動許可     | info       | ツール名、許可日時 |
| ツール許可追加     | info       | ツール名、許可日時 |
| ツール許可取り消し | info       | ツール名           |
| 全許可クリア       | warn       | クリア前のツール数 |
| 設定読み込みエラー | warn       | エラーメッセージ   |
| 設定書き込みエラー | error      | エラーメッセージ   |

### ログ例

```
[2026-01-25T12:00:00.000Z] [INFO] [PermissionStore] Tool auto-allowed: Read
[2026-01-25T12:01:00.000Z] [INFO] [PermissionStore] Tool permission added: Glob
[2026-01-25T12:02:00.000Z] [INFO] [PermissionStore] Tool permission revoked: Bash
[2026-01-25T12:03:00.000Z] [WARN] [PermissionStore] All permissions cleared (3 tools)
```

---

## 将来の拡張検討事項

以下は現在のスコープ外だが、将来検討が必要：

1. **有効期限設定**
   - 許可設定に有効期限を設定（例: 24時間、1週間）
   - 期限切れ後は再度確認ダイアログを表示

2. **ツール引数ベースの許可**
   - 特定のパスへのRead/Writeのみ許可
   - 特定のコマンドパターンのみ許可

3. **ユーザー別設定**
   - マルチユーザー環境での設定分離

---

## 関連ドキュメント

- [セキュリティパターン定義](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md)
- [データスキーマ定義](./data-schema.md)
- [インターフェース定義](./interface-definition.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
