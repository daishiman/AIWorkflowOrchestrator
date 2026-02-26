# 要件定義書

## メタ情報

| 項目     | 値                                                                           |
| -------- | ---------------------------------------------------------------------------- |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                   |
| タスク名 | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御） |
| Phase    | 1                                                                            |
| 作成日   | 2026-02-26                                                                   |
| GitHub   | #910                                                                         |

## 1. 現状調査結果サマリ

### 1.1 検証経路の現状

`quick_validate` には2つの実行経路が存在する:

| 経路         | スクリプト          | 配置場所                                                                                | 判定粒度                  |
| ------------ | ------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| primary候補  | `quick_validate.js` | `.claude/skills/skill-creator/scripts/quick_validate.js`（repo内）                      | 3段階: Pass/Warning/Error |
| fallback候補 | `quick_validate.py` | `/Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py`（.codex配下） | 2段階: Pass/Fail          |

### 1.2 4軸差分サマリ

| 軸               | 結論                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| 検証項目         | `.js` は8検証項目、`.py` は7検証項目。`.js` がより包括的             |
| 判定粒度         | `.js` は Pass/Warning/Error の3段階、`.py` は Pass/Fail の2段階      |
| 出力フォーマット | `.js` は構造化テキスト、`.py` は単一行。`.js` が情報量で優位         |
| 実行環境         | `.js` は repo 内でバージョン管理可能。`.py` は .codex 配下で管理不可 |

詳細: `outputs/phase-1/validation-path-diff.md`

### 1.3 仕様書参照の混在状況

- `spec-update-workflow.md`: `.py`（Step 1-G.3）と `.js`（必須更新ファイル欄）が混在
- `phase-11-12-guide.md`: `.js` のみだが、ObsidianMemo プロジェクトの絶対パスを使用
- いずれの仕様書も、本 repo 内の `.js` パスを正しく参照していない

### 1.4 Warning 発生状況

| スキル名                   | Error | Warning | 主な Warning 原因                                       |
| -------------------------- | ----- | ------- | ------------------------------------------------------- |
| aiworkflow-requirements    | 0     | 151     | references リンク切れ（149件）+ description 警告（2件） |
| task-specification-creator | 0     | 1       | references リンク切れ（1件）                            |
| skill-creator              | 0     | 27      | references リンク切れ（27件）                           |

詳細: `outputs/phase-1/warning-classification.md`

## 2. 機能要件（FR）

| FR-ID  | 要件                                                                                         | 優先度 | 分類        |
| ------ | -------------------------------------------------------------------------------------------- | ------ | ----------- |
| FR-001 | Phase 12 の検証コマンドとして `quick_validate.js`（repo配下）を正規経路（primary）に指定する | 高     | 経路統一    |
| FR-002 | `quick_validate.py`（.codex配下）を補助経路（fallback）として位置付け、使用条件を限定する    | 高     | 経路統一    |
| FR-003 | `spec-update-workflow.md` の Step 1-G 検証コマンドを正規経路に統一する                       | 高     | 仕様書更新  |
| FR-004 | `phase-11-12-guide.md` の検証コマンド参照を正規経路に統一する                                | 中     | 仕様書更新  |
| FR-005 | Warning を3段階（許容 / 要監視 / 要対応）に分類するルールを定義する                          | 高     | Warning運用 |
| FR-006 | 検証結果の判定基準を「Error 0件で合格、Warning は分類に基づき対応」と明文化する              | 高     | 判定基準    |
| FR-007 | `aiworkflow-requirements` の参照リンク Warning に対する運用ルール（許容条件）を定義する      | 中     | Warning運用 |

## 3. 非機能要件（NFR）

| NFR-ID  | 要件                                                                                           | 優先度 | 分類           |
| ------- | ---------------------------------------------------------------------------------------------- | ------ | -------------- |
| NFR-001 | 再現性: 同一入力に対して同一の検証結果を出力する（実行環境・タイミングに依存しない）           | 高     | 信頼性         |
| NFR-002 | 可読性: 検証結果の出力で Error / Warning / Pass が一目で識別できる                             | 中     | ユーザビリティ |
| NFR-003 | 保守性: 検証ルールの追加・変更が `quick_validate.js` の1ファイルで完結する                     | 中     | 保守性         |
| NFR-004 | 実行速度: 全3スキルの検証が合計30秒以内に完了する                                              | 中     | 性能           |
| NFR-005 | 後方互換: 既存の `quick_validate.js` の Error 判定を変更しない（Warning の再分類のみ許容する） | 高     | 互換性         |

## 4. 受け入れ基準（AC）

