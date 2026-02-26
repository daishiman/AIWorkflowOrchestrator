# Phase 9: 品質保証 - TASK-9B

## メタ情報

| 項目               | 内容                           |
| ------------------ | ------------------------------ |
| Phase              | 9                              |
| Phase名            | 品質保証                       |
| タスクID           | TASK-9B                        |
| 前提Phase          | phase-8-refactoring.md         |
| 後続Phase          | Phase 10（最終レビューゲート） |
| ステータス         | pending                        |
| 作成日             | 2026-02-26                     |
| 機能名             | task-9b-skill-creator          |
| 成果物ディレクトリ | outputs/phase-9/               |

---

## 目的

静的解析（ESLint）、型チェック（TypeScript）、セキュリティ検証、テスト実行・カバレッジの4観点からSkillCreatorService実装の品質を検証する。プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていること、およびIPC契約の整合性が保たれていることを確認する。

## 背景

SkillCreatorServiceはIPCハンドラーを介してRenderer層からアクセスされるため、通常の品質検証に加えてIPC契約整合性とセキュリティ固有の検証が必須である。12機能（chat, api, improve, execute, use, chain, fork, share, schedule, debug, docs, stats）の各IPCハンドラーについて、P42準拠3段バリデーション・sender検証・エラーサニタイズの3点を重点的に検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint検証

**目的**: ESLintルールへの準拠を確認する

**実行手順**:

1. ESLintをdesktopパッケージに対して実行する
2. エラー・警告を確認する
3. 問題があれば`--fix`で自動修正し、手動修正が必要な箇所を記録する
4. 再度Lintを実行してエラーが0件であることを確認する

**コマンド**:

```bash
# Lint実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# 自動修正
pnpm --filter @repo/desktop lint --fix

# sharedパッケージも確認
pnpm --filter @repo/shared lint
```

**検証対象ファイル**:

| ファイル                                                      | 確認項目                                   |
| ------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | Facade本体のLintクリア                     |
| `apps/desktop/src/main/services/skill/HearingFacilitator.ts`  | サブコンポーネントのLintクリア             |
| `apps/desktop/src/main/services/skill/TaskGenerator.ts`       | サブコンポーネントのLintクリア             |
| `apps/desktop/src/main/services/skill/CodeGenerator.ts`       | サブコンポーネントのLintクリア             |
| `apps/desktop/src/main/services/skill/ApiIntegrator.ts`       | サブコンポーネントのLintクリア             |
| `apps/desktop/src/main/services/skill/Validator.ts`           | サブコンポーネントのLintクリア             |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | skill-creator関連IPCハンドラーのLintクリア |
| `apps/desktop/src/preload/skill-creator-api.ts`               | Preload APIのLintクリア                    |
| `apps/desktop/src/preload/channels.ts`                        | チャンネル定数のLintクリア                 |
| `apps/desktop/src/preload/types.ts`                           | 型定義のLintクリア                         |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScriptの型エラーが0件であることを確認する

**実行手順**:

1. TypeScriptコンパイラをdesktopパッケージに対して実行する
2. sharedパッケージに対しても実行する
3. `preload/types.ts`の引数型・戻り値型と`skillCreatorHandlers.ts`のハンドラー引数・戻り値型の整合性を確認する
4. `any`型の使用箇所を検出し、0件であることを確認する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# sharedパッケージも確認
pnpm --filter @repo/shared typecheck

# any型使用検出（テストファイル・node_modulesを除外）
grep -rn ": any\b" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "\.test\." | grep -v "node_modules"
grep -rn ": any\b" apps/desktop/src/main/ipc/skillCreatorHandlers.ts | grep -v "\.test\."

