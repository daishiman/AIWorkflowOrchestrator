# MINOR 追跡テーブル解決確認レポート

## メタ情報

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 文書       | Phase 10 - MINOR 追跡解決確認                                                            |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                  |
| 作成日     | 2026-03-17                                                                               |
| 依存成果物 | Phase 3 gate-decision.md、Phase 9 spec-quality-report.md、Phase 9 quality-gate-result.md |

---

## 1. Phase 3 MINOR 追跡テーブル（10件）の解決状況

### 1.1 M-AC-1: deprecated 状態の SkillVisibility 型未収録

| 項目         | 内容                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| 指摘内容     | `"deprecated"` 状態が `SkillVisibility` 型に未収録                                                |
| 解決予定     | Phase 5                                                                                           |
| 実際の対応   | type-definitions.md SS1.1 で `isDeprecated: boolean` フィールドとして後続未タスク化する方針を確定 |
| 証跡ファイル | `outputs/phase-5/type-definitions.md` SS1.1（M-AC-1 対応セクション）                              |
| 判定         | **解決済み**（設計判断が明示的に文書化されている）                                                |

### 1.2 M-AC-2: 後方互換保持世代数のポリシー実装方針が未定義

| 項目         | 内容                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | 後方互換保持世代数のポリシー実装方針が未定義                                                                                        |
| 解決予定     | Phase 5                                                                                                                             |
| 実際の対応   | type-definitions.md SS5 で public: N-2世代、team: N-1世代、local: 制限なしを確定。service-interfaces.md SS1 update() 事後条件に反映 |
| 証跡ファイル | `outputs/phase-5/type-definitions.md` SS5、`outputs/phase-5/service-interfaces.md` SS1                                              |
| 判定         | **解決済み**                                                                                                                        |

### 1.3 M-AC-3: カテゴリ固定値の列挙が Phase 2 設計書に未収録

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 指摘内容     | カテゴリ固定値の列挙が Phase 2 設計書に未収録                                                |
| 解決予定     | Phase 5                                                                                      |
| 実際の対応   | type-definitions.md SS6 で tags フィールドで代替し、固定カテゴリ列挙型は定義しない方針を確定 |
| 証跡ファイル | `outputs/phase-5/type-definitions.md` SS6                                                    |
| 判定         | **解決済み**                                                                                 |

### 1.4 M-SS-1: CSS 変数 `--status-neutral` の既存定義衝突確認

| 項目         | 内容                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | CSS変数 `--status-neutral` の既存定義衝突確認が未実施                                                               |
| 解決予定     | Phase 5                                                                                                             |
| 実際の対応   | ipc-channel-definitions.md SS9 で「バックエンド層設計のため CSS 変数との直接衝突なし」と確認。grep コマンド記載済み |
| 証跡ファイル | `outputs/phase-5/ipc-channel-definitions.md` SS9（M-SS-1 対応行）                                                   |
| 判定         | **解決済み**（設計タスクスコープ内で CSS 変数衝突は該当しないことが確認済み）                                       |

### 1.5 M-SS-2: フィルタ UI 配置先コンポーネントの確定

| 項目         | 内容                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | フィルタ UI 配置先コンポーネントが未確定                                                                                               |
| 解決予定     | Phase 5                                                                                                                                |
| 実際の対応   | zustand-slice-design.md SS9 で `visibilityFilter` を publishingSlice に追加、UI は `SkillCenter/VisibilityFilterDropdown` に配置を確定 |
| 証跡ファイル | `outputs/phase-5/zustand-slice-design.md` SS9                                                                                          |
| 判定         | **解決済み**                                                                                                                           |

### 1.6 M-SS-3: SkillPublishingMetadata の既存型名重複確認

| 項目         | 内容                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | `SkillPublishingMetadata` の既存型名重複確認が未実施                                                                                          |
| 解決予定     | Phase 4                                                                                                                                       |
| 実際の対応   | ipc-channel-definitions.md SS9 でチャンネル名 `skill:publishing:*` / `skill:distribution:*` で既存と重複なし。3ファイル分散配置で型名重複なし |
| 証跡ファイル | `outputs/phase-5/ipc-channel-definitions.md` SS9（M-SS-3 対応行）                                                                             |
| 判定         | **解決済み**                                                                                                                                  |

