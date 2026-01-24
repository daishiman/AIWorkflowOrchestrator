# LLM設定のファイル外部化 - タスク指示書

## メタ情報

```yaml
task_id: UT-LLM-CONFIG-001
task_name: LLM設定のファイル外部化
category: 改善
target_feature: LLM API統合 / 設定管理
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12（システムプロンプトLLM API統合）
created_date: 2026-01-23
dependencies: []
issue_number: 462
spec_path: docs/30-workflows/unassigned-task/task-llm-config-file-externalization.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のLLM設定（デフォルトプロバイダー・モデル）は`llmConfigProvider.ts`にハードコードされている。システム仕様書（interfaces-llm.md）では「デフォルト値: providerId: "openai", modelId: "gpt-4o"」と記載されているが、これらの値を変更するにはコードの修正が必要。

### 1.2 問題点・課題

1. **柔軟性の欠如**: デフォルト設定の変更にコード修正が必要
2. **運用負荷**: 設定変更のたびにビルド・デプロイが必要
3. **カスタマイズ性**: ユーザーごとのデフォルト設定ができない

### 1.3 放置した場合の影響

- 設定変更のたびに開発者介入が必要
- 環境ごとの設定差異が管理しにくい
- CI/CDパイプラインでの設定切り替えが困難

---

## 2. 何を達成するか（What）

### 2.1 目的

LLM設定を外部ファイル（JSON/YAML）に移行し、コード変更なしで設定を変更可能にする。

### 2.2 最終ゴール

1. デフォルトLLM設定が設定ファイルから読み込まれる
2. 設定ファイルが存在しない場合はフォールバック値を使用
3. 設定ファイルのバリデーションが行われる
4. 設定変更がアプリ再起動で反映される

### 2.3 スコープ

#### 含むもの

- 設定ファイルフォーマットの定義（JSON）
- 設定ファイル読み込みロジック
- Zodスキーマによるバリデーション
- フォールバック機構

#### 含まないもの

- UIからの設定編集（別タスク）
- ホットリロード（再起動必要）
- クラウドからの設定同期

### 2.4 成果物

| 成果物         | 説明                               |
| -------------- | ---------------------------------- |
| 設定スキーマ   | Zodスキーマ定義                    |
| ConfigLoader   | 設定ファイル読み込みユーティリティ |
| デフォルト設定 | `llm-config.json`サンプル          |
| テストコード   | ユニット・統合テスト               |
| 実装ガイド     | Phase 12成果物                     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- システムプロンプトLLM API統合が完了している
- `llmConfigProvider.ts`が存在する

### 3.2 依存タスク

| タスクID                    | タスク名                      | ステータス |
| --------------------------- | ----------------------------- | ---------- |
| TASK-CHAT-SYSPROMPT-LLM-001 | システムプロンプトLLM API統合 | 完了       |

### 3.3 必要な知識

1. **Node.js fs API**: ファイル読み込み
2. **Zod**: スキーマ定義・バリデーション
3. **Electron app.getPath()**: 設定ファイル配置場所

### 3.4 推奨アプローチ

1. **階層的設定読み込み**:
   - デフォルト値（コード内）
   - システム設定（`app.getPath('userData')/config/llm-config.json`）
   - 環境変数（オーバーライド用）

2. **設定ファイルフォーマット**:
   ```json
   {
     "defaultProvider": "openai",
     "defaultModel": "gpt-4o",
     "providers": {
       "openai": {
         "models": ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]
       }
     }
   }
   ```

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                       |
| ----- | ------------ | -------------------------- |
| 1     | 要件定義     | 設定フォーマットの決定     |
| 2     | 設計         | スキーマ・読み込みロジック |
| 3     | 環境構築     | -                          |
| 4-7   | TDD実装      | テスト駆動開発             |
| 8-11  | 品質保証     | レビュー・リファクタリング |
| 12    | ドキュメント | 実装ガイド作成             |
| 13    | クロージング | 完了確認                   |

### Phase 4-5: TDD実装

#### 目的

設定ファイル読み込み機能の実装

#### 手順

1. Zodスキーマ定義

   ```typescript
   const LLMConfigSchema = z.object({
     defaultProvider: LLMProviderIdSchema.default("openai"),
     defaultModel: z.string().default("gpt-4o"),
     providers: z
       .record(
         z.object({
           models: z.array(z.string()).optional(),
         }),
       )
       .optional(),
   });
   ```

2. ConfigLoaderクラスの実装
3. `llmConfigProvider.ts`の更新
4. デフォルト設定ファイルのサンプル作成

#### 成果物

- `packages/shared/src/schemas/llmConfig.ts`
- `apps/desktop/src/main/utils/configLoader.ts`
- `apps/desktop/src/main/ipc/llmConfigProvider.ts`（更新）
- `apps/desktop/config/llm-config.example.json`

#### 完了条件

- [ ] 設定ファイルから値が読み込まれる
- [ ] 設定ファイル不在時にフォールバックが動作
- [ ] 不正な設定時にエラーメッセージが出力

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 設定ファイルが読み込まれる
- [ ] 設定ファイル不在時のフォールバックが動作
- [ ] 不正な設定でバリデーションエラーが発生
- [ ] 環境変数でのオーバーライドが動作

### 品質要件

- [ ] テストカバレッジ: Line 90%以上
- [ ] 全テストがPASS
- [ ] TypeScript型エラーなし

### ドキュメント要件

- [ ] 設定ファイルフォーマットのドキュメント
- [ ] 実装ガイド作成（Phase 12）
- [ ] システム仕様書更新

---

## 6. 検証方法

### テストケース

| カテゴリ | テスト内容                       |
| -------- | -------------------------------- |
| ユニット | ConfigLoaderの各メソッド         |
| 統合     | 設定ファイル読み込み→API呼び出し |
| 境界     | 空ファイル、不正JSON、権限エラー |

### 検証手順

1. 設定ファイルなしでアプリ起動 → デフォルト値が使用される
2. 設定ファイルを配置してアプリ再起動 → 設定値が反映される
3. 不正な設定ファイルを配置 → エラーログ + フォールバック

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                                 |
| ---------------- | ------ | -------- | ------------------------------------ |
| 設定ファイル破損 | 中     | 低       | JSONパースエラー時のフォールバック   |
| 権限エラー       | 中     | 低       | 適切なエラーハンドリング             |
| 設定ミス         | 中     | 中       | 詳細なバリデーションエラーメッセージ |

---

## 8. 参照情報

### 関連ドキュメント

- [interfaces-llm.md](.claude/skills/aiworkflow-requirements/references/interfaces-llm.md) - デフォルト値の定義

### 参考資料

- [Electron app.getPath()](https://www.electronjs.org/docs/latest/api/app#appgetpathname)
- [Zod Documentation](https://zod.dev/)

---

## 9. 備考

### 発見経緯

システムプロンプトLLM API統合（TASK-CHAT-SYSPROMPT-LLM-001）のPhase 12未タスク検出で、将来タスク候補として特定。

### 補足事項

- `getSelectedLLMConfig()`のデフォルト値（openai/gpt-4o）が対象
- 将来的にはUIからの設定編集機能と連携
- 12-factor appの設定外部化原則に準拠

---

## 変更履歴

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 1.0.0   | 2026-01-23 | 初版作成                  |
| 1.0.1   | 2026-01-24 | 仕様書復元、Issue再リンク |
