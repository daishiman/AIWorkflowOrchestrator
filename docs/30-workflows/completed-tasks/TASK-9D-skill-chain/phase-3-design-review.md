# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 3                                        |
| 機能名     | TASK-9D-skill-chain                      |
| タスク名   | スキルチェーン機能 設計レビューゲート    |
| 作成日     | 2026-02-28                               |
| ステータス | pending                                  |
| 前提       | Phase 1（要件定義）・Phase 2（設計）完了 |

## 目的

Phase 1（要件定義）で抽出した機能要件（FR-1 〜 FR-8）・非機能要件（NFR-1 〜 NFR-4）が Phase 2（設計）で漏れなくカバーされているかを検証する。IPC 設計・セキュリティ・型安全・Electron 3 プロセスモデルとの整合性を多角的にレビューし、PASS / MINOR / MAJOR の判定を行う。

## 実行タスク

| #   | タスク名                          | 目的                                                        |
| --- | --------------------------------- | ----------------------------------------------------------- |
| 1   | 要件充足性レビュー                | Phase 1 の全要件が Phase 2 設計でカバーされているか検証する |
| 2   | IPC 設計レビュー                  | 5 チャネルの整合性・バリデーション・セキュリティを検証する  |
| 3   | 型安全レビュー                    | 型定義の整合性・any 型不使用・P32 準拠を検証する            |
| 4   | Electron 3 プロセスモデルレビュー | Main/Preload/Renderer の責務分離を検証する                  |
| 5   | 既知の落とし穴チェック            | P31/P32/P42/P44/P45 への対策が設計に含まれているか検証する  |
| 6   | 判定                              | PASS / MINOR / MAJOR の判定を行う                           |

- 要件充足性レビュー: Phase 1要件がPhase 2設計で網羅されているかを確認する。
- IPC 設計レビュー: 5チャネルの契約整合・バリデーション・セキュリティを確認する。
- 型安全レビュー: `any` 不使用と shared/preload 同期（P32）を確認する。
- 3プロセスモデルレビュー: Main/Preload/Renderer の責務境界を確認する。
- 落とし穴チェック: P31/P32/P42/P44/P45 対策の実装方針を確認する。
- 判定: PASS / MINOR / MAJOR を決定し次Phase遷移可否を確定する。

## 参照資料