| AC-ID  | 受け入れ基準                                                                      | 検証方法                                                                    | 対応要件         |
| ------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------- |
| AC-001 | `spec-update-workflow.md` の検証コマンドが全て `quick_validate.js` を指定している | `grep -c "quick_validate.py" spec-update-workflow.md` が 0 を返す           | FR-001, FR-003   |
| AC-002 | `phase-11-12-guide.md` の検証コマンドが全て `quick_validate.js` を指定している    | `grep -c "quick_validate.py" phase-11-12-guide.md` が 0 を返す              | FR-001, FR-004   |
| AC-003 | Warning 3段階分類ルールが文書化されている                                         | `spec-update-workflow.md` に「許容 / 要監視 / 要対応」セクションが存在する  | FR-005           |
| AC-004 | `quick_validate.js` を3スキルに対して実行し、Error 0件で終了する                  | 終了コード 0（SUCCESS）を返す                                               | FR-006, NFR-001  |
| AC-005 | `aiworkflow-requirements` の参照リンク Warning に対する許容条件が明記されている   | `spec-update-workflow.md` に対象 Warning パターンと許容理由が記載されている | FR-007           |
| AC-006 | 同一スキルに `.js` と `.py` を実行した際、Error 判定が一致する                    | Task 1 の比較結果で Error 項目の一致率 100%                                 | NFR-001, NFR-005 |
| AC-007 | `.js` を正規経路、`.py` を補助経路とする位置づけが文書化されている                | `spec-update-workflow.md` に優先順位と使い分け条件が記載                    | FR-001, FR-002   |
| AC-008 | 検証結果で Error / Warning / Pass が一目で識別できる                              | `--verbose` 出力に `✓`/`⚠`/`✗` プレフィックスが付いている                   | NFR-002          |
| AC-009 | 検証ルールの追加・変更が1ファイルで完結する                                       | `quick_validate.js` の構造が単一関数で完結している                          | NFR-003          |
| AC-010 | 全3スキルの検証が合計30秒以内に完了する                                           | `time` コマンドで計測                                                       | NFR-004          |
| AC-011 | 仕様書内の `.js` パスが repo 内パスで記載されている                               | `grep -c "ObsidianMemo" spec-update-workflow.md` が 0 を返す                | FR-003           |

詳細: `outputs/phase-1/acceptance-criteria.md`

## 5. 優先度分類

| 優先度 | 要件                                   | 理由                                             |
| ------ | -------------------------------------- | ------------------------------------------------ |
| 高     | FR-001, FR-002, FR-003, FR-005, FR-006 | タスクの主目的（経路統一・判定基準明確化）に直結 |
| 高     | NFR-001, NFR-005                       | 再現性と後方互換性は品質の根幹                   |
| 中     | FR-004, FR-007                         | 運用品質の向上（必須だが緊急度は低い）           |
| 中     | NFR-002, NFR-003, NFR-004              | 開発者体験の改善                                 |

## 6. Warning 分類表

| 分類   | 定義                                                | 対応基準             | 該当件数 |
| ------ | --------------------------------------------------- | -------------------- | -------- |
| 許容   | 運用上無害、放置可（Progressive Disclosure 起因等） | 対応不要             | 176件    |
| 要監視 | 件数増加に応じて対応が必要になる可能性あり          | 定期レビュー時に確認 | 3件      |
| 要対応 | 放置すると品質低下やオペレーションミスにつながる    | 検出 Phase 内で修正  | 0件      |

詳細: `outputs/phase-1/warning-classification.md`

## 7. スコープ外

| 除外項目                                             | 理由                                   |
| ---------------------------------------------------- | -------------------------------------- |
| 全 Warning の即時ゼロ化                              | 大量の既存資産を含むため段階対応       |
| `aiworkflow-requirements/references/*.md` の全面再編 | 本タスクの目的外                       |
| 無関係なスキルの構造変更                             | 検証ゲート整合化のみが対象             |
| `quick_validate.js` のコード変更                     | 改善案の定義のみ。コード変更は別タスク |
| `quick_validate.py` の機能追加・修正                 | .codex 配下のスクリプトは管理外        |

詳細: `outputs/phase-1/scope-definition.md`

## 8. 検証経路統一の方針（Phase 2 への引き継ぎ）

Phase 1 の分析結果から、以下の方針を Phase 2 に引き継ぐ:

1. **正規経路**: `quick_validate.js`（repo 内、バージョン管理可能、3段階判定）
2. **補助経路**: `quick_validate.py`（.codex 配下、Node.js 未対応環境のフォールバック）
3. **使い分け条件**: Node.js が利用可能な環境では `.js` を使用。Node.js が利用不可の環境でのみ `.py` を使用
4. **仕様書のパス修正**: ObsidianMemo パスを repo 内パスに統一
5. **Warning 運用**: 3段階分類を `spec-update-workflow.md` に統合

## 9. Phase 間連携

| 連携先Phase | 引き継ぎ事項                                         |
| ----------- | ---------------------------------------------------- |
| Phase 2     | 検証経路階層設計、Warning 運用ルール設計、改善案定義 |
| Phase 3     | 要件の妥当性検証（本書が入力）                       |
| Phase 4     | テストケース設計（AC が入力）                        |
| Phase 5     | 仕様書実装（FR/NFR が入力）                          |
