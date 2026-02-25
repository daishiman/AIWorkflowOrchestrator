# Phase 1 要件定義書

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-A

## 目的

Phase 12 の仕様更新で発生した以下3課題を再発防止する。

1. baseline/current 判定混同
2. 完了移管後の `unassigned-task/` 参照残存
3. 通常経路と fallback 経路の片側更新

## 機能要件（FR）

- FR-1: 未タスク参照リンク同期ルール
  - FR-1.1 `verify-unassigned-links.js` 実行で参照切れ0件
  - FR-1.2 完了時に残課題テーブルを更新
  - FR-1.3 完了時に関連参照を完了側へ移動
  - FR-1.4 残課題テーブルと `unassigned-task/` の1:1対応
- FR-2: 3点同期チェックリスト
  - FR-2.1 更新順序: `task-workflow.md` → `SKILL.md` x2 → `LOGS.md` x2
  - FR-2.2 ファイル単位チェックボックス化
  - FR-2.3 LOGS 2ファイル明示
  - FR-2.4 SKILL 2ファイル明示
- FR-3: 苦戦箇所の未タスク転記手順
  - FR-3.1 3ステップ定義
  - FR-3.2 P3準拠（指示書→残課題→参照リンク）
  - FR-3.3 0件時も「苦戦箇所なし」を明記
- FR-4: baseline/current 判定分離
  - FR-4.1 判定基準明文化
  - FR-4.2 baseline は既存課題として記録
  - FR-4.3 current は今回修正必須

## 非機能要件（NFR）

- NFR-1 再現性
  - NFR-1.1 同種課題を20分以内に特定
  - NFR-1.2 各手順にコマンドまたは対象ファイル明記
- NFR-2 検証効率
  - NFR-2.1 `verify-unassigned-links.js` 3分以内
  - NFR-2.2 `generate-index.js` 2分以内
  - NFR-2.3 3コマンドを1セクションへ集約
- NFR-3 明確性
  - NFR-3.1 曖昧表現禁止
  - NFR-3.2 「何を/どこで/どう確認」を全項目で明記
  - NFR-3.3 正常時・異常時の期待出力を明記

## 実行ログ

- SubAgent-A: 参照資料抽出、FR/NFR整理、ACへの入力定義
- SubAgent-D: Phase 12運用観点（P1/P2/P3/P4/P25/P27/P29）を要件にマッピング

## 判定

- 要件定義: 完了
- 次フェーズ入力: `outputs/phase-2/architecture-design.md`
