# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 10                         |
| Phase名    | 最終レビューゲート         |
| タスクID   | TASK-9D                    |
| 前提Phase  | Phase 9（品質保証）        |
| 後続Phase  | Phase 11（手動テスト検証） |
| ステータス | pending                    |
| 作成日     | 2026-02-28                 |
| 機能名     | TASK-9D-skill-chain        |

---

## 目的

スキルチェーン機能全体の品質・整合性を9項目のレビュー観点で最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、機能完全性・セキュリティ・型安全性・テスト品質・コード品質・エラーハンドリング・IPC契約・Electron3プロセスモデル・Date型シリアライズの9観点で確認する。

## 背景

スキルチェーン機能はMain Process内の2サービス（SkillChainExecutor + SkillChainStore）、5つのIPCハンドラー、Preload層のchainAPI、Renderer層のskillSliceチェーン状態で構成される。
チェーン実行はスキルの連続呼び出し・条件分岐・テンプレート変数展開を含むため、セキュリティ（テンプレートインジェクション・循環参照・ReDoS）とデータ整合性（IPC境界でのDate型シリアライズ）の観点が特に重要である。
UI層（SkillChainBuilder / SkillChainStepEditor）はスコープ外（task-031b）であるためUI/UXレビューは対象外とし、バックエンド品質とレイヤー間契約に集中する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 9項目レビュー実施

**目的**: スキルチェーン機能を9項目のレビュー観点で多角的に検証する

**実行手順**:

1. 全対象ファイルを読み込む
2. 9項目のレビュー観点テーブルに基づいて順次検証する
3. 各観点の結果（OK / 指摘あり）を記録する
4. 指摘がある場合は重要度（MINOR / MAJOR / CRITICAL）を判定する

**9項目レビュー観点テーブル**:

| #   | レビュー観点            | 確認内容                                                                                                                        | 結果 | 指摘 |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | 機能完全性              | 5 IPCチャンネル（chain:list/get/save/delete/execute）が全て実装・テスト済み、チェーン実行・条件分岐・テンプレート展開が動作する | -    | -    |
| 2   | セキュリティ            | 全5チャンネルにvalidateIpcSender、3段バリデーション、エラーサニタイズ、テンプレートインジェクション防止                         | -    | -    |
| 3   | 型安全性                | TypeScript strict準拠、any型不使用、共有型定義（skill-chain.ts 7型）がMain/Preload/Renderer全層で正しく参照される               | -    | -    |
| 4   | テスト品質              | カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）、条件分岐・テンプレート展開の境界値テスト含む                       | -    | -    |
| 5   | コード品質              | Lint/型チェッククリア、未使用import排除、命名規則準拠、SOLID原則適用                                                            | -    | -    |
| 6   | エラーハンドリング      | 全エラーパスでユーザーフレンドリーなメッセージを返し、内部情報を漏洩しない                                                      | -    | -    |
| 7   | IPC契約                 | ハンドラー引数形式とPreload呼び出し形式の一致（P44/P45対策）、5チャネル全てで整合                                               | -    | -    |
| 8   | Electron3プロセスモデル | Main/Preload/Renderer責務分離、contextBridge経由、ホワイトリスト管理                                                            | -    | -    |
| 9   | Date型シリアライズ      | IPC境界でのISO 8601変換、createdAt/updatedAtの永続化・復元が正しい                                                              | -    | -    |

---

### タスク2: セキュリティ詳細レビュー

**目的**: セキュリティ観点をさらに深掘りし、チェーン機能固有の攻撃ベクトルに対する防御を検証する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のチェーン関連5ハンドラーを読み込む
2. セキュリティレビューマトリクスの全項目を検証する
3. `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` のテンプレート処理レビューを実施する
4. `apps/desktop/src/preload/skill-api.ts` のPreload API側もレビューする

**セキュリティレビューマトリクス**:

