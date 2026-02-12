# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目    | 値                |
| ------- | ----------------- |
| Phase   | 8                 |
| 機能名  | skill-creator-ipc |
| 作成日  | 2026-02-12        |
| 次Phase | Phase 9: 品質保証 |

## 目的

Phase 5-7 で実装・テスト済みのコードに対して、動作を変えずにコード品質を改善する。コードスメル検出、ハンドラー共通化、型定義整理、SOLID原則適用の4観点からリファクタリングを実施し、可読性・保守性・一貫性を向上させる。

## 実行タスク

### Task 1: コードスメル検出

以下の4カテゴリについて `skillCreatorHandlers.ts` と `skill-creator-api.ts` を検査する。

#### 1-1. 重複ハンドラーパターンの検出

- 同一構造の try/catch ブロックの繰り返し箇所を全て列挙する
- `validateIpcSender(event)` 呼び出しの重複回数をカウントする
- 引数バリデーションの類似パターン（string型チェック、必須フィールド確認）を分類する
- エラーレスポンス生成（`{ success: false, error: string }`）の重複箇所を特定する

#### 1-2. 命名不統一の検出

- チャンネル名と関数名の対応規則を表にまとめる
- 既存 `skillHandlers.ts` の命名規則と比較し、不統一箇所を列挙する
- 変数名・引数名の命名パターンが `skillHandlers.ts` と一致しているか確認する

#### 1-3. 型アサーション使用箇所の検出

- `as` キーワードでのキャスト箇所を全て列挙する
- 各箇所について「実行時バリデーションで置き換え可能か」を判定する
- 置き換え可能な箇所は Zod スキーマまたはガード関数に置換する

#### 1-4. スメル検出結果の記録

- 検出したスメルを `outputs/phase-8/code-smell-report.md` に記録する
- 各スメルに対して「対応する / 対応しない」の判断理由を明記する

### Task 2: ハンドラー共通化

#### 2-1. 共通バリデーションロジックの抽出評価

以下のパターンが3箇所以上で繰り返されている場合、共通関数として抽出する。

- `validateIpcSender(event)` + try/catch + `{ success: false, error }` レスポンス生成
- 文字列引数の非空チェック（`typeof arg === 'string' && arg.length > 0`）
- オブジェクト引数の必須フィールド確認

#### 2-2. 共通化の判断基準

- 共通化による可読性向上が明確な場合のみ実施する
- 既存パターン（`skillHandlers.ts`）がインラインパターンを採用している場合、一貫性を優先する
- YAGNI 原則に従い、将来の拡張を理由とした抽象化は行わない
- 共通化した場合と共通化しない場合のコード行数・可読性を比較記録する

#### 2-3. 共通化実施（判断結果が「実施」の場合）

- `withValidation` ラッパー関数を作成する（sender検証 + try/catch + エラーサニタイズを内包）
- 全6ハンドラーに適用し、各ハンドラーのコード行数を記録する
- リファクタ前後のコード差分を `outputs/phase-8/refactoring-log.md` に記録する

### Task 3: 型定義整理

#### 3-1. 不要な型エクスポートの削除

- `packages/shared/src/skill-creator/types.ts` から外部未参照の型を特定する
- `apps/desktop/src/preload/types.ts` で未使用の import を削除する
- `grep -rn "import.*from.*skill-creator"` で全参照箇所を確認し、使用されていない型エクスポートを削除する

#### 3-2. import文最適化

- 各ファイルの import 文を整理する（未使用 import の削除、import 順序の統一）
- `@repo/shared` からの import と相対パス import が混在していないか確認する

#### 3-3. shared型とpreload型の一貫性確認（P32対策）

- `packages/shared/src/skill-creator/types.ts` の型名一覧を作成する
- `apps/desktop/src/preload/types.ts` の `SkillCreatorAPI` 内の型参照一覧を作成する
- 両方の一覧を突合し、不一致がある場合は `shared` 側を正とする

### Task 4: SOLID原則適用

#### 4-1. SRP（単一責務原則）の確認

- `skillCreatorHandlers.ts` がIPCハンドラー登録のみを責務としているか確認する
- ビジネスロジック（バリデーション以外の処理）がハンドラーに漏れ出していないか確認する
- バリデーション以外の処理が含まれている場合、`SkillCreatorService` に移動する

#### 4-2. DIP（依存性逆転原則）の確認

- `skillCreatorHandlers.ts` が `SkillCreatorService` の具象クラスではなくインターフェースに依存しているか確認する
- `ipcMain` への直接依存を最小限にし、テスト容易性が確保されているか確認する

#### 4-3. OCP（開放閉鎖原則）の確認

- 新しいチャンネルを追加する際に、既存のハンドラーコードを変更する必要がないか確認する
- Handler Map方式が採用されている場合、新チャンネル追加がマップへのエントリ追加のみで完結するか確認する

### Task 5: リファクタリング後の全テスト継続成功確認

