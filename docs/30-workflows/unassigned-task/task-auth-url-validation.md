# カスタムプロトコルURL詳細検証 - タスク指示書

## メタ情報

| 項目             | 内容                          |
| ---------------- | ----------------------------- |
| タスクID         | DEBT-SEC-003                  |
| タスク名         | カスタムプロトコルURL詳細検証 |
| 分類             | セキュリティ                  |
| 対象機能         | OAuth認証（Desktop）          |
| 優先度           | 低                            |
| 見積もり規模     | 小規模                        |
| ステータス       | 未実施                        |
| 発見元           | Phase 7（最終レビューゲート） |
| 発見日           | 2025-12-22                    |
| 発見エージェント | @electron-security            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のカスタムプロトコル（`aiworkflow://`）コールバック処理では、URLスキームの確認のみで、パスやクエリパラメータの詳細検証を行っていません。

ログイン機能復旧プロジェクト（2025-12-22完了）の最終レビューゲートで、@electron-securityが詳細なURL検証が未実装であることを指摘しました。

### 1.2 問題点・課題

**攻撃シナリオ**:

1. 悪意のあるアプリケーションが`aiworkflow://`で任意のURLを送信
2. パス検証がないため、予期しないパスを処理してしまう可能性
3. 不正なクエリパラメータで内部処理を妨害される可能性

**現在の実装状態**:

- ✅ `aiworkflow://`スキーム確認は実装済み
- ❌ パス検証は未実装（`/auth/callback`以外も受け入れる）
- ❌ クエリパラメータのホワイトリスト検証は未実装

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                                               |
| ------------ | ------ | -------------------------------------------------- |
| セキュリティ | Low    | 現状でも基本的な動作は安全（スキーム確認実装済み） |
| 堅牢性       | Medium | 予期しないURLを受け入れる可能性                    |
| 保守性       | Low    | URL処理の明確性が不足                              |

---

## 2. 何を達成するか（What）

### 2.1 目的

カスタムプロトコルURLの詳細検証を実装し、不正なURLからの攻撃を防止する。

### 2.2 最終ゴール

- ✅ URLスキーム検証（`aiworkflow://`のみ許可）
- ✅ パス検証（`/auth/callback`のみ許可）
- ✅ クエリパラメータホワイトリスト検証
- ✅ 不正なURLの場合はエラーログ出力と処理中断
- ✅ 検証ロジックの単体テスト追加

### 2.3 スコープ

#### 含むもの

- URL検証ユーティリティ作成（urlValidator.ts）
- index.ts修正（URL検証呼び出し）
- ユニットテスト追加
- 手動テスト実施

#### 含まないもの

- State parameter検証（DEBT-SEC-001として別タスク）
- PKCE実装（DEBT-SEC-002として別タスク）
- セッション管理の改善（別タスク）

### 2.4 成果物

| 種別         | 成果物                       | 配置先                                             |
| ------------ | ---------------------------- | -------------------------------------------------- |
| 実装         | URL検証ユーティリティ        | `apps/desktop/src/main/utils/urlValidator.ts`      |
| 実装         | index.ts修正                 | `apps/desktop/src/main/index.ts:105-188`           |
| テスト       | urlValidator単体テスト       | `apps/desktop/src/main/utils/urlValidator.test.ts` |
| ドキュメント | セキュリティガイドライン更新 | `docs/00-requirements/17-security-guidelines.md`   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] OAuth認証が正常に動作していること
- [ ] 開発環境が正しくセットアップされていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）
- T-06-1: 品質保証（完了済み）
- T-07-1: 最終レビューゲート（完了済み）

**同時実施可能なタスク**:

- DEBT-SEC-001（State parameter検証）
- DEBT-SEC-002（PKCE実装）
- DEBT-CODE-001（構造化ログ）

### 3.3 必要な知識・スキル

- URLパース（Node.js URL API）
- セキュリティベストプラクティス（ホワイトリスト方式）
- TypeScript
- Vitest単体テスト作成

