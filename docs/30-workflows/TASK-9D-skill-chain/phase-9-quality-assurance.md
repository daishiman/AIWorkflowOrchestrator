# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| タスクID   | TASK-9D                        |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | pending                        |
| 作成日     | 2026-02-28                     |
| 機能名     | TASK-9D-skill-chain            |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からスキルチェーン機能全体の品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

スキルチェーン機能はMain Process内の2サービス（SkillChainExecutor + SkillChainStore）と5つのIPCハンドラー、Preload層のchainAPI、Renderer層のskillSliceチェーン状態の3レイヤーにまたがる。
IPCハンドラーはセキュリティ境界に位置し、チェーン実行はスキルの連続呼び出しを含むため、送信元検証・入力バリデーション・テンプレートインジェクション防止を重点検証する。
UI層（SkillChainBuilder / SkillChainStepEditor）はスコープ外（task-031b）であるため、UIコンポーネントの品質検証は対象外とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を全対象ファイルで確認する

**実行手順**:

1. ESLint を全対象ファイルに対して実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行してクリアを確認する

**コマンド**:

```bash
# Lint 実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# sharedパッケージも確認
pnpm --filter @repo/shared lint

# 自動修正
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                                     | 確認項目                   |
| ------------------------------------------------------------ | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` | ExecutorのLintクリア       |
| `apps/desktop/src/main/services/skill/SkillChainStore.ts`    | StoreのLintクリア          |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | IPCハンドラーのLintクリア  |
| `packages/shared/src/types/skill-chain.ts`                   | 型定義のLintクリア         |
| `packages/shared/src/types/index.ts`                         | re-exportのLintクリア      |
| `apps/desktop/src/preload/skill-api.ts`                      | Preload APIのLintクリア    |
| `apps/desktop/src/preload/channels.ts`                       | チャンネル定数のLintクリア |
| `apps/desktop/src/preload/types.ts`                          | 型定義のLintクリア         |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`       | Store状態のLintクリア      |
| `apps/desktop/src/main/ipc/index.ts`                         | 初期化コードのLintクリア   |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認し、レイヤー間の型整合性を検証する

**実行手順**:

1. TypeScript コンパイラを desktopパッケージとsharedパッケージに対して実行する
2. `packages/shared/src/types/skill-chain.ts` の7型定義が正しくexportされていることを確認する
3. `preload/types.ts` と `skillHandlers.ts` の型整合性を確認する
4. P32チェック（型定義の二箇所同時更新）を実施する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# shared パッケージも確認
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                 | 確認内容                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Preload型 ↔ Mainハンドラー型 | 5メソッド（list/get/save/delete/execute）の引数型・戻り値型がハンドラーのレスポンス型と一致        |
| チャンネル定数整合           | `IPC_CHANNELS` に5チャンネル（SKILL_CHAIN_LIST/GET/SAVE/DELETE/EXECUTE）が定義                     |
| ホワイトリスト整合           | `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されている                                            |
| 共有型定義整合               | `packages/shared/src/types/skill-chain.ts` の7型が `index.ts` から正しくre-export                  |
| SkillChainDefinition型一貫性 | SkillChainExecutor / SkillChainStore / IPCハンドラーが同一の SkillChainDefinition 型を参照している |
| SkillChainResult型一貫性     | executeChain の戻り値型とPreload型定義の戻り値型が一致している                                     |
| StepResult型一貫性           | 各ステップ実行結果の型がshared型定義と一致している                                                 |
| any型不使用                  | `any` 型が使用されていないか                                                                       |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 確認内容                                   |
| -------------------------------------- | ------------------------------------------ |
| `packages/shared/src/types/index.ts`   | skill-chain.ts の7型re-exportが最新か      |
| `apps/desktop/src/preload/types.ts`    | Preload型定義にchainAPI（5メソッド）が追加 |
| `apps/desktop/src/preload/channels.ts` | ホワイトリストにchainチャンネル5件追加     |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: 全5 IPCハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. 全5ハンドラーで `validateIpcSender()` が実施されていることを確認する
2. 全catchブロックで `sanitizeErrorMessage` が使用されていることを確認する
3. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する
4. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラーで実施されていることを確認する
5. chainId / chainDefinition 引数に対する入力検証が十分か確認する
6. テンプレート変数（`{{variable}}`）のインジェクション防止策を確認する

**セキュリティチェックマトリクス**:

