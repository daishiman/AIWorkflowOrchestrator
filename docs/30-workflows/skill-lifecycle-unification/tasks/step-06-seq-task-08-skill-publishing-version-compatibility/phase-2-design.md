# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| Phase名    | 設計                         |
| 前提Phase  | Phase 1（要件定義）          |
| 後続Phase  | Phase 3（設計レビュー）      |
| ステータス | 未実施                       |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

## 目的

Phase 1 で定義した公開レベル（local/team/public）、semver・schema・依存互換性要件、安全性ゲート接続条件（Task06）、観測指標接続条件（Task07）、Skill Center 登録/配布/取り下げ要件、および import/export/fork/share 整合方針を基に、次の設計を行う。

1. 各公開レベルのメタデータスキーマと TypeScript 型定義
2. 互換性チェック判定ロジックとアルゴリズム
3. Skill Center ライフサイクルフロー（登録・更新・公開停止）
4. 4 つの配布操作（import/export/fork/share）の責務境界
5. Task06/07 の結果を入力とした公開可否判定マトリクスとインターフェース

## 背景

TASK-SKILL-LIFECYCLE-08 は「スキル共有・公開・互換性統合」の設計タスクであり、プロダクションコードを生成しない。Phase 1 では「何を」実現するかを定義した。Phase 2 では「どのように」実現するかを TypeScript 型定義・インターフェース仕様・フロー設計文書として設計する。設計の入力は Phase 1 の 5 つの成果物（公開レベル定義・互換性要件・安全性接続仕様・Skill Center 要件・配布整合方針）とシステム仕様書群。設計の出力は 5 つの設計書で、Phase 3 設計レビューの審査対象となる。

## 設計対象トポロジー（concern別）

各設計タスクが担う懸念事項と対象レイヤーの対応を固定する。lane 数は 3 以下とする。

| Concern（懸念事項）         | 対象レイヤー                  | 担当タスク | 備考                                                         |
| --------------------------- | ----------------------------- | ---------- | ------------------------------------------------------------ |
| 公開レベル・metadata型      | Type / Store（State）         | タスク1    | `SkillVisibility`・`SkillPublishingMetadata` の型定義        |
| 互換性チェックロジック      | Domain Logic（Pure Function） | タスク2    | semver 比較・breaking change 判定・依存解決                  |
| Skill Center ライフサイクル | Service Interface（IPC境界）  | タスク3    | `SkillRegistryService` の入出力契約                          |
| 配布操作責務境界            | Service Interface（IPC境界）  | タスク4    | `SkillDistributionService` の入出力契約                      |
| 公開可否判定マトリクス      | Domain Logic（Pure Function） | タスク5    | `PublishReadinessChecker` の入出力契約・Task06/07 との接続点 |

### lane構成（フロー設計の制約）

フロー設計（タスク3のシーケンス図）で使用できる lane は以下の 3 つに制限する:

| Lane | 役割                                      |
| ---- | ----------------------------------------- |
| UI   | Renderer プロセス（React コンポーネント） |
| IPC  | Preload Bridge（contextBridge）           |
| Main | Main プロセス（サービス実装）             |

## コマンド単位バリデーションマトリクス

`SkillRegistryService` および `SkillDistributionService` の各メソッドで実施するバリデーションを定義する。

| サービス                   | メソッド      | 入力バリデーション                                                                                                             | 失敗時の挙動                                 |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `SkillRegistryService`     | `register`    | `metadata.name` が非空文字列・`metadata.license` が非空文字列（public 昇格時必須）                                             | `VALIDATION_ERROR` を返し登録をブロック      |
| `SkillRegistryService`     | `update`      | `skillId` が非空文字列・`newVersion` が semver 準拠・`CompatibilityCheckResult.level !== "breaking"` または `major` バンプ済み | `BREAKING_CHANGE_ERROR` を返し更新をブロック |
| `SkillRegistryService`     | `deprecate`   | `skillId` が非空文字列・`notice.reason` が1文字以上50文字以下の文字列                                                          | `VALIDATION_ERROR` を返す                    |
| `SkillRegistryService`     | `remove`      | `skillId` が非空文字列・`deprecate` 完了後30日が経過済み                                                                       | `REMOVAL_TOO_EARLY_ERROR` を返す             |
| `SkillDistributionService` | `importSkill` | `sourceUrl` が非空文字列・依存スキルが全てインストール済みまたはユーザー承認済み                                               | `DEPENDENCY_ERROR` を返す                    |
| `SkillDistributionService` | `exportSkill` | `skillId` が非空文字列・スキルが存在する                                                                                       | `NOT_FOUND_ERROR` を返す                     |
| `SkillDistributionService` | `forkSkill`   | `skillId` が非空文字列・`newName` が非空文字列かつ既存スキルと重複しない                                                       | `DUPLICATE_NAME_ERROR` を返す                |
| `SkillDistributionService` | `shareSkill`  | `skillId` が非空文字列・`teamId` が非空文字列・`options.expiresIn` が正の整数（秒）                                            | `VALIDATION_ERROR` を返す                    |

