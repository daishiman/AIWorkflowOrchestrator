# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| Phase名    | 手動テスト（設計文書ウォークスルー） |
| 前提Phase  | Phase 10（最終レビュー PASS/MINOR）  |
| 後続Phase  | Phase 12（ドキュメント）             |
| ステータス | 未実施                               |
| 作成日     | 2026-03-16                           |
| 機能名     | スキル共有・公開・互換性統合         |
| タスクID   | TASK-SKILL-LIFECYCLE-08              |
| タスク種別 | 設計                                 |

---

## 目的

設計文書ウォークスルーにより、仕様書の自己完結性・型定義整合・スコープ外未タスク・Phase 10 レビュー指摘照合・後続実装タスクへの引き継ぎを確認する。UI 実装がない設計タスクのため、画面操作テストは行わない。

---

## 背景

TASK-SKILL-LIFECYCLE-08 は公開レベル（`SkillVisibility`）、semver 互換性チェック（`CompatibilityCheckResult`）、公開判定ロジック（`PublishReadiness`）、Skill Center ライフサイクルフロー（`SkillRegistryService`）、配布操作（`SkillDistributionService`）という5つの設計領域から構成される。Phase 1〜10 を通じて設計書・型定義・インターフェース契約が作成された。

Phase 11 ではこれらの設計成果物を「運用できるドキュメント」として使えるかをウォークスルーで検証する。具体的には、依存タスク（Task06/07）との型契約の整合性、未タスク化が必要な「将来実装」箇所の漏れ、Phase 3/10 の MINOR 指摘の追跡状況を確認する。

---

## タスク種別判定

| タスク種別     | 判定条件                                   | 適用セクション                    |
| -------------- | ------------------------------------------ | --------------------------------- |
| **設計タスク** | タスク種別が「設計・仕様策定」、UI実装なし | 設計タスク専用セクション（SF-01） |

**スクリーンショット対応（P53対策）**: 設計タスクのため CLI 環境での画面キャプチャは不要。NON_VISUAL 判定。実行可能なアプリケーション UI が存在しないため、視覚的な確認は不要。

---

## 実行タスク

### タスク1: 仕様書の自己完結性確認

**目的**: Phase 1〜10 の全仕様書に、後続の実装者が必要とする情報が揃っているかを確認する。

**実行手順**:

1. 各 Phase 仕様書（phase-1-requirements.md〜phase-10-final-review.md）を読み込み、以下の項目が揃っているかを確認する:
   - 前提条件（前提 Phase の成果物パスが明示されているか）
   - 受入基準（AC-1〜AC-4 が具体的な条件式で記述されているか）
   - 成果物パス（各成果物のファイルパスが `outputs/phase-N/` 形式で明示されているか）
   - 完了条件（チェックリスト形式で検証可能な項目が記述されているか）
2. 不足している項目を「発見事項テーブル」に記録する（分類: Blocker / Note / Info）
3. `outputs/phase-11/manual-test-result.md` に確認結果を記録する

**期待される成果物**: `outputs/phase-11/manual-test-result.md` の「仕様書自己完結性」セクション

---

### タスク2: 型定義・インターフェースの整合確認

**目的**: Phase 2 で設計した型定義が、依存タスク（Task06/07）の型と整合し、参照箇所と定義箇所が一致するかを確認する。

**実行手順**:

1. Phase 2 設計書から以下の型定義を抽出する:
   - `SkillVisibility`（`outputs/phase-2/publishing-metadata-design.md`）
   - `CompatibilityCheckResult`（`outputs/phase-2/compatibility-check-design.md`）
   - `PublishReadiness` / `PublishReadinessChecker`（`outputs/phase-2/publish-readiness-design.md`）
   - `SkillRegistryService`（`outputs/phase-2/skill-center-flow-design.md`）
   - `SkillDistributionService`（`outputs/phase-2/distribution-operations-design.md`）