# @ts-ignoreの使用検出
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "node_modules"
```

**型安全性チェックポイント**:

| チェック項目  | 確認内容                                                   | 結果 |
| ------------- | ---------------------------------------------------------- | ---- |
| any型使用     | SkillCreatorService内のany型が0件                          | -    |
| any型使用     | サブコンポーネント5ファイル内のany型が0件                  | -    |
| any型使用     | skillCreatorHandlers.ts内のany型が0件                      | -    |
| @ts-ignore    | @ts-ignore/@ts-expect-errorが0件（または理由コメントあり） | -    |
| Preload型整合 | preload/types.tsの引数型がハンドラー引数型と一致           | -    |
| Preload型整合 | preload/types.tsの戻り値型がハンドラーレスポンス型と一致   | -    |
| 共有型定義    | packages/shared/src/types/skillCreator.tsの型が最新        | -    |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: 全skill-creator関連IPCハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. skill-creator関連の全IPCハンドラーで`validateIpcSender()`が実施されていることを確認する
2. 文字列引数を受け取るハンドラーでP42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）が実施されていることを確認する
3. 全catchブロックで`sanitizeErrorMessage`が使用されていることを確認する
4. チャンネル名がハードコード文字列ではなく`IPC_CHANNELS`定数で参照されていることを確認する
5. 機密情報（APIキー等）がRenderer層に漏洩するパスがないことを確認する

**セキュリティチェックリスト**:

> skill-creator関連の全IPCチャンネルについて以下を確認する

| チェック項目                        | 確認コマンド                                                                                                  | 基準                                   | 結果 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---- |
| validateIpcSender全ハンドラー適用   | `grep -c "validateIpcSender" apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                               | skill-creator関連ハンドラー数と一致    | -    |
| P42準拠3段バリデーション            | `grep -c "\.trim()" apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                        | 文字列引数を受け取るハンドラー数と一致 | -    |
| sanitizeErrorMessage全catchブロック | `grep -c "sanitizeErrorMessage" apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                            | catchブロック数と一致                  | -    |
| ハードコード文字列なし              | `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-creator-api.ts \| grep -v "IPC_CHANNELS"`       | 0件                                    | -    |
| 機密情報漏洩なし                    | `grep -rn "apiKey\|secret\|token\|password" apps/desktop/src/main/services/skill/ \| grep -v "test\|\.d\.ts"` | Renderer送信パスなし                   | -    |

**P42準拠3段バリデーション確認テンプレート**:

```bash
# 各ハンドラーの3段バリデーション確認
# 1. typeof チェック
grep -n "typeof.*!== .string." apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# 2. 空文字列チェック（=== ""）
grep -n '=== ""' apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# 3. トリム空文字列チェック（.trim() === ""）
grep -n '\.trim() === ""' apps/desktop/src/main/ipc/skillCreatorHandlers.ts
```

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: IPC契約整合性検証

**目的**: ipc-contract-checklist.md Phase 1-6の全項目をチェックし、IPC契約の整合性を確認する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`を読み込む
2. Phase 1〜6の全チェック項目をskill-creator関連ハンドラーに対して実行する
3. 各項目のPASS/FAILを記録する
4. FAILがある場合は修正内容を記録する

**IPC契約チェックリスト結果テーブル**:

| Phase | チェック項目                                                              | 結果 |
| ----- | ------------------------------------------------------------------------- | ---- |
| 1     | チャンネル名がIPC_CHANNELS定数で定義されている                            | -    |
| 1     | チャンネル名がALLOWED_INVOKE_CHANNELSに追加されている                     | -    |
| 2     | ハンドラー引数型がPreload側の呼び出し引数型と一致している                 | -    |
| 2     | ハンドラー戻り値型がPreload側の期待する型と一致している                   | -    |
| 3     | 引数名のセマンティクスが実際の値と一致している（P45対策）                 | -    |
| 3     | ハンドラーとPreloadの引数名が同一セマンティクスである                     | -    |
| 4     | validateIpcSenderが全ハンドラーで実施されている                           | -    |
| 4     | パストラバーサル防止（validatePath）が該当ハンドラーで実施されている      | -    |
| 5     | unregisterハンドラーに全チャンネルが登録されている                        | -    |
| 5     | ハンドラー二重登録防止（P5対策）が実施されている                          | -    |
| 6     | エラーサニタイズ（sanitizeErrorMessage）が全catchブロックで使用されている | -    |
| 6     | 内部エラー情報がRenderer層に漏洩しないことを確認している                  | -    |

**期待される成果物**:

- `outputs/phase-9/ipc-contract-report.md`

---

### タスク5: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. skill関連のユニットテストを実行する
2. IPC関連のユニットテストを実行する
3. カバレッジレポートを生成する
4. カバレッジ基準との照合を行う
5. 基準未達の場合はPhase 6に戻る

**コマンド**:

```bash
# skill関連テスト実行（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/services/skill/ --coverage --reporter=verbose

