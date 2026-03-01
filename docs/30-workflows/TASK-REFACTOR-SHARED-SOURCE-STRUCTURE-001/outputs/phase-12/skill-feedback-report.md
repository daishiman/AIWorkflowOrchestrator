# Phase 12 スキルフィードバックレポート

## 監査対象

- `task-specification-creator`
- `aiworkflow-requirements`

## 改善点

### 1. Phase必須セクション漏れの早期検出

- 症状: Phase 3/5/8/10/11 で `統合テスト連携` セクションが欠落していた。
- 改善提案: `generate-task-specs` の段階で、Phase 1〜11 は見出しを強制生成するルールを追加する。

### 2. 依存Phase参照漏れの検出精度向上

- 症状: `verify-all-specs` で依存成果物の参照不足警告が複数発生した。
- 改善提案: dependencies から期待参照を自動展開し、参照資料テーブルの雛形を生成する。

### 3. aiworkflow-requirements 抽出の明文化

- 症状: Phase本文に「どの仕様から何を抽出したか」が明示されていなかった。
- 改善提案: Phase 1/2 の outputs に「抽出結果テーブル」を標準項目として追加する。

## 改善不要だった点

- Phase 12 の Step 1-A〜1-G / Step 2 の骨格は整っていた。
- 未タスク検出の 0 件出力ルールと baseline/current 分離ルールは既存仕様に準拠していた。

## 次回適用方針

1. 仕様書生成直後に `validate-phase-output` を必須実行する。
2. `verify-all-specs` の警告は放置せず、参照資料の不足を同一ターンで解消する。
3. aiworkflow 参照は「ファイル名」だけでなく「抽出した判断根拠」を outputs に残す。
