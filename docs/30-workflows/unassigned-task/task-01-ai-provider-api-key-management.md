# AIプロバイダーAPIキー管理システム - タスク指示書

## メタ情報

| 項目             | 内容                              |
| ---------------- | --------------------------------- |
| タスクID         | TASK-USER-DATA-01                 |
| タスク名         | AIプロバイダーAPIキー管理システム |
| 分類             | 新規機能                          |
| 対象機能         | ユーザーデータ永続化              |
| 優先度           | 高                                |
| 見積もり規模     | 中規模                            |
| ステータス       | 未実施                            |
| 発見元           | ユーザー要件                      |
| 発見日           | 2025-12-10                        |
| 発見エージェント | タスク分解プロンプト              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AIWorkflowOrchestratorは複数のAIプロバイダー（OpenAI、Anthropic、Google、xAI等）と連携してワークフローを実行する。ユーザーは各自のAPIキーを使用してAIサービスにアクセスする必要があるが、現在はAPIキーの安全な永続化機構が実装されていない。

### 1.2 問題点・課題

- ユーザーがセッションごとにAPIキーを再入力する必要がある
- APIキーの安全な保存場所が定義されていない
- 複数のAIプロバイダーのキーを一元管理できない
- キーの有効性検証機能がない

### 1.3 放置した場合の影響

- ユーザー体験の著しい低下（毎回の入力が必要）
- APIキーの不適切な保存によるセキュリティリスク
- ワークフロー自動実行が不可能

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーのAIプロバイダーAPIキーを安全に永続化し、必要な時に利用できるようにする。

### 2.2 最終ゴール

- ユーザーがUIからAPIキーを登録・更新・削除できる
- APIキーがセキュアストレージ（Electron safeStorage）に暗号化保存される
- APIキーの有効性を検証できる
- オフライン時もローカル保存されたキーを使用可能

### 2.3 スコープ

#### 含むもの

- APIキー登録UI
- セキュアストレージへの暗号化保存
- APIキー一覧表示（マスク処理）
- APIキー有効性検証
- APIキー削除機能
- IPCハンドラー実装

#### 含まないもの

- サーバーサイドでのキー管理（クラウド保存）
- キーのローテーション自動化
- 課金管理・使用量トラッキング

### 2.4 成果物

| 種別         | 成果物                   | 配置先                                                         |
| ------------ | ------------------------ | -------------------------------------------------------------- |
| 機能         | APIキー管理IPCハンドラー | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                  |
| 機能         | APIキーストレージ        | `apps/desktop/src/main/infrastructure/apiKeyStorage.ts`        |
| 機能         | APIキー検証サービス      | `packages/shared/infrastructure/ai/apiKeyValidator.ts`         |
| UI           | APIキー設定画面          | `apps/desktop/src/renderer/views/SettingsView/ApiKeysSection/` |
| 型定義       | APIキー型定義            | `packages/shared/types/api-keys.ts`                            |
| テスト       | ユニットテスト           | `packages/shared/infrastructure/ai/__tests__/`                 |
| ドキュメント | 設定手順書               | `docs/30-workflows/api-key-management/`                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Electron safeStorage APIが利用可能であること
- 既存の認証システム（Supabase Auth）が動作していること
- IPC通信の基盤が構築済みであること

### 3.2 依存タスク

- なし（独立して実装可能）

### 3.3 必要な知識・スキル

- Electron Main Process / Renderer Process の通信
- Electron safeStorage API
- TypeScript / Zod バリデーション
- React コンポーネント設計

### 3.4 推奨アプローチ

1. **ローカルファーストアプローチ**: APIキーはローカルのセキュアストレージのみに保存
2. **暗号化必須**: Electron safeStorage で自動暗号化
3. **最小権限原則**: Renderer からは暗号化されたキーに直接アクセスさせない
4. **検証優先**: 保存前に各プロバイダーAPIでキーの有効性を検証

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

#### T-00-1: APIキー管理要件定義

##### 目的

