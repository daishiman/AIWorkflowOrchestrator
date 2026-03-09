# Phase 11: 発見課題・改善提案

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| タスク | TASK-10A-F Store-Driven Lifecycle UI |
| Phase  | 11（手動テスト検証）                 |
| 実施日 | 2026-03-09                           |

## 1. 発見課題

### 課題数: 0件

`TC-11-01` から `TC-11-08` の実画面確認では、ブロッキング課題も major 課題も検出されなかった。

## 2. 改善提案（MINOR）

### M-01: SkillAnalysisView の成功フィードバック強化

- **現状**: `applySkillImprovements` と `autoImproveSkill` 成功後は分析結果の再描画で完了を表現している
- **影響**: 画面変化に気づきにくいケースでは成功が伝わりづらい
- **提案**: インライン status か toast で成功通知を追加する
- **優先度**: 低

### M-02: GenerateStep のリカバリ導線追加

- **現状**: 生成失敗時は error 表示のみで、設定画面へ戻る導線がない
- **影響**: ユーザーがやり直し時にウィザード全体を閉じる必要がある
- **提案**: `GenerateStep` に `設定へ戻る` と `再試行` の少なくとも一方を追加する
- **優先度**: 中

### M-03: current workflow 向け screenshot 正規化の自動化

- **現状**: capture script の素材ファイル名と current workflow の `TC-11-*` 命名が一致せず、再配置が必要だった
- **影響**: screenshot は取得できても Phase 11 台帳との同期で手作業が入る
- **提案**: current workflow 専用 wrapper script または rename manifest を追加し、`manual-test-result.md` と artifact registry を自動生成する
- **優先度**: 低

## 3. 結論

ブロッキング課題は 0 件。改善提案 3 件はいずれも既存体験や証跡運用の磨き込みであり、本タスクの完了判定は維持する。
