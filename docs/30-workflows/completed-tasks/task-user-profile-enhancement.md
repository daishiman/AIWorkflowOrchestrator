# ユーザープロフィール詳細管理機能強化 - タスク指示書

## メタ情報

| 項目             | 内容                                 |
| ---------------- | ------------------------------------ |
| タスクID         | TASK-USER-DATA-02                    |
| タスク名         | ユーザープロフィール詳細管理機能強化 |
| 分類             | 機能改善                             |
| 対象機能         | ユーザーデータ永続化                 |
| 優先度           | 中                                   |
| 見積もり規模     | 中規模                               |
| ステータス       | 未実施                               |
| 発見元           | ユーザー要件                         |
| 発見日           | 2025-12-10                           |
| 発見エージェント | タスク分解プロンプト                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のユーザープロフィール管理は基本的な表示名・メールアドレス・アバターのみをサポートしているが、ワークフローオーケストレーターとしての利用において、より詳細なユーザー情報（タイムゾーン、言語設定、通知設定等）の管理が求められる。

### 1.2 問題点・課題

- 表示名以外のプロフィール情報が編集できない
- タイムゾーン設定がない（スケジュール機能に影響）
- 言語/ロケール設定がない
- 通知設定のカスタマイズができない
- プロフィール情報のエクスポート/インポート機能がない

### 1.3 放置した場合の影響

- グローバルユーザーへの対応不可
- スケジュール実行時のタイムゾーン問題
- パーソナライズされた体験の提供不可
- データポータビリティの欠如

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザープロフィールに詳細情報を追加し、パーソナライズされた体験を提供する。

### 2.2 最終ゴール

- タイムゾーン設定の追加と永続化
- 言語/ロケール設定の追加
- 通知設定（メール、デスクトップ、サウンド）の管理
- プロフィール情報のエクスポート/インポート機能
- Supabase `user_profiles` テーブルの拡張

### 2.3 スコープ

#### 含むもの

- Supabase user_profiles テーブルスキーマ拡張
- プロフィール設定UI（タイムゾーン、言語、通知）
- 設定値のCRUD操作
- ローカルキャッシュとの同期
- プロフィールエクスポート/インポート

#### 含まないもの

- 多言語対応の翻訳ファイル作成
- 実際の通知送信機能（設定のみ）
- ソーシャル機能（プロフィール公開等）

### 2.4 成果物

| 種別   | 成果物                        | 配置先                                                         |
| ------ | ----------------------------- | -------------------------------------------------------------- |
| DB     | Supabase マイグレーション     | Supabase Dashboard                                             |
| 機能   | プロフィール拡張IPCハンドラー | `apps/desktop/src/main/ipc/profileHandlers.ts`                 |
| 型定義 | 拡張プロフィール型            | `packages/shared/types/auth.ts`                                |
| UI     | プロフィール設定画面          | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/` |
| テスト | ユニットテスト                | `apps/desktop/src/main/ipc/__tests__/`                         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Supabase プロジェクトへの管理者アクセス権
- 既存の認証・プロフィールシステムが動作していること
- TASK-USER-DATA-01（APIキー管理）と並行または後続実装可能

### 3.2 依存タスク

- なし（独立して実装可能だが、TASK-USER-DATA-01の完了後が推奨）

### 3.3 必要な知識・スキル

- Supabase テーブル設計・マイグレーション
- Drizzle ORM スキーマ拡張
- React フォーム実装
- タイムゾーン処理（Intl API、date-fns-tz）

### 3.4 推奨アプローチ

1. **既存スキーマの拡張**: user_profiles テーブルにカラム追加
2. **後方互換性維持**: 既存フィールドに影響を与えない
3. **デフォルト値設定**: 新フィールドには合理的なデフォルト値
4. **段階的リリース**: 設定UIを順次追加

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 1.5: 設計レビュー
→ Phase 2: テスト作成 → Phase 3: 実装 → Phase 4: リファクタリング
→ Phase 5: 品質保証 → Phase 5.5: 最終レビュー → Phase 6: ドキュメント更新
```

---

### Phase 0: 要件定義

#### T-00-1: プロフィール拡張要件定義

##### 目的

拡張するプロフィール項目と要件を定義する。

##### Claude Code スラッシュコマンド

