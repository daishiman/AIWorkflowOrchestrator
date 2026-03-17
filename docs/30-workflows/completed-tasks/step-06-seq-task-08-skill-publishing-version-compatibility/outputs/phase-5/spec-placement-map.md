# 正本反映計画書

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 文書       | Phase 5 - タスク5 成果物                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                      |
| 作成日     | 2026-03-17                                                                   |
| P57 対策   | 設計タスクのため実際の反映は Phase 12 で実施。本書は配置マップのみを確定する |
| 参照型定義 | `outputs/phase-5/type-definitions.md`                                        |
| 参照IF     | `outputs/phase-5/service-interfaces.md`                                      |
| 参照IPC    | `outputs/phase-5/ipc-channel-definitions.md`                                 |
| 参照Slice  | `outputs/phase-5/zustand-slice-design.md`                                    |

---

## 目的

Phase 5 で確定した型定義・サービスインターフェース・IPC チャンネル定数・Zustand Store スライス設計を、`.claude` 正本（aiworkflow-requirements）のどのファイル・どのセクションに反映するかを具体的に記述する。P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン）を防ぐため、配置先をファイルパスとセクション名まで明記し、Phase 12 での反映漏れを防止する。

---

## 1. 反映先配置マップ

### 1.1 型定義の反映先

| 成果物                      | 反映先ファイル（絶対パス）                                                        | 追記セクション                         | 反映内容サマリー                                                                  |
| --------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| SkillVisibility 型          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > SkillVisibility`          | `type SkillVisibility = "local" \| "team" \| "public"` の定義と配置先             |
| SkillPublishingMetadata 型  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > SkillPublishingMetadata`  | 識別ユニオン型（LocalMetadata / TeamMetadata / PublicMetadata）と必須フィールド表 |
| CompatibilityCheckResult 型 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > CompatibilityCheckResult` | `level / breakingChanges / warnings / suggestedBump` の定義                       |
| PublishReadiness 型         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > PublishReadiness`         | 4ステータス識別ユニオン型（auto-approved / review-required 等）の定義             |
| BreakingChange 型           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > BreakingChange`           | `field / changeType / before / after` の定義                                      |
| CompatibilityWarning 型     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > CompatibilityWarning`     | `field / message` の定義                                                          |
| SafetyGateInput 型          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > SafetyGateInput`          | `riskLevel / gateStatus / securityScan` の定義                                    |
| ObservabilityMetrics 型     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `## 型定義 > ObservabilityMetrics`     | `successRate / qualityTrend / feedbackScore` の定義                               |

### 1.2 サービスインターフェースの反映先

| 成果物                      | 反映先ファイル（絶対パス）                                                         | 追記セクション                           | 反映内容サマリー                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| SkillRegistryService IF     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md` | `## サービス > SkillRegistryService`     | 5メソッド（register / update / deprecate / remove / getDependents）のシグネチャと配置先 |
| SkillDistributionService IF | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md` | `## サービス > SkillDistributionService` | 4メソッド（importSkill / exportSkill / forkSkill / shareSkill）のシグネチャと配置先     |
| PublishReadinessChecker IF  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md` | `## サービス > PublishReadinessChecker`  | `check(safetyGate, metrics): PublishReadiness` シグネチャと配置先                       |
| CompatibilityChecker IF     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md` | `## サービス > CompatibilityChecker`     | `check(oldSchema, newSchema) / checkDependencies(constraints)` シグネチャと配置先       |

### 1.3 IPC チャンネル定数の反映先

| 成果物                           | 反映先ファイル（絶対パス）                                                | 追記セクション                           | 反映内容サマリー                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| SKILL_PUBLISHING_CHANNELS 定数   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` | `## IPC チャンネル > Skill Publishing`   | 7チャンネル（register / update / deprecate / remove / get-dependents / check-readiness / check-compatibility）の定数定義 |
| SKILL_DISTRIBUTION_CHANNELS 定数 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` | `## IPC チャンネル > Skill Distribution` | 4チャンネル（import / export / fork / share）の定数定義                                                                  |
| IPC 引数・戻り値型テーブル       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` | `## IPC チャンネル > Skill Publishing`   | 11チャンネルの引数型・戻り値型・バリデーション仕様の一覧表                                                               |

