# Phase Template Core

## 対象

Phase 1、Phase 2、Phase 3。

## 共通骨格

```md
# Phase {{N}}: {{PHASE_NAME}}

## メタ情報
## 目的
## 実行タスク
## 参照資料
## 実行手順
## 統合テスト連携
## 多角的チェック観点（AIが判断）
## サブタスク管理
## 成果物
## 完了条件
## タスク100%実行確認【必須】
## 次Phase
```

## Phase 1 のポイント

- inventory と source scope の差分を固定する。
- acceptance criteria を番号付きで定義する。
- Phase 1-3 完了前に Phase 4 へ進まない gate を書く。

## Phase 2 のポイント

- concern ごとの target topology を table 化する。
- lane 数は 3 以下に固定する。
- validation matrix を command 単位で定義する。
- DI 境界の型配置判断を明示する（下記フロー参照）。

### concern 数による設計書分割基準（TASK-SKILL-LIFECYCLE-08 知見）

| concern 数 | 推奨構成 |
| --- | --- |
| 1〜2 concern | 単一 `phase-2-design.md` に全て記述 |
| 3〜4 concern | concern ごとにセクション分割（同一ファイル内） |
| 5+ concern | サブタスク分割を検討（`phase-2-design-{concern}.md` 形式） |

- 分割すると Phase 3/10 の指摘が concern 単位で追跡しやすくなる
- 分割後は各設計書に「他 concern との依存境界」を明示する

### DI 境界の型配置判断フロー（Phase 2 設計時に確認）

| 条件 | 配置先 | 例 |
| --- | --- | --- |
| DI 依存型を1つの具象クラスのみで使用 | 具象クラスファイル内に定義 | `DefaultSafetyGateDeps` → `default-safety-gate.ts` |
| DI 依存型を複数の具象クラスで共有 | Port インターフェースと同階層に配置 | `ServiceDeps` → `ports/` ディレクトリ |
| DI 依存型がレイヤー境界をまたぐ | `packages/shared/` に配置 | Main/Renderer 両方で参照する型 |

### IPC ハンドラ設計時の確認項目

- IPC ハンドラの依存先が Port/Interface であること（具象クラスを直接参照しない）
- IPC レスポンス形式（`{ success, error }` ラッパー使用の有無）を設計時点で明示的に決定する

## Phase 3 のポイント

- PASS / MINOR / MAJOR の戻り先を明示する。
- simpler alternative を検討した結果を記録する。
- Phase 4 開始条件と Phase 13 blocked 条件を残す。

### MINOR 追跡テーブル（gate-decision.md 用）

Phase 3 で MINOR 判定された指摘は、以下のテーブルで追跡計画を明示する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------- | ------------- | ------------- | ---- |
| TECH-M-01 | ... | Phase 5 | Phase 9/10 | ... |

- 「解決予定Phase」を Phase 3 時点で決定し、追跡の見通しを立てる
- 「解決確認Phase」は Phase 9（品質検証）または Phase 10（最終レビュー）で記録する
