# タイムゾーン・言語選択機能 - タスク指示書

## メタ情報

| 項目             | 内容                             |
| ---------------- | -------------------------------- |
| タスクID         | TASK-LOCALE-TZ-001               |
| タスク名         | タイムゾーン・言語選択機能の実装 |
| 分類             | 改善                             |
| 対象機能         | User Profile Enhancement         |
| 優先度           | 低                               |
| 見積もり規模     | 中規模                           |
| ステータス       | 未実施                           |
| 発見元           | Phase 8（手動テスト検証）        |
| 発見日           | 2024-12-11                       |
| 発見エージェント | 手動テスト実行者                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

User Profile Enhancement機能の一部として、タイムゾーン選択と言語選択のUIコンポーネントを実装した。
しかし、手動テストで以下の問題が発見された：

- タイムゾーン変更時にIPC呼び出しエラーが発生
- ドロップダウンがz-indexの問題で他セクションの裏に隠れる
- Supabaseのuser_profilesテーブルにtimezone/localeカラムが正しく設定されていない可能性

### 1.2 問題点・課題

- タイムゾーン変更を試みると「タイムゾーンの更新に失敗しました」エラーが表示される
- 言語選択のドロップダウンが通知セクションの裏に隠れて選択不可
- 現時点でマルチ言語対応の優先度が低い（日本語のみで十分）
- Supabaseスキーマの拡張マイグレーションが未適用の可能性

### 1.3 放置した場合の影響

- 現状は日本固定で運用可能（致命的な影響なし）
- 将来的に海外ユーザーや多言語対応が必要になった際に対応が必要

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーがプロフィール設定画面からタイムゾーンと表示言語を変更できるようにする。

### 2.2 最終ゴール

1. タイムゾーン選択ドロップダウンが正常に動作する
2. 言語選択ドロップダウンが正常に動作する
3. 選択した設定がSupabaseに永続化される
4. アプリ再起動後も設定が保持される

### 2.3 スコープ

#### 含むもの

- タイムゾーン選択UIの修正・動作確認
- 言語選択UIの修正・動作確認
- IPC通信の修正（profile:update-timezone, profile:update-locale）
- Supabaseスキーマの確認・修正
- z-index問題の完全解決

#### 含まないもの

- 実際の多言語翻訳（i18n）の実装
- タイムゾーンに基づく日時フォーマットの自動変換

### 2.4 成果物

| 種別             | 成果物                                  | 配置先                                                       |
| ---------------- | --------------------------------------- | ------------------------------------------------------------ |
| 修正             | TimezoneSelector.tsx                    | apps/desktop/src/renderer/views/SettingsView/ProfileSection/ |
| 修正             | LocaleSelector.tsx                      | apps/desktop/src/renderer/views/SettingsView/ProfileSection/ |
| 修正             | ProfileSection/index.tsx                | apps/desktop/src/renderer/views/SettingsView/ProfileSection/ |
| 修正             | profileHandlers.ts                      | apps/desktop/src/main/ipc/                                   |
| マイグレーション | 003_extend_user_profiles.sql の適用確認 | supabase/migrations/                                         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Supabaseが稼働していること
- user_profilesテーブルにtimezone/localeカラムが存在すること
- デスクトップアプリがビルド可能であること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- React（useState, useCallback, useEffect）
- Electron IPC通信
- Supabaseデータベース操作
- TypeScript
- Tailwind CSS（z-index, ポジショニング）

### 3.4 推奨アプローチ