| チャンネル            | validateIpcSender | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| --------------------- | ----------------- | ------------- | ----------------- | ---------------- | ----------------- |
| `skill:chain:list`    | -                 | -             | -                 | -                | -                 |
| `skill:chain:get`     | -                 | -             | -                 | -                | -                 |
| `skill:chain:save`    | -                 | -             | -                 | -                | -                 |
| `skill:chain:delete`  | -                 | -             | -                 | -                | -                 |
| `skill:chain:execute` | -                 | -             | -                 | -                | -                 |

**チェーン機能固有のセキュリティ検証**:

| 攻撃ベクトル                       | 対策確認内容                                                                           | 結果 |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ---- |
| テンプレート変数インジェクション   | `{{variable}}` 構文で任意コード実行・パストラバーサル・XSSが不可能であること           | -    |
| チェーン循環参照によるDoS          | ステップの依存関係で無限ループが発生しないことの検証（循環検出アルゴリズムの実装確認） | -    |
| 大量ステップ登録によるリソース枯渇 | 1チェーンのステップ数に上限が設定されている                                            | -    |
| チェーン実行タイムアウト未設定     | チェーン全体の実行時間に上限が設定されている（無限実行防止）                           | -    |
| 中間結果のメモリ蓄積               | 多数のステップ結果がメモリを圧迫しないこと（ステップ数制限との連携）                   | -    |
| ステップ内スキル名パストラバーサル | 各ステップの skillName が `../` を含むパストラバーサル攻撃に対して安全であること       | -    |
| SkillChainCondition regex ReDoS    | 条件式の regex パターンが壊滅的バックトラッキングを引き起こさないこと                  | -    |
| チェーン定義のJSONインジェクション | SkillChainDefinition の save 時にJSON構造が検証されている                              | -    |
| 中間結果からの機密情報漏洩         | ステップ間で渡される中間結果に機密情報（APIキー等）が含まれないことの確認              | -    |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク3: 型安全性・IPC契約レビュー

**目的**: Preload型定義とMainハンドラーの型が完全整合し、IPC契約にドリフトがないことを確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` の新規追加型を読み込む
2. `apps/desktop/src/main/ipc/skillHandlers.ts` のチェーンハンドラー引数・戻り値型と比較する
3. P44対策として、ハンドラー引数形式とPreload側の呼び出し形式が一致していることを確認する
4. P45対策として、引数名のセマンティクスが実際に渡される値と一致していることを確認する
5. `packages/shared/src/types/skill-chain.ts` の7型が全レイヤーで一貫して使用されていることを確認する
6. SkillChainResult / StepResult 型がIPC境界（JSON.stringify/parse）を安全に通過することを確認する

**型整合性マトリクス**:

| メソッド      | Preload引数型 | Main引数型 | Preload戻り値型 | Main戻り値型 | 整合 |
| ------------- | ------------- | ---------- | --------------- | ------------ | ---- |
| chain.list    | -             | -          | -               | -            | -    |
| chain.get     | -             | -          | -               | -            | -    |
| chain.save    | -             | -          | -               | -            | -    |
| chain.delete  | -             | -          | -               | -            | -    |
| chain.execute | -             | -          | -               | -            | -    |

**IPC契約チェック（P44/P45対策）**:

| チェック項目              | 確認内容                                                                     | 結果 |
| ------------------------- | ---------------------------------------------------------------------------- | ---- |
| 引数形式一致              | ハンドラーが期待する引数形式とPreload側の渡し方が一致しているか              | -    |
| 引数名セマンティクス一致  | 引数名（chainId, chainDefinition等）が実際に渡される値の意味と一致しているか | -    |
| 内部メソッド引数名伝搬    | SkillChainExecutor/SkillChainStore側の引数名もPreload側と一貫しているか      | -    |
| 型アサーション不使用      | `as` による型アサーションでバリデーションを回避していないか                  | -    |
| 共有型利用                | 7型定義がpackages/sharedから正しくimportされているか                         | -    |
| SkillChainResult JSON互換 | Date型プロパティがIPC通過時にISO 8601文字列に正しく変換されるか              | -    |
| StepResult JSON互換       | ステップ結果のネストしたオブジェクトがJSON.stringify/parseで損失しないか     | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 更新状況 |
| -------------------------------------- | -------- |
| `packages/shared/src/types/index.ts`   | -        |
| `apps/desktop/src/preload/types.ts`    | -        |
| `apps/desktop/src/preload/channels.ts` | -        |

**期待される成果物**:

- `outputs/phase-10/type-ipc-contract-review.md`

---

### タスク4: アーキテクチャレビュー

**目的**: レイヤー依存方向・ホワイトリスト管理・3プロセスモデル準拠を確認する

**実行手順**:

1. レイヤー依存方向（Renderer → Preload → Main）が守られていることを確認する
2. `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されていることを確認する
3. ハンドラー登録/解除が正しく実装されていることを確認する（P5対策: 二重登録防止）
4. skillSlice のチェーン状態が個別セレクタパターン（P31対策）に準拠していることを確認する
5. SkillChainExecutor が SkillService の `executeSkill` を呼び出し、戻り値/例外を `StepResult` へ正規化していることを確認する

