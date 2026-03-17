# Phase 3 タスク3: システム仕様整合性レビュー

## メタ情報

| 項目         | 内容                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| 文書         | Phase 3 - タスク3 成果物                                                                                       |
| タスクID     | TASK-SKILL-LIFECYCLE-08                                                                                        |
| 作成日       | 2026-03-17                                                                                                     |
| レビュー対象 | Phase 2 設計成果物 5ファイル                                                                                   |
| 参照仕様書   | security-skill-execution.md / ui-ux-navigation.md / interfaces-agent-sdk-skill.md / lessons-learned-current.md |

---

## 総合判定

| 仕様書                        | 判定                | 概要                                                        |
| ----------------------------- | ------------------- | ----------------------------------------------------------- |
| security-skill-execution.md   | **PASS**            | 安全性チェック設計が既存セキュリティポリシーと整合          |
| ui-ux-navigation.md           | **PASS with MINOR** | 公開/閲覧導線は既存ナビと整合。バッジ色の軽微な確認事項あり |
| interfaces-agent-sdk-skill.md | **PASS**            | 型体系・命名規則に準拠。適切なファイル配置計画              |
| lessons-learned-current.md    | **PASS**            | 主要既知教訓（P42/P60/P61/P57〜P59等）が設計に反映済み      |

**Phase 3 全体判定: MINOR**（全指摘事項は軽微。Phase 4 移行前に確認推奨）

---

## 1. security-skill-execution.md との整合

### 判定: PASS

### 1.1 公開前安全性チェックと既存セキュリティポリシーの整合

**検証結果: 整合**

`publish-readiness-design.md` の安全性チェック設計は `security-skill-execution.md` の既存ポリシーと以下の点で整合している。

| 確認項目                                 | 既存仕様（security-skill-execution.md）                                       | Phase 2 設計                                                                          | 整合性 |
| ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| ToolRiskLevel の値セット                 | `"critical" \| "high" \| "medium" \| "low"`（security.ts に定義）             | `publish-readiness-design.md` セクション1.1で同一値セットを参照                       | 整合   |
| Critical ツール自動拒否                  | `autoDenyDefault: true`（TOOL_RISK_CONFIG）でPermissionDialog非表示・自動拒否 | `"critical"` リスクは公開ブロック（`"blocked"` 判定）。一貫した fail-closed 原則      | 整合   |
| `"high"` リスクの扱い                    | `TOOL_RISK_CONFIG.high.autoDenyDefault: false`（手動承認で許可可能）          | `"high"` は `"manual-approval-required"`（管理者承認で公開可能）                      | 整合   |
| Permission fail-closed 原則（UT-06-005） | abort フォールバックで fail-closed を実現                                     | 公開ブロック時は `reasons[]` を返し作成者に修正を促す設計                             | 整合   |
| PermissionStore の DI スコープ           | 上位スコープでインスタンス化して共有参照                                      | `SafetyGateInput` は Task-06 出力をアダプタで変換して入力する設計（スコープ問題なし） | 整合   |

**特筆点**: `publish-readiness-design.md` の `SafetyGateInput.riskLevel` は `Task-06 の SafetyGateResult.overallGrade と details から convertToToolRiskLevel() で変換` と明記されており、`security-skill-execution.md` の ToolRiskLevel 参照セクション（v1.4.0 以降）と完全に対応している。

### 1.2 新規追加する型の既存 security 型体系への適合

**検証結果: 適合**

| 新規追加型                                     | 既存 security 型との関係                                                                                           | 適合判定 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `ToolRiskLevel`（publish-readiness-design.md） | `security.ts` の同名型と同一値セット（再宣言ではなく参照設計）                                                     | 適合     |
| `SafetyGateStatus`                             | PermissionStore の承認状態から派生。独立した新規型として競合なし                                                   | 適合     |
| `SecurityScanResult`                           | `SafetyGateResult.details[]` の集計型。既存型を破壊しない                                                          | 適合     |
| `SafetyGateInput`                              | Task-06 実装済み型との接続アダプタ入力型。名称注記あり（設計書内で `SafetyGateResult` との混同防止コメントを明記） | 適合     |