# IPC関連テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/ --reporter=verbose

# desktop全体テスト実行
cd apps/desktop && pnpm vitest run --reporter=verbose
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**テストケース分類**:

| テスト分類                         | テストケース数 | 全PASS |
| ---------------------------------- | -------------- | ------ |
| SkillCreatorService ユニットテスト | -              | -      |
| HearingFacilitator ユニットテスト  | -              | -      |
| TaskGenerator ユニットテスト       | -              | -      |
| CodeGenerator ユニットテスト       | -              | -      |
| ApiIntegrator ユニットテスト       | -              | -      |
| Validator ユニットテスト           | -              | -      |
| IPCハンドラー ユニットテスト       | -              | -      |
| 統合テスト                         | -              | -      |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク6: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜5の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する
4. 不合格項目がある場合は対応方針を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] `any`型の使用が0件
- [ ] `@ts-ignore`/`@ts-expect-error`が0件（または理由コメントあり）
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%+達成
- [ ] Branch Coverage 60%+達成
- [ ] Function Coverage 80%+達成

#### セキュリティ

- [ ] 全ハンドラーでvalidateIpcSender実施確認済み
- [ ] P42準拠3段バリデーション実施確認済み（全文字列引数）
- [ ] エラーサニタイズ実施確認済み（全catchブロック）
- [ ] ハードコード文字列なし確認済み
- [ ] 機密情報のRenderer層漏洩なし確認済み

#### IPC契約整合性

- [ ] ipc-contract-checklist.md Phase 1-6全項目PASS
- [ ] ハンドラー引数形式とPreload呼び出し形式の一致確認済み
- [ ] 引数名のセマンティクス一致確認済み（P45対策）

#### 判定結果

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| IPC契約       | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（品質ゲート総合判定を含む最終レポート）

---

## SubAgent分担

| SubAgent   | 担当                                                      |
| ---------- | --------------------------------------------------------- |
| SubAgent-A | タスク1（Lint検証）+ タスク2（型チェック検証）            |
| SubAgent-B | タスク3（セキュリティ検証）+ タスク4（IPC契約整合性検証） |
| SubAgent-C | タスク5（テスト実行・カバレッジ確認）                     |
| SubAgent-D | タスク6（品質ゲート総合判定）+ 品質レポート統合           |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                   |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 3段バリデーション・sender検証          |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC全般のセキュリティ原則              |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge・公開API制約             |
| IPC契約チェック          | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45統合チェック        |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer-Preload-Main間のSkill API契約 |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | コード品質・カバレッジ基準             |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result<T,E>パターン・エラーカテゴリ    |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC/DI/テストパターン                  |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の苦戦箇所と解決策                 |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                          | TypeScript型安全・テスト設計           |

### タスク固有参照

| 参照資料          | パス                                                | 内容                             |
| ----------------- | --------------------------------------------------- | -------------------------------- |
| Phase 5実装成果物 | `outputs/phase-5/design-changes.md`                 | 実装内容と検証対象の対応確認     |
| Phase 8成果物     | `outputs/phase-8/refactoring-report.md`             | リファクタリング結果（前提情報） |
| IPCハンドラー実装 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | Main Processハンドラー           |
| Preload API       | `apps/desktop/src/preload/skill-creator-api.ts`     | Preload API実装                  |
| テストファイル    | `apps/desktop/src/main/services/skill/__tests__/`   | テストコード                     |
| ESLint設定        | `.eslintrc.*`                                       | Lintルール                       |
| TypeScript設定    | `tsconfig.json`                                     | 型チェック設定                   |

---

## 成果物

| 成果物                     | パス                                      | 内容                       |
| -------------------------- | ----------------------------------------- | -------------------------- |
| Lintレポート               | `outputs/phase-9/lint-report.md`          | Lint検証結果               |
| 型チェックレポート         | `outputs/phase-9/typecheck-report.md`     | 型チェック・any型検出結果  |
| セキュリティレポート       | `outputs/phase-9/security-report.md`      | セキュリティ検証結果       |
| IPC契約レポート            | `outputs/phase-9/ipc-contract-report.md`  | IPC契約整合性検証結果      |
| テスト・カバレッジレポート | `outputs/phase-9/test-coverage-report.md` | テスト結果・カバレッジ数値 |
| 品質レポート               | `outputs/phase-9/quality-report.md`       | 品質ゲート総合判定         |