## 実行タスク

### タスク1: 公開レベルメタデータとUI表示の設計

**目的**: 3 つの公開レベル（local/team/public）ごとのメタデータスキーマと UI 表現を設計する。

**実行手順**:

1. `SkillVisibility` 型を定義する:

   ```typescript
   type SkillVisibility = "local" | "team" | "public";
   ```

2. 各レベルの必須/任意メタデータフィールドを定義する:
   - `local`: name（必須）, description（必須）, version（必須）
   - `team`: local のフィールド全部 + author（必須）, tags（必須）, teamId（必須）
   - `public`: team のフィールド全部 + license（必須）, readme（必須）, changelog（必須）, minAppVersion（必須）, repository（任意）

3. レベル遷移 StateChart を設計する（local→team→public の昇格と降格条件を全て明記する）:
   - 昇格条件: 各レベルの必須フィールドが全て入力済み、かつ互換性チェックが PASS
   - 降格条件: teamId が無効化された場合（team→local）、公開停止申請承認後（public→team または public→local）

4. Skill Center カード・詳細画面でのレベル別 UI 表示を設計する:
   - バッジ: `local`（グレー）, `team`（ブルー）, `public`（グリーン）
   - アイコン: 南京錠（local）, 人物グループ（team）, 地球儀（public）
   - フィルタ: Skill Center 一覧の visibility ドロップダウン（全て/public のみ/team のみ）

5. `SkillPublishingMetadata` インターフェースを TypeScript 型定義として設計する（全フィールドに必須/任意を型レベルで表現する）。

**期待される成果物**: `outputs/phase-2/publishing-metadata-design.md`（型定義・StateChart・UI 表示仕様を含む）

---

### タスク2: semver・schema・依存バージョン互換性チェックの設計

**目的**: スキルバージョン更新時の互換性チェックロジックを設計する。

**実行手順**:

1. semver 比較ロジックを設計する:
   - `major`（breaking change）: 入力/出力スキーマ変更、必須パラメータ追加、既存パラメータの型変更
   - `minor`（後方互換の機能追加）: 任意パラメータ追加、新出力フィールド追加
   - `patch`（バグ修正）: 動作変更なし、ドキュメント修正のみ

2. schema 互換性チェッカーを設計する:
   - 入力スキーマの diff 検出: フィールド追加/削除/型変更を判定する
   - 出力スキーマの diff 検出: フィールド追加/削除/型変更を判定する
   - breaking change の自動判定ロジック: 「既存フィールド削除」または「型の非互換変更」を breaking と定義する

3. 依存スキル間のバージョン制約チェックを設計する:
   - semver range 記法: `^1.0.0`（minor/patch 互換）, `~1.0.0`（patch 互換）, `>=1.0.0 <2.0.0`（範囲指定）
   - 依存解決アルゴリズム: conflict detection（同一スキルの異なる range 要求が存在する場合にエラーを返す）

4. `CompatibilityCheckResult` 型を設計する:
   ```typescript
   type CompatibilityLevel = "compatible" | "minor-incompatible" | "breaking";
   interface CompatibilityCheckResult {
     level: CompatibilityLevel;
     breakingChanges: BreakingChange[];
     warnings: CompatibilityWarning[];
     suggestedBump: "major" | "minor" | "patch";
   }
   ```

**期待される成果物**: `outputs/phase-2/compatibility-check-design.md`（判定ロジック・型定義・依存解決アルゴリズムを含む）

---

### タスク3: Skill Center 登録・更新・公開停止フローの設計

**目的**: Skill Center への登録から取り下げまでのライフサイクルフローを設計する。

**実行手順**:

