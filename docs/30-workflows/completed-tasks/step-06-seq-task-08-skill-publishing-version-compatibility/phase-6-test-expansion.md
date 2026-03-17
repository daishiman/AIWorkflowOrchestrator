# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 6                            |
| Phase名    | テスト拡充                   |
| 前提Phase  | Phase 5（実装）              |
| 後続Phase  | Phase 7（カバレッジ確認）    |
| ステータス | 完了（2026-03-17 再監査）    |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

## 目的

Phase 4 のテスト仕様で網羅できなかった境界ケース・異常系・回帰ガード・同時操作競合のテスト仕様を追加する。Phase 5 で確定した型定義の全フィールドがテストで検証されるよう補完する。

## 背景

TASK-SKILL-LIFECYCLE-08 は設計タスクであり、プロダクションコードを生成しない。Phase 6 の「テスト拡充」は実行可能テストコードの追加ではなく、テスト仕様書の拡充を意味する。Phase 4 は「設計の正しさ」を検証する基本テスト仕様を定義した。Phase 6 では以下3つの観点で補完する:

1. **エッジケース堅牢性**: 旧バージョンスキルとの互換性、schema drift、公開停止・再公開の境界、同時操作の競合は実際の運用で発生しやすいが Phase 4 では定義されていない
2. **型定義フィールド網羅**: Phase 5 で確定した全 TypeScript 型の全フィールドがテスト仕様でカバーされているかを補完する
3. **回帰ガード（regression check）**: Phase 4 で定義した正常系テスト仕様が Phase 5 の型定義変更によって無効化されていないかを確認し、変更前後で同一の期待値が成立することを検証するテスト仕様を追加する（`CompatibilityChecker.check()` の冪等性テスト等）

## 実行タスク

### タスク1: 旧バージョンスキルとの互換性境界テスト

**目的**: N-1、N-2 バージョンとの後方互換性と、非互換バージョンへの遷移拒否を検証するテスト仕様を追加する。

**実行手順**:

1. N-1 バージョン互換性テストケースを定義する:
   - 現行スキル `v2.0.0` と N-1 版スキル `v1.9.0` の `CompatibilityCheckResult.level` が `"compatible"` であることを確認
   - N-1 版スキルのメタデータが現行スキルにインポートされた後、`parentRef` に N-1 版の `skillId` が保持されることを確認

2. N-2 バージョン互換性テストケースを定義する:
   - 現行スキル `v3.0.0` と N-2 版スキル `v1.x.x` の `CompatibilityCheckResult.level` が `"breaking"` であることを確認
   - breaking change が検出された場合、自動インポートが拒否され `ImportResult.success: false` を返すことを確認

3. 非互換バージョンへの遷移拒否テストケースを定義する:
   - `CompatibilityLevel: "breaking"` の状態で visibility を `"local"` → `"public"` に昇格しようとした場合、バリデーションエラーを返すことを確認
   - エラーメッセージに `breakingChanges` の内容が含まれ、ユーザーが理由を把握できることを確認

**期待される成果物**: `outputs/phase-6/version-compatibility-boundary-spec.md`

---

### タスク2: schema drift 検出テスト

**目的**: 段階的な schema 変更によるドリフトと、metadata 破損時のフォールバックを検証するテスト仕様を定義する。

**実行手順**:

1. 段階的 schema ドリフトテストケースを定義する:
   - `v1.0.0` → `v1.1.0` でフィールド追加（互換）、`v1.1.0` → `v1.2.0` で追加フィールド削除（非互換）という2ステップ遷移で、トータルの `CompatibilityCheckResult.level` が `"breaking"` になることを確認
   - 各ステップの `breakingChanges` 配列が累積されずに最新のdiffのみを反映することを確認

2. metadata 破損時フォールバックテストケースを定義する:
   - `SkillPublishingMetadata` の `version` フィールドが semver 形式でない文字列（`"latest"`, `"v1.0"`, `""`）の場合、`CompatibilityChecker.check()` がバリデーションエラーを返すことを確認
   - `tags` フィールドが `null` や文字列（配列でない値）の場合、バリデーションエラーを返すことを確認
   - metadata 破損が検出された場合、フォールバックとして `CompatibilityCheckResult.level: "breaking"` を返し、処理を安全側に倒すことを確認（フェイルセキュア原則）

