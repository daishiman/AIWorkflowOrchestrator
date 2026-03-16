# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 8                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 5〜7 で実装・テスト拡充した `DefaultSafetyGate` および `skill:evaluate-safety` IPCハンドラのコードを整理し、重複排除・命名統一・不要import除去を行う。リファクタリング後も全テストがPASSすることを確認する。

## 実行タスク

### Task 1: 重複コードの排除

#### 1-1. 5種チェックメソッドの共通パターン特定

`apps/desktop/src/main/permissions/default-safety-gate.ts` の5種チェックメソッドを読み、以下の観点で共通化できる箇所を特定する:

| 確認観点                             | 具体的な確認内容                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `SafetyCheckDetail` オブジェクト構築 | `passed` 状態の `checkId`, `toolName: ''`, `riskLevel: 'low'` を返すパターンの共通化候補 |
| ツールフィルタリング                 | `tools.find(t => t.riskLevel === '...')` のパターンが複数チェックで重複していないか      |
| メッセージ生成                       | スキル名を埋め込むメッセージ文字列のフォーマットに共通テンプレートが適用できるか         |

共通化の判断基準:

- 同一コードブロックが2箇所以上に存在する場合、プライベートヘルパーメソッドに抽出する
- 抽出後のヘルパーメソッド名は `build<StatusName>CheckDetail(checkId, ...)` 形式とする
- 共通化によってコードの可読性が下がる場合は共通化しない（1ケースのみ特殊な場合など）

#### 1-2. リファクタリング実施

抽出対象として特定したコードブロックをヘルパーメソッドに移動する。移動後は元の呼び出し箇所をヘルパーメソッド呼び出しに置き換える。

```typescript
// 共通化パターンの例（実際のコードで確認して適用する）
private buildPassedDetail(
  checkId: SafetyCheckId,
  message: string,
): SafetyCheckDetail {
  return {
    checkId,
    toolName: '',
    riskLevel: 'low',
    status: 'passed',
    message,
  };
}
```

### Task 2: 命名規則の統一確認

以下の命名規則が全ファイルで統一されていることを確認する:

| 対象                   | 命名規則                                                   | 確認ファイル                                             |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| プライベートメソッド名 | `check<CheckId形式のcamelCase>` (例: `checkAllLowTools`)   | `default-safety-gate.ts`                                 |
| パラメータ名           | `skillName`（`skillId` 禁止、P45準拠）                     | `default-safety-gate.ts`, `safety-gate.ts` (IPCハンドラ) |
| チャンネル定数         | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` で統一参照（P27準拠） | `safety-gate.ts` (IPCハンドラ), `channels.ts`            |
| テスト変数名           | `mockPermissionStore`, `mockSkillMetadataProvider` で統一  | `default-safety-gate.test.ts`                            |

命名規則違反が見つかった場合は修正する。修正箇所をコメントに記録する。

### Task 3: 不要importの除去

以下のファイルで未使用importを検出して除去する:

| ファイル                                                        | 確認コマンド                         |
| --------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/src/main/permissions/default-safety-gate.ts`      | ESLint `no-unused-vars` ルールで確認 |
| `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             | ESLint `no-unused-vars` ルールで確認 |
| `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | ESLint `no-unused-vars` ルールで確認 |
| `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | ESLint `no-unused-vars` ルールで確認 |

検出方法: `pnpm --filter @repo/desktop lint` を実行し、`no-unused-vars` エラーを確認する。

### Task 4: テストコードのヘルパー関数化

`apps/desktop/src/main/permissions/default-safety-gate.test.ts` で以下のパターンを確認し、ヘルパー化できる箇所を特定・適用する:

#### 4-1. ヘルパー化候補の特定

| 候補                             | 判断基準                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| モックオブジェクト生成           | `mockPermissionStore`, `mockSkillMetadataProvider` の生成が3箇所以上に分散している場合、`createMocks()` ヘルパーに抽出する                |
| テスト用スキルツール一覧生成     | `[{ name: 'Bash', riskLevel: 'critical' }]` 等の配列リテラルが3箇所以上に重複している場合、`createToolList(riskLevel)` ヘルパーに抽出する |
| `SafetyCheckDetail` アサーション | 複数テストで同じフィールドを繰り返しアサートしている場合、`expectCheckDetail(detail, expected)` ヘルパーに抽出する                        |

#### 4-2. ヘルパー関数の配置

ヘルパー関数はテストファイルのモジュールスコープ（`describe` ブロック外）に配置する。テスト間で状態を共有しないよう、ヘルパーは毎回新しいオブジェクトを返すファクトリ関数として定義する（P9準拠）。

### Task 5: リファクタリング後のテスト実行

リファクタリング完了後、以下のコマンドで全テストがPASSすることを確認する:

```bash
pnpm --filter @repo/desktop test apps/desktop/src/main/permissions/default-safety-gate.test.ts
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/handlers/safety-gate.test.ts
```

テスト失敗が発生した場合、リファクタリング差分を `git diff` で確認し、意図しない変更を元に戻す。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容                             |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | ヘルパー関数設計、テストパターン |

### タスク固有参照

| 参照資料               | パス                                                            |
| ---------------------- | --------------------------------------------------------------- |
| Phase 5 実装成果物     | `apps/desktop/src/main/permissions/default-safety-gate.ts`      |
| Phase 5 IPCハンドラ    | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             |
| Phase 5/6 テストコード | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` |
| Phase 5/6 テストコード | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md` (P9, P27, P42, P45)        |

## 実行手順

1. Task 1: 重複コードの排除（1-1 共通パターン特定 → 1-2 リファクタリング実施）
2. Task 2: 命名規則の統一確認（パラメータ名・チャンネル定数・テスト変数名）
3. Task 2-ext: Navigation 短縮確認（メソッド呼び出し連鎖が3段を超える箇所を中間変数またはヘルパーに短縮）
4. Task 3: 不要importの除去（ESLint `no-unused-vars` で検出）
5. Task 4: テストコードのヘルパー関数化（4-1 候補特定 → 4-2 配置）
6. Task 5: リファクタリング後のテスト実行（全テスト PASS 確認）
7. 成果物の作成・配置
8. 完了条件の検証

## 統合テスト連携

- リファクタリングは外部インターフェース（`SafetyGatePort`）を変更しないため、Task-08 の消費コードへの影響はない
- ヘルパーメソッド抽出後も `SafetyCheckDetail` の5要素返却契約は維持する

## 多角的チェック観点（AIが判断）

| 観点            | 確認項目                                                                                               | 仕様参照先                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| セキュリティ    | P42 3段バリデーションがリファクタリング後も維持されているか、P27 チャンネル定数管理が崩れていないか    | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ  | DI 境界維持（`SafetyGatePort` インターフェース準拠）、レイヤー依存方向が変わっていないか               | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスタビリティ  | テスト間状態リーク防止（P9）、ヘルパー関数がファクトリパターン（毎回新オブジェクト返却）になっているか | `aiworkflow-requirements: testing-component-patterns.md`           |
| Navigation 短縮 | メソッド呼び出し連鎖の深さを確認し、3段を超える連鎖がある場合は中間変数またはヘルパーで短縮する        | `aiworkflow-requirements: architecture-implementation-patterns.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                                                                              | 仕様参照先                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate のプライベートメソッド抽出がクラス外部 API を変更しないこと                         | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | `skill:evaluate-safety` ハンドラの引数型・バリデーションがリファクタリング後も P42 準拠を維持すること | `aiworkflow-requirements: api-ipc-system.md`        |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Task 1: 重複コードの排除
2. Task 2: 命名規則の統一確認
3. Task 3: 不要importの除去
4. Task 4: テストコードのヘルパー関数化
5. Task 5: リファクタリング後テスト実行
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物                                 | パス                                                            |
| -------------------------------------- | --------------------------------------------------------------- |
| リファクタリング済み DefaultSafetyGate | `apps/desktop/src/main/permissions/default-safety-gate.ts`      |
| リファクタリング済み IPCハンドラ       | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             |
| リファクタリング済みテストコード       | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` |
| リファクタリング済みテストコード       | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        |
| リファクタリングレポート               | `outputs/phase-8/refactoring-report.md`                         |

## 完了条件

- [ ] 重複コードがプライベートヘルパーメソッドに抽出されている（抽出対象が存在する場合）
- [ ] 命名規則が全ファイルで統一されている（特に `skillName` パラメータ名）
- [ ] 不要importが全ファイルで除去されている
- [ ] テストコードの重複パターンがヘルパー関数に抽出されている（重複が存在する場合）
- [ ] メソッド呼び出し連鎖が3段以下に短縮されている（または短縮不要であることが確認済み）
- [ ] `pnpm --filter @repo/desktop test` でリファクタリング対象テストが全件PASSする
- [ ] `SafetyGatePort` の外部インターフェースに変更がない

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 8
```

## 次Phase

Phase 9: 品質検証 → `phase-9-quality-assurance.md`