1. 登録フローを設計する（シーケンス図記述）:
   - Step 1: メタデータ入力（name, description, tags, license）
   - Step 2: 自動バリデーション（スキーマ検証 + 安全性チェック）
   - Step 3: プレビュー確認画面の表示
   - Step 4: 公開確定（visibility が `public` に遷移し、Skill Center カタログに掲載）

2. 更新フローを設計する（シーケンス図記述）:
   - 新バージョンアップロード → 互換性チェック実行 → breaking change がない場合は自動承認・ある場合は手動承認 → 公開
   - 旧バージョンユーザーへの通知戦略: breaking change がある場合は in-app 通知を送信する

3. 公開停止フローを設計する（シーケンス図記述）:
   - 申請 → deprecation notice 掲載（30 日間の grace period）→ removal 実行
   - 依存スキルへの影響分析: 取り下げ対象スキルに依存するスキルの一覧を事前表示する

4. `SkillRegistryService` のインターフェースを設計する:
   ```typescript
   interface SkillRegistryService {
     register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;
     update(skillId: string, newVersion: SkillVersion): Promise<UpdateResult>;
     deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;
     remove(skillId: string): Promise<void>;
     getDependents(skillId: string): Promise<string[]>;
   }
   ```

**期待される成果物**: `outputs/phase-2/skill-center-flow-design.md`（シーケンス図記述・サービスインターフェースを含む）

---

### タスク4: import/export/fork/share の責務境界設計

**目的**: 4 つの配布操作の責務境界と相互関係を明確にする。

**実行手順**:

1. 各操作の責務マトリクスを定義する:
   | 操作 | 入力 | 出力 | バージョン関係 | メタデータ処理 |
   | ------ | ---------------- | ---------------- | ---------------- | ---------------------------- |
   | import | Skill Center URL | ローカルスキル | 参照コピー | 元メタデータを保持 |
   | export | ローカルスキル | パッケージファイル | 独立バージョン | メタデータを付与して出力 |
   | fork | 公開スキル | 新スキル | 独立バージョン | parentRef を設定・新 ID 付与 |
   | share | ローカルスキル | 共有リンク | 同一バージョン | teamId ベースのアクセス制御 |

2. import の依存解決フローを設計する:
   - 公開スキルのダウンロード → ローカル配置 → 依存チェック（依存スキルが未インストールの場合は一括インストール確認） → 有効化

3. export のパッケージングフローを設計する:
   - ローカルスキル選択 → メタデータ入力・付与 → バリデーション（必須フィールド検証） → パッケージ生成（`.skill` ファイル形式）

4. fork のバージョン分岐フローを設計する:
   - 元スキルの参照を `parentRef` に保持 → 新スキル ID 生成（UUID v4）→ 新スキルとして独立管理

5. share のアクセス制御フローを設計する:
   - teamId ベースの権限管理（teamId を持つユーザーのみアクセス可） → 共有リンク生成（有効期限付き JWT）

6. `SkillDistributionService` のインターフェースを設計する:
   ```typescript
   interface SkillDistributionService {
     importSkill(
       sourceUrl: string,
       options: ImportOptions,
     ): Promise<ImportResult>;
     exportSkill(
       skillId: string,
       options: ExportOptions,
     ): Promise<ExportPackage>;
     forkSkill(skillId: string, newName: string): Promise<ForkResult>;
     shareSkill(
       skillId: string,
       teamId: string,
       options: ShareOptions,
     ): Promise<ShareLink>;
   }
   ```

**期待される成果物**: `outputs/phase-2/distribution-operations-design.md`（責務マトリクス・フロー図記述・サービスインターフェースを含む）

---

### タスク5: Task06/07 結果の公開可否判定ロジック設計

**目的**: 安全性ゲート（Task06）と観測指標（Task07）を公開判断に反映する判定ロジックを設計する。

**実行手順**:

1. Task06（安全性ゲート）からの入力を定義する:
   - `ToolRiskLevel`: `'low' | 'medium' | 'high' | 'critical'`
   - `SafetyGateStatus`: `'approved' | 'pending' | 'rejected'`
   - `SecurityScanResult`: `{ passed: boolean; criticalFindings: number; warnings: number }`

2. Task07（観測指標）からの入力を定義する:
   - 実行成功率: 直近 30 日の成功率（0〜100 の数値）
   - 品質スコアトレンド: `'improving' | 'stable' | 'declining'`
   - ユーザーフィードバックスコア: 0〜5 の数値（0 はデータなし）

