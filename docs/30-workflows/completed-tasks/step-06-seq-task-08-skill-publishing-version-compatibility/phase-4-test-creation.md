# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| 前提Phase  | Phase 3（設計レビュー PASS または MINOR） |
| 後続Phase  | Phase 5（実装）                           |
| ステータス | 完了（2026-03-17 再監査）                 |
| 作成日     | 2026-03-16                                |
| 機能名     | スキル共有・公開・互換性統合              |
| タスクID   | TASK-SKILL-LIFECYCLE-08                   |
| タスク種別 | 設計                                      |

## 目的

Phase 2 の 5 つの設計書（公開レベルメタデータ、互換性チェック、Skill Center フロー、配布操作、公開判定）に対するテスト仕様（テストケース定義・期待値・テストデータ・モック定義）を作成する。設計タスクのため、実行可能テストコードではなくテスト仕様書が成果物となる。

## 事前確認（phase-template-execution.md 準拠）

### 既存ユーティリティ重複検出【必須】

テスト対象機能で使用する可能性のあるユーティリティ関数が既に存在しないか確認する。

```bash
# semver 比較関連のユーティリティ検索
grep -rn "export.*function.*semver\|export.*function.*compareVersion\|export const.*semver" packages/ apps/
# スキーマ比較関連のユーティリティ検索
grep -rn "export.*function.*schemaDiff\|export.*function.*checkCompat" packages/ apps/
# メタデータバリデーション関連のユーティリティ検索
grep -rn "export.*function.*validateMetadata\|export.*function.*checkRequired" packages/ apps/
```

重複が検出された場合は、既存実装を再利用する設計に変更する。

### IPC レスポンス形式の事前合意

テスト設計時に、IPC ハンドラのレスポンス形式を明示的に決定する。

| チャンネル                             | 形式                                                                       | 使用基準          |
| -------------------------------------- | -------------------------------------------------------------------------- | ----------------- |
| `skill:publishing:register`            | `{ success: true, data: RegisterResult }` / `{ success: false, error: E }` | CRUD 操作（登録） |
| `skill:publishing:update`              | `{ success: true, data: UpdateResult }` / `{ success: false, error: E }`   | CRUD 操作（更新） |
| `skill:publishing:deprecate`           | `{ success: true }` / `{ success: false, error: E }`                       | 破壊的操作        |
| `skill:publishing:remove`              | `{ success: true }` / `{ success: false, error: E }`                       | 破壊的操作        |
| `skill:publishing:get-dependents`      | 直接値返却 (`string[]`)                                                    | 単純な取得操作    |
| `skill:publishing:check-readiness`     | 直接値返却 (`PublishReadiness`)                                            | 同期的な判定      |
| `skill:publishing:check-compatibility` | 直接値返却 (`CompatibilityCheckResult`)                                    | 同期的な判定      |
| `skill:distribution:import`            | `{ success: true, data: ImportResult }` / `{ success: false, error: E }`   | 外部サービス連携  |
| `skill:distribution:export`            | `{ success: true, data: ExportPackage }` / `{ success: false, error: E }`  | CRUD 操作         |
| `skill:distribution:fork`              | `{ success: true, data: ForkResult }` / `{ success: false, error: E }`     | CRUD 操作         |
| `skill:distribution:share`             | `{ success: true, data: ShareLink }` / `{ success: false, error: E }`      | CRUD 操作         |

テストの期待値をレスポンス形式と一致させること（P60 対策）。

### テスト対象ファイルの import 副作用チェック

本タスクは設計タスクのため、実行可能テストコードは作成しない。テスト対象ファイルの import 副作用チェックは**該当なし**。後続の実装タスクで実行可能テストコードを作成する際に実施する。

## 背景

TDD の Red フェーズに相当する。テスト仕様を先に定義することで、Phase 5 の型定義・インターフェース確定時に「テスト可能な設計」を維持できる。Phase 2 の 5 つの設計書が審査対象であり、各設計の正しさを検証するテストケースを網羅的に定義する。

## 実行タスク

### タスク1: 公開レベルメタデータのテスト仕様設計

**目的**: `SkillVisibility` 型と `SkillPublishingMetadata` の型バリデーション、StateChart 遷移の正当性を検証するテスト仕様を定義する。

**実行手順**:

1. `SkillVisibility` 型バリデーションのテストケースを定義する:
   - 正常系: `"local"`, `"team"`, `"public"` の 3 値が型として有効であることを確認
   - 異常系: `"private"`, `""`, `null`, `undefined` が型エラーまたはバリデーションエラーを返すことを確認