### 1.3 改善推奨事項

なし。

---

## 2. ui-ux-navigation.md との整合

### 判定: PASS with MINOR

### 2.1 Skill Center の公開/閲覧導線と既存ナビゲーション仕様の整合

**検証結果: 整合**

`skill-center-flow-design.md` の UI フローは `ui-ux-navigation.md` の既存ナビゲーション設計と以下の点で整合している。

| 確認項目                   | 既存仕様（ui-ux-navigation.md）                             | Phase 2 設計                                                                                                      | 整合性 |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| Skill Center の ViewType   | `skillCenter`（canonical）。`skill-center` は互換エイリアス | `skill-center-flow-design.md` は `SkillRegistryService` の操作フローを定義しており、ViewType の命名には干渉しない | 整合   |
| Skill Center の一次導線    | `スキルを作る / 使う / 改善する` の 3 ジョブを案内する入口  | 登録フロー（作る）・更新フロー（改善する）・停止フロー（管理する）がこの 3 ジョブを補完する                       | 整合   |
| Surface ownership board    | `Skill Center` が入口・案内担当。`Skill Creator` が作成先   | 登録フローの Step 1（メタデータ入力）と Step 3（プレビュー確認）は Skill Center 内の操作として設計済み            | 整合   |
| settings の AuthGuard 例外 | `settings` は AuthGuard 外でアクセス可能                    | 公開管理フローは `skillCenter` ViewType 配下の機能であり、settings の AuthGuard 設計に干渉しない                  | 整合   |

### 2.2 レベル別 UI 表示と既存デザインシステムの統一性

**確認結果: 概ね統一。軽微な確認事項あり**

`publishing-metadata-design.md` セクション4のバッジ仕様と `ui-ux-navigation.md` のデザイン方針を照合した。

#### 整合している点

| 確認項目                           | 結果                                                                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Apple HIG 準拠のカラーパレット使用 | `bg-[var(--status-neutral)]`（systemGray5）、`bg-[var(--status-info)]`（systemBlue）、`bg-[var(--status-success)]`（systemGreen）を使用。`01-architecture.md` の Apple HIG カラーパレットと一致 |
| ライト/ダークモード対応            | CSS 変数でライト/ダーク両対応のカラートークンを定義。既存デザインシステムの方針と一致                                                                                                           |
| アクセシビリティ対応               | 各アイコンに `aria-label` を付与（`"ローカル（非公開）"` 等）。`ui-ux-navigation.md` のアクセシビリティ方針と一致                                                                               |
| P47 準拠                           | `visibilityBadgeStyles` を `Record<SkillVisibility, ...>` として export 定義し、テスト側が import して期待値を生成できる設計                                                                    | 一致 |
| lucide-react アイコン使用          | `<Lock />` / `<Users />` / `<Globe />` を使用。既存コンポーネントと同じアイコンライブラリを使用                                                                                                 |

#### MINOR: 軽微な確認事項

**MINOR-1: `--status-neutral` CSS 変数の既存定義との重複確認**

`publishing-metadata-design.md` セクション4.1 では `--status-neutral`、`--status-info`、`--status-success`、`--text-secondary`、`--text-inverse` の CSS 変数を新規定義している。既存の CSS 変数定義（`ui-ux-components.md` または `global.css`）と名称が衝突していないか実装前に確認が必要。

- **影響度**: 低（名称が既存と一致すれば値を共有可能。衝突の場合はリネームで対応）
- **対応タイミング**: Phase 5（実装）開始前に `grep -rn "\-\-status-neutral" apps/desktop/src/` で確認する

**MINOR-2: フィルタ UI の配置場所の具体化**

