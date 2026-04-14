# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 1                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | -                                                  |
| 後続Phase  | Phase 2                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

`SkillScanner.ts` と `init_skill.js` の 2 箇所に分散している正規表現 `/^[a-z0-9]+(-[a-z0-9]+)*$/` の現状を調査し、`packages/shared` への一元化に向けた受け入れ基準を確定する。本タスクは NON_VISUAL タスク（UI 変更なし）として分類されることを明記する。

## 背景

TASK-FIX-IPC-SKILL-NAME-001（2026-04-06）での修正作業中に、スキル名バリデーション正規表現が以下の 2 箇所に独立して定義されていることが判明した：

1. `apps/desktop/src/main/claude-cli/SkillScanner.ts` の `validateSkillName()` メソッドコメント内
2. `.claude/skills/skill-creator/scripts/init_skill.js` の `validateSkillName()` 関数内

この分散状態では、正規表現ルールを変更する際に両ファイルを個別に修正しなければならず、片方の更新漏れによるバリデーション不整合リスクが生じる。

## NON_VISUAL タスク分類

本タスクはリファクタリングタスクであり、以下の点で NON_VISUAL に分類される：

- ユーザー向け UI 変更なし
- 画面レイアウト・スタイル変更なし
- 既存の動作仕様に変更なし（バリデーションルール自体は同一）
- 内部実装の整理・一元化のみ

## SubAgent チーム編成

| SubAgent   | 関心ごと            | 主担当                                       |
| ---------- | ------------------- | -------------------------------------------- |
| SubAgent-A | shared 定数設計     | packages/shared の定数構造・エクスポート設計 |
| SubAgent-B | TypeScript 参照更新 | SkillScanner.ts の import・参照変更          |
| SubAgent-C | ESM 参照更新        | init_skill.js の import・参照変更            |
| SubAgent-D | 統合監査            | 矛盾・漏れ・整合・依存判定・ビルド設定確認   |

## 実行タスク

- 現状調査: 2 箇所の正規表現定義を照合し、内容が同一であることを確認する
- NON_VISUAL 分類確認: スコープが UI 変更を含まないことを明示する
- packages/shared ビルド設定調査: CJS/ESM 両方でエクスポートされるか確認する
- 受け入れ基準確定: 一元化後の品質基準を定義する

## 参照資料

### 実装・コード

