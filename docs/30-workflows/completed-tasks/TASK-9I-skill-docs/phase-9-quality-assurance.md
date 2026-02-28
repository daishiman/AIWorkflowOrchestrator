# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| タスクID   | TASK-9I                        |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | pending                        |
| 作成日     | 2026-02-28                     |
| 機能名     | TASK-9I-skill-docs             |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からスキルドキュメント生成機能全体の品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

スキルドキュメント生成機能はMain Process（SkillDocGenerator + IPCハンドラー4件）とPreload層の2レイヤーにまたがる。
IPCハンドラーはセキュリティ境界に位置し、LLMを使ったドキュメント生成を制御するため、送信元検証と入力バリデーションを重点検証する。
UI層はスコープ外（TASK-9I）であるため、UIコンポーネントの品質検証は対象外とする。

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

| ファイル                                                    | 確認項目                   |
| ----------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | サービスのLintクリア       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | IPCハンドラーのLintクリア  |
| `packages/shared/src/types/skill-docs.ts`                   | 型定義のLintクリア         |
| `packages/shared/src/types/index.ts`                        | re-exportのLintクリア      |
| `apps/desktop/src/preload/skill-api.ts`                     | Preload APIのLintクリア    |
| `apps/desktop/src/preload/channels.ts`                      | チャンネル定数のLintクリア |
| `apps/desktop/src/preload/types.ts`                         | 型定義のLintクリア         |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認し、レイヤー間の型整合性を検証する

**実行手順**:

1. TypeScript コンパイラを desktopパッケージとsharedパッケージに対して実行する
2. `packages/shared/src/types/skill-docs.ts` の型定義が正しくexportされていることを確認する
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

| チェック項目                 | 確認内容                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Preload型 ↔ Mainハンドラー型 | 4メソッド全ての引数型・戻り値型がハンドラーのレスポンス型と一致                          |
| チャンネル定数整合           | `IPC_CHANNELS` に4チャンネル（SKILL_DOCS_GENERATE/PREVIEW/EXPORT/TEMPLATES）が定義       |
| ホワイトリスト整合           | `ALLOWED_INVOKE_CHANNELS` に4チャンネルが追加されている                                  |
| 共有型定義整合               | `packages/shared/src/types/skill-docs.ts` の型が `index.ts` から正しくre-export          |
| 5インターフェース完全性      | DocGenerationRequest / GeneratedDoc / DocTemplate / DocSection / DocExportOptions が完全 |
| any型不使用                  | `any` 型が使用されていないか                                                             |
| as型アサーション不使用       | `as` 型アサーションが使用されていないか（正当な理由がある場合はコメント付きで許容）      |
| @ts-ignore不使用             | `@ts-ignore` / `@ts-expect-error` が使用されていないか                                   |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 確認内容                                    |
| -------------------------------------- | ------------------------------------------- |
| `packages/shared/src/types/index.ts`   | skill-docs.ts のre-exportが最新か           |
| `apps/desktop/src/preload/types.ts`    | Preload型定義にdocsメソッドが追加されている |
| `apps/desktop/src/preload/channels.ts` | ホワイトリストにdocsチャンネル追加          |

**P44準拠検証**: IPCハンドラの引数型とPreload側の呼び出し引数型が一致していること

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: 全4 IPCハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. 全4ハンドラーで `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` が実施されていることを確認する
2. 全catchブロックで `sanitizeErrorMessage` が使用されていることを確認する
3. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する
4. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が該当3ハンドラーで実施されていることを確認する
5. exportハンドラーでパストラバーサル防止チェックが実施されていることを確認する

**セキュリティチェックマトリクス**:

| チャネル               | validateIpcSender | skillName検証 | sanitizeErrorMessage | IPC_CHANNELS定数 | 3段バリデーション |
| ---------------------- | ----------------- | ------------- | -------------------- | ---------------- | ----------------- |
| `skill:docs:generate`  | -                 | -             | -                    | -                | -                 |
| `skill:docs:preview`   | -                 | -             | -                    | -                | -                 |
| `skill:docs:export`    | -                 | -             | -                    | -                | -                 |
| `skill:docs:templates` | -                 | N/A           | -                    | -                | N/A               |

