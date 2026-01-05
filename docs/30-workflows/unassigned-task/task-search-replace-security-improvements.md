# 検索・置換機能 セキュリティ改善 - タスク指示書

## メタ情報

| 項目             | 内容                             |
| ---------------- | -------------------------------- |
| タスクID         | SEC-SR-001                       |
| タスク名         | 検索・置換機能のセキュリティ強化 |
| 分類             | セキュリティ                     |
| 対象機能         | GlobResolver / FileBackupManager |
| 優先度           | 中                               |
| 見積もり規模     | 小規模                           |
| ステータス       | 未実施                           |
| 発見元           | Phase 7 - 最終レビューゲート     |
| 発見日           | 2025-12-12                       |
| 発見エージェント | .claude/agents/sec-auditor.md                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索・置換機能のT-07-1最終レビューにおいて、.claude/agents/sec-auditor.mdエージェントが以下の2つのセキュリティ改善点を指摘した：

1. **SR-001**: シンボリックリンク未チェック（GlobResolver）
2. **SR-002**: バックアップディレクトリ権限設定不足（FileBackupManager）

### 1.2 問題点・課題

#### SR-001: シンボリックリンク未チェック

- 現在の`isWithinBasePath()`はシンボリックリンクを解決せずにパス比較を行っている
- 攻撃者がシンボリックリンクを使用して、ベースパス外のファイルにアクセスできる可能性がある
- パストラバーサル攻撃の一種として悪用される恐れがある

#### SR-002: バックアップディレクトリ権限

- バックアップディレクトリ作成時に明示的な権限設定がない
- デフォルト権限（umaskに依存）では他のユーザーがバックアップを読み取れる可能性がある
- 機密データを含むファイルのバックアップが漏洩するリスク

### 1.3 放置した場合の影響

- **SR-001**: 悪意のあるシンボリックリンクによる意図しないファイル変更・削除
- **SR-002**: バックアップファイルからの機密情報漏洩
- セキュリティ監査で指摘を受ける可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

シンボリックリンク対策とバックアップディレクトリ権限設定を実装し、検索・置換機能のセキュリティを強化する。

### 2.2 最終ゴール

- `GlobResolver.isWithinBasePath()`がシンボリックリンクを解決してパス検証を行う
- `FileBackupManager`がバックアップディレクトリを`0o700`権限で作成する
- セキュリティテストが追加される

### 2.3 スコープ

#### 含むもの

- GlobResolverのシンボリックリンク対策実装
- FileBackupManagerの権限設定実装
- セキュリティテストの追加
- 既存テストの更新

#### 含まないもの

- 他のセキュリティ機能（認証、暗号化など）
- UIコンポーネントの変更
- 追加ReDoSパターン（別タスク）

### 2.4 成果物

| 種別   | 成果物                      | 配置先                                                                  |
| ------ | --------------------------- | ----------------------------------------------------------------------- |
| 機能   | 改修されたGlobResolver      | `apps/desktop/src/main/search/GlobResolver.ts`                          |
| 機能   | 改修されたFileBackupManager | `apps/desktop/src/main/transaction/FileBackupManager.ts`                |
| テスト | セキュリティテスト          | `apps/desktop/src/main/search/__tests__/GlobResolver.test.ts`           |
| テスト | 権限テスト                  | `apps/desktop/src/main/transaction/__tests__/FileBackupManager.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 検索・置換機能のPhase 6品質ゲート通過済み
- 既存テストが全て成功していること
- Node.js `fs` モジュールの`realpathSync`が利用可能

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- Node.js fsモジュール（realpathSync, mkdir権限オプション）
- セキュリティベストプラクティス（パストラバーサル対策）
- ファイルシステム権限（Unix権限モデル）
- Vitestによるユニットテスト

### 3.4 推奨アプローチ

#### SR-001: シンボリックリンク対策

```typescript
// GlobResolver.ts - 推奨修正
import { realpathSync } from 'fs';

private isWithinBasePath(filePath: string): boolean {
  try {
    const realFilePath = realpathSync(filePath);
    const realBasePath = realpathSync(this.basePath);
    return realFilePath.startsWith(realBasePath + path.sep);
  } catch {
    // シンボリックリンク解決に失敗した場合は安全のためfalseを返す
    return false;
  }
}
```

#### SR-002: バックアップディレクトリ権限

```typescript
// FileBackupManager.ts - 推奨修正
await fs.mkdir(this.backupDir, {
  recursive: true,
  mode: 0o700, // 所有者のみ読み書き実行可能
});
```

---

## 4. 実行手順

### Phase構成

```
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
```

### Phase 3: テスト作成 (TDD: Red)

#### 目的

セキュリティ対策の動作を検証するテストを作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/search/GlobResolver.ts
/ai:generate-unit-tests apps/desktop/src/main/transaction/FileBackupManager.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/sec-auditor.md, .claude/agents/unit-tester.md
- **選定理由**: セキュリティテストの設計には.claude/agents/sec-auditor.mdの知見が必要、テスト実装には.claude/agents/unit-tester.mdが最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                      | 活用方法                         | 選定理由             |
| ----------------------------- | -------------------------------- | -------------------- |
| .claude/skills/tdd-principles/SKILL.md                | Red-Green-Refactorサイクルの遵守 | TDDの原則に従うため  |
| .claude/skills/security-configuration-review/SKILL.md | セキュリティ設定の検証           | 権限設定テストに必要 |
| .claude/skills/boundary-value-analysis/SKILL.md       | 境界値テスト                     | エッジケースの検証   |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース例

```typescript
// GlobResolver.test.ts
describe("シンボリックリンク対策", () => {
  it("should reject symlink pointing outside basePath", async () => {
    // シンボリックリンクがベースパス外を指す場合は拒否
  });

  it("should resolve symlink within basePath", async () => {
    // ベースパス内のシンボリックリンクは許可
  });

  it("should handle broken symlink gracefully", async () => {
    // 壊れたシンボリックリンクはfalseを返す
  });
});

