# Per-argument Permission Granularity - タスク指示書

## メタ情報

```yaml
issue_number: 525
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-PERM-GRAN-001                 |
| タスク名     | 引数レベルの権限粒度機能           |
| 分類         | 改善                               |
| 対象機能     | PermissionStore / Permission Rules |
| 優先度       | 低                                 |
| 見積もり規模 | 大規模                             |
| ステータス   | 未実施                             |
| 発見元       | Phase 12（TASK-3-1-E）             |
| 発見日       | 2026-01-26                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のPermissionStoreは、ツール名単位での許可管理を行っている。例えば「Bash」ツールを許可すると、すべてのBashコマンドが許可される。しかし、実際の運用では「git pushは許可するが、rm -rfは毎回確認したい」といった細かい制御が求められることがある。

### 1.2 問題点・課題

- ツール単位の許可は粒度が粗すぎる
- 危険なコマンドと安全なコマンドを区別できない
- パス単位でのファイル操作許可ができない

### 1.3 放置した場合の影響

- セキュリティと利便性のトレードオフが最適化されない
- ユーザーが不必要に多くの確認ダイアログを見る、または危険な操作が無確認で実行される

---

## 2. 何を達成するか（What）

### 2.1 目的

ツールの引数（コマンド、パス等）レベルで権限を細かく制御できる仕組みを実装する。

### 2.2 最終ゴール

- Bash: コマンドパターン単位での許可（例: `git *` は許可）
- Write/Edit: パスパターン単位での許可（例: `/project/src/**` は許可）
- Read: パスパターン単位での許可

### 2.3 スコープ

#### 含むもの

- AllowedToolEntryへのpattern/pathフィールド追加
- パターンマッチングロジックの実装
- 設定画面でのパターン入力UI
- DANGEROUS_PATTERNSとの連携

#### 含まないもの

- 正規表現パターンのサポート（Globのみ）
- 動的なパターン学習機能
- パターンの自動推薦機能

### 2.4 成果物

| 成果物              | 説明                               |
| ------------------- | ---------------------------------- |
| PermissionStore更新 | パターンマッチング対応API          |
| 型定義更新          | AllowedToolEntryへのpattern追加    |
| 設定UI更新          | パターン入力・編集UIコンポーネント |
| 単体テスト          | パターンマッチングのテストケース   |
| ドキュメント更新    | 関連仕様書の更新                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-E（PermissionStore基盤）が完了していること
- matchGlobPattern()関数が利用可能であること

### 3.2 依存タスク

| タスクID   | タスク名                 | 状態 |
| ---------- | ------------------------ | ---- |
| TASK-3-1-E | rememberChoice機能永続化 | 完了 |
| TASK-2C    | スキル実行セキュリティ   | 完了 |

### 3.3 必要な知識

- Globパターンマッチング
- TypeScript/Electron開発
- セキュリティ設計（DANGEROUS_PATTERNS理解）

### 3.4 推奨アプローチ

1. AllowedToolEntryを拡張し、オプショナルなpatternフィールドを追加
2. isToolAllowed()にツール引数を渡すように変更
3. 引数とpatternのマッチングロジックを実装
4. 設定UIにパターン入力フィールドを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 成果物                     |
| ----- | ------------ | -------------------------- |
| 1     | スキーマ設計 | 型定義・パターン形式決定   |
| 2     | マッチング   | パターンマッチングロジック |
| 3     | Store実装    | PermissionStore API更新    |
| 4     | UI実装       | パターン入力UI             |
| 5     | 統合テスト   | E2Eテスト                  |
| 6     | ドキュメント | 仕様書更新                 |

### Phase 1: スキーマ設計

#### 目的

引数パターン対応のデータ構造を設計する。

#### 手順

1. AllowedToolEntry型にpatternフィールドを追加
2. ツール別のパターン形式を定義

#### 成果物

```typescript
interface AllowedToolEntry {
  toolName: string;
  allowedAt: string;
  expiresAt?: string;
  pattern?: ToolPattern; // 新規追加
}

type ToolPattern =
  | { type: "command"; value: string } // Bash: "git *"
  | { type: "path"; value: string } // Write/Edit/Read: "/project/**"
  | { type: "all" }; // 全許可（後方互換）
```

#### 完了条件

- 型定義が更新されている
- パターン形式のドキュメントが作成されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] patternフィールドが追加されている
- [ ] コマンドパターンマッチングが動作する
- [ ] パスパターンマッチングが動作する
- [ ] 設定UIでパターンを入力・編集できる
- [ ] pattern未設定時は全許可（後方互換）

### 品質要件

- [ ] 単体テストカバレッジ90%以上
- [ ] パフォーマンステスト（1000パターンで100ms以内）
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

| ケース                              | 期待結果                         |
| ----------------------------------- | -------------------------------- |
| Bash + "git \*" + "git push"        | isToolAllowed() = true           |
| Bash + "git \*" + "rm -rf"          | isToolAllowed() = false          |
| Write + "/src/\*\*" + "/src/a.ts"   | isToolAllowed() = true           |
| Write + "/src/\*\*" + "/etc/passwd" | isToolAllowed() = false          |
| pattern未設定                       | isToolAllowed() = true（全許可） |

### 検証手順

1. パターン付きエントリを作成
2. 様々な引数でisToolAllowed()を呼び出し
3. 期待通りのtrue/falseが返ることを確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                               |
| -------------------- | ------ | -------- | ---------------------------------- |
| パターン入力の複雑さ | 高     | 高       | プリセットパターンの提供           |
| パフォーマンス低下   | 中     | 中       | パターンキャッシュの実装           |
| セキュリティホール   | 高     | 低       | DANGEROUS_PATTERNSとの二重チェック |
| 後方互換性問題       | 中     | 低       | pattern未設定時は全許可            |

---

## 8. 参照情報

### 関連ドキュメント

- [security-skill-execution.md](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md)
- [permission-control.md](/.claude/skills/claude-agent-sdk/references/permission-control.md)
- [ui-ux-settings.md](/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md)

### 参考資料

- [minimatch Globパターン](https://github.com/isaacs/minimatch)
- [Claude Code Permission Rules](https://docs.anthropic.com/claude-code/permissions)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Future Enhancement Candidates (Not Unassigned Tasks):
- Per-argument permission granularity (Low priority, Out of scope for current task)
```

### 補足事項

- このタスクは「大規模」であり、実装前に詳細設計フェーズを設けることを推奨
- DANGEROUS_PATTERNSによるセキュリティチェックは常に優先されること
- ユーザーがパターンを誤設定した場合のフォールバック動作を明確にすること