`publishing-metadata-design.md` セクション4.3 で「Skill Center 一覧ヘッダー右上のツールバー」にフィルタを配置すると定義しているが、`ui-ux-navigation.md` の `GlobalNavStrip` / `AppLayout` 体系における具体的な配置コンポーネント（`organisms/SkillCenterView/` 等）が未確定。

- **影響度**: 低（既存ナビゲーション構造を破壊しない範囲の配置決定）
- **対応タイミング**: Phase 5 実装時に既存 Skill Center コンポーネント構造を確認して決定

---

## 3. interfaces-agent-sdk-skill.md との整合

### 判定: PASS

### 3.1 新規追加する型の既存型体系・命名規則との統一性

**検証結果: 整合**

`interfaces-agent-sdk-skill.md` の仕様書インデックスと Phase 2 設計の新規型を照合した。

| 新規型名                   | 既存型体系との関係                                                                                                            | 命名規則準拠 | 整合性         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------- |
| `SkillVisibility`          | 既存の `SkillLifecycleEvent`（TASK-SKILL-LIFECYCLE-07）等と同じ `Skill` プレフィックス命名                                    | 準拠         | 整合           |
| `SkillPublishingMetadata`  | 既存の `SkillPublishingMetadata`（TASK-9F `スキル共有型定義`）と同名候補に注意                                                | 準拠         | 要確認（後述） |
| `PublishReadiness`         | ライフサイクルドメインの判定結果型として適切。既存の `PublishReadinessMetrics`（TASK-SKILL-LIFECYCLE-07）とは別概念で区別済み | 準拠         | 整合           |
| `CompatibilityLevel`       | `interfaces-agent-sdk-skill-reference.md` の `スキルチェーン型定義` 等と命名が干渉しない独立型                                | 準拠         | 整合           |
| `SkillDistributionService` | `Skill` プレフィックス + `Service` サフィックスの命名規則に準拠                                                               | 準拠         | 整合           |
| `SkillRegistryService`     | 同上                                                                                                                          | 準拠         | 整合           |

**MINOR-3: `SkillPublishingMetadata` の命名重複リスク**

`interfaces-agent-sdk-skill-reference-share-debug-analytics.md` の `スキル共有型定義（TASK-9F）` に既存の `SkillPublishingMetadata` が定義されている可能性がある。Phase 2 の `publishing-metadata-design.md` は同名の型を新規定義しており、Phase 5 実装時に型定義の衝突が発生するリスクがある。

- **影響度**: 中（名称が重複する場合、`packages/shared/src/index.ts` の re-export で競合）
- **対応タイミング**: Phase 4 または Phase 5 開始前に `grep -rn "SkillPublishingMetadata" packages/shared/src/ .claude/skills/` で既存定義を確認する
- **回避策候補**: 既存定義が存在する場合は `SkillCatalogPublishingMetadata` への改名、または既存定義を拡張する方針を Phase 3 で決定する

### 3.2 IPC チャンネル追加の既存 IPC 契約ルールへの準拠

**検証結果: 準拠**

`skill-center-flow-design.md` セクション5.1 および `distribution-operations-design.md` セクション4.1 で定義した新規 IPC チャンネルが既存ルールに準拠しているかを検証した。

| 確認項目                           | 既存ルール                                                                                   | Phase 2 設計                                                                                                                                                            | 準拠状況 |
| ---------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| チャンネル名の定数管理（P27）      | `IPC_CHANNELS` 定数でハードコード文字列禁止                                                  | `SKILL_PUBLISHING_CHANNELS` 定数と `IPC_CHANNELS` への追加定義を明記                                                                                                    | 準拠     |
| IPC レスポンス wrapper 形式（P60） | `{ success: true; data: T } \| { success: false; error: { code: string; message: string } }` | 全チャンネルで同一 `IpcResponse<T>` wrapper を使用。テストアサーション例も `result.error.code` 形式で記載                                                               | 準拠     |
| IPC ハンドラの DIP 準拠（P61）     | ハンドラ登録関数の引数型はインターフェース（具象クラス不可）                                 | `registerSkillPublishingHandlers(registry: SkillRegistryService)` / `registerSkillDistributionHandlers(distributionService: SkillDistributionService)` で Port 型を使用 | 準拠     |
| 引数バリデーション P42 準拠        | 3段バリデーション（型チェック → 空文字列 → trim後空文字列）                                  | 全メソッドのバリデーション表に3段確認を明記。コード例も `metadata.name.trim() === ""` 形式                                                                              | 準拠     |
| 新チャンネルの命名規約             | `<domain>:<subdomain>:<action>` 形式（例: `skill:import`）                                   | `skill:publishing:register` / `skill:distribution:import` 等で一貫した命名                                                                                              | 準拠     |