```
/ai:gather-requirements user-profile-enhancement
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 機能要件・非機能要件の明確化
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                 | 活用方法                   |
| ------------------------ | -------------------------- |
| .claude/skills/requirements-engineering/SKILL.md | プロフィール拡張要件の整理 |
| .claude/skills/use-case-modeling/SKILL.md        | ユーザー設定シナリオ定義   |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物     | パス                                                         | 内容         |
| ---------- | ------------------------------------------------------------ | ------------ |
| 要件定義書 | `docs/30-workflows/user-profile-enhancement/requirements.md` | 拡張項目一覧 |

##### 完了条件

- [ ] 追加プロフィール項目の確定
- [ ] 各項目のデータ型・制約定義
- [ ] デフォルト値の決定

---

### Phase 1: 設計

#### T-01-1: データベーススキーマ設計

##### 目的

Supabase user_profiles テーブルの拡張スキーマを設計する。

##### Claude Code スラッシュコマンド

```
/ai:design-database user_profiles
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/db-architect.md`
- **選定理由**: データベース設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名               | 活用方法                |
| ---------------------- | ----------------------- |
| .claude/skills/database-normalization/SKILL.md | 正規化設計              |
| .claude/skills/json-optimization/SKILL.md      | JSONB活用（通知設定等） |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                          | 内容         |
| -------------- | ------------------------------------------------------------- | ------------ |
| スキーマ設計書 | `docs/30-workflows/user-profile-enhancement/schema-design.md` | テーブル設計 |

##### 完了条件

- [ ] 追加カラム定義
- [ ] インデックス設計
- [ ] マイグレーションSQL作成

---

#### T-01-2: 型定義・バリデーション設計

##### 目的

拡張プロフィールの型定義とZodスキーマを設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-schema user-profile-extended
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/schema-def.md`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物 | パス                            | 内容       |
| ------ | ------------------------------- | ---------- |
| 型定義 | `packages/shared/types/auth.ts` | 拡張型定義 |

##### 完了条件

- [ ] ExtendedUserProfile型
- [ ] NotificationSettings型
- [ ] Zodスキーマ

---

#### T-01-3: UI/UX設計

##### 目的

プロフィール設定画面のUI/UXを設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-component ProfileSettings organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/ui-designer.md`
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                   | 活用方法                 |
| -------------------------- | ------------------------ |
| .claude/skills/design-system-architecture/SKILL.md | 設定画面レイアウト       |
| .claude/skills/accessibility-wcag/SKILL.md         | フォームアクセシビリティ |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物   | パス                                                      | 内容         |
| -------- | --------------------------------------------------------- | ------------ |
| UI設計書 | `docs/30-workflows/user-profile-enhancement/ui-design.md` | 設定画面設計 |

##### 完了条件

- [ ] セクション分割設計
- [ ] フォーム要素設計
- [ ] エクスポート/インポートUI設計

---

### Phase 1.5: 設計レビューゲート

#### T-01R: 設計レビュー

##### レビュー参加エージェント

| エージェント  | レビュー観点               | 選定理由           |
| ------------- | -------------------------- | ------------------ |
| .claude/agents/arch-police.md  | アーキテクチャ整合性       | 既存設計との整合性 |
| .claude/agents/db-architect.md | データベース設計           | スキーマ品質確認   |
| .claude/agents/sec-auditor.md  | プライバシー・セキュリティ | 個人情報の取り扱い |

- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全レビュー観点でPASS判定

---

### Phase 2: テスト作成 (TDD: Red)

#### T-02-1: プロフィール拡張テスト作成

##### 目的

拡張プロフィール機能のテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/ipc/profileHandlers.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                                   | 内容       |
| -------------- | ---------------------------------------------------------------------- | ---------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/profileHandlers.extended.test.ts` | 拡張テスト |

##### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run profileHandlers
```

- [ ] テストが失敗することを確認（Red状態）

##### 完了条件

- [ ] タイムゾーン設定テスト
- [ ] 言語設定テスト
- [ ] 通知設定テスト
- [ ] エクスポート/インポートテスト

---

### Phase 3: 実装 (TDD: Green)

#### T-03-1: Supabase マイグレーション実行

##### 目的

user_profiles テーブルにカラムを追加する。

##### 実行手順

1. Supabase Dashboard にログイン
2. SQL Editor でマイグレーションSQL実行
3. テーブル構造確認

##### 追加カラム（予定）

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Tokyo';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'ja';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
```

