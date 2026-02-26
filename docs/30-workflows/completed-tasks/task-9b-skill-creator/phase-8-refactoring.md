# Phase 8: リファクタリング（TDD: Refactor） - TASK-9B

## メタ情報

| 項目               | 内容                              |
| ------------------ | --------------------------------- |
| Phase              | 8                                 |
| Phase名            | リファクタリング（TDD: Refactor） |
| タスクID           | TASK-9B                           |
| 前提Phase          | phase-7-coverage-check.md         |
| 後続Phase          | Phase 9（品質保証）               |
| ステータス         | pending                           |
| 作成日             | 2026-02-26                        |
| 機能名             | task-9b-skill-creator             |
| 成果物ディレクトリ | outputs/phase-8/                  |

---

## 目的

Phase 5で実装したSkillCreatorServiceおよび関連コンポーネントの動作を変えずに、コードの可読性・保守性・拡張性を改善する。TDDサイクルのRefactorフェーズとして、全テストがGreen状態を維持したままリファクタリングを実施する。

## 背景

SkillCreatorServiceはFacadeパターンで5つのサブコンポーネント（HearingFacilitator, TaskGenerator, CodeGenerator, ApiIntegrator, Validator）を統合している。Phase 5の実装では機能要件を優先したため、以下の技術的負債が想定される:

- スキル生成・改善・フォークで共通するファイルシステム操作の重複
- IPCハンドラー引数名とサービス層の引数名のセマンティクス不一致（P45対策強化）
- タイムアウト値・リトライ回数のマジックナンバー

---

## 実行タスク

> 以下のタスクを順番に実行してください。リファクタリング中は各タスク完了時にテストを実行し、Green状態を維持すること。

### リファクタリング対象候補

> 以下はPhase 5〜7で蓄積された技術的負債の候補一覧。タスク1の分析で実際の該当箇所を特定し、該当するものをリファクタリングする。

| 対象                   | 改善内容                                     | 基準                                          |
| ---------------------- | -------------------------------------------- | --------------------------------------------- |
| バリデーションロジック | P42準拠3段バリデーションの共通関数化         | 3箇所以上で同一パターン使用                   |
| エラーハンドリング     | Result<T,E>パターン統一                      | サービス層の全メソッド                        |
| 型定義                 | 重複型の統合（packages/shared配置）          | 2ファイル以上で同一定義が存在                 |
| IPCハンドラ応答生成    | toIPCSuccess/toIPCError のヘルパー関数統一   | 全ハンドラで同一レスポンス構造を使用          |
| ファイルパス検証       | パストラバーサル検出の共通ユーティリティ化   | VL-003/VL-004/BV-004/BV-005で同一ロジック     |
| ログ出力               | electron-logレベル統一、テスト環境ガード追加 | console.log/warnが残存している箇所（P20対策） |

---

### タスク1: コード品質分析

**目的**: SkillCreatorServiceと5つのサブコンポーネントのコード品質を分析し、改善ポイントを特定する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` を読み込む
2. 各サブコンポーネントファイルを読み込む
3. 以下の観点で改善ポイントを特定する
4. 改善ポイントを優先度付きでリスト化する

**分析観点**:

| 観点                       | 確認内容                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ファイルシステム操作の重複 | スキル生成（`/skill-creator chat`）、改善（`/skill-creator improve`）、フォーク（`/skill-creator fork`）で同一のディレクトリ作成・ファイル書き込みパターンが繰り返されていないか |
| マジックナンバー           | タイムアウト値（例: `60000`）、リトライ回数（例: `3`）、バッファサイズがコード中にハードコードされていないか                                                                     |
| Long Method                | 50行を超えるメソッドがないか（超える場合は分割候補として記録）                                                                                                                   |
| Feature Envy               | 他クラス（HearingFacilitator等）のプロパティに過度に依存するメソッドがSkillCreatorServiceにないか                                                                                |
| God Class兆候              | SkillCreatorServiceのpublicメソッド数が12を超えていないか（12機能のエントリーポイント以外のpublicメソッド有無）                                                                  |
| 命名一貫性                 | IPCハンドラー引数名とサービスメソッド引数名のセマンティクスが一致しているか（P45対策）                                                                                           |

**確認コマンド**:

```bash
# メソッド行数の概算確認
grep -n "async \|private \|public \|protected " apps/desktop/src/main/services/skill/SkillCreatorService.ts