2. 各レベルの必須フィールドバリデーションテストを定義する（P42準拠3段バリデーション: 型チェック → 空文字列チェック → trim後空文字列チェック）:
   - `local`: `name`（string, 非空, trim後非空）, `description`（同）, `version`（semver形式）
   - `team`: `local` 必須フィールド全て + `author`（同）, `tags`（非空配列）, `teamId`（UUID形式）
   - `public`: `team` 必須フィールド全て + `license`（SPDX形式または非空文字列）, `readme`（非空）, `changelog`（非空）, `minAppVersion`（semver形式）

3. StateChart 遷移テストケースを定義する:
   - 昇格正常系: `local→team` で `author`, `tags`, `teamId` が全て入力済み かつ互換性チェックPASS
   - 昇格異常系: `local→team` で必須フィールドが1つでも欠けている場合はエラー
   - 昇格異常系: `team→public` で `license` が空文字列の場合はエラー
   - 降格正常系: `team→local` で `teamId` が無効化された場合に遷移が発生
   - 降格正常系: `public→team` で公開停止申請承認後に遷移が発生

**期待される成果物**: `outputs/phase-4/publishing-test-spec.md`

---

### タスク2: 互換性チェックのテスト仕様設計

**目的**: semver 比較ロジック、schema diff 検出、依存バージョン制約の正確性を検証するテスト仕様を定義する。

**実行手順**:

1. semver 比較テストケースを定義する:
   - `major` 判定: 入力スキーマの必須フィールドを削除した場合（例: `{a: string, b: string}` → `{a: string}`）
   - `major` 判定: 既存パラメータの型を非互換変更した場合（例: `a: string` → `a: number`）
   - `minor` 判定: 任意パラメータを追加した場合（例: `{a: string}` → `{a: string, b?: number}`）
   - `patch` 判定: スキーマ変更なしでドキュメントのみ変更した場合

2. schema 互換性チェック（breaking change 自動判定）テストケースを定義する:
   - breaking change 正常系: `{"required": ["a"]}` → `{}` で `breakingChanges` に `"a removed"` が含まれる
   - breaking change 正常系: `a: string` → `a: number` で `breakingChanges` に型変更が含まれる
   - 非breaking change: `{}` → `{"optional": ["b"]}` で `breakingChanges` が空配列

3. 依存バージョン制約テストケースを定義する:
   - `^1.0.0` range に `1.2.3` が適合し `2.0.0` が非適合であることを確認
   - `~1.0.0` range に `1.0.5` が適合し `1.1.0` が非適合であることを確認
   - conflict detection: 同一スキルに `^1.0.0` と `^2.0.0` の要求が同時に存在する場合に `CompatibilityLevel: "breaking"` を返す

4. `CompatibilityCheckResult` の全フィールドが正しく設定されることを検証するテストデータを定義する:
   - `level`: `"compatible"` | `"minor-incompatible"` | `"breaking"` の各パスで期待値を定義
   - `suggestedBump`: `level` に対応する `"major"` | `"minor"` | `"patch"` の期待値を定義

**期待される成果物**: `outputs/phase-4/compatibility-test-spec.md`

---

### タスク3: Skill Center フローのテスト仕様設計

**目的**: 登録・更新・公開停止の 3 フローの正常系と異常系を検証するテスト仕様を定義する。

**実行手順**:

1. 登録フロー テストケースを定義する:
   - 正常系: Step 1〜4 が順に実行され、最終的に `visibility: "public"` となることを確認
   - 異常系: Step 2 のバリデーションで `name` が空の場合、Step 4 に到達せずエラーを返す
   - 異常系: Step 2 の安全性チェックで `SecurityScanResult.criticalFindings > 0` の場合、Step 4 に到達せずエラーを返す

2. 更新フロー テストケースを定義する:
   - 互換更新正常系: `CompatibilityLevel: "compatible"` の場合は自動承認され `UpdateResult.approved: true` を返す
   - 非互換更新正常系: `CompatibilityLevel: "breaking"` の場合は手動承認フラグ `UpdateResult.requiresManualApproval: true` を返す
   - 通知発生: breaking change がある場合、旧バージョンユーザーへの通知が1件以上生成されることを確認

3. 公開停止フロー テストケースを定義する:
   - 正常系: deprecation notice が掲載され `gracePeriodDays: 30` が設定されることを確認
   - 依存スキルあり: `getDependents` が非空配列を返す場合、影響スキル一覧が応答に含まれることを確認
   - 依存スキルなし: `getDependents` が空配列の場合、影響スキル一覧が空であることを確認