2. Task06（安全性ゲート）の Phase 2 設計書から `ToolRiskLevel`、`SafetyGateResult` の定義を確認し、本タスクの `PublishReadinessChecker.check()` の引数型と照合する
3. Task07（観測指標）の Phase 2 設計書から `ObservabilityMetrics`、`SkillAggregateView` の定義を確認し、本タスクの判定マトリクスの入力型と照合する
4. 不整合箇所を「発見事項テーブル」に記録する（Blocker: 型が不整合、Note: 命名不一致、Info: 軽微な差異）
5. `outputs/phase-11/manual-test-result.md` に確認結果を追記する

**期待される成果物**: `outputs/phase-11/manual-test-result.md` の「型定義整合性」セクション

---

### タスク3: スコープ外の未タスク洗い出し

**目的**: Phase 1〜10 の設計書で「将来実装」「TODO」「スコープ外」と記述された箇所を全て列挙し、未タスク化が必要なものを特定する。

**実行手順**:

1. 以下のパターンで全設計書を確認する:
   - 「将来」「将来的に」「future」「TBD」「TODO」「スコープ外」「後続タスク」が含まれる記述を列挙する
   - Phase 3/10 の MINOR 追跡テーブルの「解決予定 Phase: Phase 12 以降」となっている項目を確認する
2. 列挙した項目ごとに以下を判断する:
   - Phase 12 内で解決できる（= 仕様書の追記・修正で完結する）
   - 独立した未タスク仕様書（`docs/30-workflows/unassigned-task/` 配下）が必要である
3. 独立した未タスク仕様書が必要なものについて「未タスク候補リスト」を作成する
4. `outputs/phase-11/manual-test-result.md` に確認結果を追記する

**期待される成果物**: `outputs/phase-11/manual-test-result.md` の「スコープ外未タスク」セクション

---

### タスク4: Phase 3/10 レビュー指摘の照合

**目的**: Phase 3（設計レビュー）と Phase 10（最終レビュー）の MINOR 指摘が、全て記録・追跡されているかを確認する。

**実行手順**:

1. `outputs/phase-3/gate-decision.md` の MINOR 追跡テーブルを読み込み、全 MINOR 指摘の解決状況を確認する
2. `outputs/phase-10/final-review-decision.md` の MINOR 指摘を読み込み、全 MINOR 指摘の解決状況を確認する
3. 「解決済み」の指摘について、解決の証跡（成果物ファイルの更新箇所）が存在するかを確認する
4. 「未解決」または「Phase 12 で対応」となっている指摘の一覧を作成する
5. `outputs/phase-11/manual-test-result.md` に確認結果を追記する

**期待される成果物**: `outputs/phase-11/manual-test-result.md` の「Phase 3/10 レビュー指摘照合」セクション

---

### タスク5: 後続実装タスクへの引き継ぎ情報の整備

**目的**: 本タスクの設計成果物を実装に引き継ぐ際に必要な情報（型定義→実装、契約→テスト）を整理する。

**実行手順**:

1. 以下の引き継ぎカテゴリごとに、後続タスクが必要とする情報を整理する:
   - **型定義→実装**: `SkillVisibility`, `CompatibilityCheckResult`, `PublishReadiness` 等の型定義を実装する際の配置先ファイル（`packages/shared/src/agent/types.ts` 等）と注意事項
   - **契約→テスト**: `SkillRegistryService`, `SkillDistributionService` の各メソッドに対して、統合テストで検証すべき入出力の組み合わせ
   - **UI仕様→コンポーネント**: Skill Center の公開レベルバッジ・フィルタ・フローダイアログの React コンポーネント実装に必要な仕様箇所の参照先
2. 引き継ぎ情報を「後続実装タスクへの引き継ぎテーブル」として整理する
3. `outputs/phase-11/manual-test-result.md` に引き継ぎ情報を追記する

**期待される成果物**: `outputs/phase-11/manual-test-result.md` の「後続実装タスクへの引き継ぎ」セクション

---

### タスク6: 発見事項の整理と Blocker 対応