# マジックナンバー候補の検出
grep -n "[0-9]\{4,\}" apps/desktop/src/main/services/skill/SkillCreatorService.ts | grep -v "import\|test\|spec\|//"
```

**期待される成果物**:

- `outputs/phase-8/code-quality-analysis.md`

---

### タスク2: 共通ファイルシステム操作の抽出

**目的**: スキル生成・改善・フォークで共通するファイルシステム操作をヘルパーメソッドに抽出する

**実行手順**:

1. スキル生成（`createSkill`）、改善（`improveSkill`）、フォーク（`forkSkill`）の3メソッドを比較する
2. 共通するファイルシステム操作パターン（ディレクトリ作成、SKILL.md生成、agents/ディレクトリ構築、references/ディレクトリ構築）を特定する
3. 共通パターンを`private`ヘルパーメソッドとして抽出する
4. 抽出後にテストを実行し、全テストがPASSすることを確認する

**抽出候補パターン**:

```typescript
// Before: 各メソッドで繰り返されるパターン
async createSkill(request: CreateSkillRequest): Promise<SkillCreationResult> {
  // ディレクトリ作成
  await fs.mkdir(skillDir, { recursive: true });
  await fs.mkdir(path.join(skillDir, "agents"), { recursive: true });
  await fs.mkdir(path.join(skillDir, "references"), { recursive: true });
  // SKILL.md生成
  await fs.writeFile(path.join(skillDir, "SKILL.md"), content);
  // ...
}

// After: ヘルパーメソッド抽出
private async initializeSkillDirectory(skillDir: string): Promise<void> {
  await fs.mkdir(skillDir, { recursive: true });
  await fs.mkdir(path.join(skillDir, "agents"), { recursive: true });
  await fs.mkdir(path.join(skillDir, "references"), { recursive: true });
}
```

**判断基準**:

| 判断       | 条件                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| 抽出する   | 3行以上の完全に同一のコードブロックが3箇所以上ある場合                      |
| 抽出しない | 各メソッドの処理が微妙に異なり、抽出するとパラメータが4つ以上必要になる場合 |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/filesystem-helper-extraction.md`

---

### タスク3: マジックナンバーの定数化

**目的**: コード内のマジックナンバーを名前付き定数に置き換える

**実行手順**:

1. タスク1で検出したマジックナンバーを確認する
2. 以下の定数ファイルに適切な定数を定義する
3. コード内のマジックナンバーを定数参照に置き換える
4. テストを実行し、全テストがPASSすることを確認する

**定数化対象候補**:

| マジックナンバー             | 定数名候補                  | 定義場所                                    |
| ---------------------------- | --------------------------- | ------------------------------------------- |
| スキル生成タイムアウト（ms） | `SKILL_CREATION_TIMEOUT_MS` | SkillCreatorService.ts のモジュールスコープ |
| リトライ回数                 | `MAX_RETRY_COUNT`           | SkillCreatorService.ts のモジュールスコープ |
| リトライ間隔（ms）           | `RETRY_INTERVAL_MS`         | SkillCreatorService.ts のモジュールスコープ |
| 最大スキル名長               | `MAX_SKILL_NAME_LENGTH`     | SkillCreatorService.ts のモジュールスコープ |
| バックアップ保持数           | `MAX_BACKUP_COUNT`          | SkillCreatorService.ts のモジュールスコープ |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/magic-number-extraction.md`（抽出した定数一覧と変更箇所の記録）

---

### タスク4: SOLID原則適用の検証と改善

**目的**: SkillCreatorServiceと5つのサブコンポーネントがSOLID原則に準拠していることを検証する

**実行手順**:

1. SRP（単一責務原則）: 各サブコンポーネントが単一の責務を持つことを確認する
2. OCP（開放閉鎖原則）: 新しいスキル生成戦略の追加が既存コード変更なしで可能か検証する
3. DIP（依存性逆転原則）: SkillCreatorServiceが具象クラスではなくインターフェースに依存しているか検証する
4. 違反箇所があれば修正し、テストを実行する

**SOLID検証マトリクス**:

| 原則 | 検証対象            | 確認内容                                                                                | 結果 |
| ---- | ------------------- | --------------------------------------------------------------------------------------- | ---- |
| SRP  | HearingFacilitator  | ヒアリング以外の責務（ファイル操作、バリデーション）を持っていないか                    | -    |
| SRP  | TaskGenerator       | タスク生成以外の責務を持っていないか                                                    | -    |
| SRP  | CodeGenerator       | コード生成以外の責務を持っていないか                                                    | -    |
| SRP  | ApiIntegrator       | API連携以外の責務を持っていないか                                                       | -    |
| SRP  | Validator           | 検証以外の責務を持っていないか                                                          | -    |
| SRP  | SkillCreatorService | Facadeとしてのオーケストレーション以外の責務を持っていないか                            | -    |
| OCP  | SkillCreatorService | 新しいコマンド（例: `/skill-creator analyze`）追加時にService本体を変更する必要がないか | -    |
| DIP  | SkillCreatorService | コンストラクタで具象クラスを直接生成していないか（DI経由であるか）                      | -    |

**確認コマンド**:

```bash
# DI確認: コンストラクタの引数を確認
grep -A 20 "constructor" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# 具象クラスの直接生成確認
grep -n "new HearingFacilitator\|new TaskGenerator\|new CodeGenerator\|new ApiIntegrator\|new Validator" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