### 3.4 推奨アプローチ

1. **ホワイトリスト方式**: 許可するスキーム・パス・パラメータを明示的に定義
2. **早期リターン**: 検証失敗時は即座に処理を中断
3. **詳細なエラーログ**: どの検証で失敗したかを明確に記録
4. **ユーザーフィードバック**: エラー時はユーザーに分かりやすいメッセージを表示

---

## 4. 実行手順

### Phase構成

```
Phase 1: urlValidator実装（TDD Red）
  ↓
Phase 2: index.ts修正（URL検証呼び出し）
  ↓
Phase 3: TDD Green確認
  ↓
Phase 4: 手動テスト
  ↓
Phase 5: ドキュメント更新
```

---

### Phase 1: urlValidator実装（TDD Red）

#### 目的

カスタムプロトコルURL検証ロジックを実装し、単体テストでRed状態を確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@unit-tester URL検証ユーティリティを実装してください。

要件:
- URLスキーム検証（aiworkflow://のみ許可）
- パス検証（/auth/callbackのみ許可）
- クエリパラメータホワイトリスト検証
- 必須パラメータ確認（access_token）
- ValidationResult型を返す

テストケース:
1. 正しいコールバックURLの検証成功
2. 不正なプロトコルスキームの検証失敗
3. 不正なパスの検証失敗
4. 予期しないパラメータの検証失敗
5. access_token欠落の検証失敗
6. hashフラグメント欠落の検証失敗

ファイル:
- apps/desktop/src/main/utils/urlValidator.ts（新規）
- apps/desktop/src/main/utils/urlValidator.test.ts（新規）
```

#### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: 単体テスト作成とTDD実践の専門家。セキュリティ関連の検証ロジック実装に適している。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                           |
| -------------------- | ---------------------------------- |
| tdd-principles       | TDD Red-Green-Refactorサイクル実践 |
| clean-code-practices | 高品質な検証ロジック作成           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                 | パス                                               | 内容              |
| ---------------------- | -------------------------------------------------- | ----------------- |
| urlValidatorモジュール | `apps/desktop/src/main/utils/urlValidator.ts`      | URL検証ロジック   |
| urlValidator単体テスト | `apps/desktop/src/main/utils/urlValidator.test.ts` | 6テストケース以上 |

#### 完了条件

- [ ] urlValidator.ts実装完了
- [ ] urlValidator.test.ts実装完了
- [ ] テスト実行でRed状態確認
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: index.ts修正（URL検証呼び出し）

#### 目的

カスタムプロトコルコールバック受信時にurlValidator を使用してURL検証を実施する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@electron-security index.tsのhandleAuthCallback関数を修正してURL検証を追加してください。

修正内容:
- urlValidatorをインポート
- validateAuthCallbackURL()でURL検証
- 検証失敗時はエラーログ出力とauth:errorイベント送信
- 検証成功時のみトークン処理を続行

ファイル: apps/desktop/src/main/index.ts:105-188
```

#### 使用エージェント

- **エージェント**: @electron-security
- **選定理由**: Electronセキュリティの専門家。カスタムプロトコル処理のセキュリティ強化に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                    | 活用方法                         |
| --------------------------- | -------------------------------- |
| electron-security-hardening | Electronアプリのセキュリティ強化 |
| clean-code-practices        | エラーハンドリングの適切な実装   |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                             | 内容                |
| ------------ | -------------------------------- | ------------------- |
| index.ts修正 | `apps/desktop/src/main/index.ts` | URL検証ロジック追加 |

#### 完了条件

- [ ] validateAuthCallbackURL()呼び出し追加
- [ ] 検証失敗時のエラーハンドリング実装
- [ ] ユーザーへのエラー表示実装
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: TDD Green確認

#### 目的

実装完了後、urlValidatorのテストがすべて成功することを確認する。

#### 実行コマンド

```bash
pnpm --filter @repo/desktop test:run urlValidator.test.ts
```