3. 公開可否判定マトリクスを設計する:
   | RiskLevel | 成功率 | トレンド | SecurityScan | 判定 |
   | --------- | -------- | -------------------- | ------------ | ---------------- |
   | low | >= 80% | stable または improving | passed | 自動公開可 |
   | low | < 80% | 任意 | 任意 | レビュー後公開 |
   | medium | >= 90% | improving | passed | レビュー後公開 |
   | medium | < 90% | 任意 | 任意 | 手動承認必須 |
   | high | 任意 | 任意 | 任意 | 手動承認必須 |
   | critical | 任意 | 任意 | 任意 | 公開不可 |

4. `PublishReadinessChecker` のインターフェースを設計する:

   ```typescript
   type PublishReadiness =
     | { status: "auto-approved" }
     | { status: "review-required"; reasons: string[] }
     | { status: "manual-approval-required"; reasons: string[] }
     | { status: "blocked"; reasons: string[] };

   interface PublishReadinessChecker {
     check(
       safetyGate: SafetyGateResult,
       metrics: ObservabilityMetrics,
     ): PublishReadiness;
   }
   ```

**期待される成果物**: `outputs/phase-2/publish-readiness-design.md`（判定マトリクス・インターフェース定義を含む）

## 参照資料

| 参照資料                         | パス                                                                                                              | 内容                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Phase 1 成果物                   | `./phase-1-requirements.md`                                                                                       | 要件定義の全成果物                                             |
| Phase 1 公開レベル定義           | `outputs/phase-1/publishing-levels.md`                                                                            | 3 レベルの定義                                                 |
| Phase 1 互換性要件               | `outputs/phase-1/compatibility-requirements.md`                                                                   | semver/schema 要件                                             |
| Phase 1 安全性接続仕様           | `outputs/phase-1/safety-gate-connection.md`                                                                       | Task06/07 接続条件                                             |
| Phase 1 Skill Center 要件        | `outputs/phase-1/skill-center-registration.md`                                                                    | 登録・配布要件                                                 |
| Phase 1 配布整合方針             | `outputs/phase-1/distribution-alignment.md`                                                                       | import/export/fork/share                                       |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                   | 公開前安全性                                                   |
| security-skill-ipc               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                         | 配布操作IPCのセキュリティ要件（Task 4 配布操作設計の前提）     |
| ui-ux-navigation                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                           | Skill Center 導線                                              |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 | 型定義更新先（インデックス）                                   |
| interfaces-agent-sdk-skill-share | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | TASK-9F共有型正本（Task 4 配布操作設計のインターフェース確認） |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                    | import/share drift 教訓                                        |

## 統合テスト連携

Phase 2 の設計成果物は、Phase 4（テスト設計）において以下のテストケースとして実装される。

| 設計成果物                 | 対応テストカテゴリ                                                |
| -------------------------- | ----------------------------------------------------------------- |
| 公開レベルメタデータ設計書 | SkillVisibility 型バリデーションテスト、StateChart 遷移テスト     |
| 互換性チェック設計書       | semver 比較テスト、breaking change 自動判定テスト、依存解決テスト |
| Skill Center フロー設計書  | 登録/更新/公開停止の E2E フローテスト                             |
| 配布操作設計書             | import/export/fork/share の各操作単体テスト                       |
| 公開判定ロジック設計書     | 判定マトリクス網羅テスト（全ケースのパスとブロックを検証）        |

## 成果物

| 成果物                     | パス                                                | 内容                                       |
| -------------------------- | --------------------------------------------------- | ------------------------------------------ |
| 公開レベルメタデータ設計書 | `outputs/phase-2/publishing-metadata-design.md`     | 型定義・StateChart・UI 表示仕様            |
| 互換性チェック設計書       | `outputs/phase-2/compatibility-check-design.md`     | 判定ロジック・型定義・依存解決アルゴリズム |
| Skill Center フロー設計書  | `outputs/phase-2/skill-center-flow-design.md`       | 登録・更新・公開停止フロー                 |
| 配布操作設計書             | `outputs/phase-2/distribution-operations-design.md` | import/export/fork/share 責務設計          |
| 公開判定ロジック設計書     | `outputs/phase-2/publish-readiness-design.md`       | 判定マトリクス・インターフェース定義       |

## 完了条件