**目的**: タスク1〜5 で発見した事項を Blocker / Note / Info に分類し、Blocker については即座に対応する。

**実行手順**:

1. 発見事項を以下のテーブルに整理する:

   | #   | シナリオ         | 発見事項         | 分類              | 対応方針           |
   | --- | ---------------- | ---------------- | ----------------- | ------------------ |
   | 1   | 仕様書自己完結性 | （確認後に記入） | Blocker/Note/Info | （対応方針を記入） |

2. 分類基準:
   - **Blocker**: Phase 12 に進めない問題（型定義の重大な不整合、受入基準の未達）
   - **Note**: Phase 12 内で解決すべき改善（命名不一致、ドキュメント不足）
   - **Info**: 情報共有のみ（将来の考慮事項、背景情報）

3. Blocker に分類された事項について、対応策を実施した後に Phase 12 へ進む
4. Note に分類された事項は Phase 12 のタスク内で解決する
5. `outputs/phase-11/discovered-issues.md` に Blocker と Note の詳細を記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（全タスクの確認結果を含む最終報告書）
- `outputs/phase-11/discovered-issues.md`（Blocker と Note の詳細）

---

## 参照資料

| 参照資料                        | パス                                                | 内容                             |
| ------------------------------- | --------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義                | `./phase-1-requirements.md`                         | 受入基準 AC-1〜AC-4              |
| Phase 2 設計                    | `./phase-2-design.md`                               | 型定義・サービスインターフェース |
| Phase 3 設計レビュー            | `./phase-3-design-review.md`                        | MINOR 追跡テーブル               |
| Phase 10 最終レビュー           | `./phase-10-final-review.md`                        | 最終レビュー MINOR 指摘          |
| Phase 2 公開メタデータ設計      | `outputs/phase-2/publishing-metadata-design.md`     | 型定義・StateChart               |
| Phase 2 互換性チェック設計      | `outputs/phase-2/compatibility-check-design.md`     | 判定ロジック                     |
| Phase 2 Skill Center フロー設計 | `outputs/phase-2/skill-center-flow-design.md`       | 登録・更新・停止フロー           |
| Phase 2 配布操作設計            | `outputs/phase-2/distribution-operations-design.md` | import/export/fork/share         |
| Phase 2 公開判定ロジック設計    | `outputs/phase-2/publish-readiness-design.md`       | 判定マトリクス                   |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                    |
| -------------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | 公開前安全性チェック    |
| ui-ux-navigation           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | Skill Center 導線       |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型定義更新先            |
| lessons-learned-current    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | import/share drift 教訓 |

---

## 統合テスト連携

Phase 11 は設計タスクのウォークスルーフェーズであり、実行可能なテストコードは作成しない。ただし、タスク5（後続実装タスクへの引き継ぎ）で作成した「契約→テスト」の引き継ぎ情報が、Phase 4 テスト仕様の入力として活用される。

---

## 成果物

| 成果物                   | パス                                     | 内容                                                |
| ------------------------ | ---------------------------------------- | --------------------------------------------------- |
| ウォークスルー結果報告書 | `outputs/phase-11/manual-test-result.md` | 5つの確認項目の結果・発見事項テーブル・引き継ぎ情報 |
| 発見事項詳細             | `outputs/phase-11/discovered-issues.md`  | Blocker と Note の詳細・対応方針                    |

---

## 完了条件

- [ ] タスク1: 全 Phase 仕様書（phase-1〜phase-10）の自己完結性確認が完了し、発見事項が記録されている
- [ ] タスク2: Phase 2 の5つの型定義と依存タスク（Task06/07）の型との整合確認が完了し、不整合箇所が記録されている
- [ ] タスク3: 全設計書の「将来実装」「TBD」「スコープ外」箇所が列挙され、独立未タスク候補リストが作成されている
- [ ] タスク4: Phase 3/10 の全 MINOR 指摘の解決状況が照合され、未解決一覧が作成されている
- [ ] タスク5: 型定義→実装・契約→テスト・UI仕様→コンポーネントの引き継ぎ情報が整備されている
- [ ] タスク6: 発見事項が Blocker/Note/Info に分類されており、Blocker が 0件であること（または対応済みであること）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されており、全タスクの確認結果が含まれている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されており、Blocker と Note が記録されている

