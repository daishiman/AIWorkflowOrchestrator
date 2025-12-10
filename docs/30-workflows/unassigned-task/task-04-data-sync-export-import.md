# データ同期・エクスポート/インポート機能 - タスク指示書

## メタ情報

| 項目             | 内容                                    |
| ---------------- | --------------------------------------- |
| タスクID         | TASK-USER-DATA-04                       |
| タスク名         | データ同期・エクスポート/インポート機能 |
| 分類             | 新規機能                                |
| 対象機能         | ユーザーデータ永続化                    |
| 優先度           | 低                                      |
| 見積もり規模     | 大規模                                  |
| ステータス       | 未実施                                  |
| 発見元           | ユーザー要件                            |
| 発見日           | 2025-12-10                              |
| 発見エージェント | タスク分解プロンプト                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ユーザーデータの永続化において、バックアップ・復元機能およびデバイス間のデータ移行機能は重要な要素である。現在はSupabaseでクラウド保存されているが、ユーザーがデータをエクスポートして手元に保管したり、別環境にインポートする機能がない。

### 1.2 問題点・課題

- ユーザーデータの手動バックアップができない
- デバイス移行時のデータ引き継ぎが困難
- データポータビリティ（GDPR等の要件）への対応が不十分
- 設定のテンプレート化・共有ができない

### 1.3 放置した場合の影響

- データ消失リスクへの対応不可
- 複数デバイス間での設定同期が困難
- 法的コンプライアンス要件を満たせない可能性
- ユーザーのデータ主権が確保できない

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーデータのエクスポート・インポート機能を実装し、データポータビリティとバックアップ・復元機能を提供する。

### 2.2 最終ゴール

- ユーザーデータの完全エクスポート（JSON形式）
- エクスポートデータからの復元（インポート）
- 選択的エクスポート（プロフィール、設定、ワークフロー等）
- 暗号化エクスポートオプション
- データ整合性検証

### 2.3 スコープ

#### 含むもの

- データエクスポートIPCハンドラー
- データインポートIPCハンドラー
- エクスポートファイル形式定義（JSON）
- 暗号化オプション（AES-256）
- 整合性チェック機能
- エクスポート/インポートUI

#### 含まないもの

- 自動同期サービス（クラウド同期は既存）
- 他アプリケーションとの互換形式
- リアルタイム同期
- 差分バックアップ

### 2.4 成果物

| 種別   | 成果物                     | 配置先                                                                |
| ------ | -------------------------- | --------------------------------------------------------------------- |
| 機能   | データエクスポートサービス | `packages/shared/services/dataExport.ts`                              |
| 機能   | データインポートサービス   | `packages/shared/services/dataImport.ts`                              |
| 機能   | 暗号化ユーティリティ       | `packages/shared/utils/encryption.ts`                                 |
| 機能   | データ同期IPCハンドラー    | `apps/desktop/src/main/ipc/dataSyncHandlers.ts`                       |
| UI     | データ管理画面             | `apps/desktop/src/renderer/views/SettingsView/DataManagementSection/` |
| 型定義 | エクスポートデータ型       | `packages/shared/types/export.ts`                                     |
| テスト | ユニットテスト             | `packages/shared/services/__tests__/`                                 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-USER-DATA-01（APIキー管理）が完了していること
- TASK-USER-DATA-02（プロフィール拡張）が完了していること
- 既存の認証・データベースシステムが動作していること

### 3.2 依存タスク

- TASK-USER-DATA-01（APIキー管理）- APIキーのエクスポート対象
- TASK-USER-DATA-02（プロフィール拡張）- 拡張プロフィールのエクスポート対象

### 3.3 必要な知識・スキル

- Node.js ファイルシステム操作
- 暗号化（Web Crypto API / Node.js crypto）
- JSON スキーマ設計
- データ整合性検証

### 3.4 推奨アプローチ

1. **段階的エクスポート**: カテゴリ別に選択可能
2. **バージョニング**: エクスポートファイルにバージョン情報
3. **後方互換性**: 旧形式ファイルのインポート対応
4. **セキュリティ**: 機密データの暗号化オプション

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