- [ ] 3 つの公開レベルの TypeScript 型定義と StateChart が設計されている
- [ ] semver/schema 互換性チェックの判定ロジックが具体的に設計されている
- [ ] Skill Center の登録・更新・公開停止フローがシーケンス図記述で設計されている
- [ ] import/export/fork/share の責務境界が責務マトリクスで明確に設計されている
- [ ] Task06/07 の結果を公開判断に反映する判定マトリクスが全ケース網羅で設計されている
- [ ] 全サービスのインターフェース（TypeScript 型）が定義されている
- [ ] 5 つの成果物ファイルが `outputs/phase-2/` 配下に作成されている

## タスク100%実行確認【必須】

Phase 2 を完了と判断する前に、以下を逐次確認すること。

| 確認項目                                 | 確認方法                                                                            | 合否基準                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| 5 つの成果物ファイルが存在する           | `ls outputs/phase-2/` で 5 ファイルを確認                                           | 5 ファイル全てが存在する           |
| 全型定義が TypeScript として有効         | 型定義を設計書内コードブロックで論理的に検証（設計タスクのため `tsc` は実行しない） | 型定義の論理的整合性に問題がない   |
| 判定マトリクスが全ケースを網羅           | マトリクスの行数が RiskLevel × 条件の組み合わせを全てカバー                         | 抜け漏れケースが 0 件              |
| フロー図記述がシーケンスを過不足なく表現 | 登録・更新・公開停止の各フローに Start/End と分岐が明記                             | 02-code-quality.md 禁止表現が 0 件 |
| 責務マトリクスの全セルが具体的に記述     | マトリクスの各セルに条件・値・処理が明記されている                                  | 空白セルまたは「TBD」が 0 件       |

---

## 多角的チェック観点（AIが判断）

- 5つの設計書間で型名・フィールド名が統一されているか（例: `SkillVisibility` が全設計書で同一定義を参照）
- `PublishReadiness` の判定ロジックが Phase 1 の AC-3 受入基準を満たす全ケースを網羅しているか
- StateChart の遷移が一方向ではなく双方向（公開→非公開の取り下げ等）も考慮されているか
- IPC チャンネル設計が P42 準拠3段バリデーション対象を明記しているか
- import/export/fork/share の責務マトリクスに競合ケース（同時操作）が考慮されているか

---

## サブタスク管理

| #   | タスク名                                           | ステータス | 完了基準                                   |
| --- | -------------------------------------------------- | ---------- | ------------------------------------------ |
| 1   | 公開レベルメタデータとUI表示の設計                 | 未実施     | SkillVisibility 型と StateChart が設計済み |
| 2   | semver・schema・依存バージョン互換性チェックの設計 | 未実施     | 判定ロジックが具体的に設計済み             |
| 3   | Skill Center 登録・更新・公開停止フローの設計      | 未実施     | シーケンス図記述で設計済み                 |
| 4   | import/export/fork/share の責務境界設計            | 未実施     | 責務マトリクスが全セル記載済み             |
| 5   | Task06/07 結果の公開可否判定ロジック設計           | 未実施     | 判定マトリクスが全ケース網羅               |

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビュー）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（公開レベルメタデータとUI表示の設計）: （結果を記録）
- タスク2（semver・schema・依存バージョン互換性チェックの設計）: （結果を記録）
- タスク3（Skill Center 登録・更新・公開停止フローの設計）: （結果を記録）
- タスク4（import/export/fork/share の責務境界設計）: （結果を記録）
- タスク5（Task06/07 結果の公開可否判定ロジック設計）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 3（設計レビュー）: `./phase-3-design-review.md`

- 上記 5 つの設計書を対象に、要件との整合性・型安全性・フロー網羅性をレビューする
- PASS / MINOR / MAJOR の判定を行い、MAJOR の場合は Phase 2 に差し戻す

---

## 差し戻し時の再実行手順

Phase 3（設計レビュー）で MAJOR（設計問題）判定、または Phase 10（最終レビュー）で MAJOR 判定により Phase 2 へ差し戻された場合、以下の手順で再実行する:

1. 差し戻し元の指摘事項レポート（`outputs/phase-3/review-result.md` または `outputs/phase-10/final-review-decision.md`）を確認する
2. 指摘事項に該当する設計書（5 つの設計書のうち該当するもの）を修正する
3. 修正箇所を `outputs/phase-2/` 配下の成果物に反映する
4. Phase 2 の完了条件を再確認し、Phase 3 へ進む