APIキー管理機能の要件を明確化し、受け入れ基準を定義する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements api-key-management
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@req-analyst`
- **選定理由**: 要件工学の専門家として、曖昧な要望を検証可能な要件に変換
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                               | 活用方法                              |
| -------------------------------------- | ------------------------------------- |
| requirements-engineering               | MoSCoW優先度でAPIキー管理要件を整理   |
| acceptance-criteria-writing            | Given-When-Then形式で受け入れ基準定義 |
| functional-non-functional-requirements | セキュリティ要件（NFR）の明確化       |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物     | パス                                                   | 内容                 |
| ---------- | ------------------------------------------------------ | -------------------- |
| 要件定義書 | `docs/30-workflows/api-key-management/requirements.md` | 機能要件・非機能要件 |

##### 完了条件

- [ ] 対応AIプロバイダー一覧の確定
- [ ] セキュリティ要件の明文化
- [ ] 受け入れ基準の定義完了

---

### Phase 1: 設計

#### T-01-1: データモデル設計

##### 目的

APIキーの保存形式とデータ構造を設計する。

##### Claude Code スラッシュコマンド

```
/ai:design-domain-model api-key
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@domain-modeler`
- **選定理由**: DDDに基づいたデータモデル設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名              | 活用方法                           |
| --------------------- | ---------------------------------- |
| domain-driven-design  | エンティティと値オブジェクトの定義 |
| value-object-patterns | APIキーの不変性保証                |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物   | パス                                                         | 内容                            |
| -------- | ------------------------------------------------------------ | ------------------------------- |
| 型定義   | `packages/shared/types/api-keys.ts`                          | TypeScript型定義                |
| スキーマ | `packages/shared/infrastructure/database/schema/api-keys.ts` | Drizzleスキーマ（キャッシュ用） |

##### 完了条件

- [ ] APIキーエンティティの型定義完了
- [ ] プロバイダー列挙型の定義
- [ ] Zodバリデーションスキーマ作成

---

#### T-01-2: ストレージ設計

##### 目的

セキュアストレージの設計とIPC通信フローを定義する。

##### Claude Code スラッシュコマンド

```
/ai:design-architecture secure-storage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@electron-architect`
- **選定理由**: Electronアーキテクチャ設計とセキュリティの専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                    | 活用方法                   |
| --------------------------- | -------------------------- |
| electron-architecture       | Main/Renderer分離とIPC設計 |
| electron-security-hardening | セキュアストレージ設計     |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物 | パス                                                   | 内容           |
| ------ | ------------------------------------------------------ | -------------- |
| 設計書 | `docs/30-workflows/api-key-management/architecture.md` | ストレージ設計 |

##### 完了条件

- [ ] IPCチャネル設計完了
- [ ] 暗号化フロー図作成
- [ ] エラーハンドリング設計

---

#### T-01-3: UI/UX設計

##### 目的

APIキー設定画面のUI/UXを設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-component ApiKeySettings organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **選定理由**: UIコンポーネント設計とアクセシビリティの専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                   | 活用方法               |
| -------------------------- | ---------------------- |
| design-system-architecture | デザイントークン適用   |
| accessibility-wcag         | WCAG準拠のフォーム設計 |
| apple-hig-guidelines       | macOS向けUI最適化      |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物   | パス                                                | 内容                 |
| -------- | --------------------------------------------------- | -------------------- |
| UI設計書 | `docs/30-workflows/api-key-management/ui-design.md` | 画面設計・操作フロー |

##### 完了条件

- [ ] ワイヤーフレーム作成
- [ ] コンポーネント構成図
- [ ] マスク表示仕様定義

---

### Phase 1.5: 設計レビューゲート

#### T-01R: 設計レビュー

##### 目的

実装前に設計の妥当性を検証する。

##### レビュー参加エージェント

| エージェント       | レビュー観点         | 選定理由                       |
| ------------------ | -------------------- | ------------------------------ |
| @arch-police       | アーキテクチャ整合性 | Clean Architecture原則遵守確認 |
| @sec-auditor       | セキュリティ設計     | 暗号化・アクセス制御の適切性   |
| @electron-security | Electronセキュリティ | safeStorage実装の安全性        |

- **参照**: `.claude/agents/agent_list.md`

##### レビューチェックリスト

**アーキテクチャ整合性** (@arch-police)

- [ ] レイヤー違反がないか
- [ ] 依存関係逆転の原則が守られているか
- [ ] 既存設計との整合性

**セキュリティ設計** (@sec-auditor)

- [ ] 暗号化方式の適切性
- [ ] アクセス制御の設計
- [ ] ログ出力からの機密情報漏洩防止

**Electronセキュリティ** (@electron-security)

- [ ] safeStorageの正しい使用
- [ ] IPC通信の安全性
- [ ] Renderer側からの直接アクセス防止

##### 完了条件

- [ ] 全レビュー観点でPASS判定
- [ ] 指摘事項の対応完了

---

### Phase 2: テスト作成 (TDD: Red)

#### T-02-1: ストレージ層テスト作成

##### 目的

APIキーストレージのテストを作成し、Red状態を確認する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/infrastructure/apiKeyStorage.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@unit-tester`
- **選定理由**: TDD原則に基づいたテスト作成の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                | 活用方法                   |
| ----------------------- | -------------------------- |
| tdd-principles          | Red-Green-Refactorサイクル |
| test-doubles            | safeStorageのモック作成    |
| boundary-value-analysis | エッジケーステスト         |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                                   | 内容           |
| -------------- | ---------------------------------------------------------------------- | -------------- |
| テストファイル | `apps/desktop/src/main/infrastructure/__tests__/apiKeyStorage.test.ts` | ユニットテスト |

##### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run apiKeyStorage
```

- [ ] テストが失敗することを確認（Red状態）

##### 完了条件

- [ ] 保存テスト作成
- [ ] 取得テスト作成
- [ ] 削除テスト作成
- [ ] 暗号化テスト作成

---

#### T-02-2: IPC層テスト作成

##### 目的

APIキーIPCハンドラーのテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/ipc/apiKeyHandlers.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@unit-tester`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                         | 内容      |
| -------------- | ------------------------------------------------------------ | --------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/apiKeyHandlers.test.ts` | IPCテスト |

##### 完了条件

- [ ] 各IPCチャネルのテスト作成
- [ ] エラーハンドリングテスト作成

---

#### T-02-3: バリデーション層テスト作成

##### 目的

APIキー検証サービスのテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/infrastructure/ai/apiKeyValidator.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@unit-tester`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                                  | 内容                 |
| -------------- | --------------------------------------------------------------------- | -------------------- |
| テストファイル | `packages/shared/infrastructure/ai/__tests__/apiKeyValidator.test.ts` | バリデーションテスト |

##### 完了条件

- [ ] 各プロバイダーの検証テスト作成
- [ ] 無効なキーのテスト作成

---

### Phase 3: 実装 (TDD: Green)

#### T-03-1: 型定義・スキーマ実装

##### 目的

APIキー関連の型定義とZodスキーマを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-schema api-key
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@schema-def`
- **選定理由**: Zodスキーマ定義の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名             | 活用方法            |
| -------------------- | ------------------- |
| zod-validation       | APIキースキーマ定義 |
| type-safety-patterns | 厳格な型安全性確保  |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物 | パス                                | 内容      |
| ------ | ----------------------------------- | --------- |
| 型定義 | `packages/shared/types/api-keys.ts` | APIキー型 |

##### 完了条件

- [ ] AIプロバイダー列挙型
- [ ] APIキーエンティティ型
- [ ] Zodバリデーションスキーマ

---

#### T-03-2: ストレージ層実装

##### 目的

セキュアストレージ層を実装する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic api-key-storage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@logic-dev`
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物     | パス                                                    | 内容             |
| ---------- | ------------------------------------------------------- | ---------------- |
| ストレージ | `apps/desktop/src/main/infrastructure/apiKeyStorage.ts` | 暗号化ストレージ |

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run apiKeyStorage
```

- [ ] テストが成功することを確認（Green状態）

##### 完了条件

- [ ] safeStorage暗号化保存
- [ ] 復号化取得
- [ ] 削除処理

---

#### T-03-3: IPC層実装

##### 目的

APIキー管理のIPCハンドラーを実装する。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic api-key-ipc
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@electron-architect`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物        | パス                                          | 内容        |
| ------------- | --------------------------------------------- | ----------- |
| IPCハンドラー | `apps/desktop/src/main/ipc/apiKeyHandlers.ts` | IPC実装     |
| Preload       | `apps/desktop/src/preload/apiKeyApi.ts`       | Preload API |

##### 完了条件

- [ ] `apiKey:save` ハンドラー
- [ ] `apiKey:get` ハンドラー
- [ ] `apiKey:delete` ハンドラー
- [ ] `apiKey:validate` ハンドラー
- [ ] `apiKey:list` ハンドラー

---

#### T-03-4: バリデーション層実装

##### 目的

各AIプロバイダーのAPIキー検証ロジックを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-api-gateway ai-provider-validator
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@gateway-dev`
- **選定理由**: 外部API連携の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名            | 活用方法                      |
| ------------------- | ----------------------------- |
| api-client-patterns | 各プロバイダーAPIクライアント |
| retry-strategies    | 検証リトライ処理              |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物       | パス                                                   | 内容         |
| ------------ | ------------------------------------------------------ | ------------ |
| バリデーター | `packages/shared/infrastructure/ai/apiKeyValidator.ts` | 検証サービス |

##### 完了条件

- [ ] OpenAI検証
- [ ] Anthropic検証
- [ ] Google検証
- [ ] xAI検証

---

#### T-03-5: UI実装

##### 目的

APIキー設定画面のUIコンポーネントを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-component ApiKeysSection organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                           | 内容   |
| -------------- | -------------------------------------------------------------- | ------ |
| コンポーネント | `apps/desktop/src/renderer/views/SettingsView/ApiKeysSection/` | 設定UI |

##### 完了条件

- [ ] APIキー入力フォーム
- [ ] キー一覧表示（マスク）
- [ ] 削除確認ダイアログ
- [ ] 検証ステータス表示

---

### Phase 4: リファクタリング (TDD: Refactor)

#### T-04-1: コード品質改善

##### 目的

実装コードの品質を改善する。

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/infrastructure/apiKeyStorage.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@code-quality`
- **選定理由**: コード品質管理の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名               | 活用方法   |
| ---------------------- | ---------- |
| clean-code-practices   | 可読性向上 |
| refactoring-techniques | 重複排除   |