### 1.7 M-DQ-1: semver ライブラリの外部依存（satisfies 関数）が未定義

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| 指摘内容     | `satisfies` 関数の外部依存（semver ライブラリ）が未定義                         |
| 解決予定     | Phase 5                                                                         |
| 実際の対応   | service-interfaces.md SS8 で `semver` パッケージ（npm 公式、約8KB）の採用を確定 |
| 証跡ファイル | `outputs/phase-5/service-interfaces.md` SS8                                     |
| 判定         | **解決済み**                                                                    |

### 1.8 M-DQ-2: update() 内の in-app 通知の責務越境懸念

| 項目         | 内容                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | `update()` 内の in-app 通知の責務越境懸念                                                                                                                            |
| 解決予定     | Phase 5                                                                                                                                                              |
| 実際の対応   | service-interfaces.md SS7 で RegistryService は「状態変更のみ」、NotificationService は「通知のみ」の責務分離を確定。UpdateResult に requiresManualApproval を含める |
| 証跡ファイル | `outputs/phase-5/service-interfaces.md` SS7                                                                                                                          |
| 判定         | **解決済み**                                                                                                                                                         |

### 1.9 M-DQ-3: reasons フィールドの日本語固定

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| 指摘内容     | `reasons` フィールドの日本語固定                      |
| 解決予定     | 未タスク化（Phase 3 gate-decision.md で確定済み）     |
| 実際の対応   | i18n 対応として未タスク化。Phase 3 で承認済み         |
| 証跡ファイル | `outputs/phase-3/gate-decision.md` MINOR 追跡テーブル |
| 判定         | **未タスク化済み**（対応不要）                        |

### 1.10 M-DQ-4: SkillDependency の DI 境界配置先未確定

| 項目         | 内容                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | `SkillDependency` の DI 境界配置先未確定                                                                        |
| 解決予定     | Phase 5                                                                                                         |
| 実際の対応   | service-interfaces.md SS6 で `dependency-constraint.ts` を `apps/desktop/src/main/domain/` の Port 同階層に配置 |
| 証跡ファイル | `outputs/phase-5/service-interfaces.md` SS6                                                                     |
| 判定         | **解決済み**                                                                                                    |

---

## 2. Phase 3 WARN 項目（4件）の解決状況

### 2.1 W-01: team スキルの SkillCard 表示ポリシー未定義

| 項目         | 内容                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 指摘内容     | `team` スキルの SkillCard 表示ポリシーが未定義                                                                           |
| 対応推奨     | Phase 5 前に追記                                                                                                         |
| 実際の対応   | zustand-slice-design.md SS9 で `visibilityFilter` を追加し、UI フィルタリングで team/local/public を切り替える設計を確定 |
| 証跡ファイル | `outputs/phase-5/zustand-slice-design.md` SS9                                                                            |
| 判定         | **解決済み**（publishingSlice の visibilityFilter で対応）                                                               |

### 2.2 W-02: hasOnlyOncePerm の Phase 2 判定からの除外

| 項目         | 内容                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 指摘内容     | `hasOnlyOncePerm` が Phase 2 の `SafetyGateInput` に含まれず、PublishReadiness 判定に反映されない                                                      |
| 対応推奨     | Phase 5 引き継ぎ                                                                                                                                       |
| 実際の対応   | Phase 5 で SafetyGateInput に hasOnlyOncePerm を含めない設計を維持。Phase 1 の WARN-02 は PublishEligibility 層（UI 向け補助情報）で処理する設計に分離 |
| 証跡ファイル | `outputs/phase-3/dependency-contract-alignment.md` SS2.4、`outputs/phase-5/type-definitions.md` SS3.4                                                  |
| 判定         | **解決済み**（意図的な設計判断として文書化済み）                                                                                                       |

