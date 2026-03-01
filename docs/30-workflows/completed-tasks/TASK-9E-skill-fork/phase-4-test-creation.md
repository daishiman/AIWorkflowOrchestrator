# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| Phase    | 4                        |
| 機能名   | TASK-9E-skill-fork       |
| タスク名 | スキルフォーク・派生機能 |
| 作成日   | 2026-02-28               |
| 前Phase  | Phase 3: 設計レビュー    |
| 次Phase  | Phase 5: 実装            |

## 目的

SkillForker の期待動作を検証するテストを実装より先に作成し、Red状態（テスト失敗）を確認する。TDD原則に従い、テストファーストで開発を進める。

## 実行タスク

- SkillForker ユニットテスト設計: fork() メソッドの正常系・異常系テストケースを設計し実装する
- IPC ハンドラテスト設計: skill:fork チャネルのバリデーション・セキュリティテストを設計し実装する
- 境界値テスト設計: エッジケースを網羅するテストケースを設計し実装する

## 参照資料

| 資料名                     | パス                                                                    | 説明                         |
| -------------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| 要件定義書                 | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-1/` | Phase 1 成果物               |
| 設計書                     | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-2/` | Phase 2 成果物               |
| 設計レビュー結果           | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-3/` | Phase 3 成果物               |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                    | Pitfall対策リスト            |
| 既存テスト構造             | `apps/desktop/src/main/services/skill/__tests__/`                       | 既存テストファイル参照       |
| IPC バリデーションパターン | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`        | P42準拠3段バリデーション参照 |

## 実行手順

### ステップ1: テストファイル作成

`apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts` を作成する。

### ステップ2: SkillForker ユニットテスト作成

#### 2-1. fork() 正常系テスト

| テストケース                            | 検証内容                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 全オプションコピーでフォークできる      | `copyAgents=true, copyReferences=true, copyScripts=true, copyAssets=true` で全サブディレクトリがコピーされる |
| 部分コピーでフォークできる              | `copyAgents=false, copyReferences=true` で agents/ 以外がコピーされる                                        |
| 説明文を変更してフォークできる          | `description` 指定時に SKILL.md の説明文が更新される                                                         |
| modifyAllowedTools 指定でフォークできる | `modifyAllowedTools` 指定時に SKILL.md の allowedTools が更新される                                          |

#### 2-2. modifySkillMd() テスト

| テストケース                    | 検証内容                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| スキル名が正しく更新される      | SKILL.md 内の name フィールドが newName に変更される            |
| 説明文が正しく更新される        | description 指定時に説明文が変更される                          |
| allowedTools が正しく更新される | modifyAllowedTools 指定時に allowedTools セクションが変更される |
| その他のフィールドが維持される  | name/description 以外のフィールドが元のまま保持される           |

#### 2-3. copyDirectory() テスト

| テストケース                             | 検証内容                                                 |
| ---------------------------------------- | -------------------------------------------------------- |
| 指定サブディレクトリのみコピーされる     | コピー対象外のディレクトリが存在しないことを確認         |
| ネストしたディレクトリが再帰コピーされる | サブディレクトリ内のサブディレクトリも正しくコピーされる |
| コピーされたファイル一覧が返される       | 戻り値の copiedFiles 配列が正確であることを確認          |

#### 2-4. writeForkMetadata() テスト

| テストケース                            | 検証内容                                               |
| --------------------------------------- | ------------------------------------------------------ |
| fork-metadata.json が正しく書き込まれる | forkedFrom, forkedAt, originalDescription が記録される |
| forkedAt が ISO 8601 形式である         | タイムスタンプが `YYYY-MM-DDTHH:mm:ss.sssZ` 形式である |

### ステップ3: 異常系テスト作成

| テストケース                                         | 検証内容                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| 存在しないソーススキル指定時にエラーになる           | `sourceSkill` で指定したスキルが存在しない場合、適切なエラーメッセージが返される |
| 同名スキルへのフォーク時にエラーになる               | `newName` が既存スキル名と重複する場合、エラーが返される                         |
| ファイルシステムエラー（権限不足）時のエラー         | ディレクトリ作成に失敗した場合、エラーが返される                                 |
| ファイルシステムエラー（ディスク容量不足）時のエラー | ファイルコピーに失敗した場合、エラーが返される                                   |

### ステップ4: IPC ハンドラテスト作成

`apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts` を作成する。