---

## タスク100%実行確認【必須】

| #   | 確認項目                                       | 確認方法                                                                     | 合否基準                                                             |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | 成果物2ファイルが存在する                      | `ls outputs/phase-11/`                                                       | `manual-test-result.md` と `discovered-issues.md` が存在する         |
| 2   | 仕様書自己完結性確認が完了している             | `manual-test-result.md` の「仕様書自己完結性」セクションが存在する           | セクションが存在し、全 Phase の確認結果が記録されている              |
| 3   | 型定義整合確認が完了している                   | `manual-test-result.md` の「型定義整合性」セクションが存在する               | 5つの型定義と Task06/07 との照合結果が記録されている                 |
| 4   | Blocker が解消されている                       | `discovered-issues.md` の Blocker 件数を確認                                 | Blocker が 0件（または全て対応済みと記録されている）                 |
| 5   | 後続実装タスクへの引き継ぎ情報が整備されている | `manual-test-result.md` の「後続実装タスクへの引き継ぎ」セクションが存在する | 型定義→実装・契約→テスト・UI仕様→コンポーネントの3カテゴリが存在する |

---

## 多角的チェック観点（AIが判断）

- 仕様書の自己完結性（依存関係・実行タスク・成果物パス・完了条件）が全 Phase で確認されているか
- 型定義と依存タスク（Task06/07）の型との整合が Phase 5 の確定書と一致しているか
- 「将来実装」「TBD」「スコープ外」箇所が漏れなく列挙されているか
- Phase 3/10 の全 MINOR 指摘が照合され、未解決一覧が正確か
- 後続実装タスクへの引き継ぎ情報が十分か（型定義→実装・契約→テスト・UI仕様→コンポーネント）

---

## サブタスク管理

| #   | タスク名                             | ステータス | 完了基準                      |
| --- | ------------------------------------ | ---------- | ----------------------------- |
| 1   | 仕様書の自己完結性確認               | 未実施     | 全 Phase の確認結果が記録     |
| 2   | 型定義・インターフェースの整合確認   | 未実施     | 5型と Task06/07 の照合完了    |
| 3   | スコープ外の未タスク洗い出し         | 未実施     | 独立未タスク候補リストが作成  |
| 4   | Phase 3/10 レビュー指摘の照合        | 未実施     | 未解決一覧が作成              |
| 5   | 後続実装タスクへの引き継ぎ情報の整備 | 未実施     | 3カテゴリの引き継ぎ情報が存在 |
| 6   | 発見事項の整理と Blocker 対応        | 未実施     | Blocker が 0件                |

---

## 依存関係

- **前提**: Phase 10（最終レビュー）が PASS または MINOR で完了していること
- **後続**: Phase 12（ドキュメント）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（仕様書の自己完結性確認）: （結果を記録）
- タスク2（型定義・インターフェースの整合確認）: （結果を記録）
- タスク3（スコープ外の未タスク洗い出し）: （結果を記録）
- タスク4（Phase 3/10 レビュー指摘の照合）: （結果を記録）
- タスク5（後続実装タスクへの引き継ぎ情報の整備）: （結果を記録）
- タスク6（発見事項の整理と Blocker 対応）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 12: ドキュメント

- 成果物パス: `./phase-12-documentation.md`
- 前提条件: Phase 11 完了条件が全てチェック済みであること（特に Blocker が 0件であること）
- 主な活動:
  - 実装ガイドの作成（2パート構成）
  - システム仕様書の更新（`interfaces-agent-sdk-skill.md` 等）
  - LOGS.md・SKILL.md の更新（2ファイル両方）
  - topic-map.md の再生成
  - 未タスク検出レポートの作成（0件でも必須）
  - スキルフィードバックレポートの作成（改善点なしでも必須）