| 資料名                     | パス                                                                                                                         | 用途                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義           | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-1-requirements.md`                                              | レビュー対象（要件）         |
| Phase 2 設計               | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-2-design.md`                                                    | レビュー対象（設計）         |
| タスク仕様                 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` | TASK-9D タスク定義           |
| 機能仕様 §18               | `docs/30-workflows/skill-import-agent-system/specification.md`                                                               | スキル連携・チェーン機能仕様 |
| 技術判断 §19               | `docs/30-workflows/skill-import-agent-system/technical-decisions.md`                                                         | 設計判断の根拠               |
| IPC 契約                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                         | 既存 IPC チャネル契約        |
| インターフェース定義       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                            | スキル統一 API 仕様          |
| セキュリティ IPC           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                    | IPC セキュリティ要件         |
| Electron セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                 | Electron 3 プロセスモデル    |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                | IPC ハンドラ検証手順         |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                  | アーキテクチャ実装パターン   |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                 | Zustand 状態管理設計         |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                       | 過去のインシデント教訓       |
| チェーン設計エージェント   | `.claude/skills/skill-creator/agents/design-skill-chain.md`                                                                  | 設計思考プロセス 8 ステップ  |
| チェーンパターン集         | `.claude/skills/skill-creator/references/skill-chain-patterns.md`                                                            | 基本 4 + 応用 4 パターン     |
| オーケストレーションガイド | `.claude/skills/skill-creator/references/orchestration-guide.md`                                                             | 全体アーキテクチャ・変数構文 |

## 実行手順

### Step 1: 要件充足性レビュー

Phase 1 の全要件が Phase 2 設計で対応されているかをマトリクスで検証する。

#### FR 充足マトリクス

| 要件 ID | 要件概要                            | 設計での対応箇所                                  | 充足判定 |
| ------- | ----------------------------------- | ------------------------------------------------- | -------- |
| FR-1-1  | チェーン定義の新規作成              | SkillChainStore.save() + IPC skill:chain:save     | □        |
| FR-1-2  | チェーン定義の ID 指定取得          | SkillChainStore.get() + IPC skill:chain:get       | □        |
| FR-1-3  | チェーン定義の一覧取得              | SkillChainStore.list() + IPC skill:chain:list     | □        |
| FR-1-4  | チェーン定義の更新                  | SkillChainStore.save() + updatedAt 更新           | □        |
| FR-1-5  | チェーン定義の削除                  | SkillChainStore.delete() + IPC skill:chain:delete | □        |
| FR-1-6  | 存在しない chainId のエラー         | IPC ハンドラの null チェック + エラーレスポンス   | □        |
| FR-2-1  | ステップ順次実行                    | SkillChainExecutor.executeChain() の for ループ   | □        |
| FR-2-2  | 前ステップ出力の入力転送            | buildStepInput() の previousOutput 処理           | □        |
| FR-2-3  | SkillChainResult の返却             | executeChain() の戻り値型                         | □        |
| FR-2-4  | ステップ実行時間の記録              | StepResult.duration の計測ロジック                | □        |
| FR-2-5  | チェーン全体の実行時間記録          | totalDuration の計測ロジック                      | □        |
| FR-3-1  | condition 未指定時の常時実行        | evaluateCondition() の undefined → true           | □        |
| FR-3-2  | type="always" の常時実行            | evaluateCondition() の always 分岐                | □        |
| FR-3-3  | type="ifVariable" の条件実行        | evaluateCondition() の ifVariable 分岐            | □        |
| FR-3-4  | type="ifPreviousSuccess" の条件実行 | evaluateCondition() の ifPreviousSuccess 分岐     | □        |
| FR-3-5  | type="expression" の条件実行        | evaluateCondition() の expression 分岐            | □        |
| FR-3-6  | スキップ時の StepResult             | for ループ内の skipped=true 設定                  | □        |
| FR-4-1  | errorHandling="stop" の動作         | エラーハンドリング擬似コード stop 分岐            | □        |
| FR-4-2  | errorHandling="skip" の動作         | エラーハンドリング擬似コード skip 分岐            | □        |
| FR-4-3  | errorHandling="retry" のリトライ    | maxAttempts ループ + retry 分岐                   | □        |
| FR-4-4  | リトライ成功時の続行                | for ループ内の break + stepSuccess=true           | □        |
| FR-5-1  | Mustache テンプレート展開           | renderTemplate() メソッド                         | □        |
| FR-5-2  | variable 型の変数取得               | buildStepInput() の variable 処理                 | □        |
| FR-5-3  | literal 型のリテラル設定            | buildStepInput() の literal 処理                  | □        |
| FR-5-4  | OutputMapping の変数格納            | extractOutput() + context.variables 格納          | □        |
| FR-6-1  | JSONPath 出力抽出                   | extractOutput() の extractPath 処理               | □        |
| FR-6-2  | extractPath 未指定時の全体格納      | extractOutput() の undefined パス処理             | □        |
| FR-7-1  | skill:chain:list IPC                | IPC ハンドラ設計 + Preload chainAPI.list          | □        |
| FR-7-2  | skill:chain:get IPC                 | IPC ハンドラ設計 + Preload chainAPI.get           | □        |
| FR-7-3  | skill:chain:save IPC                | IPC ハンドラ設計 + Preload chainAPI.save          | □        |
| FR-7-4  | skill:chain:delete IPC              | IPC ハンドラ設計 + Preload chainAPI.delete        | □        |
| FR-7-5  | skill:chain:execute IPC             | IPC ハンドラ設計 + Preload chainAPI.execute       | □        |
| FR-7-6  | P42 準拠 3 段バリデーション         | 各ハンドラのバリデーションコード                  | □        |
| FR-7-7  | sender 検証                         | validateIpcSender 呼び出し                        | □        |
| FR-8-1  | skillSlice チェーン状態             | SkillChainSliceState 型定義                       | □        |
| FR-8-2  | チェーン実行状態管理                | ChainExecutionStatus 型定義                       | □        |
| FR-8-3  | 個別セレクタ提供                    | useChains, useChainExecutionStatus 等 10 個       | □        |

#### NFR 充足マトリクス

| 要件 ID | 要件概要                         | 設計での対応箇所                                   | 充足判定 |
| ------- | -------------------------------- | -------------------------------------------------- | -------- |
| NFR-1-1 | CRUD 応答時間 100ms 以内         | SkillChainStore JSON ファイル I/O                  | □        |
| NFR-1-2 | 実行開始応答 200ms 以内          | IPC ラウンドトリップ設計                           | □        |
| NFR-1-3 | ステップ間転送 50ms 以内         | buildStepInput のインメモリ処理                    | □        |
| NFR-1-4 | 一覧取得応答 200ms 以内          | SkillChainStore.list() のディレクトリスキャン      | □        |
| NFR-2-1 | P42 準拠 3 段バリデーション      | 各ハンドラのバリデーションコード                   | □        |
| NFR-2-2 | sender 検証                      | validateIpcSender                                  | □        |
| NFR-2-3 | パストラバーサル防止             | SkillChainStore のパス検証設計                     | □        |
| NFR-2-4 | エラーサニタイズ                 | sanitizeError 呼び出し                             | □        |
| NFR-2-5 | テンプレートインジェクション防止 | renderTemplate の eval 不使用設計                  | □        |
| NFR-3-1 | ステップ失敗時の状態整合性       | エラーハンドリング擬似コードの finalVariables 管理 | □        |
| NFR-3-2 | タイムアウト制御                 | step.timeout 設計                                  | □        |
| NFR-3-3 | チェーン定義の永続化             | SkillChainStore JSON ファイル設計                  | □        |
| NFR-4-1 | 型安全（any 不使用）             | 全型定義の strict 対応                             | □        |
| NFR-4-2 | SRP 準拠                         | Executor/Store 責務分離                            | □        |
| NFR-4-3 | テストカバレッジ基準             | テスト設計の対象範囲                               | □        |
| NFR-4-4 | P32 準拠型定義同時更新           | shared/preload 型定義の対応表                      | □        |

### Step 2: IPC 設計レビュー

#### IPC 契約チェックリスト（ipc-contract-checklist.md Phase 1-6 準拠）

##### Phase 1: チャネル名の整合性

- [ ] 5 チャネルが `skill:chain:` プレフィックスで統一されている
- [ ] チャネル名が `IPC_CHANNELS` 定数で定義されている（ハードコード文字列不使用）
- [ ] 既存のスキルチャネル（`skill:list`, `skill:execute` 等）と命名規則が整合している

##### Phase 2: 引数型の整合性

- [ ] 各チャネルの引数型がハンドラ定義と Preload 呼び出しで一致している
- [ ] `skill:chain:get` の引数: ハンドラ `chainId: string` = Preload `safeInvoke(ch, chainId)` ✓
- [ ] `skill:chain:save` の引数: ハンドラ `chain: SkillChainDefinition` = Preload `safeInvoke(ch, chain)` ✓
- [ ] `skill:chain:delete` の引数: ハンドラ `chainId: string` = Preload `safeInvoke(ch, chainId)` ✓
- [ ] `skill:chain:execute` の引数: ハンドラ `{ chainId, variables }` = Preload `safeInvoke(ch, { chainId, variables })` ✓
- [ ] 引数名のセマンティクスが実際の値と一致している（P45 対策）

##### Phase 3: 戻り値型の整合性

- [ ] 全チャネルが `IpcResult<T>` 形式で統一されている
- [ ] 正常系: `{ success: true, data: T }`
- [ ] 異常系: `{ success: false, error: string }`
- [ ] Preload 型定義（ChainAPI）の戻り値型がハンドラの戻り値型と一致している

##### Phase 4: バリデーション

- [ ] `skill:chain:list`: sender 検証のみ（引数なし）— 適切
- [ ] `skill:chain:get`: sender 検証 + P42 準拠 3 段バリデーション（chainId）— 適切
- [ ] `skill:chain:save`: sender 検証 + オブジェクトバリデーション（name, steps, errorHandling）— 適切
- [ ] `skill:chain:delete`: sender 検証 + P42 準拠 3 段バリデーション（chainId）— 適切
- [ ] `skill:chain:execute`: sender 検証 + P42 準拠 3 段バリデーション（chainId）+ variables 型チェック — 適切

##### Phase 5: エラーハンドリング

- [ ] 全ハンドラで try/catch がエラーを握りつぶさず `sanitizeError()` 経由で返している
- [ ] 存在しない chainId のエラーメッセージが具体的（"Chain not found"）
- [ ] バリデーションエラーメッセージが入力パラメータの問題を明示している

##### Phase 6: セキュリティ

- [ ] 全ハンドラで `validateIpcSender()` が最初に呼ばれている
- [ ] `sanitizeError()` で内部パス・スタックトレースをマスクしている
- [ ] SkillChainStore のファイル操作でパストラバーサル検証を実施する設計

### Step 3: 型安全レビュー

- [ ] 7 型 + 2 内部型の全フィールドに JSDoc コメントが付与されている
- [ ] `any` 型を使用していない
- [ ] `@ts-ignore` / `@ts-expect-error` を使用していない
- [ ] 型アサーション（`as`）を使用していない
- [ ] ユニオン型（SkillChainErrorStrategy, InputMappingType, SkillChainConditionType）が明示的に列挙されている
- [ ] `packages/shared/src/types/skill-chain.ts` と `apps/desktop/src/preload/types.ts` の型定義が整合している（P32 準拠）
- [ ] `packages/shared/src/types/index.ts` に全型のエクスポートが追加されている
- [ ] IpcResult 型が既存の定義と整合している

### Step 4: Electron 3 プロセスモデルレビュー

#### Main Process

- [ ] SkillChainExecutor と SkillChainStore が Main Process 内に配置されている
- [ ] ファイルシステムアクセス（JSON 永続化）が Main Process に限定されている
- [ ] スキル実行（SkillService 呼び出し）が Main Process で行われている

#### Preload

- [ ] chainAPI が `safeInvoke` 経由で IPC 通信している
- [ ] チャネル名が `IPC_CHANNELS` 定数で参照されている（ハードコード不使用）
- [ ] `contextBridge.exposeInMainWorld` 経由で Renderer に公開している
- [ ] Preload に Node.js ビジネスロジックを含んでいない

#### Renderer

- [ ] `window.electronAPI.chain` 経由で chainAPI にアクセスする設計
- [ ] Zustand Store（skillSlice）で状態管理している
- [ ] 個別セレクタで必要なデータのみ取得する設計（P31 対策）
- [ ] Node.js API を直接使用していない

### Step 5: 既知の落とし穴チェック

| Pitfall | 内容                         | 設計での対策                                              | 対策確認 |
| ------- | ---------------------------- | --------------------------------------------------------- | -------- |
| P31     | Zustand 無限ループ           | 個別セレクタ 10 個（状態 5 + アクション 5）を提供         | □        |
| P32     | 型定義二箇所同時更新         | shared/preload 型定義の対応関係を明示                     | □        |
| P42     | trim バリデーション漏れ      | 全文字列引数に 3 段バリデーション（typeof → "" → trim()） | □        |
| P44     | IPC インターフェース不整合   | ハンドラ引数型と Preload 呼び出しの一致を検証             | □        |
| P45     | 引数命名ドリフト             | chainId, chain, variables の命名がセマンティクスと一致    | □        |
| P5      | リスナー二重登録             | IPC ハンドラ登録時の二重登録防止（既存パターン準拠）      | □        |
| P23     | API 二重定義の型管理         | 単一の chainAPI のみ（二重定義なし）                      | □        |
| P11     | PostToolUse フック Edit 失敗 | 大量編集後の git diff --stat 検証を手順に含める           | □        |

### Step 6: 判定

#### 判定基準

| 判定              | 条件                                                             | 次のアクション          |
| ----------------- | ---------------------------------------------------------------- | ----------------------- |
| PASS              | 全観点で問題なし                                                 | Phase 4（テスト作成）へ |
| MINOR             | 軽微な指摘（命名改善、コメント追加、ドキュメント修正）           | 指摘対応後 Phase 4 へ   |
| MAJOR（要件問題） | 要件の欠落・矛盾が発見された                                     | Phase 1 へ戻る          |
| MAJOR（設計問題） | 設計の構造的な問題（責務分離違反、セキュリティホール、型不整合） | Phase 2 へ戻る          |

#### 判定結果テンプレート

```markdown
## 判定結果