| チャンネル            | validateIpcSender | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| --------------------- | ----------------- | ------------- | ----------------- | ---------------- | ----------------- |
| `skill:chain:list`    | -                 | -             | -                 | -                | -                 |
| `skill:chain:get`     | -                 | -             | -                 | -                | -                 |
| `skill:chain:save`    | -                 | -             | -                 | -                | -                 |
| `skill:chain:delete`  | -                 | -             | -                 | -                | -                 |
| `skill:chain:execute` | -                 | -             | -                 | -                | -                 |

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**チェーン実行固有のセキュリティ確認**:

| チェック項目                         | 確認内容                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------ |
| テンプレート変数インジェクション防止 | `{{variable}}` 構文でコード実行やパストラバーサルが不可能であること      |
| チェーン循環参照防止                 | ステップ間の依存でチェーンが無限ループしないことの検証                   |
| ステップ数上限チェック               | 1チェーンのステップ数に上限が設定されている                              |
| 実行時間タイムアウト                 | チェーン全体の実行時間に上限が設定されている                             |
| 中間結果のメモリ管理                 | 大量のステップ結果がメモリを圧迫しないことの確認                         |
| スキル名バリデーション               | 各ステップの skillName がパストラバーサル攻撃に対して安全であること      |
| 条件式評価の安全性                   | SkillChainCondition の regex パターンが ReDoS 攻撃に対して安全であること |

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. 全対象テストを実行する
2. カバレッジレポートを確認する
3. カバレッジ基準との照合を行う
4. 基準未達の場合はPhase 6に戻る

**コマンド**:

```bash
# SkillChainExecutorテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainExecutor --coverage --reporter=verbose

# SkillChainStoreテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainStore --coverage --reporter=verbose

# チェーン型定義テスト
cd apps/desktop && pnpm vitest run --coverage --reporter=verbose --grep "chain"

# チェーン関連IPCハンドラーテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage --reporter=verbose --grep "chain"

# skillSlice チェーン状態テスト
cd apps/desktop && pnpm vitest run src/renderer/store/__tests__/skillSlice --coverage --reporter=verbose --grep "chain"
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**テスト対象範囲**:

| テスト対象                   | テストファイル                                                 | 分類                                  |
| ---------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| SkillChainExecutor           | `src/main/services/skill/__tests__/SkillChainExecutor.test.ts` | 正常実行/条件分岐/エラー/テンプレート |
| SkillChainStore              | `src/main/services/skill/__tests__/SkillChainStore.test.ts`    | CRUD/永続化/バリデーション            |
| IPCハンドラー（5チャンネル） | `src/main/ipc/__tests__/skillHandlers*.test.ts`                | 正常/異常/セキュリティ                |
| チェーン型定義               | `packages/shared/src/types/__tests__/skill-chain.test.ts`      | 型ガード/バリデーション               |
| skillSlice                   | `src/renderer/store/__tests__/skillSlice*.test.ts`             | 状態管理/セレクタ                     |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 依存関係確認

**目的**: 幽霊依存（P8対策）がないこと、レイヤー依存方向が正しいことを確認する

**実行手順**:

1. `packages/shared/src/types/skill-chain.ts` が外部依存を持たないことを確認する
2. `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` の import が自身の `package.json` に宣言されたパッケージのみであることを確認する
3. Renderer → Preload → Main の一方向依存が守られていることを確認する
4. skillSlice から Main Process のモジュールを直接 import していないことを確認する

**依存方向チェック**:

| レイヤー | 許可される依存先                     | 禁止される依存先 |
| -------- | ------------------------------------ | ---------------- |
| Renderer | Preload（contextBridge経由）、shared | Main Process     |
| Preload  | shared                               | Main Process     |
| Main     | shared、Node.js標準ライブラリ        | Renderer         |
| shared   | なし（末端パッケージ）               | apps/\*          |

**確認コマンド**:

```bash
# 幽霊依存チェック: shared パッケージの外部依存確認
grep -rn "from '" packages/shared/src/types/skill-chain.ts | grep -v "@repo/"