#### T-00-1: データエクスポート要件定義

##### 目的

エクスポート対象データと形式を定義する。

##### Claude Code スラッシュコマンド

```
/ai:gather-requirements data-export-import
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@req-analyst`
- **選定理由**: データポータビリティ要件の明確化
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                               | 活用方法                 |
| -------------------------------------- | ------------------------ |
| requirements-engineering               | エクスポート要件整理     |
| functional-non-functional-requirements | セキュリティ・互換性要件 |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物     | パス                                                   | 内容             |
| ---------- | ------------------------------------------------------ | ---------------- |
| 要件定義書 | `docs/30-workflows/data-export-import/requirements.md` | エクスポート要件 |

##### 完了条件

- [ ] エクスポート対象データ一覧
- [ ] ファイル形式仕様
- [ ] セキュリティ要件

---

#### T-00-2: データ形式設計

##### 目的

エクスポートファイルのJSON形式を設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-schema export-data
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@schema-def`
- **選定理由**: データスキーマ設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                    | 内容         |
| -------------- | ------------------------------------------------------- | ------------ |
| スキーマ設計書 | `docs/30-workflows/data-export-import/schema-design.md` | JSON形式定義 |

##### 完了条件

- [ ] エクスポートファイルスキーマ
- [ ] バージョニング戦略
- [ ] 拡張性考慮

---

### Phase 1: 設計

#### T-01-1: アーキテクチャ設計

##### 目的

エクスポート/インポート機能のアーキテクチャを設計する。

##### Claude Code スラッシュコマンド

```
/ai:design-architecture data-export-service
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@arch-police`
- **選定理由**: アーキテクチャ設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                      | 活用方法     |
| ----------------------------- | ------------ |
| clean-architecture-principles | レイヤー設計 |
| solid-principles              | 拡張性確保   |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物 | パス                                                   | 内容               |
| ------ | ------------------------------------------------------ | ------------------ |
| 設計書 | `docs/30-workflows/data-export-import/architecture.md` | アーキテクチャ設計 |

##### 完了条件

- [ ] サービス層設計
- [ ] IPC通信設計
- [ ] 暗号化フロー設計

---

#### T-01-2: セキュリティ設計

##### 目的

エクスポートデータの暗号化と安全な取り扱いを設計する。

##### Claude Code スラッシュコマンド

```
/ai:security-audit database
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@sec-auditor`
- **選定理由**: セキュリティ設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                      | 活用方法               |
| ----------------------------- | ---------------------- |
| cryptographic-practices       | 暗号化アルゴリズム選定 |
| security-configuration-review | セキュリティ設定       |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物             | パス                                               | 内容       |
| ------------------ | -------------------------------------------------- | ---------- |
| セキュリティ設計書 | `docs/30-workflows/data-export-import/security.md` | 暗号化設計 |

##### 完了条件

- [ ] 暗号化アルゴリズム選定（AES-256-GCM）
- [ ] 鍵導出方式（PBKDF2）
- [ ] 整合性検証方式

---

#### T-01-3: UI設計

##### 目的

データ管理画面のUIを設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-component DataManagementSection organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物   | パス                                                | 内容     |
| -------- | --------------------------------------------------- | -------- |
| UI設計書 | `docs/30-workflows/data-export-import/ui-design.md` | 画面設計 |

##### 完了条件

- [ ] エクスポート画面設計
- [ ] インポート画面設計
- [ ] 進捗表示設計

---

### Phase 1.5: 設計レビューゲート

#### T-01R: 設計レビュー

##### レビュー参加エージェント

| エージェント  | レビュー観点         | 選定理由           |
| ------------- | -------------------- | ------------------ |
| @arch-police  | アーキテクチャ整合性 | 設計品質確認       |
| @sec-auditor  | セキュリティ設計     | 暗号化実装確認     |
| @db-architect | データ整合性         | スキーマ整合性確認 |

- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全レビュー観点でPASS判定

---

### Phase 2: テスト作成 (TDD: Red)

#### T-02-1: エクスポートサービステスト

##### 目的

データエクスポートサービスのテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/services/dataExport.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@unit-tester`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                    | 内容               |
| -------------- | ------------------------------------------------------- | ------------------ |
| テストファイル | `packages/shared/services/__tests__/dataExport.test.ts` | エクスポートテスト |

##### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run dataExport
```

- [ ] テストが失敗することを確認（Red状態）

##### 完了条件

- [ ] 全データエクスポートテスト
- [ ] 選択的エクスポートテスト
- [ ] 暗号化エクスポートテスト
- [ ] エラーハンドリングテスト

---

#### T-02-2: インポートサービステスト

##### 目的

データインポートサービスのテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/services/dataImport.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@unit-tester`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                    | 内容             |
| -------------- | ------------------------------------------------------- | ---------------- |
| テストファイル | `packages/shared/services/__tests__/dataImport.test.ts` | インポートテスト |

##### 完了条件

- [ ] 正常インポートテスト
- [ ] 暗号化ファイルインポートテスト
- [ ] バージョン互換性テスト
- [ ] 整合性検証テスト
- [ ] 不正ファイル拒否テスト

---

#### T-02-3: 暗号化ユーティリティテスト

##### 目的

暗号化ユーティリティのテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/utils/encryption.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 成果物

| 成果物         | パス                                                 | 内容         |
| -------------- | ---------------------------------------------------- | ------------ |
| テストファイル | `packages/shared/utils/__tests__/encryption.test.ts` | 暗号化テスト |

##### 完了条件

- [ ] 暗号化/復号化テスト
- [ ] 鍵導出テスト
- [ ] 整合性検証テスト

---

### Phase 3: 実装 (TDD: Green)

#### T-03-1: 型定義・スキーマ実装

##### 目的

エクスポートデータの型定義とZodスキーマを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-schema export-data
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@schema-def`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物 | パス                              | 内容           |
| ------ | --------------------------------- | -------------- |
| 型定義 | `packages/shared/types/export.ts` | エクスポート型 |

##### 完了条件

- [ ] ExportData型
- [ ] ExportOptions型
- [ ] ImportResult型
- [ ] Zodバリデーションスキーマ

---

#### T-03-2: 暗号化ユーティリティ実装

##### 目的

データ暗号化/復号化ユーティリティを実装する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic encryption-utils
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@logic-dev`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物               | パス                                  | 内容       |
| -------------------- | ------------------------------------- | ---------- |
| 暗号化ユーティリティ | `packages/shared/utils/encryption.ts` | 暗号化機能 |

##### 完了条件

- [ ] AES-256-GCM暗号化
- [ ] PBKDF2鍵導出
- [ ] 整合性検証（HMAC）

---

#### T-03-3: エクスポートサービス実装

##### 目的

データエクスポートサービスを実装する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic data-export
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@logic-dev`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物               | パス                                     | 内容             |
| -------------------- | ---------------------------------------- | ---------------- |
| エクスポートサービス | `packages/shared/services/dataExport.ts` | エクスポート機能 |

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run dataExport
```

- [ ] テストが成功することを確認（Green状態）

##### 完了条件

- [ ] 全データエクスポート
- [ ] 選択的エクスポート
- [ ] 暗号化オプション
- [ ] バージョン情報付与

---

#### T-03-4: インポートサービス実装

##### 目的

データインポートサービスを実装する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic data-import
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@logic-dev`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物             | パス                                     | 内容           |
| ------------------ | ---------------------------------------- | -------------- |
| インポートサービス | `packages/shared/services/dataImport.ts` | インポート機能 |

##### 完了条件

- [ ] データ復元
- [ ] 暗号化ファイル復号
- [ ] バージョン互換性処理
- [ ] 整合性検証
- [ ] コンフリクト解決

---

#### T-03-5: IPCハンドラー実装

##### 目的

データ同期のIPCハンドラーを実装する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic data-sync-ipc
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@electron-architect`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物        | パス                                            | 内容    |
| ------------- | ----------------------------------------------- | ------- |
| IPCハンドラー | `apps/desktop/src/main/ipc/dataSyncHandlers.ts` | IPC実装 |

##### 完了条件