**アーキテクチャチェックリスト**:

| チェック項目                       | 確認内容                                                                                             | 結果 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| ホワイトリスト追加                 | `ALLOWED_INVOKE_CHANNELS` に5チャンネル追加済み                                                      | -    |
| ハンドラー登録                     | チェーン関連5ハンドラーが登録済み                                                                    | -    |
| ハンドラー解除                     | unregister時に5チャンネルが解除される（P5対策）                                                      | -    |
| チャンネル定数（正本と副本の一致） | `packages/shared` と `apps/desktop` のチャンネル値一致                                               | -    |
| レイヤー依存方向                   | Renderer → Preload → Main の一方向依存                                                               | -    |
| contextBridge経由                  | Renderer からの chainAPI アクセスが contextBridge 経由                                               | -    |
| 個別セレクタパターン               | skillSliceのチェーン状態がP31準拠の個別セレクタで提供される                                          | -    |
| SkillService連携                   | SkillChainExecutor が各ステップで SkillService.executeSkill を呼び、結果を StepResult に反映している | -    |
| DI パターン                        | 依存オブジェクトのインジェクション方式が適切（Constructor/Setter）                                   | -    |

**Electron 3プロセスモデル確認**:

| プロセス | 責務確認内容                                                                   | 結果 |
| -------- | ------------------------------------------------------------------------------ | ---- |
| Main     | SkillChainExecutor/SkillChainStore/IPCハンドラーがMain Processに配置されている | -    |
| Preload  | chainAPIがcontextBridge経由でRenderer層に公開されている                        | -    |
| Renderer | skillSliceがUI状態のみを管理し、チェーン実行ロジックを含まない                 | -    |

**期待される成果物**:

- `outputs/phase-10/architecture-review.md`

---

### タスク5: Date型シリアライズ・データ整合性レビュー

**目的**: IPC境界でのDate型変換とデータ整合性を確認する

**実行手順**:

1. SkillChainDefinition / SkillChainResult / StepResult のDate型プロパティを特定する
2. save → get のラウンドトリップでDate型が正しく保存・復元されることを確認する
3. executeChain の結果に含まれるタイムスタンプがIPC境界を通過した後も正確であることを確認する
4. チェーン定義のcreatedAt / updatedAt が electron-store に ISO 8601文字列として保存されていることを確認する

**Date型シリアライズチェックリスト**:

| チェック項目                     | 確認内容                                                        | 結果 |
| -------------------------------- | --------------------------------------------------------------- | ---- |
| SkillChainDefinition.createdAt   | save時にISO 8601文字列に変換、get時にDateオブジェクトに復元     | -    |
| SkillChainDefinition.updatedAt   | save時にISO 8601文字列に変換、get時にDateオブジェクトに復元     | -    |
| SkillChainResult.startedAt       | executeChain結果のタイムスタンプがIPC経由でRendererに正しく伝達 | -    |
| SkillChainResult.completedAt     | 完了タイムスタンプがISO 8601でシリアライズされる                | -    |
| StepResult.startedAt/completedAt | 各ステップの実行時間がISO 8601でシリアライズされる              | -    |
| list時の一括変換                 | 全チェーン定義のDate型フィールドが一括で正しく変換されている    | -    |