**期待される成果物**:

- `outputs/phase-8/solid-verification.md`

---

### タスク5: 命名改善とP45対策強化

**目的**: IPCハンドラー引数名とサービス層の引数名のセマンティクスを統一する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` のskill-creator関連ハンドラーの引数名を確認する
2. `SkillCreatorService` のpublicメソッド引数名と比較する
3. セマンティクスが一致しない箇所を修正する（例: `skillId` として受け取っているが実際は `skillName` である場合）
4. テストを実行し、全テストがPASSすることを確認する

**P45チェックリスト**:

| IPCハンドラー引数名 | サービスメソッド引数名 | 実際の値のセマンティクス | 一致 |
| ------------------- | ---------------------- | ------------------------ | ---- |
| {{IPC引数1}}        | {{Service引数1}}       | {{実際の意味}}           | -    |
| {{IPC引数2}}        | {{Service引数2}}       | {{実際の意味}}           | -    |

> ※ 実行時にIPCハンドラーの実際の引数名を確認して表を埋めること

**検出コマンド**:

```bash
# IPCハンドラーの引数名確認
grep -n "ipcMain.handle.*skill-creator\|ipcMain.handle.*skillCreator" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# サービスメソッドの引数名確認
grep -n "async.*(" apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -20
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/ --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/naming-p45-review.md`

---

### タスク6: リファクタリング総合確認

**目的**: タスク1〜5の変更が全体テストに影響を与えていないことを確認する

**実行手順**:

1. skill関連の全テストを実行する
2. IPC関連の全テストを実行する
3. カバレッジがPhase 7と同等以上であることを確認する
4. リファクタリングレポートを作成する

**確認コマンド**:

```bash
# skill関連テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/ --reporter=verbose

# IPC関連テスト
cd apps/desktop && pnpm vitest run src/main/ipc/ --reporter=verbose

# カバレッジ確認
cd apps/desktop && pnpm vitest run src/main/services/skill/ --coverage --reporter=verbose
```

**カバレッジ比較**:

| 指標              | Phase 7実績  | Phase 8実績  | 差分     | 判定 |
| ----------------- | ------------ | ------------ | -------- | ---- |
| Line Coverage     | {{Phase7値}} | {{Phase8値}} | {{差分}} | -    |
| Branch Coverage   | {{Phase7値}} | {{Phase8値}} | {{差分}} | -    |
| Function Coverage | {{Phase7値}} | {{Phase8値}} | {{差分}} | -    |

> カバレッジが低下した場合はリファクタリングによるテスト漏れがあるため、Phase 6に戻りテストを追加すること。

**期待される成果物**:

- `outputs/phase-8/refactoring-report.md`（全タスクの変更箇所・理由・影響範囲の統合レポート）

---

## SubAgent分担

| SubAgent   | 担当                                                                 |
| ---------- | -------------------------------------------------------------------- |
| SubAgent-A | タスク1（コード品質分析）+ タスク2（共通ファイルシステム操作の抽出） |
| SubAgent-B | タスク3（マジックナンバーの定数化）+ タスク4（SOLID原則検証）        |
| SubAgent-C | タスク5（命名改善とP45対策）                                         |
| SubAgent-D | タスク6（リファクタリング総合確認）+ リファクタリングレポート統合    |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 内容                                         |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Facadeパターン・DI・リファクタリングパターン |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の苦戦箇所と解決策                       |
| Electronサービス設計 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Facadeパターン・DI設計方針                   |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 3段バリデーション・sender検証                |
| IPC契約チェック      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45統合チェック              |
| 品質基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | コード品質・カバレッジ基準                   |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result<T,E>パターン・エラーカテゴリ          |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                          | TypeScript型安全・テスト設計                 |

### タスク固有参照

| 参照資料                  | パス                                                                                                  | 内容                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1要件成果物         | `outputs/phase-1/requirements-definition.md`                                                          | 要件制約・受け入れ基準の再確認   |
| Phase 2設計成果物         | `outputs/phase-2/architecture-design.md`                                                              | 設計意図・責務境界の確認         |
| Phase 5実装コード         | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                                         | リファクタリング対象の実装コード |
| Phase 6テスト拡充成果物   | `outputs/phase-6/coverage-report.md`                                                                  | 追加テスト観点の確認             |
| Phase 7カバレッジレポート | `outputs/phase-7/coverage-report.md`                                                                  | カバレッジ基準値（リファクタ前） |
| IPCハンドラー             | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                                   | skill-creator関連IPCハンドラー   |
| 元タスク仕様書            | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-020a-task-9b-skill-creator.md` | 分割前の元仕様                   |