| 資料名                  | パス                                                 | 用途                                         |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------- |
| SkillScanner.ts         | `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | validateSkillName() の正規表現コメントを確認 |
| init_skill.js           | `.claude/skills/skill-creator/scripts/init_skill.js` | validateSkillName() の正規表現定義を確認     |
| shared 定数インデックス | `packages/shared/src/constants/index.ts`             | 既存エクスポート構成を確認                   |
| shared package.json     | `packages/shared/package.json`                       | CJS/ESM エクスポートフィールドを確認         |
| tsup.config.ts          | `packages/shared/tsup.config.ts`                     | ビルド設定（CJS/ESM 両対応）を確認           |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                                        | 用途                       |
| -------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止               |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート基準             |
| タスク運用     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール・分類ルール |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見               |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | shared 定数パターン        |
| 検索スクリプト | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                             | 仕様抽出コマンド           |

## 実行手順

1. `SkillScanner.ts` の `validateSkillName()` メソッドと `init_skill.js` の `validateSkillName()` 関数を読み込み、正規表現の文字列が完全に一致することを確認する。
2. `packages/shared/src/constants/index.ts` と `packages/shared/package.json`、`tsup.config.ts` を調査し、新規ファイル `skillName.ts` を追加したときに CJS/ESM 両方でビルド・エクスポートされるかを確認する。
3. `init_skill.js` が Node.js ESM 環境で動作するスクリプトであることを確認し、`import '@repo/shared/constants'` でインポートできるかを検証方針として記録する。
4. NON_VISUAL タスク分類の根拠を箇条書きで文書化し、スコープ定義書に明記する。
5. 調査結果をもとに受け入れ基準（AC）を確定し、「2 箇所の正規表現削除 → 定数参照への置き換え → ビルド成功 → テスト全通過」を判定基準として文書化する。

## 統合テスト連携

- SubAgent-A が shared 定数の構造を設計し、SubAgent-B/C が並列で参照箇所を洗い出す。
- SubAgent-D が CJS/ESM 互換性と後方互換性を統合判定する。
- ビルド成功・既存テスト全通過を統合完了条件に固定する。
- 統合ログは `outputs/phase-1/` に保存する。

## 多角的チェック観点（30 思考法）

| カテゴリ     | 思考法               | 確認内容                                                       |
| ------------ | -------------------- | -------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | 前提の弱さや、正規表現の共通化以外に必要な条件がないか確認する |
| 論理分析系   | 演繹思考             | skill 定義 → current diff → 準拠可否の順で結論を出す           |
| 論理分析系   | 帰納的思考           | 2 つの実装から共通パターンを抽出し、単一ルールへまとめる       |
| 論理分析系   | アブダクション       | いま起きている分散の最も妥当な原因を仮説として立てる           |
| 論理分析系   | 垂直思考             | 正規表現の差異が将来的にバグになる経路を掘り下げる             |
| 構造分解系   | 要素分解             | 定数、参照先、ビルド、検証を最小単位に分解する                 |
| 構造分解系   | MECE                 | 検証項目が漏れなく重複なく網羅されているか確認する             |
| 構造分解系   | 2 軸思考             | 影響度 × 変更頻度で一元化の優先度を確認する                    |
| 構造分解系   | プロセス思考         | 調査 → 設計 → 実装 → 検証の流れを固定する                      |
| メタ・抽象系 | メタ思考             | 「なぜこのタスクを今やるか」を上位目的から見直す               |
| メタ・抽象系 | 抽象化思考           | 個別の正規表現問題を「定数の所有権」問題として抽象化する       |
| メタ・抽象系 | ダブル・ループ思考   | 手順だけでなく、判断基準自体が妥当かも見直す                   |
| 発想・拡張系 | ブレインストーミング | 代替案を広く出し、定数以外の設計案も比較する                   |
| 発想・拡張系 | 水平思考             | 他に分散している定数がないか横断調査する                       |
| 発想・拡張系 | 逆説思考             | 一元化しないとどのような問題が起きるかを列挙する               |
| 発想・拡張系 | 類推思考             | security.ts の定数一元化パターンと比較する                     |
| 発想・拡張系 | if 思考              | CJS ビルドが失敗した場合の代替手段を列挙する                   |
| 発想・拡張系 | 素人思考             | 初見の開発者がどちらを信頼源と見なすかを想定する               |
| システム系   | システム思考         | shared → desktop → scripts の依存方向を確認する                |
| システム系   | 因果関係分析         | 定数の分散が保守コストにどう波及するかを確認する               |
| システム系   | 因果ループ           | 一元化により生じうる循環依存を検査する                         |
| 戦略・価値系 | トレードオン思考     | ビルド設定変更コストと分散リスクを比較する                     |
| 戦略・価値系 | プラスサム思考       | Desktop・Scripts 両チームが恩恵を受ける設計を選ぶ              |
| 戦略・価値系 | 価値提案思考         | 単一信頼源によるメンテナンスコスト削減を定量化する             |
| 戦略・価値系 | 戦略的思考           | 短期修正（定数移動）と中期運用（ルール策定）を分離する         |
| 問題解決系   | why 思考             | なぜ 2 箇所に分散したかの経緯を確認する                        |
| 問題解決系   | 改善思考             | 定数追加ルールを CLAUDE.md に記載する再発防止策を検討する      |
| 問題解決系   | 仮説思考             | 「正規表現は同一」という仮説を検証し反証がないか確認する       |
| 問題解決系   | 論点思考             | 「移動先」「移動方法」「互換性」を排他的に分解する             |
| 問題解決系   | KJ法                 | 分散・互換性・検証コストの論点をクラスタリングする             |

## 成果物

| 成果物         | パス                                         | 説明                                        |
| -------------- | -------------------------------------------- | ------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・NON_VISUAL 分類の明記 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC 一覧                          |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        | 変更範囲・対象外範囲・タスク分類の文書化    |

## 完了条件

- [ ] 2 箇所の正規表現が `/^[a-z0-9]+(-[a-z0-9]+)*$/` で同一であることを確認
- [ ] `packages/shared` の CJS/ESM ビルド設定が新規ファイルを受け入れ可能であることを確認
- [ ] NON_VISUAL タスク分類の根拠が文書化されていること
- [ ] 受け入れ基準が矛盾なし・漏れなしの状態で固定されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 参照資料（SkillScanner.ts / init_skill.js / shared 定数）の確認
2. SubAgent-A/B/C の並列調査作業
3. SubAgent-D の統合判定（ビルド設定・CJS 互換性）
4. 成果物出力
5. 完了条件判定

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次の Phase

Phase 2: 設計