# レイヤー依存方向チェック: Renderer から Main への直接 import がないか
grep -rn "from.*main/" apps/desktop/src/renderer/store/slices/skillSlice.ts
```

**期待される成果物**:

- `outputs/phase-9/dependency-check-report.md`

---

### タスク6: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜5の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートテーブル**:

| 品質ゲート   | 確認内容                                       | コマンド                                                                    | 結果 |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功                               | `pnpm --filter @repo/desktop test`                                          | -    |
| コード品質   | Lint/型チェッククリア                          | `pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck` | -    |
| テスト網羅性 | カバレッジ基準達成                             | `pnpm --filter @repo/desktop test -- --coverage`                            | -    |
| セキュリティ | validateIpcSender適用、3段バリデーション全実施 | 手動レビュー                                                                | -    |
| 依存関係     | 幽霊依存なし、レイヤー依存方向正しい           | 手動レビュー                                                                | -    |

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] SkillChainExecutorテスト全件PASS（チェーン実行・条件分岐・テンプレート展開）
- [ ] SkillChainStoreテスト全件PASS（CRUD・永続化・Date型シリアライズ）
- [ ] IPCハンドラー5チャンネル全テストPASS
- [ ] チェーン型定義テスト全件PASS（7型）
- [ ] skillSliceチェーン状態テスト全件PASS

#### コード品質

- [ ] Lint エラーなし（desktopパッケージ）
- [ ] Lint エラーなし（sharedパッケージ）
- [ ] 型エラーなし（desktopパッケージ）
- [ ] 型エラーなし（sharedパッケージ）
- [ ] コードフォーマット適用済み
- [ ] any型不使用

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] 全ハンドラーで validateIpcSender 実施確認済み
- [ ] P42準拠3段バリデーション全ハンドラー実施確認済み
- [ ] エラーサニタイズ実施確認済み
- [ ] ハードコード文字列なし確認済み（P27対策）
- [ ] テンプレートインジェクション防止確認済み
- [ ] チェーン循環参照防止確認済み
- [ ] 条件式regex ReDoS 防止確認済み

#### 依存関係

- [ ] 幽霊依存なし（P8対策）
- [ ] レイヤー依存方向正しい（Renderer → Preload → Main）
- [ ] shared パッケージが末端（外部依存なし）

**判定結果テーブル**:

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| Dependency    | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料           | パス                                                                 | 内容                   |
| ------------------ | -------------------------------------------------------------------- | ---------------------- |
| SkillChainExecutor | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`         | チェーン実行エンジン   |
| SkillChainStore    | `apps/desktop/src/main/services/skill/SkillChainStore.ts`            | チェーン永続化         |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                         | Main Processハンドラー |
| チェーン型定義     | `packages/shared/src/types/skill-chain.ts`                           | 共有型定義（7型）      |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                              | Preload API実装        |
| Preload型定義      | `apps/desktop/src/preload/types.ts`                                  | 型定義                 |
| チャンネル定数     | `apps/desktop/src/preload/channels.ts`                               | チャンネル定義         |
| skillSlice         | `apps/desktop/src/renderer/store/slices/skillSlice.ts`               | Renderer状態管理       |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillChainExecutor*` | Executorテスト         |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillChainStore*`    | Storeテスト            |
| Phase 5 実装成果物 | `outputs/phase-5/`                                                   | 実装結果               |
| Phase 8 成果物     | `outputs/phase-8/`                                                   | リファクタリング結果   |

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

| 成果物               | パス                                         | 内容             |
| -------------------- | -------------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`             | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`        | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`         | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md`    | テスト結果       |
| 依存関係チェック     | `outputs/phase-9/dependency-check-report.md` | 依存関係確認     |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`     | 総合判定         |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                 | 基準                                                   |
| ------------------------ | ------------------------------------------------------ |
| 全テスト                 | 100% パス                                              |
| SkillChainExecutorテスト | チェーン実行・条件分岐・テンプレート展開テスト全件成功 |
| SkillChainStoreテスト    | CRUD・永続化・Date型シリアライズテスト全件PASS         |
| IPCハンドラーテスト      | 5チャンネル全て正常動作、セキュリティテスト全件PASS    |
| チェーン型テスト         | 7型の型ガード・バリデーションテスト全件PASS            |
| skillSliceテスト         | チェーン状態管理・個別セレクタテスト全件PASS           |
| エラーハンドリングテスト | エラーサニタイズ確認済み                               |

---

## 完了条件

- [ ] Lint エラーがない（desktop + sharedパッケージ）
- [ ] 型エラーがない（desktop + sharedパッケージ）
- [ ] セキュリティレビューが完了している（全5ハンドラーで全項目確認済み）
- [ ] チェーン実行固有のセキュリティ確認（テンプレートインジェクション防止・循環参照防止・ReDoS防止）が完了している
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 依存関係チェック（幽霊依存なし・レイヤー依存方向正しい）が完了している
- [ ] 品質ゲートの全項目をパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9D-skill-chain/phase-10-final-review.md`