- **参照**: `.claude/skills/skill_list.md`

##### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが成功することを確認

##### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] 重複コード排除

---

### Phase 5: 品質保証

#### T-05-1: 統合テスト実行

##### 目的

全体の統合テストを実行し品質を確認する。

##### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@unit-tester`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全テスト成功
- [ ] カバレッジ80%以上

---

#### T-05-2: セキュリティ監査

##### 目的

セキュリティの観点から実装を監査する。

##### Claude Code スラッシュコマンド

```
/ai:security-audit auth
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@sec-auditor`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 暗号化実装の確認
- [ ] ログからの機密情報漏洩なし
- [ ] IPC通信の安全性確認

---

### Phase 5.5: 最終レビューゲート

#### T-05R: 最終レビュー

##### 目的

リリース前の最終品質確認を行う。

##### レビュー参加エージェント

| エージェント  | レビュー観点       | 選定理由             |
| ------------- | ------------------ | -------------------- |
| @code-quality | コード品質         | 保守性・可読性確認   |
| @arch-police  | アーキテクチャ遵守 | 設計原則準拠確認     |
| @sec-auditor  | セキュリティ       | 最終セキュリティ確認 |
| @unit-tester  | テスト品質         | テストカバレッジ確認 |

- **参照**: `.claude/agents/agent_list.md`

##### レビューチェックリスト

**コード品質** (@code-quality)

- [ ] コーディング規約準拠
- [ ] 適切なエラーハンドリング
- [ ] 過度な複雑性の排除

**セキュリティ** (@sec-auditor)

- [ ] OWASP Top 10対応
- [ ] 機密情報の適切な取り扱い

##### 完了条件

- [ ] 全レビュー観点でPASS

---

### Phase 6: ドキュメント更新・未完了タスク記録

#### T-06: ドキュメント更新

##### 目的

システムドキュメントを更新し、未完了タスクを記録する。

##### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@spec-writer`
- **参照**: `.claude/agents/agent_list.md`

##### 更新対象ドキュメント

- `docs/00-requirements/02-non-functional-requirements.md` - セキュリティ要件
- `docs/00-requirements/13-environment-variables.md` - 環境変数（該当する場合）

##### 完了条件

- [ ] 要件ドキュメント更新
- [ ] 設定手順書作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] APIキーの保存が可能
- [ ] APIキーの取得が可能
- [ ] APIキーの削除が可能
- [ ] APIキーの有効性検証が可能
- [ ] 対応プロバイダー: OpenAI, Anthropic, Google, xAI

### 品質要件

- [ ] 全テスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] カバレッジ80%以上

### ドキュメント要件

- [ ] 設定手順書作成
- [ ] システムドキュメント更新

---

## 6. 検証方法

### テストケース

1. **正常系**: APIキーを保存し、取得できることを確認
2. **正常系**: APIキーを削除できることを確認
3. **正常系**: 有効なAPIキーの検証が成功することを確認
4. **異常系**: 無効なAPIキーの検証が失敗することを確認
5. **異常系**: 存在しないキーの取得がエラーになることを確認

### 検証手順

1. 設定画面からAPIキーを入力
2. 検証ボタンで有効性確認
3. 保存後、再起動してもキーが保持されていることを確認
4. 削除後、キーが取得できないことを確認

---

## 7. リスクと対策

| リスク                | 影響度 | 発生確率 | 対策                                             |
| --------------------- | ------ | -------- | ------------------------------------------------ |
| safeStorageが利用不可 | 高     | 低       | 代替保存方式（警告付き平文保存）のフォールバック |
| APIキー漏洩           | 高     | 低       | ログからの除外、暗号化必須                       |
| プロバイダーAPI変更   | 中     | 中       | 検証ロジックの抽象化                             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `apps/desktop/src/main/infrastructure/secureStorage.ts` - 既存セキュアストレージ実装

### 参考資料

- [Electron safeStorage API](https://www.electronjs.org/docs/latest/api/safe-storage)
- [OpenAI API Authentication](https://platform.openai.com/docs/api-reference/authentication)
- [Anthropic API Authentication](https://docs.anthropic.com/en/api/authentication)

---

## 9. 備考

### 補足事項

- 既存の `secureStorage.ts` を参考に実装することで一貫性を保つ
- プロバイダー追加時の拡張性を考慮した設計が必要
- APIキーは絶対にログ出力しない
