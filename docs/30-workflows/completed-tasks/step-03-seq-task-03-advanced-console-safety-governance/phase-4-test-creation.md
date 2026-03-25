# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 4                                               |
| Phase名    | テスト作成                                      |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-3                                       |
| 後続Phase  | Phase 5（実装）                                 |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval、disclosure、manual boundary、advanced console opt-in のテスト仕様を定義する。

## 実行タスク

- approval case 作成
- disclosure case 作成
- no auto-send case 作成
- advanced console opt-in case 作成

## 参照資料

| 参照資料    | パス                             | 内容           |
| ----------- | -------------------------------- | -------------- |
| 依存Phase 1 | `phase-1-requirements.md`        | 要件定義       |
| 依存Phase 2 | `phase-2-design.md`              | 設計           |
| 依存Phase 3 | `phase-3-design-review.md`       | 設計レビュー   |
| root pack   | `../../phase-4-test-creation.md` | 上位テスト方針 |

## 実行手順

### ステップ1: テスト対象の設計成果物を精読する

Phase 1-3の成果物（FR/NFR/AC、compliance baseline、設計書）からテスト観点を抽出する。

### ステップ2: テストマトリクスとthreat modelを作成する

テストカテゴリ（approval、disclosure、advanced console、compliance、integration、edge case）ごとにテストケースを定義する。

### ステップ3: Pitfall準拠チェックを行う

P39(happy-dom)、P40(テスト実行ディレクトリ)、P47(CSS変数)、P48(non-null assertion)の注意事項を確認する。

## 統合テスト連携

approval表示、disclosure表示、advanced console opt-in、no auto-send の4観点でテストケースを定義。

## 成果物

| 成果物                 | パス                                        | 説明                |
| ---------------------- | ------------------------------------------- | ------------------- |
| テストマトリクス       | `outputs/phase-4/test-matrix.md`            | ケース一覧          |
| threat model checklist | `outputs/phase-4/threat-model-checklist.md` | abuse / misuse 観点 |

## 多角的チェック観点（AIが判断）

- compliance / security / UX の3観点でクロスチェック実施

## サブタスク管理

本Phaseの全サブタスクは完了済み。

## タスク100%実行確認【必須】

- [x] 全実行タスクを100%完了した
- [x] 成果物が全て `outputs/phase-4/` に存在する
- [x] 完了条件を全て満たした

## 完了条件

- [ ] approval と disclosure の両方に test case がある
- [ ] no auto-send の negative case がある
- [ ] advanced console opt-in の case がある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