1. まずSupabaseスキーマを確認し、マイグレーションが適用されているか確認
2. IPC通信のエラー原因を調査（ログ確認）
3. z-index問題を修正（ドロップダウンに高いz-index値を設定）
4. 統合テストで動作確認

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件確認
Phase 1: スキーマ確認・修正
Phase 3: テスト作成
Phase 4: 実装修正
Phase 6: 品質保証
Phase 8: 手動テスト
```

### Phase 0: 要件確認

#### 目的

現在の実装状態とエラー原因を調査する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:debug-error タイムゾーン更新時のIPC通信エラー
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/db-architect.md
- **選定理由**: データベーススキーマの確認とマイグレーション状態の調査
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

| 成果物       | 内容                       |
| ------------ | -------------------------- |
| 調査レポート | エラー原因の特定と修正方針 |

#### 完了条件

- [ ] エラー原因が特定されている
- [ ] 修正方針が決定されている

---

### Phase 1: スキーマ確認・修正

#### 目的

Supabaseのuser_profilesテーブルにtimezone/localeカラムが存在するか確認し、必要に応じてマイグレーションを適用する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:optimize-queries supabase/migrations/003_extend_user_profiles.sql
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/dba-mgr.md
- **選定理由**: マイグレーションの適用と検証
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                                     |
| ---------------------- | -------------------------------------------- |
| .claude/skills/database-normalization/SKILL.md | スキーマ設計の妥当性確認                     |
| .claude/skills/transaction-management/SKILL.md | マイグレーション適用時のトランザクション管理 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                 | 内容                           |
| -------------------- | -------------------- | ------------------------------ |
| マイグレーション確認 | supabase/migrations/ | 適用済みマイグレーションの確認 |

#### 完了条件

- [ ] user_profilesテーブルにtimezone, localeカラムが存在
- [ ] RLSポリシーが正しく設定されている

---

### Phase 3: テスト作成

#### 目的

修正後の動作を検証するテストを作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/main/ipc/profileHandlers.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: タイムゾーン・ロケール更新のIPCハンドラーテスト作成
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] profile:update-timezone のテストケースが作成されている
- [ ] profile:update-locale のテストケースが作成されている
- [ ] テストが失敗することを確認（Red状態）

---

### Phase 4: 実装修正

#### 目的

タイムゾーン・言語選択機能を正常に動作させる。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/views/SettingsView/ProfileSection/TimezoneSelector.tsx
/ai:refactor apps/desktop/src/renderer/views/SettingsView/ProfileSection/LocaleSelector.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/electron-ui-dev.md
- **選定理由**: Electron UIコンポーネントの修正
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                                 |
| -------------------- | ---------------------------------------- |
| .claude/skills/electron-ui-patterns/SKILL.md | ドロップダウンUIのベストプラクティス適用 |
| .claude/skills/state-lifting/SKILL.md        | 状態管理の最適化                         |

- **参照**: `.claude/skills/skill_list.md`

#### 完了条件

- [ ] タイムゾーン選択が正常に動作する
- [ ] 言語選択が正常に動作する
- [ ] z-index問題が解決している
- [ ] テストが成功する（Green状態）

---

### Phase 6: 品質保証

#### 目的

修正後のコード品質を検証する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
/ai:lint --fix
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 完了条件

- [ ] 全テスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし

---

### Phase 8: 手動テスト

#### 目的

実際の操作で動作を確認する。

#### 手動テストケース

| No  | テスト項目       | 操作手順                               | 期待結果                     |
| --- | ---------------- | -------------------------------------- | ---------------------------- |
| 1   | タイムゾーン変更 | ドロップダウンでAmerica/New_Yorkを選択 | エラーなく変更される         |
| 2   | 言語変更         | ドロップダウンでEnglishを選択          | エラーなく変更される         |
| 3   | 永続化確認       | アプリ再起動後に設定画面を開く         | 選択した設定が保持されている |

#### 完了条件

- [ ] すべての手動テストがPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] タイムゾーン選択ドロップダウンが表示される
- [ ] タイムゾーン変更が正常に保存される
- [ ] 言語選択ドロップダウンが表示される
- [ ] 言語変更が正常に保存される
- [ ] アプリ再起動後も設定が保持される

### 品質要件

- [ ] 全ユニットテスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし

### ドキュメント要件

- [ ] 手動テストガイドの更新

---

## 6. 検証方法

### テストケース

1. タイムゾーン変更のIPC通信が成功する
2. ロケール変更のIPC通信が成功する
3. Supabaseにデータが永続化される
4. オフライン時にキャッシュからデータが表示される

### 検証手順

1. デスクトップアプリを起動
2. 設定画面 > プロフィール設定を開く
3. タイムゾーンを変更し、エラーが出ないことを確認
4. 言語を変更し、エラーが出ないことを確認
5. アプリを再起動し、設定が保持されていることを確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                     |
| ------------------------------ | ------ | -------- | ------------------------ |
| Supabaseマイグレーション未適用 | 高     | 中       | 本番環境のスキーマを確認 |
| z-index競合                    | 低     | 低       | 固定値z-[100]で統一      |
| IPC通信タイムアウト            | 中     | 低       | リトライ処理を実装       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/user-profile-enhancement/` - User Profile Enhancement実装ドキュメント
- `docs/00-requirements/15-database-design.md` - データベース設計

### 関連ファイル

- `apps/desktop/src/renderer/views/SettingsView/ProfileSection/TimezoneSelector.tsx`
- `apps/desktop/src/renderer/views/SettingsView/ProfileSection/LocaleSelector.tsx`
- `apps/desktop/src/main/ipc/profileHandlers.ts`
- `supabase/migrations/003_extend_user_profiles.sql`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
タイムゾーンの切り替えができないです。現在の時間を現地のタイムゾーンにしようとクリックしても、
エラーが出て「タイムゾーンの更新に失敗しました」と表示されます。
タイムゾーンをクリックすると各タイムゾーンが表示されるのですが、
それをクリックしても切り替わりません。表示されている内容が通知のブロックと干渉してしまい、
通知のブロックの下側にタイムゾーンの表示が出ています。

言語に関しても同様です。日本語のところをクリックすると、現状では日本語が選択されていますが、
他の言語を選択しようとしても選択窓が通知の裏側に来ているため、選択することができません。
```

### 補足事項

- 現時点では日本固定で運用可能なため、優先度は低
- 将来的に海外展開や多言語対応が必要になった際に実装予定
- コンポーネント自体は実装済みのため、修正のみで対応可能