3. 互換性チェック結果の冪等性テストケースを定義する:
   - 同一の oldSchema と newSchema で `CompatibilityChecker.check()` を2回呼び出した場合、同一の `CompatibilityCheckResult` が返されることを確認

**期待される成果物**: `outputs/phase-6/schema-drift-detection-spec.md`

---

### タスク3: 公開停止と再公開の境界テスト

**目的**: deprecation 期間中のインポート試行と再公開時のバージョン整合性を検証するテスト仕様を定義する。

**実行手順**:

1. deprecation 中のインポート試行テストケースを定義する:
   - `SkillRegistryService.deprecate()` 呼び出し後、grace period（30日）内に `SkillDistributionService.importSkill()` を実行した場合、`ImportResult.success: true` かつ警告メッセージが含まれることを確認
   - grace period（30日）経過後の `importSkill()` は `ImportResult.success: false` かつエラーメッセージに `"deprecated"` が含まれることを確認
   - grace period 中の import で取得したスキルが、grace period 経過後も引き続き使用可能であることを確認（既存ユーザーへの影響なし）

2. 再公開時のバージョン整合性テストケースを定義する:
   - deprecation 後に同一 `skillId` で `register()` を再呼び出しした場合、`version` が deprecation 時より大きい semver でなければ `RegisterResult.success: false` を返すことを確認
   - 再公開成功時に `visibility` が `"public"` に設定されることを確認
   - 再公開後、旧 deprecation notice が無効化されることを確認（`getDependents()` で再公開スキルへの依存が取り消されないことを確認）

3. 依存スキルが存在する状態での公開停止テストケースを定義する:
   - `getDependents()` が非空配列を返すスキルを `deprecate()` しようとした場合、`DeprecationNotice` に依存スキル一覧が含まれることを確認
   - `gracePeriodDays` が 30 未満の値に設定しようとした場合、バリデーションエラーを返すことを確認

**期待される成果物**: `outputs/phase-6/deprecation-republish-boundary-spec.md`

---

### タスク4: 同時操作の競合テスト

**目的**: import と更新の同時実行、fork と公開停止の競合シナリオを検証するテスト仕様を定義する。

**実行手順**:

1. import と update の同時操作テストケースを定義する:
   - スキル A の `update()` が進行中に同スキル A の `importSkill()` が実行された場合、`importSkill()` が `update()` の完了後に実行されることを確認（並行実行によりメタデータが破損しないこと）
   - `update()` が `requiresManualApproval: true` の状態で `importSkill()` を実行した場合、`ImportResult.success: false` かつ理由に `"pending-approval"` が含まれることを確認

2. fork と deprecation の競合テストケースを定義する:
   - `deprecate()` 処理中に `forkSkill()` を実行した場合、fork は成功し `ForkResult.parentRef` に deprecation 対象の `skillId` が設定されることを確認（fork は止めない）
   - grace period 経過後に `remove()` された元スキルの `forkSkill()` はエラー（Business Error: 2000-2999 相当、元スキルが存在しない旨のメッセージ）を返すことを確認

3. share と teamId 無効化の競合テストケースを定義する:
   - `shareSkill()` で発行した `ShareLink` の有効期限が切れていない状態で `teamId` が無効化された場合、`ShareLink` へのアクセスが `401` エラーを返すことを確認
   - `teamId` 無効化後に `shareSkill()` を再呼び出しした場合、`teamId` バリデーションエラーを返すことを確認

**期待される成果物**: `outputs/phase-6/concurrent-operation-conflict-spec.md`

---

### タスク5: エラーハンドリング仕様の拡充

**目的**: Phase 4 で定義されていないエラーケース（ネットワーク障害、メタデータ不整合、権限不足）のテスト仕様を追加する。

**実行手順**:

1. ネットワーク障害時のテストケースを定義する:
   - `importSkill()` 実行中にネットワーク障害が発生した場合、`ImportResult.success: false` かつ `errors` に障害メッセージが含まれることを確認
   - ネットワーク障害後に再試行可能なエラーコード（External Service Error: 3000-3999）が返されることを確認
   - 部分ダウンロード状態でネットワーク障害が発生した場合、ローカルに不完全なスキルファイルが残存しないことを確認（ロールバック保証）