リファクタリングにより既存テストが壊れていないことを検証する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skillCreator"
pnpm --filter @repo/desktop test -- --testPathPattern="skill-creator"
```

- 全テストが PASS することを確認する
- リファクタリング前後でテスト数が変わっていないことを確認する
- テストコード自体のリファクタリング（テストヘルパーの抽出、describe構造の整理）を実施する

## 参照資料

| 資料名                             | パス                                                                              | 説明                                   |
| ---------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| セキュリティ（Skill IPC）          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | SkillCreator IPC固有のセキュリティ要件 |
| インターフェース仕様               | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillCreatorService API仕様            |
| IPCアーキテクチャ                  | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3準拠、Handler Map方式         |
| Electronセキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC通信セキュリティ原則                |
| IPC API仕様                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存チャンネルとの命名一貫性確認       |
| 既存ハンドラーパターン             | `apps/desktop/src/main/ipc/handlers/skillHandlers.ts`                             | リファクタリング一貫性の基準           |
| リファクタリング対象（ハンドラー） | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                               | リファクタリング対象ファイル           |
| リファクタリング対象（Preload）    | `apps/desktop/src/preload/api/skill-creator-api.ts`                               | リファクタリング対象ファイル           |
| 型定義（Preload）                  | `apps/desktop/src/preload/types.ts`                                               | 型整理確認用                           |
| Phase 5-7 成果物                   | `docs/30-workflows/skill-creator-ipc/outputs/phase-5/` ～ `outputs/phase-7/`      | 実装・テスト・カバレッジレポート       |
| コード品質ルール                   | `.claude/rules/02-code-quality.md`                                                | SOLID原則・コーディング規約            |

## 実行手順

1. Task 1 を実行し、コードスメル検出結果を `outputs/phase-8/code-smell-report.md` に記録する
2. Task 2 を実行し、共通化の判断結果と実施内容を記録する
3. Task 3 を実行し、型定義の整理を完了する
4. Task 4 を実行し、SOLID原則への準拠状況を確認する
5. Task 5 を実行し、全テストが継続成功することを確認する
6. 全タスクの結果を `outputs/phase-8/refactoring-log.md` に記録する

## 統合テスト連携【必須】

リファクタリング後の全テスト継続成功を確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skillCreator"
pnpm --filter @repo/desktop test -- --testPathPattern="skill-creator"
```

| 確認項目                | 確認内容                              | 結果       |
| ----------------------- | ------------------------------------- | ---------- |
| ハンドラーテスト        | `skillCreatorHandlers.test.ts` 全PASS | {{RESULT}} |
| Preload APIテスト       | `skill-creator-api.test.ts` 全PASS    | {{RESULT}} |
| 既存skillHandlersテスト | 既存ハンドラーテストへの影響なし      | {{RESULT}} |
| テスト数の変化          | リファクタ前後でテスト数が同一        | {{RESULT}} |

## 多角的チェック観点

| 観点                   | 確認内容                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- |
| コードスメル           | 重複パターン、命名不統一、型アサーション使用が全て検出・対応されている             |
| 既存パターンとの一貫性 | `skillHandlers.ts` と同じ構造・命名規則を使用している                              |
| 過度な抽象化の回避     | YAGNI原則に従い、将来の拡張を理由とした抽象化がない                                |
| SOLID原則              | SRP（IPCハンドラー登録のみ）、DIP（インターフェース依存）、OCP（拡張に対して開放） |
| テスト継続成功         | 全テストがPASSし、テスト数が減少していない                                         |

## 成果物

| 成果物               | パス                                                                       | 説明                                 |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| コードスメルレポート | `docs/30-workflows/skill-creator-ipc/outputs/phase-8/code-smell-report.md` | 検出したスメルと対応判断の記録       |
| リファクタリング記録 | `docs/30-workflows/skill-creator-ipc/outputs/phase-8/refactoring-log.md`   | リファクタ前後の差分と実施内容の記録 |
| 改善コード           | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                        | リファクタリング後のハンドラー実装   |
| 改善コード           | `apps/desktop/src/preload/api/skill-creator-api.ts`                        | リファクタリング後のPreload API実装  |

## 完了条件

- [ ] コードスメルが検出され、対応/非対応の判断理由が全て記録されている
- [ ] 重複ハンドラーパターンの共通化が評価され、判断結果が記録されている
- [ ] 型アサーション（`as`）の使用箇所が全て確認され、置き換え可能な箇所は置換されている
- [ ] 不要な型エクスポートが削除されている
- [ ] import文が整理されている（未使用import削除済み）
- [ ] shared型とpreload型の一貫性が確認されている（P32対策）
- [ ] SRP: `skillCreatorHandlers.ts` がIPCハンドラー登録のみを責務としている
- [ ] DIP: `SkillCreatorService` のインターフェースに依存している
- [ ] 既存パターン（`skillHandlers.ts`）との一貫性が保たれている
- [ ] 過度な抽象化がない（YAGNI原則準拠）
- [ ] 全テストがPASS（テスト数の減少なし）
- [ ] `outputs/phase-8/code-smell-report.md` が作成されている
- [ ] `outputs/phase-8/refactoring-log.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク                 | ステータス | 完了日 |
| -------------------------- | ---------- | ------ |
| Task 1: コードスメル検出   | 未着手     |        |
| Task 2: ハンドラー共通化   | 未着手     |        |
| Task 3: 型定義整理         | 未着手     |        |
| Task 4: SOLID原則適用      | 未着手     |        |
| Task 5: テスト継続成功確認 | 未着手     |        |

## タスク100%実行確認【必須】

- [ ] Task 1（コードスメル検出）: 4カテゴリ全て検査完了
- [ ] Task 2（ハンドラー共通化）: 判断結果記録済み、実施した場合はコード差分記録済み
- [ ] Task 3（型定義整理）: 不要エクスポート削除、import最適化、P32一貫性確認完了
- [ ] Task 4（SOLID原則適用）: SRP・DIP・OCP全て確認完了
- [ ] Task 5（テスト継続成功確認）: 全テストPASS、テスト数不変

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