**P42準拠3段バリデーション確認**:

| チャネル              | 引数       | typeof検証 | 空文字列検証 | trim()検証 |
| --------------------- | ---------- | ---------- | ------------ | ---------- |
| `skill:docs:generate` | skillName  | -          | -            | -          |
| `skill:docs:preview`  | skillName  | -          | -            | -          |
| `skill:docs:export`   | outputPath | -          | -            | -          |

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**パストラバーサル検証（export）**:

| チェック項目             | 確認内容                                             |
| ------------------------ | ---------------------------------------------------- |
| outputPath正規化         | path.resolve/path.normalize でパスが正規化されている |
| ディレクトリトラバーサル | `../` を含むパスが拒否される                         |
| 許可ディレクトリ制限     | 書き込み先が許可されたディレクトリ内に制限されている |

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
# SkillDocGeneratorテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator.test.ts --coverage --reporter=verbose

# IPCハンドラーテスト
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.docs.test.ts --coverage --reporter=verbose

# 関連テスト全件
cd apps/desktop && pnpm vitest run src/main/services/skill/ src/main/ipc/ --coverage --reporter=verbose
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**テスト対象範囲**:

| テスト対象                 | テストファイル                                      | 分類                   |
| -------------------------- | --------------------------------------------------- | ---------------------- |
| SkillDocGenerator          | `src/main/services/skill/SkillDocGenerator.test.ts` | 正常/異常/LLM連携      |
| IPCハンドラー（4チャネル） | `src/main/ipc/skillHandlers.docs.test.ts`           | 正常/異常/セキュリティ |

**テスト件数確認（P37対策）**:

```bash
# 実際のテスト件数をファイルから正確にカウント
grep -c "it(" apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts
grep -c "it(" apps/desktop/src/main/ipc/skillHandlers.docs.test.ts
```

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートテーブル**:

| 品質ゲート   | 確認内容                                       | コマンド                                                                    | 結果 |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功                               | `pnpm --filter @repo/desktop test`                                          | -    |
| コード品質   | Lint/型チェッククリア                          | `pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck` | -    |
| テスト網羅性 | カバレッジ基準達成                             | `pnpm --filter @repo/desktop test -- --coverage`                            | -    |
| セキュリティ | validateIpcSender適用、3段バリデーション全実施 | 手動レビュー                                                                | -    |

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] SkillDocGeneratorテスト全件PASS（generate/preview/export/templates）
- [ ] IPCハンドラー4チャネル全テストPASS
- [ ] 境界値テスト含む（空文字列、スペースのみ、超長文字列）

#### コード品質

- [ ] Lint エラーなし（desktopパッケージ）
- [ ] Lint エラーなし（sharedパッケージ）
- [ ] 型エラーなし（desktopパッケージ）
- [ ] 型エラーなし（sharedパッケージ）
- [ ] any型不使用
- [ ] as型アサーション不使用（正当な理由がある場合はコメント付きで許容）
- [ ] @ts-ignore / @ts-expect-error 不使用

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] 全ハンドラーで validateIpcSender 実施確認済み
- [ ] P42準拠3段バリデーションが3チャネル（generate/preview/export）で実施確認済み
- [ ] P44準拠のハンドラ引数型とPreload呼び出し型の一致が確認済み
- [ ] P45準拠の引数名セマンティクス一致が確認済み
- [ ] エラーサニタイズ実施確認済み
- [ ] ハードコード文字列なし確認済み（P27対策）
- [ ] exportハンドラーのパストラバーサル防止確認済み