// FileBackupManager.test.ts
describe("バックアップディレクトリ権限", () => {
  it("should create backup directory with 0o700 permissions", async () => {
    // 権限が0o700であることを確認
  });
});
```

#### 成果物

- シンボリックリンクテストケース
- ディレクトリ権限テストケース

#### 完了条件

- [ ] セキュリティテストケースが作成されている
- [ ] テストがRed状態（失敗）であることを確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを成功させるためのセキュリティ対策を実装する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/search/GlobResolver.ts
/ai:refactor apps/desktop/src/main/transaction/FileBackupManager.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/sec-auditor.md, .claude/agents/logic-dev.md
- **選定理由**: セキュリティ実装には.claude/agents/sec-auditor.mdの監督が必要、実装自体は.claude/agents/logic-dev.mdが担当
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                    | 活用方法                               | 選定理由                         |
| --------------------------- | -------------------------------------- | -------------------------------- |
| .claude/skills/electron-security-hardening/SKILL.md | Electronセキュリティベストプラクティス | デスクトップアプリのセキュリティ |
| .claude/skills/type-safety-patterns/SKILL.md        | 型安全な実装                           | エラーハンドリングの型定義       |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- シンボリックリンク対策が実装されたGlobResolver
- 権限設定が実装されたFileBackupManager

#### 完了条件

- [ ] `realpathSync`によるシンボリックリンク解決が実装されている
- [ ] `mode: 0o700`によるディレクトリ作成が実装されている
- [ ] テストがGreen状態（成功）であることを確認

---

### Phase 5: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善しつつ、テストが継続して成功することを確認する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/search/GlobResolver.ts
/ai:security-audit apps/desktop/src/main/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/code-quality.md, .claude/agents/sec-auditor.md
- **選定理由**: コード品質とセキュリティの両面から検証
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] エラーハンドリングが適切である
- [ ] コードの可読性が確保されている
- [ ] リファクタリング後もテストが成功する

---

### Phase 6: 品質保証

#### 目的

品質基準を満たすことを検証する。

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
/ai:security-audit apps/desktop/src/main/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/sec-auditor.md, .claude/agents/code-quality.md
- **選定理由**: セキュリティと品質の最終検証
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 全テスト成功
- [ ] セキュリティスキャン完了
- [ ] カバレッジ80%以上維持

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] シンボリックリンクがベースパス外を指す場合に拒否される
- [ ] ベースパス内のシンボリックリンクは正常に処理される
- [ ] バックアップディレクトリが0o700権限で作成される
- [ ] 壊れたシンボリックリンクが適切に処理される

### 品質要件

- [ ] 全テストが成功する
- [ ] カバレッジが80%以上を維持
- [ ] Lint/型チェックがクリア

### セキュリティ要件

- [ ] パストラバーサル攻撃が防止される
- [ ] バックアップファイルが他ユーザーから保護される

---

## 6. 検証方法

### テストケース

1. シンボリックリンクがベースパス外を指す場合に拒否される
2. ベースパス内のシンボリックリンクは許可される
3. 壊れたシンボリックリンクはfalseを返す
4. バックアップディレクトリが0o700権限で作成される

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test:run GlobResolver
pnpm --filter @repo/desktop test:run FileBackupManager

# 権限確認（手動）
ls -la /path/to/backup/dir
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                   |
| -------------------------------- | ------ | -------- | ------------------------------------------------------ |
| realpathSyncのパフォーマンス影響 | 低     | 中       | 大量ファイル処理時のみ測定、必要に応じてキャッシュ検討 |
| Windows環境での権限設定          | 中     | 高       | Windowsでは権限設定が無視されることを文書化            |
| 既存テストへの影響               | 低     | 低       | 既存テストを更新して対応                               |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/search-replace/task-step07-final-review.md` - 最終レビューレポート
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン

### 参考資料

- [Node.js fs.realpathSync](https://nodejs.org/api/fs.html#fsrealpathsyncpath-options) - シンボリックリンク解決
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal) - パストラバーサル攻撃

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
| ID     | 脆弱性                           | リスク | 推奨対策             |
| SR-001 | シンボリックリンク未チェック     | MEDIUM | `realpathSync()`使用 |
| SR-002 | バックアップディレクトリ権限     | MEDIUM | `mode: 0o700`指定    |
```

### 補足事項

- Windows環境では`mode`オプションが無視される可能性があるため、クロスプラットフォーム対応は別途検討
- 追加ReDoSパターン（SR-003）は別タスクとして管理