4. `SkillRegistryService` モック定義を記述する:
   - `register`: 正常時 `{ success: true, skillId: "test-skill-id" }` を返すモック
   - `update`: breaking change 時 `{ requiresManualApproval: true }` を返すモック
   - `getDependents`: 依存スキルありパスは `["dep-skill-1"]`, なしパスは `[]` を返すモック

**期待される成果物**: `outputs/phase-4/skill-center-test-spec.md`

---

### タスク4: 配布操作のテスト仕様設計

**目的**: import/export/fork/share の 4 操作の単体テストケースと操作間整合性テストを定義する。

**実行手順**:

1. `importSkill` テストケースを定義する:
   - 正常系: 有効な `sourceUrl` で `ImportResult.success: true` かつ `localSkillId` が返される
   - 依存解決: 依存スキルが未インストールの場合、`ImportResult.missingDependencies` に依存スキル名が含まれる
   - 異常系: `sourceUrl` が空文字列の場合、バリデーションエラーを返す（P42準拠）

2. `exportSkill` テストケースを定義する:
   - 正常系: 有効な `skillId` で `ExportPackage` が `.skill` 拡張子のファイルパスと共に返される
   - 異常系: `skillId` が trim後空文字列の場合、バリデーションエラーを返す（P42準拠）
   - 異常系: 必須フィールド（`name`, `version`）未設定のスキルをexportしようとした場合にエラーを返す

3. `forkSkill` テストケースを定義する:
   - 正常系: 有効な `skillId` と `newName` で `ForkResult.newSkillId` が UUID v4 形式で返される
   - 正常系: `ForkResult` に `parentRef: originalSkillId` が含まれる
   - 異常系: `newName` が空文字列の場合、バリデーションエラーを返す（P42準拠）

4. `shareSkill` テストケースを定義する:
   - 正常系: 有効な `skillId` と `teamId` で `ShareLink` が有効期限付きJWT形式で返される
   - 正常系: `ShareLink` の有効期限が `options.expireAt` と一致することを確認
   - 異常系: `teamId` が空文字列の場合、バリデーションエラーを返す（P42準拠）

5. 操作間整合性テストケースを定義する:
   - fork後にimport: fork済みスキルをexportして別環境にimportした場合、`parentRef` が保持されることを確認
   - share後に無効化: `teamId` が無効化された後、同 `ShareLink` でのアクセスが `401` エラーを返すことを確認

**期待される成果物**: `outputs/phase-4/distribution-test-spec.md`

---

### タスク5: 公開判定ロジックのテスト仕様設計

**目的**: `PublishReadinessChecker` の判定マトリクスの全組合せを網羅するテスト仕様と、Task06/07 入力のモック定義を作成する。

**実行手順**:

1. 判定マトリクス網羅テストケースを定義する（Phase 2 のマトリクス全行に対応）:
   - `auto-approved` パス: `RiskLevel="low"`, 成功率=85%, `trend="stable"`, `scanPassed=true` → `status: "auto-approved"`
   - `review-required` パス: `RiskLevel="low"`, 成功率=70% → `status: "review-required"`, `reasons` に成功率条件が含まれる
   - `review-required` パス: `RiskLevel="medium"`, 成功率=92%, `trend="improving"`, `scanPassed=true` → `status: "review-required"`
   - `manual-approval-required` パス: `RiskLevel="medium"`, 成功率=85% → `status: "manual-approval-required"`
   - `manual-approval-required` パス: `RiskLevel="high"` → `status: "manual-approval-required"`（成功率・トレンドに関わらず）
   - `blocked` パス: `RiskLevel="critical"` → `status: "blocked"`, `reasons` に critical risk が含まれる

2. 境界値テストケースを定義する:
   - 成功率境界: `RiskLevel="low"` で成功率 79%（`review-required`）と 80%（`auto-approved`）の境界を確認
   - 成功率境界: `RiskLevel="medium"` で成功率 89%（`manual-approval-required`）と 90%（`review-required`）の境界を確認