---

## 統合テスト連携【必須】

> 品質保証で統合テスト結果を確認する

| 確認項目     | 基準                                  | 結果 |
| ------------ | ------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功                      | -    |
| 統合テスト   | 全統合テスト成功                      | -    |
| セキュリティ | 3段バリデーション適用率100%           | -    |
| IPC契約      | チェックリスト全項目PASS              | -    |
| カバレッジ   | Line 80%+, Branch 60%+, Function 80%+ | -    |

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                          | 仕様参照先                                        |
| ------------------ | ------------------------------------------------- | ------------------------------------------------- |
| セキュリティ       | 必須（全IPCハンドラーのセキュリティ検証）         | aiworkflow-requirements: security-skill-ipc.md    |
| UI/UX              | 非該当（バックエンド品質検証のみ）                | -                                                 |
| アーキテクチャ     | 必須（IPC契約整合性・レイヤー依存方向確認）       | aiworkflow-requirements: architecture-overview.md |
| API設計            | 必須（IPC API契約整合性検証）                     | aiworkflow-requirements: api-ipc-agent.md         |
| データ整合性       | 非該当（DB変更なし）                              | -                                                 |
| エラーハンドリング | 必須（エラーサニタイズ・Result<T,E>パターン確認） | aiworkflow-requirements: error-handling.md        |
| パフォーマンス     | 対象限定（テスト実行時間の異常検出のみ）          | aiworkflow-requirements: quality-requirements.md  |
| アクセシビリティ   | 非該当（UI実装なし）                              | -                                                 |
| テスタビリティ     | 必須（カバレッジ基準達成・テスト品質確認）        | aiworkflow-requirements: quality-requirements.md  |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                | 仕様参照先                                             |
| -------------------------- | --------------------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | 契約確認のみ（Preload型定義の整合性）   | aiworkflow-requirements: interfaces-agent-sdk-skill.md |
| バックエンド（Main）       | 必須（SkillCreatorService品質検証）     | aiworkflow-requirements: arch-electron-services.md     |
| IPC通信                    | 必須（IPC契約チェックリスト全項目確認） | aiworkflow-requirements: api-ipc-agent.md              |
| Preload/セキュリティ       | 必須（ホワイトリスト・safeInvoke確認）  | aiworkflow-requirements: security-api-electron.md      |
| ローカルストレージ         | 非該当（DB変更なし）                    | -                                                      |

---

## 実行手順

1. タスク1（Lint検証）を実行する
2. タスク2（型チェック検証）を実行する
3. タスク3（セキュリティ検証）を実行する
4. タスク4（IPC契約整合性検証）を実行する
5. タスク5（テスト実行・カバレッジ確認）を実行する
6. タスク6（品質ゲート総合判定）を実行し、品質レポートを作成する
7. Phase完了時の検証コマンドを実行する

**Phase完了時の検証コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 9
```

---

## 完了条件

- [ ] Lintエラーが0件である
- [ ] 型エラーが0件である
- [ ] `any`型の使用が0件である
- [ ] セキュリティレビューが完了している（全ハンドラーでP42準拠3段バリデーション・sender検証・エラーサニタイズ確認済み）
- [ ] IPC契約チェックリストPhase 1-6の全項目がPASSしている
- [ ] 機密情報のRenderer層漏洩がないことを確認している
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲートの全項目をパスしている
- [ ] 品質レポート（6ファイル）が全て生成されている

---

## サブタスク管理

- [ ] 全6タスクの完了確認
- [ ] 各タスクの成果物が生成されていることを確認
- [ ] タスク間の依存関係（タスク1〜5→タスク6）が守られていることを確認
- [ ] SubAgent分担に従い、並列実行可能なタスクは並列で実施

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクの成果物（6ファイル）が全て生成されている
- [ ] artifacts.jsonのphase-9ステータスが更新されている
- [ ] 品質ゲート全項目PASSを確認

---

## 次Phase

Phase 10（最終レビューゲート）へ進む。

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/task-9b-skill-creator/phase-10-final-review.md`