### 2.3 W-03: hasCriticalFeedback の Phase 2 での非使用

| 項目         | 内容                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | `hasCriticalFeedback` が Phase 2 `ObservabilityMetrics` に含まれず、PublishReadiness 判定に反映されない                                                                               |
| 対応推奨     | Phase 5 引き継ぎ                                                                                                                                                                      |
| 実際の対応   | Phase 5 で ObservabilityMetrics は3フィールド（successRate/qualityTrend/feedbackScore）のみとする設計を維持。hasCriticalFeedback は後続の UI 実装タスクでアダプタ関数に追加を検討する |
| 証跡ファイル | `outputs/phase-3/dependency-contract-alignment.md` SS3.4、`outputs/phase-5/type-definitions.md` SS3.6                                                                                 |
| 判定         | **未タスク化対象**（後続実装タスクで hasCriticalFeedback をアダプタに追加するか判断する）                                                                                             |

### 2.4 W-04: usageCount の ObservabilityMetrics 未追加

| 項目         | 内容                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容     | `usageCount` が Phase 2 `ObservabilityMetrics` に含まれていない                                                                                                   |
| 対応推奨     | Phase 5 引き継ぎ                                                                                                                                                  |
| 実際の対応   | Phase 5 で ObservabilityMetrics に usageCount を追加しない設計を維持。successRate=0 の境界値処理で実行履歴なしケースは "review-required" となり安全側に倒れる設計 |
| 証跡ファイル | `outputs/phase-3/dependency-contract-alignment.md` SS3.5、`outputs/phase-5/type-definitions.md` SS3.6                                                             |
| 判定         | **未タスク化対象**（後続実装タスクで UI 表示情報として usageCount をアダプタに追加するか判断する）                                                                |

---

## 3. Phase 9 WARN 項目（追加追跡対象）

### 3.1 Phase 9 W-1: 曖昧表現7件

| 項目     | 内容                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 指摘内容 | 曖昧表現（「適切に」「必要に応じて」「など」）が7件検出                                                      |
| 出典     | spec-quality-report.md SS1                                                                                   |
| 影響度   | 低（全てレビュー文脈・例示文脈での使用。仕様定義文・受入基準・完了条件には含まれない）                       |
| 対応方針 | 後続実装タスクの仕様書作成時に例示文脈での曖昧表現を具体的な列挙に置換する                                   |
| 判定     | **WARN 承認**（Phase 10 最終確認: 仕様定義文には曖昧表現が含まれないことを再確認済み。機能設計への影響なし） |

### 3.2 Phase 9 W-2: 命名規約違反3件

| 項目     | 内容                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 指摘内容 | boolean フィールド命名規約違反3件（V-1: autoResolveDependencies、V-2: includeMetadata、V-3: passed）              |
| 出典     | spec-quality-report.md SS3、naming-audit.md SS5                                                                   |
| 影響度   | 低（推奨レベル。波及範囲が広い: テスト仕様書8〜15件に修正が必要）                                                 |
| 対応方針 | 未タスク化して管理する。後続実装タスクで shouldAutoResolveDependencies / shouldIncludeMetadata / hasPassed に改名 |
| 判定     | **未タスク化対象**                                                                                                |

### 3.3 Phase 9 W-3: M-AC-2 意図的未タスク化

| 項目     | 内容                                                                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 指摘内容 | M-AC-2（後方互換保持世代数）が「意図的未タスク化」とされた記録                                                                                                                                             |
| 出典     | quality-gate-result.md SS2.2                                                                                                                                                                               |
| 確認結果 | Phase 3 gate-decision.md で M-AC-2 は Phase 5 解決予定として記録。Phase 5 で実際に解決済み（type-definitions.md SS5 + service-interfaces.md SS1）。Phase 9 spec-quality-report.md SS4.2 でも解決済みを確認 |
| 判定     | **解決確認済み**（Phase 9 の W-3 記載は spec-quality-report.md の M-DQ-3 未タスク化との混同。M-AC-2 自体は Phase 5 で解決済み）                                                                            |

