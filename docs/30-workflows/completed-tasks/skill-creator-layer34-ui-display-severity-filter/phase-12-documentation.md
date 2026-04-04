# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 12                                               |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

ドキュメント更新・仕様反映・未タスク検出。Phase 11 の visual capture と `outputs/phase-11` の screenshot refs を phase 12 に反映する。

## 必須タスク（5タスク + コンプライアンスチェック）

### Task 12-1: implementation-guide.md

- **Part 1: 中学生レベルの説明**
  - severity フィルタとは何か
  - なぜ必要か（情報量が多いときに重要な問題を見つけやすくする）
  - 日常生活での例え話を必ず含める
  - 専門用語は使わず、使う場合はその場で説明する
  - 「なぜ必要か」を先に説明してから「何をするか」を説明する
  - 具体的な使い方（ボタンを押すとフィルタが切り替わる）
- **Part 2: 技術詳細**
  - 変更ファイル一覧（`SkillLifecyclePanel.tsx`, `SkillLifecyclePanel.test.tsx`）
  - 型定義・関連定数（`SeverityFilterLevel`, `SEVERITY_FILTER_OPTIONS`, `severityFilterButtonStyles`）
  - データフロー（state → useMemo → filteredData → UI）
  - API シグネチャと使用例
  - エラーハンドリングとエッジケース
  - 設定可能なパラメータと定数一覧
  - テスト結果サマリー
- **Part 3: 画面証跡**
  - `outputs/phase-11/screenshots/*` の参照
  - phase 11 visual capture の実施方法
- **出力先**: `outputs/phase-12/implementation-guide.md`

### Task 12-2: system-spec-update-summary.md

- **Step 1-A**: タスク完了記録（UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001 → completed）
  - 関連ドキュメントリンク、変更履歴、`LOGS.md` ×2、`topic-map.md` を同 wave で更新する
- **Step 1-B**: 実装状況更新（ステータスを completed に変更）
- **Step 1-C**: 関連タスクテーブル（依存元 UT-SDK-L34-UI-DISPLAY-001 との関係）
- **Step 2**: 新規インターフェースなし（`SeverityFilterLevel` は内部型のため仕様書更新不要）
- **出力先**: `outputs/phase-12/system-spec-update-summary.md`

### Task 12-3: documentation-changelog.md

- 変更ファイル一覧
- 各 Step の実行結果記録
- phase 11 screenshot coverage / checklist / metadata への参照
- **出力先**: `outputs/phase-12/documentation-changelog.md`

### Task 12-4: unassigned-task-detection.md

- スコープ外項目スキャン
- Phase 3/10 で MINOR 判定された事項の確認
- コード内 `TODO` / `FIXME` / `HACK` / `XXX` スキャン
- 0件でもサマリーを出力すること
- **出力先**: `outputs/phase-12/unassigned-task-detection.md`

### Task 12-5: skill-feedback-report.md

- テンプレート・ワークフロー・ドキュメントの改善点
- 改善点なしでも出力必須
- **出力先**: `outputs/phase-12/skill-feedback-report.md`

### Task 12-6: phase12-task-spec-compliance-check.md

- Task 12-1〜12-5 の全完了確認
- 各タスクの PASS/FAIL 判定
- screenshot refs を含む implementation guide の確認
- **出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 成果物ファイル名照合

| テンプレート名       | 正しいファイル名                      |
| -------------------- | ------------------------------------- |
| 実装ガイド           | implementation-guide.md               |
| 仕様書更新サマリー   | system-spec-update-summary.md         |
| ドキュメント更新履歴 | documentation-changelog.md            |
| 未タスク検出レポート | unassigned-task-detection.md          |
| スキルフィードバック | skill-feedback-report.md              |
| 準拠チェック         | phase12-task-spec-compliance-check.md |

## 完了条件

- [x] implementation-guide.md（Part 1 + Part 2 + screenshot refs）が存在
- [x] system-spec-update-summary.md が存在
- [x] documentation-changelog.md が存在
- [x] unassigned-task-detection.md が存在
- [x] skill-feedback-report.md が存在
- [x] phase12-task-spec-compliance-check.md で全タスク PASS
- [x] planned wording 残存なし
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次のPhase

Phase 13: PR作成