---

## 成果物

| 成果物                   | パス                                              | 内容                     |
| ------------------------ | ------------------------------------------------- | ------------------------ |
| コード品質分析           | `outputs/phase-8/code-quality-analysis.md`        | 改善ポイント一覧と優先度 |
| FS操作ヘルパー抽出       | `outputs/phase-8/filesystem-helper-extraction.md` | 共通パターン抽出結果     |
| マジックナンバー定数化   | `outputs/phase-8/magic-number-extraction.md`      | 定数化した項目一覧       |
| SOLID原則検証            | `outputs/phase-8/solid-verification.md`           | SOLID準拠確認結果        |
| 命名改善・P45対策        | `outputs/phase-8/naming-p45-review.md`            | 命名統一結果             |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`           | 全変更の統合レポート     |

---

## 統合テスト連携【必須】

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                  | 基準                                                       |
| ------------------------- | ---------------------------------------------------------- |
| skill関連全ユニットテスト | 100% パス                                                  |
| IPC関連全ユニットテスト   | 100% パス                                                  |
| カバレッジ維持            | Phase 7と同等以上（Line 80%+, Branch 60%+, Function 80%+） |
| セキュリティテスト        | 3段バリデーション・sender検証テスト全件PASS                |

**統合テスト実行コマンド**:

```bash
# リファクタリング後の全テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/ --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/ipc/ --reporter=verbose
```

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                                      | 仕様参照先                                         |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------- |
| セキュリティ       | 必須（リファクタで3段バリデーションが壊れていないことを確認） | aiworkflow-requirements: security-skill-ipc.md     |
| UI/UX              | 非該当（バックエンドリファクタリングのみ）                    | -                                                  |
| アーキテクチャ     | 必須（Facadeパターン・DI構造の維持確認）                      | aiworkflow-requirements: arch-electron-services.md |
| API設計            | 非該当（IPCインターフェース変更なし）                         | -                                                  |
| データ整合性       | 非該当（DB変更なし）                                          | -                                                  |
| エラーハンドリング | 必須（Result<T,E>パターン維持確認）                           | aiworkflow-requirements: error-handling.md         |
| パフォーマンス     | 非該当（パフォーマンス変更なし）                              | -                                                  |
| アクセシビリティ   | 非該当（UI実装なし）                                          | -                                                  |
| テスタビリティ     | 必須（DI維持・テスト容易性確認）                              | aiworkflow-requirements: quality-requirements.md   |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                         | 仕様参照先                                         |
| -------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（バックエンドリファクタリングのみ）       | -                                                  |
| バックエンド（Main）       | 必須（SkillCreatorService構造維持確認）          | aiworkflow-requirements: arch-electron-services.md |
| IPC通信                    | 確認のみ（インターフェース変更がないことを確認） | aiworkflow-requirements: api-ipc-agent.md          |
| Preload/セキュリティ       | 確認のみ（Preload変更がないことを確認）          | aiworkflow-requirements: security-api-electron.md  |
| ローカルストレージ         | 非該当（DB変更なし）                             | -                                                  |

---

## 実行手順

1. タスク1を実行し、改善ポイントを特定する
2. タスク2〜5を実行し、各改善を実施する（各タスク完了後にテストを実行してGreen状態を維持）
3. タスク6で全体テストとカバレッジを確認する
4. リファクタリングレポートを作成する
5. Phase完了時の検証コマンドを実行する

**Phase完了時の検証コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 8
```

---

## 完了条件

- [ ] コード品質分析が完了し、改善ポイントが特定されている
- [ ] 共通ファイルシステム操作の抽出判断と実施（または見送り理由記録）が完了している
- [ ] マジックナンバーが定数化されている（該当箇所がない場合は「該当なし」と記録）
- [ ] SOLID原則の検証が完了し、違反箇所の修正が完了している
- [ ] IPCハンドラーとサービス層の引数名セマンティクスが統一されている（P45対策）
- [ ] 全テスト（skill関連・IPC関連）が100% PASSしている
- [ ] カバレッジがPhase 7と同等以上である
- [ ] リファクタリングレポート（6ファイル）が全て生成されている

---

## サブタスク管理

- [ ] 全6タスクの完了確認
- [ ] 各タスクの成果物が生成されていることを確認
- [ ] タスク間の依存関係（タスク1→タスク2〜5→タスク6）が守られていることを確認
- [ ] SubAgent分担に従い、並列実行可能なタスクは並列で実施

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクの成果物（6ファイル）が全て生成されている
- [ ] artifacts.jsonのphase-8ステータスが更新されている
- [ ] テストが継続してGreen状態であることを確認

---

## 次Phase

Phase 9（品質保証）へ進む。

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/task-9b-skill-creator/phase-9-quality-assurance.md`