### 1.4 Zustand Store スライス設計の反映先

| 成果物                       | 反映先ファイル（絶対パス）                                                        | 追記セクション                  | 反映内容サマリー                                                |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| publishingSlice 状態設計     | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | `## スライス > publishingSlice` | PublishingState 定義・初期状態・skillSlice との境界・永続化方針 |
| 個別セレクタ一覧（P31 準拠） | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | `## スライス > publishingSlice` | 6状態セレクタ + 5アクションセレクタの関数名と返却型             |
| P48 準拠派生セレクタ         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | `## スライス > publishingSlice` | useShallow 適用が必要な派生セレクタのパターン例                 |

---

## 2. 反映前の確認手順（Phase 12 で実施）

### 2.1 反映先ファイルの存在確認

```bash
# interfaces-agent-sdk-skill.md の確認
ls .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md

# arch-electron-services-core.md の確認
ls .claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md

# api-ipc-agent-core.md の確認
ls .claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md

# arch-state-management-core.md の確認
ls .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md
```

### 2.2 既存セクションとの重複確認

```bash
# SkillPublishingMetadata の既存定義確認（M-SS-3 対応）
grep -rn "SkillPublishingMetadata" .claude/skills/aiworkflow-requirements/references/

# CompatibilityChecker の既存定義確認
grep -rn "CompatibilityChecker" .claude/skills/aiworkflow-requirements/references/

# PublishReadiness の既存定義確認
grep -rn "PublishReadiness" .claude/skills/aiworkflow-requirements/references/
```

### 2.3 topic-map.md 再生成（P2 対策）

仕様書更新後、必ず topic-map.md を再生成する（P2: topic-map.md 再生成忘れ防止）:

```bash
cd .claude/skills/aiworkflow-requirements
node scripts/generate-index.js
```

---

## 3. 反映実施スケジュール