**期待される成果物**:

- `outputs/phase-10/date-serialization-review.md`

---

### タスク6: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜5の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS / MINOR / MAJOR / CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                                                             | 次のアクション                                      |
| -------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| PASS     | 全9項目のレビュー観点で問題なし                                                  | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能・セキュリティに影響なし）                                   | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能に影響）                                       | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（テンプレートインジェクション・循環参照によるDoS・IPC契約破綻） | Phase 1 へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順**（省略不可）:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

> **注意**: 「機能影響なし」であっても MINOR 指摘の未タスク化は省略不可（05-task-execution.md準拠）

**戻り先決定基準**:

| 問題の種類                                                 | 戻り先                |
| ---------------------------------------------------------- | --------------------- |
| セキュリティ要件の未充足（テンプレートインジェクション等） | Phase 1（要件定義）   |
| IPCインターフェース設計の問題                              | Phase 2（設計）       |
| テスト設計の不足                                           | Phase 4（テスト作成） |
| 実装の問題（ロジックエラー・循環参照未防止）               | Phase 5（実装）       |
| コード品質の問題                                           | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| #   | レビュー観点            | 結果 | 指摘事項 | 重要度 |
| --- | ----------------------- | ---- | -------- | ------ |
| 1   | 機能完全性              | -    | -        | -      |
| 2   | セキュリティ            | -    | -        | -      |
| 3   | 型安全性                | -    | -        | -      |
| 4   | テスト品質              | -    | -        | -      |
| 5   | コード品質              | -    | -        | -      |
| 6   | エラーハンドリング      | -    | -        | -      |
| 7   | IPC契約                 | -    | -        | -      |
| 8   | Electron3プロセスモデル | -    | -        | -      |
| 9   | Date型シリアライズ      | -    | -        | -      |
| -   | **最終判定**            | -    | -        | -      |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料              | パス                                                                 | 内容                   |
| --------------------- | -------------------------------------------------------------------- | ---------------------- |
| SkillChainExecutor    | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`         | チェーン実行エンジン   |
| SkillChainStore       | `apps/desktop/src/main/services/skill/SkillChainStore.ts`            | チェーン永続化         |
| IPCハンドラー         | `apps/desktop/src/main/ipc/skillHandlers.ts`                         | Main Processハンドラー |
| チェーン型定義        | `packages/shared/src/types/skill-chain.ts`                           | 共有型定義（7型）      |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                              | Preload API実装        |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                                  | 型定義                 |
| チャンネル定数        | `apps/desktop/src/preload/channels.ts`                               | チャンネル定義         |
| skillSlice            | `apps/desktop/src/renderer/store/slices/skillSlice.ts`               | Renderer状態管理       |
| 初期化コード          | `apps/desktop/src/main/ipc/index.ts`                                 | アプリ起動統合         |
| テストファイル        | `apps/desktop/src/main/services/skill/__tests__/SkillChainExecutor*` | Executorテスト         |
| テストファイル        | `apps/desktop/src/main/services/skill/__tests__/SkillChainStore*`    | Storeテスト            |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-gate-result.md`                             | 品質検証結果           |
| Phase 1要件仕様       | `outputs/phase-1/`                                                   | 要件                   |
| Phase 2設計           | `outputs/phase-2/`                                                   | 設計                   |
| Phase 5実装成果物     | `outputs/phase-5/`                                                   | 実装コード・実装記録   |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                    |
| --------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC チャンネル          |
| インターフェース定義  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキルAPI型定義         |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ        |
| Skill IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | Skill系IPC境界          |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ          |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 設計パターン集          |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand設計原則         |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45検証 |
| 教訓集                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の教訓              |

### スキルチェーン設計資産

| 参照資料                 | パス                                                              | 内容                          |
| ------------------------ | ----------------------------------------------------------------- | ----------------------------- |
| チェーン設計エージェント | `.claude/skills/skill-creator/agents/design-skill-chain.md`       | 設計思考プロセス（8ステップ） |
| チェーンパターン集       | `.claude/skills/skill-creator/references/skill-chain-patterns.md` | 基本4+応用2パターン           |
| オーケストレーション     | `.claude/skills/skill-creator/references/orchestration-guide.md`  | 全体アーキテクチャ・変数構文  |