3. Task06（安全性ゲート）モック定義を記述する:

   ```
   モックA（安全承認済み）: { riskLevel: "low", safetyStatus: "approved", scan: { passed: true, criticalFindings: 0, warnings: 1 } }
   モックB（中リスク）:    { riskLevel: "medium", safetyStatus: "pending", scan: { passed: true, criticalFindings: 0, warnings: 3 } }
   モックC（高リスク）:    { riskLevel: "high", safetyStatus: "rejected", scan: { passed: false, criticalFindings: 2, warnings: 5 } }
   モックD（致命的）:      { riskLevel: "critical", safetyStatus: "rejected", scan: { passed: false, criticalFindings: 10, warnings: 0 } }
   ```

4. Task07（観測指標）モック定義を記述する:
   ```
   モックX（安定高品質）: { successRate: 92, qualityTrend: "stable",    feedbackScore: 4.5 }
   モックY（改善中）:     { successRate: 85, qualityTrend: "improving", feedbackScore: 3.8 }
   モックZ（低品質）:     { successRate: 65, qualityTrend: "declining", feedbackScore: 2.1 }
   モックW（データなし）: { successRate: 0,  qualityTrend: "stable",    feedbackScore: 0   }
   ```

**期待される成果物**: `outputs/phase-4/publish-readiness-test-spec.md`

## 参照資料

| 参照資料                   | パス                                                | 内容                             |
| -------------------------- | --------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義           | `./phase-1-requirements.md`                         | 受入基準・機能要件               |
| Phase 2 設計               | `./phase-2-design.md`                               | 5 つの設計書（総括）             |
| Phase 2 公開レベル設計     | `outputs/phase-2/publishing-metadata-design.md`     | SkillVisibility・StateChart 設計 |
| Phase 2 互換性チェック設計 | `outputs/phase-2/compatibility-check-design.md`     | semver・schema diff・依存制約    |
| Phase 2 Skill Center 設計  | `outputs/phase-2/skill-center-flow-design.md`       | 登録・更新・公開停止フロー       |
| Phase 2 配布操作設計       | `outputs/phase-2/distribution-operations-design.md` | import/export/fork/share         |
| Phase 2 公開判定設計       | `outputs/phase-2/publish-readiness-design.md`       | 判定マトリクス・閾値定義         |
| Phase 3 レビュー           | `./phase-3-design-review.md`                        | レビュー結果・MINOR追跡          |

### システム仕様（aiworkflow-requirements）

| 参照資料                         | パス                                                                                                              | 内容                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                   | 公開前安全性                                                  |
| security-skill-ipc               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                         | 配布操作IPCセキュリティ（共有型テストのセキュリティ検証根拠） |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 | 型定義（インデックス）                                        |
| interfaces-agent-sdk-skill-share | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | TASK-9F共有型正本（import/export/fork/shareテスト設計の根拠） |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                    | 教訓（P42: trim バリデーション等）                            |

## 統合テスト連携

Phase 4 のテスト仕様は Phase 5 の型定義確定フィードバックとして機能する。テスト仕様が「モック可能か」「純粋関数として分離可能か」を Phase 5 の DI 設計に反映する。

| テスト仕様                     | Phase 5 での対応                                                        |
| ------------------------------ | ----------------------------------------------------------------------- |
| SkillVisibility バリデーション | `SkillPublishingMetadata` 型の `visibility` フィールドに union 型を使用 |
| P42準拠3段バリデーション       | 全 IPC ハンドラ引数に `.trim() === ""` チェックを含む型定義             |
| Task06/07 モック定義           | `PublishReadinessChecker` が DI で差し替え可能なインターフェース設計    |

## 成果物

| 成果物                     | パス                                             | 内容                                                    |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| 公開レベルテスト仕様書     | `outputs/phase-4/publishing-test-spec.md`        | SkillVisibility 型バリデーション・StateChart 遷移テスト |
| 互換性チェックテスト仕様書 | `outputs/phase-4/compatibility-test-spec.md`     | semver 比較・breaking change 判定・依存制約テスト       |
| Skill Center テスト仕様書  | `outputs/phase-4/skill-center-test-spec.md`      | 登録・更新・公開停止フローテスト                        |
| 配布操作テスト仕様書       | `outputs/phase-4/distribution-test-spec.md`      | import/export/fork/share 操作テスト                     |
| 公開判定テスト仕様書       | `outputs/phase-4/publish-readiness-test-spec.md` | 判定マトリクス全組合せ・境界値テスト                    |

## 完了条件