2. メタデータ不整合時のテストケースを定義する:
   - `SkillPublishingMetadata` の `name` が 200 文字を超える場合、バリデーションエラーを返すことを確認
   - `tags` が 10 件を超える場合、バリデーションエラーを返すことを確認（Phase 1 Task 1 で最大10件と定義）
   - `license` が既知の SPDX 識別子でも `"proprietary"` 文字列でもない場合、バリデーションエラーを返すことを確認

3. 権限不足時のテストケースを定義する:
   - `teamId` を持たないユーザーが `shareSkill()` を呼び出した場合、権限エラー（Business Error: 2000-2999 相当）を返すことを確認
   - 他ユーザーが所有するスキルに対して `deprecate()` を呼び出した場合、権限エラーを返すことを確認

**期待される成果物**: `outputs/phase-6/error-handling-extended-spec.md`

## 参照資料

| 参照資料                   | パス                                                | 内容                                   |
| -------------------------- | --------------------------------------------------- | -------------------------------------- |
| Phase 1 要件定義           | `./phase-1-requirements.md`                         | 受入基準・機能要件                     |
| Phase 2 設計               | `./phase-2-design.md`                               | 5 つの設計書（総括）                   |
| Phase 2 互換性チェック設計 | `outputs/phase-2/compatibility-check-design.md`     | semver・schema diff（タスク1-2の根拠） |
| Phase 2 Skill Center 設計  | `outputs/phase-2/skill-center-flow-design.md`       | 公開停止フロー（タスク3の根拠）        |
| Phase 2 配布操作設計       | `outputs/phase-2/distribution-operations-design.md` | 同時操作競合（タスク4の根拠）          |
| Phase 4 テスト仕様         | `./phase-4-test-creation.md`                        | 基本テストケース（拡充元）             |
| Phase 5 型定義確定書       | `./phase-5-implementation.md`                       | 型定義の全フィールド                   |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容         |
| -------------------------- | --------------------------------------------------------------------------------- | ------------ |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | 公開前安全性 |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型定義       |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | P42/P55 教訓 |

## 統合テスト連携

Phase 6 の境界テストは Phase 7 のカバレッジ確認で「Phase 4+6 のテスト仕様が Phase 2 設計の全 concern を網羅しているか」を判定するための入力となる。特に以下の concern は Phase 6 で初めてカバーされる:

| Phase 6 テスト仕様           | 対応する Phase 2 設計の concern    |
| ---------------------------- | ---------------------------------- |
| N-2 バージョン非互換遷移拒否 | 互換性チェック設計の遷移拒否条件   |
| metadata 破損フォールバック  | フェイルセキュア原則の適用         |
| grace period 境界            | 公開停止フローの grace period 設計 |
| 同時操作競合                 | 配布操作設計の排他制御要件         |
| ロールバック保証             | import フローの原子性要件          |

## 成果物

| 成果物                           | パス                                                     | 内容                                     |
| -------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| バージョン互換性境界テスト仕様   | `outputs/phase-6/version-compatibility-boundary-spec.md` | N-1/N-2 互換性・非互換遷移拒否テスト     |
| schema drift 検出テスト仕様      | `outputs/phase-6/schema-drift-detection-spec.md`         | 段階的ドリフト・破損フォールバックテスト |
| 公開停止・再公開境界テスト仕様   | `outputs/phase-6/deprecation-republish-boundary-spec.md` | grace period・バージョン整合性テスト     |
| 同時操作競合テスト仕様           | `outputs/phase-6/concurrent-operation-conflict-spec.md`  | import/update/fork/deprecate 競合テスト  |
| エラーハンドリング拡充テスト仕様 | `outputs/phase-6/error-handling-extended-spec.md`        | ネットワーク障害・権限不足テスト         |

## 完了条件

