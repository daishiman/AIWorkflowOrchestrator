# UT-SDK-L34-UI-DISPLAY-001: SkillCreator Layer3/4検証結果のUI表示拡張

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-SDK-L34-UI-DISPLAY-001                                         |
| タスク名     | SkillCreator Layer3/4検証結果のUI表示拡張                         |
| 分類         | feat（UI改善）                                                    |
| 対象機能     | SkillCreator UI (renderer side) - 検証結果表示                    |
| 優先度       | 中                                                                |
| 規模         | 中規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | Phase 11（UT-IMP-SDK-06 Layer3/4 verify拡張テスト実装）           |
| 作成日       | 2026-04-03                                                        |
| 依存タスク   | UT-IMP-SDK-06（完了済み）                                         |
| GitHub Issue | #1820                                                             |
| spec_path    | docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/ |

## タスク概要

`SkillCreatorVerificationEngine`にLayer3/4検証（スキーマ品質・references整合性）が追加されたが、
`SkillLifecyclePanel.tsx`はすべてのchecksをフラットな2列グリッドで表示している。
Layer別グルーピング・アコーディオン折りたたみ・severityアイコン表示を実装し、
ユーザーが検証結果をLayer単位で把握できるUIに拡張する。

## タスク分類

- **UIタスク**: Rendererコンポーネントの追加・変更あり
- **IPC変更なし**: バックエンド（SkillCreatorVerificationEngine）は変更不要
- **テスト対象**: `SkillLifecyclePanel.tsx`コンポーネントテスト

## 実行オーケストレーション

| Lane | 担当           | 実行Phase | 並列性     | 役割                                                             |
| ---- | -------------- | --------- | ---------- | ---------------------------------------------------------------- |
| A    | skill準拠検証  | 1-2       | B と並列可 | 変更分が 2 つの skill 定義に漏れなく準拠しているかを確認する     |
| B    | 多角的思考分析 | 3         | A と並列可 | 30 種の思考法を用いて改善余地と設計の境界を洗い出す              |
| C    | 実装・テスト   | 4-8       | 直列       | TDD に従って UI 改修と回帰防止を進める                           |
| D    | 品質・手動検証 | 9-11      | 一部並列可 | lint / typecheck / screenshot / manual test をまとめて確認する   |
| E    | Phase 12 同期  | 12        | D と並列可 | 実装ガイド、台帳、未タスク、root evidence を同一 wave で同期する |
| F    | PR 準備        | 13        | 直列       | ユーザー承認後にのみ PR 作成へ進む                               |

## 多角的分析方針

Phase 3 では、以下 30 種の思考法を 7 群すべてで少なくとも 1 回は明示的に扱う。

| 群           | 含む思考法                                                           | 主な観点                                     |
| ------------ | -------------------------------------------------------------------- | -------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 因果の妥当性、結論の飛躍、観測からの一般化   |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | 責務分離、網羅性、順序依存、漏れ             |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 前提の妥当性、抽象度、ルール自体の改善       |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | 代替案、既存前提の反転、再構成の余地         |
| システム系   | システム思考、因果関係分析、因果ループ                               | 依存関係、フィードバック、波及効果           |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | 価値最大化、コスト抑制、優先順位             |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 根本原因、改善仮説、論点整理、クラスタリング |

## Phase一覧

| Phase | 名称                 | ステータス | 仕様書                                                       | 成果物                                                                                                                                                                                                                                                                                                   |
| ----- | -------------------- | ---------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義             | 未着手     | [phase-1-requirements.md](phase-1-requirements.md)           | `outputs/phase-1/requirements.md`                                                                                                                                                                                                                                                                        |
| 2     | 設計                 | 未着手     | [phase-2-design.md](phase-2-design.md)                       | `outputs/phase-2/design.md`                                                                                                                                                                                                                                                                              |
| 3     | 設計レビューゲート   | 未着手     | [phase-3-design-review.md](phase-3-design-review.md)         | `outputs/phase-3/design-review.md`                                                                                                                                                                                                                                                                       |
| 4     | テスト作成           | 未着手     | [phase-4-test-creation.md](phase-4-test-creation.md)         | テストファイル群 / `outputs/phase-4/test-design.md`                                                                                                                                                                                                                                                      |
| 5     | 実装                 | 未着手     | [phase-5-implementation.md](phase-5-implementation.md)       | `SkillLifecyclePanel.tsx` 等 / `outputs/phase-5/implementation-summary.md`                                                                                                                                                                                                                               |
| 6     | テスト拡充           | 未着手     | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 追加テストファイル群 / `outputs/phase-6/test-expansion-report.md`                                                                                                                                                                                                                                        |
| 7     | テストカバレッジ確認 | 未着手     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                     |
| 8     | リファクタリング     | 未着手     | [phase-8-refactoring.md](phase-8-refactoring.md)             | `outputs/phase-8/refactoring-report.md`                                                                                                                                                                                                                                                                  |
| 9     | 品質保証             | 未着手     | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | `outputs/phase-9/quality-report.md`                                                                                                                                                                                                                                                                      |
| 10    | 最終レビューゲート   | 未着手     | [phase-10-final-review.md](phase-10-final-review.md)         | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                                |
| 11    | 手動テスト検証       | 未着手     | [phase-11-manual-test.md](phase-11-manual-test.md)           | `outputs/phase-11/manual-test-checklist.md` / `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/ui-sanity-visual-review.md` / `outputs/phase-11/phase11-capture-metadata.json`                                                                     |
| 12    | ドキュメント更新     | 未着手     | [phase-12-documentation.md](phase-12-documentation.md)       | `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | PR作成               | 未着手     | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | `outputs/phase-13/pr-info.md`                                                                                                                                                                                                                                                                            |

## 受け入れ条件

- `verifyDetail.checks`がLayer1/Layer2/Layer3/Layer4にグルーピングされて表示される
- 各Layerグループはアコーディオン（折りたたみ可能）で表示される
- severityアイコン（✓/⚠/✗）が各checkに表示される
- Layerヘッダーに集計バッジ（error/warning/infoの件数）が表示される
- checksが空のLayerグループは表示されない
- 既存のLayer1/2表示が壊れない（後方互換性確保）
- TypeScriptコンパイルエラーなし
- コンポーネントテストが全パス

## 関連ファイル

| ファイル                                                                                           | 役割                         |
| -------------------------------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | メイン変更対象（checks表示） |
| `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`                                  | 新規（分離する場合）         |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | テスト更新対象               |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト更新対象               |
| `packages/shared/src/types/skillCreator.ts`                                                        | 型定義参照（変更不要）       |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                         | バックエンド参照（変更不要） |

## 変更履歴

| Date       | 変更内容             |
| ---------- | -------------------- |
| 2026-04-03 | タスク仕様書初版作成 |