- [ ] 5 つのテスト仕様書が `outputs/phase-4/` 配下に作成されている
- [ ] 各テスト仕様書に正常系と異常系のテストケースが明記されている
- [ ] P42準拠3段バリデーション（型チェック→空文字列→trim空文字列）がすべての文字列引数に定義されている
- [ ] **AC-1対応**: StateChart 遷移の正常系3パスと異常系3パスが定義されており、`publishing-test-spec.md` に local/team/public の3レベル遷移テストが含まれている
- [ ] **AC-2対応**: `compatibility-test-spec.md` に semver major/minor/patch の判定テストと依存バージョン制約テストが含まれている
- [ ] **AC-3対応**: 公開判定マトリクスの全6パス（auto-approved/review-required x2/manual-approval-required x2/blocked）が定義されており、Task06（`SafetyGateResult` モックA-D）・Task07（`ObservabilityMetrics` モックX-W）の各4種類が定義されている
- [ ] **AC-4対応**: `skill-center-test-spec.md` に登録・更新・公開停止の3フローテストが定義されており、`distribution-test-spec.md` に import/export/fork/share の4操作テストが含まれている
- [ ] 操作間整合性テスト（fork→import, share無効化）が定義されている

## タスク100%実行確認【必須】

| #   | 確認項目                                      | 確認方法                                                           | 合否基準                                          |
| --- | --------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| 1   | 5 つのテスト仕様書が存在する                  | `ls outputs/phase-4/` で 5 ファイルを確認                          | 5 ファイル全て存在する                            |
| 2   | 判定マトリクス全パスが定義されている          | `publish-readiness-test-spec.md` の行数をカウント                  | 6パス（auto/review x2/manual x2/blocked）全て定義 |
| 3   | P42準拠バリデーションが全操作に定義されている | 各テスト仕様書の異常系に trim チェックが含まれているか確認         | 全 string 引数に定義されている                    |
| 4   | Task06/07 モックが定義されている              | `publish-readiness-test-spec.md` にモックA-D, X-W が存在するか確認 | 8種類全て定義されている                           |
| 5   | 曖昧表現が使用されていない                    | 各仕様書内に 02-code-quality.md 禁止表現がないか確認               | 0件                                               |

---

## 多角的チェック観点（AIが判断）

- テスト仕様が Phase 2 の設計書の全 concern（公開レベル/互換性/Skill Center/配布/判定ロジック）をカバーしているか
- P42 準拠3段バリデーションが全文字列引数に対して定義されているか
- テストデータ（モック）が Phase 1 の受入基準で定義した閾値・条件を網羅しているか
- 正常系と異常系のバランスが取れているか（異常系が正常系の2倍以上あるか）
- Task06/07 のモックデータが実際の型定義と整合しているか

---

## サブタスク管理

| #   | タスク名                             | ステータス | 完了基準                                           |
| --- | ------------------------------------ | ---------- | -------------------------------------------------- |
| 1   | 公開レベルメタデータのテスト仕様設計 | 完了       | StateChart 遷移の正常系3パスと異常系3パスが定義    |
| 2   | 互換性チェックのテスト仕様設計       | 完了       | semver 全パターンのテストケースが定義              |
| 3   | Skill Center フローのテスト仕様設計  | 完了       | 登録・更新・公開停止の各フローのテストケースが定義 |
| 4   | 配布操作のテスト仕様設計             | 完了       | 操作間整合性テストが定義                           |
| 5   | 公開判定ロジックのテスト仕様設計     | 完了       | 全6パスのテストケースが定義                        |

---

## TDD検証

本タスクは設計タスクのため、実行可能テストコードではなくテスト仕様書を成果物とする。TDD サイクル（Red→Green→Refactor）は後続の実装タスクで実施する。

**確認項目**:

- [ ] テスト仕様書が「テストファースト」の原則に基づき、実装前にテストケースを定義している
- [ ] 各テストケースに期待値（expected）が明確に記載されている
- [ ] テストデータが境界値・異常系を含んでいる

---

## 依存関係

- **前提**: Phase 3（設計レビュー）が PASS または MINOR で完了していること
- **後続**: Phase 5（実装）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（公開レベルメタデータのテスト仕様設計）: （結果を記録）
- タスク2（互換性チェックのテスト仕様設計）: （結果を記録）
- タスク3（Skill Center フローのテスト仕様設計）: （結果を記録）
- タスク4（配布操作のテスト仕様設計）: （結果を記録）
- タスク5（公開判定ロジックのテスト仕様設計）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 5（実装）: `./phase-5-implementation.md`

Phase 4 で定義したテスト仕様を満たす TypeScript 型定義・インターフェース・IPC チャンネル定数・Zustand Store スライス設計を確定し、`.claude` 正本への配置計画を作成する。