- [ ] 5 つの拡充テスト仕様書が `outputs/phase-6/` 配下に作成されている
- [ ] **AC-1対応**: 非互換バージョンでの visibility 昇格拒否テスト（`CompatibilityLevel: "breaking"` 時に `local→public` 遷移がエラーを返す）が定義されている
- [ ] **AC-2対応**: N-1/N-2 バージョン互換性テストが正常系・異常系それぞれ定義されている
- [ ] **AC-2対応**: schema drift 検出テストに破損フォールバック（フェイルセキュア）が含まれている
- [ ] **AC-4対応**: grace period（30日）の境界テストが「30日未満」と「30日経過後」の両方を含む
- [ ] **AC-4対応**: 同時操作競合テストが import-update, fork-deprecate, share-teamId無効化の3シナリオを含む
- [ ] ネットワーク障害時のロールバック保証（不完全ファイル残存なし）が定義されている
- [ ] 02-code-quality.md 禁止表現（条件・基準が不明確な修飾語）が 0 件である

## タスク100%実行確認【必須】

| #   | 確認項目                              | 確認方法                                                                                          | 合否基準                         |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | 5 つの拡充テスト仕様書が存在する      | `ls outputs/phase-6/` で 5 ファイルを確認                                                         | 5 ファイル全て存在する           |
| 2   | grace period 境界テストが両境界を含む | `deprecation-republish-boundary-spec.md` に 29日/30日の両ケースが存在するか確認                   | 両境界が定義されている           |
| 3   | フェイルセキュア原則が適用されている  | `schema-drift-detection-spec.md` に metadata 破損時の `"breaking"` フォールバックが含まれるか確認 | フォールバックが定義されている   |
| 4   | 同時操作競合が 3 シナリオ含む         | `concurrent-operation-conflict-spec.md` のシナリオ数をカウント                                    | 3 シナリオ以上が定義されている   |
| 5   | ロールバック保証が定義されている      | `error-handling-extended-spec.md` にネットワーク障害時の残存ファイルなしテストが存在するか確認    | ロールバック要件が明記されている |

---

## 多角的チェック観点（AIが判断）

- Phase 4 のテスト仕様で未カバーだった境界値・異常系が網羅的に追加されているか
- フェイルセキュア原則（障害時は安全側に倒す）が全異常系テストに反映されているか
- 同時操作競合テストが実際のユースケース（import中のfork等）を想定しているか
- grace period（30日）の境界テストが「境界上」「境界の両側」をテストしているか
- エラーハンドリング仕様が既存のエラーカテゴリ（02-code-quality.md）と整合しているか

---

## サブタスク管理

| #   | タスク名                               | ステータス | 完了基準                                         |
| --- | -------------------------------------- | ---------- | ------------------------------------------------ |
| 1   | 旧バージョンスキルとの互換性境界テスト | 完了       | N-1/N-2 バージョンの正常系・異常系が定義         |
| 2   | schema drift 検出テスト                | 完了       | 破損フォールバック（フェイルセキュア）が含まれる |
| 3   | 公開停止と再公開の境界テスト           | 完了       | grace period 境界テストが両方を含む              |
| 4   | 同時操作の競合テスト                   | 完了       | 3シナリオ以上が定義                              |
| 5   | エラーハンドリング仕様の拡充           | 完了       | ロールバック保証が定義                           |

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（旧バージョンスキルとの互換性境界テスト）: （結果を記録）
- タスク2（schema drift 検出テスト）: （結果を記録）
- タスク3（公開停止と再公開の境界テスト）: （結果を記録）
- タスク4（同時操作の競合テスト）: （結果を記録）
- タスク5（エラーハンドリング仕様の拡充）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 7（カバレッジ確認）: `./phase-7-coverage-check.md`

Phase 4+6 のテスト仕様が Phase 2 の設計の全 concern を網羅しているかを確認し、カバレッジマトリクスを作成する。未検証箇所があれば追加テスト仕様の必要性を判定する。

---

## Phase 7 からの差し戻し時の追加手順

Phase 7（カバレッジ確認）でカバレッジ未達と判定され Phase 6 へ差し戻された場合、以下の手順で再実行する:

1. `outputs/phase-7/coverage-matrix.md` のカバレッジマトリクスを確認し、未検証箇所を特定する
2. 未検証箇所に対応する境界テスト仕様を `outputs/phase-6/` に追加する
3. Phase 6 の完了条件を再確認し、Phase 7 へ進む