- [ ] `data:export` ハンドラー
- [ ] `data:import` ハンドラー
- [ ] `data:export-encrypted` ハンドラー
- [ ] `data:import-encrypted` ハンドラー
- [ ] 進捗通知

---

#### T-03-6: UI実装

##### 目的

データ管理画面のUIコンポーネントを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-component DataManagementSection organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                                  | 内容   |
| -------------- | --------------------------------------------------------------------- | ------ |
| コンポーネント | `apps/desktop/src/renderer/views/SettingsView/DataManagementSection/` | 管理UI |

##### 完了条件

- [ ] エクスポートボタン・オプション
- [ ] インポートボタン・ファイル選択
- [ ] 暗号化パスワード入力
- [ ] 進捗表示
- [ ] 結果表示

---

### Phase 4: リファクタリング (TDD: Refactor)

#### T-04-1: コード品質改善

##### Claude Code スラッシュコマンド

```
/ai:refactor packages/shared/services/dataExport.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@code-quality`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] 重複コード排除

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

#### T-05-2: セキュリティ監査

##### Claude Code スラッシュコマンド

```
/ai:security-audit all
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@sec-auditor`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 暗号化実装の検証
- [ ] 機密データ保護確認
- [ ] ファイル操作の安全性確認

---

### Phase 5.5: 最終レビューゲート

#### T-05R: 最終レビュー

##### レビュー参加エージェント

| エージェント  | レビュー観点       | 選定理由       |
| ------------- | ------------------ | -------------- |
| @code-quality | コード品質         | 保守性確認     |
| @arch-police  | アーキテクチャ遵守 | 設計原則確認   |
| @sec-auditor  | セキュリティ       | 暗号化実装確認 |

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

- `docs/00-requirements/02-non-functional-requirements.md` - バックアップ要件
- ユーザーマニュアル（エクスポート/インポート手順）

##### 完了条件

- [ ] 要件ドキュメント更新
- [ ] ユーザー向け手順書作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全データエクスポートが可能
- [ ] 選択的エクスポートが可能
- [ ] 暗号化エクスポートが可能
- [ ] データインポートが可能
- [ ] 暗号化ファイルのインポートが可能
- [ ] 整合性検証が動作

### 品質要件

- [ ] 全テスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] カバレッジ80%以上
- [ ] セキュリティ監査PASS

### ドキュメント要件

- [ ] システムドキュメント更新
- [ ] ユーザーマニュアル作成

---

## 6. 検証方法

### テストケース

1. **正常系**: 全データをエクスポートし、JSONファイルが生成される
2. **正常系**: 選択したカテゴリのみエクスポートされる
3. **正常系**: 暗号化エクスポートでパスワード入力が必要
4. **正常系**: エクスポートファイルをインポートし、データが復元される
5. **正常系**: 暗号化ファイルをパスワードで復号してインポート
6. **異常系**: 不正なファイル形式はエラー表示
7. **異常系**: 整合性エラーのファイルは警告表示

### 検証手順

1. 設定画面からエクスポートボタンをクリック
2. オプションを選択してエクスポート実行
3. 生成されたファイルを別環境でインポート
4. データが正しく復元されたことを確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                 |
| ------------------------ | ------ | -------- | ------------------------------------ |
| 大容量データのメモリ問題 | 高     | 中       | ストリーミング処理、分割エクスポート |
| 暗号化の脆弱性           | 高     | 低       | 標準アルゴリズム使用、定期的な監査   |
| バージョン非互換         | 中     | 中       | バージョニング、マイグレーション処理 |
| ファイル破損             | 中     | 低       | 整合性検証、チェックサム             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `packages/shared/types/auth.ts` - 既存型定義

### 参考資料

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [NIST Cryptographic Standards](https://csrc.nist.gov/publications/fips)
- [GDPR Data Portability](https://gdpr.eu/right-to-data-portability/)

---

## 9. 備考

### 補足事項

- APIキーはエクスポート時に暗号化必須とする
- エクスポートファイルには作成日時・バージョン・チェックサムを含める
- 大容量データの場合は進捗表示必須
- インポート時は既存データとのマージ/上書きオプションを提供