| テストケース                                            | 検証内容                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| skill:fork チャネルの正常系レスポンス                   | 有効な SkillForkOptions を送信すると SkillForkResult が返される      |
| P42準拠3段バリデーション: 型チェック                    | `sourceSkill` が string 型でない場合にバリデーションエラーが返される |
| P42準拠3段バリデーション: 空文字列チェック              | `sourceSkill` が空文字列 `""` の場合にバリデーションエラーが返される |
| P42準拠3段バリデーション: トリム空文字列チェック        | `sourceSkill` が `"   "` の場合にバリデーションエラーが返される      |
| P42準拠3段バリデーション: newName型チェック             | `newName` が string 型でない場合にバリデーションエラーが返される     |
| P42準拠3段バリデーション: newName空文字列チェック       | `newName` が空文字列 `""` の場合にバリデーションエラーが返される     |
| P42準拠3段バリデーション: newNameトリム空文字列チェック | `newName` が `"   "` の場合にバリデーションエラーが返される          |
| 送信元ウィンドウ検証（validateIpcSender）               | 不正なウィンドウからのリクエストが拒否される                         |

### ステップ5: 境界値テスト作成

| テストケース                                 | 検証内容                                                    |
| -------------------------------------------- | ----------------------------------------------------------- |
| 空の SKILL.md を持つスキルのフォーク         | SKILL.md が空でもエラーにならず、デフォルト値で作成される   |
| 特殊文字を含むスキル名でのフォーク           | 日本語、スペース、記号を含む名前でも正しく処理される        |
| サブディレクトリが存在しないスキルのフォーク | agents/ や references/ がなくても正常にフォークできる       |
| 大量のファイルを含むスキルのフォーク         | 100ファイル以上のスキルでもタイムアウトせずにフォークできる |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                                          | テストファイル               |
| ------------------ | ----------------------------------------------------------------- | ---------------------------- |
| IPC接続テスト      | skill:fork チャネルのリクエスト・レスポンス形式検証               | `skillHandlers.fork.test.ts` |
| データフローテスト | Renderer → Preload → Main → FS → Main → Preload → Renderer の往復 | `SkillForker.test.ts`        |
| エラーハンドリング | FS エラー時のサニタイズされたエラーメッセージ確認                 | `SkillForker.test.ts`        |

## アーキテクチャ層別テスト

| 層           | テスト観点                                          | テストファイル配置                                                   |
| ------------ | --------------------------------------------------- | -------------------------------------------------------------------- |
| Main Process | SkillForker サービスのユニットテスト                | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts` |
| IPC通信      | skill:fork ハンドラのバリデーション・セキュリティ   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`     |
| Shared       | SkillForkOptions / SkillForkResult 型の整合性テスト | 型テストはコンパイル時に検証                                         |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                          |
| ------------------ | -------- | ------------------------------------------------- |
| セキュリティ       | 適用     | validateIpcSender による送信元検証テスト          |
| エラーハンドリング | 適用     | FS エラー、バリデーションエラーの適切な処理テスト |
| アーキテクチャ     | 適用     | Main Process 層のサービス分離テスト               |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                             |
| -------------------- | -------- | ------------------------------------ |
| バックエンド（Main） | 適用     | SkillForker サービスのユニットテスト |
| IPC通信              | 適用     | skill:fork チャネルのテスト          |
| Preload/セキュリティ | 適用     | safeInvoke 経由のチャネル制限テスト  |

## 成果物

| 成果物             | パス                                                                                         | 説明                             |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------- |
| SkillForker テスト | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`                         | ユニットテスト・異常系・境界値   |
| IPC ハンドラテスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`                             | IPC バリデーション・セキュリティ |
| テスト仕様書       | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-4/test-specification.md` | テスト設計ドキュメント           |

## TDD検証

```bash
# テスト実行コマンド（apps/desktop ディレクトリから実行 — P40対策）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillForker.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] 実装ファイル（SkillForker.ts）が存在しないためインポートエラーで失敗する
```

## 完了条件

- [ ] SkillForker ユニットテスト（正常系4件以上）が作成されている
- [ ] modifySkillMd() テスト（4件以上）が作成されている
- [ ] copyDirectory() テスト（3件以上）が作成されている
- [ ] writeForkMetadata() テスト（2件以上）が作成されている
- [ ] 異常系テスト（4件以上）が作成されている
- [ ] IPC ハンドラテスト（8件以上）が作成されている
- [ ] 境界値テスト（4件以上）が作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+, Function 80%+）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-3 成果物、既存テスト構造）
2. SkillForker ユニットテスト作成（正常系・modifySkillMd・copyDirectory・writeForkMetadata）
3. 異常系テスト作成（存在しないスキル、同名衝突、FS エラー）
4. IPC ハンドラテスト作成（バリデーション・セキュリティ）
5. 境界値テスト作成（空 SKILL.md、特殊文字、大量ファイル）
6. Red 状態の確認
7. 成果物の配置と完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