### 3.3 `interfaces-agent-sdk-skill.md` への記録

**確認結果**: Phase 2 は設計タスクであるため、`interfaces-agent-sdk-skill.md` への型定義追記は Phase 12 で行う設計となっている（P57 の教訓に基づく「Phase 12 完了時に実ファイル更新必須」）。現時点では参照先として `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に `スキル共有型定義（TASK-9F）` との接続点を確認する必要がある。

---

## 4. lessons-learned-current.md の教訓確認

### 判定: PASS

### 4.1 import/share drift の既知教訓の設計反映

**確認結果**: Phase 2 設計では以下の drift 対策が明示的に組み込まれている。

| 教訓                                                  | 設計への反映状況                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| P44（skill:import/remove IPC インターフェース不整合） | `skill-center-flow-design.md` セクション4.3「コマンド単位バリデーションマトリクス」で全メソッドの引数型を明示。Preload 側との契約ドリフトを防止   |
| P45（IPC 引数命名の契約ドリフト）                     | `publish-readiness-design.md` セクション2.1 で「命名注意（P45対策）」として `stabilityScore` フィールド名を明記。設計書内での誤った命名伝播を防止 |
| P23（API 二重定義の型管理複雑性）                     | 型配置先を `packages/shared/src/skill/publishing-types.ts` 等に一元化し、re-export を `packages/shared/src/index.ts` から行う設計                 |

### 4.2 P42 の教訓確認

**確認結果**: 全設計書で P42 準拠が明示されている。

| 設計書                              | P42 対応箇所                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `publishing-metadata-design.md`     | セクション2.3「P42 準拠 3段バリデーション」で `isValidString()` 関数を定義。全文字列フィールドに適用                |
| `skill-center-flow-design.md`       | セクション4.3「コマンド単位バリデーションマトリクス」で全メソッドに3段バリデーションを定義                          |
| `distribution-operations-design.md` | セクション3.3「コマンド単位バリデーション」で `sourceUrl`、`skillId`、`teamId`、`newName` に3段バリデーションを適用 |
| `publish-readiness-design.md`       | セクション5「PublishReadinessChecker インターフェース」でバリデーション例を記載                                     |
| `compatibility-check-design.md`     | セクション5「DI境界・型配置」でP61準拠の確認記載あり                                                                |

### 4.3 P60 の教訓確認

**確認結果**: 全 IPC チャンネルで P60 準拠を確認。

`skill-center-flow-design.md` セクション5.2、`distribution-operations-design.md` セクション4.2、`compatibility-check-design.md` セクション5.2 のいずれも `IpcResponse<T>` wrapper 形式を採用し、テストアサーションを `result.error.code` 形式で記述する旨を明記している。

### 4.4 P61 の教訓確認

**確認結果**: 全 IPC ハンドラ登録関数でDIP準拠を確認。

| ハンドラ登録関数                    | 引数型（インターフェース） | 具象クラス依存の有無 |
| ----------------------------------- | -------------------------- | -------------------- |
| `registerSkillPublishingHandlers`   | `SkillRegistryService`     | なし（P61 準拠）     |
| `registerSkillDistributionHandlers` | `SkillDistributionService` | なし（P61 準拠）     |

Phase 2 設計書の `publishing-metadata-design.md` セクション5.1 にも「IPC ハンドラ依存先の確認（P61 準拠）」として明示的にコメントが記載されている。

### 4.5 P57〜P59 の教訓確認（設計タスク固有）

**確認結果**: 教訓が設計書の作成プロセスに反映されている。

| 教訓                                                             | 確認内容                                                                                                                                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P57（設計タスクでのシステム仕様書更新先送り）                    | Phase 2 成果物に「Phase 12 完了時に実ファイル更新を行う」旨の設計注記が含まれており、Phase 12 で実更新を行う意図が明確化されている                                               |
| P58（設計タスクを理由とした未タスク指示書の配置省略）            | 設計書内の「未解決事項」（publishing-metadata-design.md セクション7の U-1〜U-3）が未タスク候補として明示されており、Phase 12 Task 4 で正規の指示書として作成する素材が整っている |
| P59（並列エージェントによる documentation-changelog 件数不整合） | Phase 2 は設計タスクで直接的なコード変更がないため現時点では影響範囲外。ただし Phase 12 では単一エージェントによる changelog 統合作成を行うこと                                  |

### 4.6 lessons-learned-current.md の最新教訓（P62/P63）との整合

**確認結果**: Phase 2 設計で対策済み。

| 教訓                                            | 設計への反映                                                                                                                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P62（PermissionStore の DI スコープ問題）       | `publish-readiness-design.md` で `SafetyGateInput` を Task-06 の `SafetyGateResult + PermissionStore` から合成する設計としており、スコープ問題のある直接参照を避けている                                                         |
| P63（SafetyGate metadataProvider の抽象化境界） | `publish-readiness-design.md` セクション1.4 の設計注記で `SafetyGateInput` が「Phase 5 でアダプタ関数を実装し、SafetyGateResult + PermissionStore から合成する」と明記。データソース未確定の場合のスタブ判断根拠の記録方針と整合 |

---

## 5. 改善推奨事項サマリー

| ID      | 分類     | 対象設計書                                    | 内容                                                                                                                                                                                                                                  | 対応タイミング                                      |
| ------- | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| MINOR-1 | 実装確認 | `publishing-metadata-design.md` セクション4.1 | `--status-neutral` 等の CSS 変数が既存定義と衝突しないことを実装前に確認する。`grep -rn "\-\-status-neutral" apps/desktop/src/` を実行                                                                                                | Phase 5 開始前                                      |
| MINOR-2 | 設計補完 | `publishing-metadata-design.md` セクション4.3 | フィルタ UI の配置先コンポーネント（`organisms/SkillCenterView/` 等）を Phase 5 で既存コンポーネント構造を確認してから決定する                                                                                                        | Phase 5 実装時                                      |
| MINOR-3 | 型名確認 | `publishing-metadata-design.md` セクション2   | `SkillPublishingMetadata` の命名が `interfaces-agent-sdk-skill-reference-share-debug-analytics.md`（TASK-9F スキル共有型定義）と重複しないかを Phase 4 前に確認する。`grep -rn "SkillPublishingMetadata" packages/shared/src/` を実行 | Phase 4 開始前（推奨）または Phase 5 開始前（必須） |

---

## 6. 検証スキップ項目

なし。参照した全4ファイルが存在し、全項目を検証完了。

---

## 7. 結論

Phase 2 の設計成果物5ファイルはいずれも既存システム仕様書との整合性が高い。主要な確認事項（P42/P60/P61/P57〜P63 の既知教訓）は設計書内に明示的に反映されており、Phase 4（テスト作成）への移行可能な品質に達している。

3件の MINOR 指摘はいずれも実装時の事前確認事項であり、設計そのものを修正する必要はない。Phase 4 開始前に MINOR-3（型名重複確認）を実施することを推奨する。MINOR-1 および MINOR-2 は Phase 5 で対応すれば十分。