| 項目       | 内容                 |
| ---------- | -------------------- |
| 判定       | PASS / MINOR / MAJOR |
| レビュー日 | YYYY-MM-DD           |

### 指摘事項（該当する場合）

| #   | 重要度 | カテゴリ | 指摘内容         | 対応方針     |
| --- | ------ | -------- | ---------------- | ------------ |
| 1   | MINOR  | 型設計   | （具体的な指摘） | （対応方針） |

### 判定理由

（判定の根拠を記載）
```

## 統合テスト連携

| テスト種別   | 対象                   | 確認内容                                           |
| ------------ | ---------------------- | -------------------------------------------------- |
| レビュー検証 | FR 充足マトリクス      | Phase 1 の全 FR が Phase 2 設計でカバーされている  |
| レビュー検証 | NFR 充足マトリクス     | Phase 1 の全 NFR が Phase 2 設計でカバーされている |
| IPC 契約検証 | IPC 契約チェックリスト | 6 Phase の全項目がチェック済み                     |
| 型安全検証   | 型定義レビュー         | 全型がstrict モードでコンパイル可能                |

## 多角的チェック観点

### レビュープロセス観点

- [ ] FR 充足マトリクスの全 35 項目がチェック済み
- [ ] NFR 充足マトリクスの全 16 項目がチェック済み
- [ ] IPC 契約チェックリストの 6 Phase がチェック済み
- [ ] 型安全レビューの全 8 項目がチェック済み
- [ ] Electron 3 プロセスモデルレビューの全 12 項目がチェック済み
- [ ] 既知の落とし穴チェックの全 8 項目がチェック済み

### 判定の客観性

- [ ] 判定基準が事前に定義され、主観的な判断を排除している
- [ ] MINOR 指摘がある場合、具体的な対応方針が記載されている
- [ ] MAJOR 判定の場合、戻り先 Phase が明確に指定されている

## 成果物

| 成果物           | パス                                      | 内容                               |
| ---------------- | ----------------------------------------- | ---------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果、指摘事項、充足マトリクス |

## 完了条件

- [ ] FR 充足マトリクス（35 項目）の全項目がチェック済み
- [ ] NFR 充足マトリクス（16 項目）の全項目がチェック済み
- [ ] IPC 契約チェックリスト（Phase 1-6）の全項目がチェック済み
- [ ] 型安全レビュー（8 項目）の全項目がチェック済み
- [ ] Electron 3 プロセスモデルレビュー（12 項目）の全項目がチェック済み
- [ ] 既知の落とし穴チェック（8 項目）の全項目がチェック済み
- [ ] PASS / MINOR / MAJOR の判定が下されている
- [ ] MINOR 指摘がある場合、対応方針が記載されている
- [ ] 設計レビュー結果ファイルが作成されている

## サブタスク管理

| #   | サブタスク                        | 依存      | ステータス |
| --- | --------------------------------- | --------- | ---------- |
| 1   | 要件充足性レビュー（FR）          | Phase 1,2 | pending    |
| 2   | 要件充足性レビュー（NFR）         | Phase 1,2 | pending    |
| 3   | IPC 設計レビュー                  | サブ 1    | pending    |
| 4   | 型安全レビュー                    | サブ 1    | pending    |
| 5   | Electron 3 プロセスモデルレビュー | サブ 1    | pending    |
| 6   | 既知の落とし穴チェック            | サブ 1-5  | pending    |
| 7   | 判定                              | サブ 1-6  | pending    |
| 8   | 設計レビュー結果作成              | サブ 7    | pending    |

## タスク 100% 実行確認

Phase 3 の全タスクが完了したことを確認するための最終チェック:

- [ ] Step 1（要件充足性レビュー）: FR 35 項目 + NFR 16 項目 = 51 項目チェック済み
- [ ] Step 2（IPC 設計レビュー）: IPC 契約チェックリスト Phase 1-6 完了
- [ ] Step 3（型安全レビュー）: 8 項目チェック済み
- [ ] Step 4（Electron 3 プロセスモデルレビュー）: 12 項目チェック済み
- [ ] Step 5（既知の落とし穴チェック）: 8 項目チェック済み
- [ ] Step 6（判定）: PASS/MINOR/MAJOR 判定が下されている
- [ ] 成果物: 設計レビュー結果ファイルが作成済み

## 次の Phase

| 判定              | 次の Phase                  |
| ----------------- | --------------------------- |
| PASS              | Phase 4（テスト作成）へ進む |
| MINOR             | 指摘対応後、Phase 4 へ進む  |
| MAJOR（要件問題） | Phase 1（要件定義）へ戻る   |
| MAJOR（設計問題） | Phase 2（設計）へ戻る       |
