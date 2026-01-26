# Permission Levels (Read/Write/Execute) - タスク指示書

## メタ情報

```yaml
issue_number: 526
```

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | TASK-PERM-LVL-001                    |
| タスク名     | 権限レベル機能（read/write/execute） |
| 分類         | 改善                                 |
| 対象機能     | PermissionStore / Permission Control |
| 優先度       | 低                                   |
| 見積もり規模 | 大規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 12（TASK-3-1-E）               |
| 発見日       | 2026-01-26                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のPermissionStoreは、ツールの許可/不許可を二値（boolean）で管理している。しかし、Unix系OSのファイルパーミッション（rwx）のように、操作の種類によって権限レベルを分けることで、より柔軟なアクセス制御が可能になる。

### 1.2 問題点・課題

- 読み取り専用で許可したい場合でも、書き込みも許可される
- 実行権限と編集権限を分離できない
- 組織のセキュリティポリシーに合わせた細かい制御ができない

### 1.3 放置した場合の影響

- 最小権限の原則を徹底できない
- セキュリティ監査での指摘事項となる可能性
- 大規模組織での導入障壁となる

---

## 2. 何を達成するか（What）

### 2.1 目的

ツール許可に権限レベル（read/write/execute）を導入し、操作種別ごとの細かいアクセス制御を実現する。

### 2.2 最終ゴール

- 3段階の権限レベル: read < write < execute
- ツールと権限レベルの組み合わせで許可管理
- 設定画面での権限レベル選択UI

### 2.3 スコープ

#### 含むもの

- PermissionLevel型の定義（read/write/execute）
- AllowedToolEntryへのlevelフィールド追加
- ツール別の権限レベルマッピング
- 設定画面での権限レベル選択UI

#### 含まないもの

- カスタム権限レベルの追加機能
- 権限レベルの継承機能
- グループベースの権限管理

### 2.4 成果物

| 成果物              | 説明                             |
| ------------------- | -------------------------------- |
| PermissionStore更新 | 権限レベル対応API                |
| 型定義更新          | PermissionLevel型追加            |
| ツールマッピング    | ツール→権限レベル対応表          |
| 設定UI更新          | 権限レベル選択UIコンポーネント   |
| 単体テスト          | 権限レベルチェックのテストケース |
| ドキュメント更新    | 関連仕様書の更新                 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-E（PermissionStore基盤）が完了していること
- 権限レベルの設計方針が決定していること

### 3.2 依存タスク

| タスクID   | タスク名                 | 状態 |
| ---------- | ------------------------ | ---- |
| TASK-3-1-E | rememberChoice機能永続化 | 完了 |

### 3.3 必要な知識

- Unix パーミッションモデル
- TypeScript/Electron開発
- アクセス制御設計

### 3.4 推奨アプローチ

1. PermissionLevel型を定義（read/write/execute）
2. ツールを権限レベルにマッピング
3. AllowedToolEntryにlevelフィールドを追加
4. isToolAllowed()に権限レベルチェックを追加
5. 設定UIに権限レベルセレクトを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 成果物                     |
| ----- | ------------ | -------------------------- |
| 1     | 設計         | 権限モデル・マッピング設計 |
| 2     | 型定義       | PermissionLevel型          |
| 3     | Store実装    | PermissionStore API更新    |
| 4     | UI実装       | 権限レベル選択UI           |
| 5     | テスト       | 単体・統合テスト           |
| 6     | ドキュメント | 仕様書更新                 |

### Phase 1: 設計

#### 目的

権限レベルモデルとツールマッピングを設計する。

#### 手順

1. 権限レベルの定義と階層関係を決定
2. 各ツールを権限レベルにマッピング
3. 権限チェックロジックを設計

#### 成果物

```typescript
type PermissionLevel = "read" | "write" | "execute";

// 権限階層: read < write < execute
// write権限があればread操作も許可
// execute権限があればwrite/read操作も許可

const TOOL_PERMISSION_MAPPING: Record<AllowedTool, PermissionLevel> = {
  // Read系（read権限で許可）
  Read: "read",
  Glob: "read",
  Grep: "read",
  LS: "read",
  WebSearch: "read",

  // Write系（write権限で許可）
  Write: "write",
  Edit: "write",
  TodoWrite: "write",
  WebFetch: "write",

  // Execute系（execute権限で許可）
  Bash: "execute",
  Task: "execute",
};
```

#### 完了条件

- 権限レベル設計書が作成されている
- ツールマッピングが定義されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PermissionLevel型が定義されている
- [ ] AllowedToolEntryにlevelフィールドが追加されている
- [ ] ツール別の権限レベルマッピングが実装されている
- [ ] 権限レベル階層チェックが動作する
- [ ] 設定UIで権限レベルを選択できる

### 品質要件

- [ ] 単体テストカバレッジ90%以上
- [ ] TypeScriptエラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] security-skill-execution.md更新
- [ ] ui-ux-settings.md更新
- [ ] interfaces-agent-sdk.md更新
- [ ] permission-control.md更新

---

## 6. 検証方法

### テストケース

| ケース                  | 期待結果                           |
| ----------------------- | ---------------------------------- |
| read権限 + Readツール   | isToolAllowed() = true             |
| read権限 + Writeツール  | isToolAllowed() = false            |
| write権限 + Readツール  | isToolAllowed() = true（階層継承） |
| write権限 + Writeツール | isToolAllowed() = true             |
| write権限 + Bashツール  | isToolAllowed() = false            |
| execute権限 + 全ツール  | isToolAllowed() = true             |
| level未設定             | isToolAllowed() = true（後方互換） |

### 検証手順

1. 権限レベル付きエントリを作成
2. 様々なツールでisToolAllowed()を呼び出し
3. 権限階層が正しく適用されることを確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                           |
| -------------------- | ------ | -------- | ------------------------------ |
| 権限モデルの複雑さ   | 高     | 中       | シンプルな3レベルに限定        |
| ユーザー混乱         | 中     | 中       | わかりやすいUI説明文追加       |
| 後方互換性問題       | 中     | 低       | level未設定時はexecute扱い     |
| ツールマッピング誤り | 高     | 低       | レビュー必須、テストケース充実 |

---

## 8. 参照情報

### 関連ドキュメント

- [security-skill-execution.md](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md)
- [permission-control.md](/.claude/skills/claude-agent-sdk/references/permission-control.md)
- [ui-ux-settings.md](/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md)
- [ALLOWED_TOOLS_WHITELIST定義](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md#allowed_tools_whitelist)

### 参考資料

- [Unix File Permissions](https://en.wikipedia.org/wiki/File-system_permissions)
- [RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Future Enhancement Candidates (Not Unassigned Tasks):
- Permission levels (read/write/execute) (Low priority, Out of scope for current task)
```

### 補足事項

- このタスクは「大規模」であり、TASK-PERM-GRAN-001（引数レベル権限）との関連を考慮すること
- 将来的にRBAC（Role-Based Access Control）への拡張を視野に入れた設計を推奨
- 権限レベルの名称（read/write/execute）は、Unixパーミッションに馴染みのあるユーザー向けの表現
- 非技術者向けには「閲覧/編集/実行」などの表記も検討すること