| フェーズ        | 作業内容                     | 対応方針                                                                                                             |
| --------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase 5（本書） | 配置マップの確定             | 本書（`spec-placement-map.md`）が成果物                                                                              |
| Phase 12        | 実際の仕様書ファイルへの追記 | 本書の配置マップに従い、各仕様書ファイルに型定義・IF を追記する                                                      |
| Phase 12        | topic-map.md 再生成          | `node scripts/generate-index.js` を実行して indexes/ を更新する                                                      |
| Phase 12        | LOGS.md 2ファイル更新        | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方を更新する（P1/P25 対策）            |
| Phase 12        | SKILL.md 変更履歴更新        | `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴テーブルを更新する（P29 対策） |

---

## 4. 反映内容の詳細（Phase 12 担当者向け）

### 4.1 interfaces-agent-sdk-skill.md への追記内容

対象ファイル: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

追記する型定義の一覧（`outputs/phase-5/type-definitions.md` から転記）:

1. `SkillVisibility` 型（§1.1）
2. `SkillPublishingMetadataBase` インターフェース（§1.2）
3. `LocalMetadata` インターフェース（§1.2）
4. `TeamMetadata` インターフェース（§1.2）
5. `PublicMetadata` インターフェース（§1.2）
6. `SkillPublishingMetadata` ユニオン型（§1.2）
7. `CompatibilityLevel` 型（§2.1）
8. `BreakingChange` インターフェース（§2.2）
9. `CompatibilityWarning` インターフェース（§2.3）
10. `CompatibilityCheckResult` インターフェース（§2.4）
11. `PublishReadiness` 型（§3.1）
12. `ToolRiskLevel` 型（§3.2）
13. `SafetyGateStatus` 型（§3.3）
14. `SafetyGateInput` インターフェース（§3.4）
15. `QualityTrend` 型（§3.5）
16. `ObservabilityMetrics` インターフェース（§3.6）

### 4.2 arch-electron-services-core.md への追記内容

対象ファイル: `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md`

追記するサービスインターフェースの一覧（`outputs/phase-5/service-interfaces.md` から転記）:

1. `SkillRegistryService` インターフェース（§1）+ 補助型（RegisterResult / UpdateResult / DeprecationNotice）
2. `SkillDistributionService` インターフェース（§2）+ 補助型（ImportOptions / ImportResult / ExportOptions / ExportPackage / ForkResult / ShareOptions / ShareLink）
3. `PublishReadinessChecker` インターフェース（§3）
4. `CompatibilityChecker` インターフェース（§4）

### 4.3 api-ipc-agent-core.md への追記内容

対象ファイル: `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`

追記する IPC チャンネル定義（`outputs/phase-5/ipc-channel-definitions.md` から転記）:

1. `SKILL_PUBLISHING_CHANNELS` 定数（§1.1）: 7チャンネル
2. `SKILL_DISTRIBUTION_CHANNELS` 定数（§1.2）: 4チャンネル
3. チャンネル一覧テーブル（§2）: 引数型・戻り値型・対応メソッド
4. Preload ホワイトリスト更新箇所（§3）

### 4.4 arch-state-management-core.md への追記内容

対象ファイル: `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`

追記する Zustand スライス設計（`outputs/phase-5/zustand-slice-design.md` から転記）:

1. `PublishingState` インターフェース（§1）
2. `PublishingActions` インターフェース（§2）
3. 初期状態（§3）
4. 個別セレクタ一覧（§4）: 6状態セレクタ + 5アクションセレクタ
5. 派生セレクタ（§5）: useShallow 適用パターン
6. skillSlice との境界定義（§7）

---

## 5. P57 準拠確認チェックリスト（Phase 12 で使用）

- [ ] `interfaces-agent-sdk-skill.md` への 16 型定義の追記が完了した
- [ ] `arch-electron-services-core.md` への 4 サービスインターフェースの追記が完了した
- [ ] `api-ipc-agent-core.md` への 11 チャンネル定数の追記が完了した
- [ ] `arch-state-management-core.md` への publishingSlice 設計の追記が完了した
- [ ] `topic-map.md` の再生成が完了した（`node scripts/generate-index.js` 実行済み）
- [ ] `aiworkflow-requirements/LOGS.md` の更新が完了した（P1/P25 対策）
- [ ] `task-specification-creator/LOGS.md` の更新が完了した（P1/P25 対策: 2ファイル両方）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴テーブルが更新された（P29 対策）
- [ ] `task-specification-creator/SKILL.md` の変更履歴テーブルが更新された（P29 対策）
- [ ] `documentation-changelog.md` に実際の反映内容が記録された（P4/P51 対策: 実行後に記録）

---

## 6. Phase 3 MINOR 対応状況（全10件）

| MINOR ID | 指摘内容                           | 対応状況   | 本文書での対応内容                                                                                     |
| -------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| M-AC-1   | `"deprecated"` 状態の型未収録      | 反映計画済 | interfaces-agent-sdk-skill.md への型追記計画に isDeprecated 関連を含む（4.1 の項目1）                  |
| M-AC-2   | 後方互換保持世代数ポリシー未定義   | 反映計画済 | arch-electron-services-core.md への update() 事後条件として N-2 世代方針を含む（4.2 の項目1）          |
| M-AC-3   | カテゴリ固定値の列挙未収録         | 解決済み   | tags フィールドで代替する設計を確定。固定カテゴリ列挙型は定義しない                                    |
| M-SS-1   | CSS変数衝突確認                    | 反映計画済 | 実装タスクで grep 確認後、該当する仕様書に結果を記録する                                               |
| M-SS-2   | フィルタUI配置先コンポーネント確定 | 解決済み   | VisibilityFilterDropdown を SkillCenter/ に配置する設計を確定。配置マップ 1.4 に含む                   |
| M-SS-3   | 型名重複確認                       | 解決済み   | grep 確認で重複なし。反映前確認手順 2.2 に重複確認コマンドを記載                                       |
| M-DQ-1   | semver ライブラリ未定義            | 反映計画済 | arch-electron-services-core.md への semver パッケージ採用を記録する（4.2 の項目4）                     |
| M-DQ-2   | update() 内通知の責務越境          | 反映計画済 | arch-electron-services-core.md に RegistryService と NotificationService の責務境界を記録する          |
| M-DQ-3   | reasons フィールドの日本語固定     | 未タスク化 | i18n 対応として未タスク化（Phase 3 確定済み）。正本反映の対象外                                        |
| M-DQ-4   | SkillDependency DI境界配置先未確定 | 解決済み   | dependency-constraint.ts への配置を確定。arch-electron-services-core.md の CompatibilityChecker に記載 |