**判定結果テーブル**:

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料           | パス                                                             | 内容                   |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillDocGenerator  | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | ドキュメント生成実装   |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| ドキュメント型定義 | `packages/shared/src/types/skill-docs.ts`                        | 共有型定義             |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts` | ユニットテスト         |
| IPCテストファイル  | `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`           | IPCハンドラーテスト    |
| Phase 5 実装成果物 | `outputs/phase-5/`                                               | 実装結果               |
| Phase 8 成果物     | `outputs/phase-8/`                                               | リファクタリング結果   |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API IPC仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル命名、引数契約、戻り値契約      |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer-Preload-Main間のSkill API契約     |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge、ホワイトリスト、公開API制約 |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | ipcMain.handle/on運用差分、Sender検証      |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | safeInvoke/safeOn運用、Skill API防御       |
| Skill実行セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | 権限と実行境界                             |
| 入力バリデーション仕様   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | P42 準拠の入力検証                         |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45検証                    |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC拡張とPreload API設計                   |
| Electronサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main Process責務分離                       |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲートとテスト要件                     |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IPC失敗時のエラー契約                      |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                        | P5/P32/P44/P45再発防止                     |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 同種タスク失敗例と予防策                   |

---

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`          | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定         |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                 | 基準                                              |
| ------------------------ | ------------------------------------------------- |
| 全テスト                 | 100% パス                                         |
| SkillDocGeneratorテスト  | generate/preview/export/templatesテスト全件PASS   |
| IPCハンドラーテスト      | 4チャネル全て正常動作、セキュリティテスト全件PASS |
| エラーハンドリングテスト | エラーサニタイズ確認済み                          |
| バリデーションテスト     | P42準拠3段バリデーション確認済み                  |

---

## 多角的チェック観点

| 観点               | 適用判断                             | 仕様参照先                                                               |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------ |
| セキュリティ       | 必須（IPC境界を含む）                | `aiworkflow-requirements: security-electron-ipc.md`                      |
| 入力バリデーション | 必須（P42準拠）                      | `aiworkflow-requirements: security-input-validation.md`                  |
| IPC契約整合        | 必須（P44/P45準拠）                  | `aiworkflow-requirements: api-ipc-agent.md`, `ipc-contract-checklist.md` |
| エラーハンドリング | 必須（リトライ可否・分類）           | `aiworkflow-requirements: error-handling.md`                             |
| 品質ゲート         | 必須（カバレッジ閾値・検証手順）     | `aiworkflow-requirements: quality-requirements.md`                       |
| アーキテクチャ     | 対象限定（Main/Preload責務境界確認） | `aiworkflow-requirements: arch-electron-services.md`                     |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                         | 仕様参照先                                           |
| -------------------------- | -------------------------------- | ---------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（本タスクはMain/IPC中心） | -                                                    |
| バックエンド（Main）       | 必須（サービス実装品質確認）     | `aiworkflow-requirements: arch-electron-services.md` |
| IPC通信                    | 必須（4チャネル契約確認）        | `aiworkflow-requirements: api-ipc-agent.md`          |
| Preload/セキュリティ       | 必須（公開API整合確認）          | `aiworkflow-requirements: security-api-electron.md`  |
| ローカルストレージ         | 非該当（DBスキーマ変更なし）     | -                                                    |

---

## 完了条件

- [ ] ESLint エラーがない（desktop + sharedパッケージ）
- [ ] TypeScript 型エラーがない（desktop + sharedパッケージ）
- [ ] P32準拠: `packages/shared/src/types/skill-docs.ts` と `apps/desktop/src/preload/types.ts` の型定義が整合している
- [ ] P44準拠のハンドラ引数型とPreload呼び出し型の一致が確認されている
- [ ] P45準拠の引数名セマンティクス一致が確認されている
- [ ] P42準拠3段バリデーションが3チャネル（generate/preview/export）で実装されている
- [ ] validateIpcSenderが4チャネル全てで実装されている
- [ ] sanitizeErrorMessageが全エラーレスポンスに適用されている
- [ ] exportハンドラーのパストラバーサル防止が実装されている
- [ ] セキュリティレビューが完了している（全4ハンドラーで全項目確認済み）
- [ ] 全テストが成功している
- [ ] Line Coverage 80%+ を達成している
- [ ] Branch Coverage 60%+ を達成している
- [ ] Function Coverage 80%+ を達成している
- [ ] テスト件数が実際のテストファイルからカウントされている（P37対策）
- [ ] 品質ゲートの全項目をパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9I-skill-docs/phase-10-final-review.md`