#### 完了条件

- [ ] 全テストケース成功（Green状態）
- [ ] テストカバレッジ100%
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 4: 手動テスト

#### 目的

実際のOAuth認証フローでURL検証が正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目               | 操作手順                              | 期待結果                 |
| --- | -------- | ------------------------ | ------------------------------------- | ------------------------ |
| 1   | 正常系   | 正しいコールバックURL    | 通常のOAuth認証フロー実行             | ログイン成功             |
| 2   | 異常系   | 不正なプロトコルスキーム | https://で始まるURLを手動送信         | エラー表示、ログイン失敗 |
| 3   | 異常系   | 不正なパス               | aiworkflow://malicious/pathを手動送信 | エラー表示、ログイン失敗 |

#### 実行手順

1. `pnpm --filter @repo/desktop preview` でアプリを起動
2. DevToolsを開く
3. 正常系テスト実行
4. 異常系テスト実行（手動でURLを構築して送信）
5. 結果を記録

#### 完了条件

- [ ] 全3テストケースがPASS
- [ ] 不正なURLで「Invalid callback URL」エラーが出力されることを確認

---

### Phase 5: ドキュメント更新

#### 目的

セキュリティガイドラインにURL検証実装状況を反映する。

#### 更新対象

`docs/00-requirements/17-security-guidelines.md`

**更新箇所**: 17.2.1.3 カスタムプロトコルのセキュリティ考慮事項

```markdown
| URL検証 | ✅ 実装済み | urlValidator.tsでスキーム・パス・パラメータ検証 |
```

#### 完了条件

- [ ] セキュリティガイドライン更新完了
- [ ] URL検証が✅実装済みに変更

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] urlValidator実装完了
- [ ] URLスキーム検証実装完了
- [ ] パス検証実装完了
- [ ] クエリパラメータ検証実装完了
- [ ] エラーハンドリング実装完了

### 品質要件

- [ ] 全ユニットテスト成功（6テストケース以上）
- [ ] 全手動テスト成功（3テストケース）
- [ ] テストカバレッジ100%（urlValidator）
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] セキュリティガイドライン更新完了

---

## 6. 検証方法

### テストケース

#### ユニットテスト（urlValidator）

1. 正しいコールバックURLの検証成功
2. 不正なプロトコルスキームの検証失敗
3. 不正なパスの検証失敗
4. 予期しないクエリパラメータの検証失敗
5. access_token欠落の検証失敗
6. hashフラグメント欠落の検証失敗

### 検証手順

#### 自動テスト検証

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run urlValidator.test.ts

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# 全テスト実行
pnpm --filter @repo/desktop test:run
```

#### 手動テスト検証

```bash
# アプリ起動
pnpm --filter @repo/desktop preview

# DevToolsのConsoleで不正なURLをテスト
# 例: handleAuthCallback("https://auth/callback#access_token=xxx")
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                               | 対応サブタスク |
| ------------------------------------ | ------ | -------- | ---------------------------------- | -------------- |
| 許可パラメータリストの不足           | Medium | Medium   | Supabase実装確認、必要に応じて追加 | Phase 1        |
| パラメータホワイトリストが厳格すぎる | Low    | Low      | 手動テストで確認、必要に応じて緩和 | Phase 4        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-recovery/step11-final-review.md` - 最終レビュー結果
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `apps/desktop/src/main/index.ts` - カスタムプロトコル処理

### 参考資料

- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
@electron-security:
"カスタムプロトコルURLの詳細検証が推奨されます。
 aiworkflow://スキーム確認のみでなく、パス検証と
 クエリパラメータ検証を追加してください。"
```

### 補足事項

- 現状でも基本的なセキュリティは確保されているため、優先度は低い
- State parameter検証（DEBT-SEC-001）と組み合わせることで、より強固なセキュリティを実現
- ホワイトリストの定義は、Supabaseが実際に返すパラメータを確認してから決定