---

## 成果物

| 成果物                     | パス                                            | 内容                             |
| -------------------------- | ----------------------------------------------- | -------------------------------- |
| セキュリティレビュー       | `outputs/phase-10/security-review.md`           | セキュリティ検証結果             |
| 型安全性・IPC契約レビュー  | `outputs/phase-10/type-ipc-contract-review.md`  | 型整合性・IPC契約確認結果        |
| アーキテクチャレビュー     | `outputs/phase-10/architecture-review.md`       | 構成・3プロセスモデル確認結果    |
| Date型シリアライズレビュー | `outputs/phase-10/date-serialization-review.md` | Date型変換・データ整合性確認結果 |
| 最終判定                   | `outputs/phase-10/final-review-result.md`       | 判定結果                         |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目                 | 基準                                                   |
| ------------------------ | ------------------------------------------------------ |
| 全テスト                 | 100% パス                                              |
| SkillChainExecutorテスト | チェーン実行・条件分岐・テンプレート展開テスト全件成功 |
| SkillChainStoreテスト    | CRUD・永続化・Date型シリアライズ・復元テスト全件PASS   |
| IPCハンドラーテスト      | 5チャンネル全て正常動作確認済み                        |
| セキュリティテスト       | sender検証・バリデーション・エラーサニタイズ確認済み   |
| チェーン型テスト         | 7型の型ガード・バリデーションテスト全件PASS            |
| skillSliceテスト         | チェーン状態管理・個別セレクタテスト全件PASS           |
| Date型シリアライズテスト | IPC境界でのDate型ラウンドトリップテスト全件PASS        |

---

## 多角的チェック観点

| #   | 観点                    | 確認ポイント                                                                                                                |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | 機能完全性              | 5チャンネル全実装、チェーン実行・条件分岐（eq/neq/gt/lt/contains/regex）・テンプレート展開（`{{variable}}`）対応            |
| 2   | セキュリティ            | validateIpcSender全適用、3段バリデーション、sanitizeErrorMessage、テンプレートインジェクション防止、ReDoS防止、循環参照防止 |
| 3   | 型安全性                | TypeScript strict、any型不使用、共有7型定義の一貫参照、IPC境界でのDate型ISO 8601変換                                        |
| 4   | テスト品質              | カバレッジ基準達成、条件分岐全パターンテスト、テンプレート変数展開テスト、エラーケーステスト                                |
| 5   | コード品質              | Lint/型チェッククリア、命名規則準拠、SOLID原則適用、Result<T,E>パターン統一                                                 |
| 6   | エラーハンドリング      | 全エラーパスでユーザーフレンドリーメッセージ、内部情報非漏洩、ステップ失敗時のチェーン全体の適切な処理                      |
| 7   | IPC契約                 | P44/P45対策、引数形式一致、引数名セマンティクス一致、7型の整合                                                              |
| 8   | Electron3プロセスモデル | Main（Executor/Store/IPCハンドラー）、Preload（chainAPI）、Renderer（skillSlice）の責務分離                                 |
| 9   | Date型シリアライズ      | createdAt/updatedAt/startedAt/completedAtのISO 8601変換、electron-store永続化、IPC境界通過時の正確性                        |

---

## 完了条件

- [ ] 9項目のレビュー観点で全ての検証が完了している
- [ ] セキュリティレビューで全5ハンドラーが要件を満たしている
- [ ] チェーン機能固有のセキュリティ検証（9項目: テンプレートインジェクション・循環参照・ReDoS等）が完了している
- [ ] 型安全性レビューで型不整合がない
- [ ] IPC契約レビューでP44/P45対策が確認済みである
- [ ] アーキテクチャレビューでホワイトリスト・登録/解除・3プロセスモデル準拠が正しい
- [ ] Date型シリアライズレビューでIPC境界のラウンドトリップが正確である
- [ ] テストカバレッジ目標を達成している
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が3ステップ全完了で作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-11-manual-test.md`