---

## 4. 解決状況サマリー

### 4.1 Phase 3 MINOR（10件）

| MINOR ID | 指摘内容                   | 解決予定Phase | 実際の解決状況   | 証跡ファイル                        | 判定       |
| -------- | -------------------------- | ------------- | ---------------- | ----------------------------------- | ---------- |
| M-AC-1   | deprecated 状態の型未収録  | Phase 5       | 方針確定済み     | type-definitions.md SS1.1           | 解決済み   |
| M-AC-2   | 後方互換保持世代数ポリシー | Phase 5       | ポリシー確定済み | type-definitions.md SS5             | 解決済み   |
| M-AC-3   | カテゴリ固定値             | Phase 5       | tags 代替確定    | type-definitions.md SS6             | 解決済み   |
| M-SS-1   | CSS 変数衝突確認           | Phase 5       | 非該当確認済み   | ipc-channel-definitions.md SS9      | 解決済み   |
| M-SS-2   | フィルタ UI 配置先         | Phase 5       | 配置確定済み     | zustand-slice-design.md SS9         | 解決済み   |
| M-SS-3   | 型名重複確認               | Phase 4       | 重複なし確認済み | ipc-channel-definitions.md SS9      | 解決済み   |
| M-DQ-1   | semver ライブラリ          | Phase 5       | semver 確定      | service-interfaces.md SS8           | 解決済み   |
| M-DQ-2   | update() 通知責務越境      | Phase 5       | 責務分離確定     | service-interfaces.md SS7           | 解決済み   |
| M-DQ-3   | reasons 日本語固定         | 未タスク化    | 未タスク化済み   | gate-decision.md MINOR 追跡テーブル | 未タスク化 |
| M-DQ-4   | SkillDependency DI 境界    | Phase 5       | 配置先確定済み   | service-interfaces.md SS6           | 解決済み   |

**結果: 9件解決済み + 1件未タスク化済み = 全10件追跡完了**

### 4.2 Phase 3 WARN（4件）

| WARN ID | 指摘内容                    | 実際の解決状況             | 判定       |
| ------- | --------------------------- | -------------------------- | ---------- |
| W-01    | team SkillCard 表示ポリシー | publishingSlice で対応済み | 解決済み   |
| W-02    | hasOnlyOncePerm 除外        | 意図的設計判断として文書化 | 解決済み   |
| W-03    | hasCriticalFeedback 非使用  | 後続タスクで対応           | 未タスク化 |
| W-04    | usageCount 未追加           | 後続タスクで対応           | 未タスク化 |

**結果: 2件解決済み + 2件未タスク化対象 = 全4件追跡完了**

### 4.3 Phase 9 WARN（3件）

| WARN ID    | 指摘内容              | 判定                        |
| ---------- | --------------------- | --------------------------- |
| Phase9-W-1 | 曖昧表現7件           | WARN 承認（機能影響なし）   |
| Phase9-W-2 | 命名規約違反3件       | 未タスク化対象              |
| Phase9-W-3 | M-AC-2 未タスク化記録 | 解決確認済み（M-AC-2 解決） |

---

## 5. 未タスク化要件（Phase 12 で正式に未タスク指示書を作成する対象）

| #   | 未タスク名称                                        | 出典    | 優先度 |
| --- | --------------------------------------------------- | ------- | ------ |
| 1   | M-DQ-3: reasons フィールドの i18n 対応              | Phase 3 | 低     |
| 2   | W-03: hasCriticalFeedback のアダプタ関数追加検討    | Phase 3 | 低     |
| 3   | W-04: usageCount の UI 表示情報としてのアダプタ追加 | Phase 3 | 低     |
| 4   | Phase9-W-2: boolean 命名規約修正（V-1/V-2/V-3）     | Phase 9 | 低     |
| 5   | 曖昧表現7件の例示文脈での具体化                     | Phase 9 | 低     |

全5件は Phase 12（ドキュメント）の未タスク検出で正式に指示書を作成し、task-workflow.md 残課題テーブルに登録する。