##### 完了条件

- [ ] マイグレーション成功
- [ ] 既存データに影響なし

---

#### T-03-2: 型定義・スキーマ実装

##### 目的

拡張プロフィールの型定義とZodスキーマを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-schema user-profile-extended
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/schema-def.md`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物 | パス                            | 内容       |
| ------ | ------------------------------- | ---------- |
| 型定義 | `packages/shared/types/auth.ts` | 拡張型追加 |

##### 完了条件

- [ ] タイムゾーン型（IANAタイムゾーン）
- [ ] ロケール型
- [ ] 通知設定型

---

#### T-03-3: IPC層拡張実装

##### 目的

プロフィール更新IPCハンドラーを拡張する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic profile-extended
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物        | パス                                           | 内容     |
| ------------- | ---------------------------------------------- | -------- |
| IPCハンドラー | `apps/desktop/src/main/ipc/profileHandlers.ts` | 拡張実装 |

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run profileHandlers
```

- [ ] テストが成功することを確認（Green状態）

##### 完了条件

- [ ] `profile:update-timezone` ハンドラー
- [ ] `profile:update-locale` ハンドラー
- [ ] `profile:update-notifications` ハンドラー
- [ ] `profile:export` ハンドラー
- [ ] `profile:import` ハンドラー

---

#### T-03-4: UI実装

##### 目的

プロフィール設定画面のUIコンポーネントを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-component ProfileSettingsSection organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/ui-designer.md`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                           | 内容   |
| -------------- | -------------------------------------------------------------- | ------ |
| コンポーネント | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/` | 設定UI |

##### 完了条件

- [ ] タイムゾーンセレクター
- [ ] 言語セレクター
- [ ] 通知設定トグル群
- [ ] エクスポート/インポートボタン

---

### Phase 4: リファクタリング (TDD: Refactor)

#### T-04-1: コード品質改善

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/ipc/profileHandlers.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし

---

### Phase 5: 品質保証

#### T-05-1: 統合テスト実行

##### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 完了条件

- [ ] 全テスト成功
- [ ] カバレッジ80%以上

---

### Phase 5.5: 最終レビューゲート

#### T-05R: 最終レビュー

##### レビュー参加エージェント

| エージェント  | レビュー観点 | 選定理由     |
| ------------- | ------------ | ------------ |
| .claude/agents/code-quality.md | コード品質   | 保守性確認   |
| .claude/agents/sec-auditor.md  | プライバシー | 個人情報保護 |

- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全レビュー観点でPASS

---

### Phase 6: ドキュメント更新

#### T-06: ドキュメント更新

##### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 更新対象ドキュメント

- `docs/00-requirements/master_system_design.md` - プロフィール仕様追記

##### 完了条件

- [ ] ドキュメント更新完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] タイムゾーン設定・保存が可能
- [ ] 言語設定・保存が可能
- [ ] 通知設定の変更が可能
- [ ] プロフィールエクスポートが可能
- [ ] プロフィールインポートが可能

### 品質要件

- [ ] 全テスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし

### ドキュメント要件

- [ ] システムドキュメント更新

---

## 6. 検証方法

### テストケース

1. **正常系**: タイムゾーンを変更し、再起動後も保持されることを確認
2. **正常系**: 通知設定を変更し、保存されることを確認
3. **正常系**: プロフィールをエクスポートし、JSONファイルが生成されることを確認
4. **正常系**: JSONファイルからインポートし、設定が復元されることを確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                      |
| ------------------------ | ------ | -------- | ----------------------------------------- |
| マイグレーション失敗     | 高     | 低       | バックアップ後に実行、ロールバックSQL準備 |
| 既存データ破損           | 高     | 低       | NULL許容・デフォルト値設定                |
| タイムゾーン処理の複雑化 | 中     | 中       | date-fns-tz使用、UTCベース保存            |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/ipc/profileHandlers.ts` - 既存プロフィールハンドラー
- `packages/shared/types/auth.ts` - 既存型定義

### 参考資料

- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [date-fns-tz](https://github.com/marnusw/date-fns-tz)

---

## 9. 備考

### 補足事項

- タイムゾーンはIANA形式（例: Asia/Tokyo）で保存
- 通知設定はJSONB型で柔軟に拡張可能な設計
- エクスポート形式はJSON（機密情報を除外）
