# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 8                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

再発防止ガイドと workflow 文書から冗長さを減らし、運用で迷わない構造に整える。

## 実行タスク

- docs の重複削減
- fallback 順序の明確化
- workflow / artifacts の整合調整

## 参照資料

| 資料名         | パス                                                 | 説明         |
| -------------- | ---------------------------------------------------- | ------------ |
| 設計           | `phase-2-design.md`                                  | 元の復旧設計 |
| 実装           | `phase-5-implementation.md`                          | 復旧フロー   |
| テスト拡充     | `phase-6-test-expansion.md`                          | 周辺検証結果 |
| カバレッジ確認 | `phase-7-coverage-check.md`                          | AC 証跡      |
| 再発防止ガイド | `docs/40-guides/esbuild-arch-mismatch-prevention.md` | docs 成果物  |

## 実行手順

### Step 1: 冗長削減

- arm64 固定表現を残さない
- 第一候補、第二候補、第三候補の順序を維持する
- docs と phase 本文で同じ説明を二重化しない

### Step 2: 運用整合

- `artifacts.json` と各 phase の成果物名を一致させる
- Phase 12 / 13 の境界を再確認する

## 統合テスト連携

- リファクタリング後も Phase 5〜7 の観測点が変わらないことを確認する。

## 成果物

| 成果物               | パス                                    | 説明         |
| -------------------- | --------------------------------------- | ------------ |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | 文書整理結果 |

## 完了条件

- [ ] 冗長な説明を削減した
- [ ] fallback 順序を明確化した
- [ ] artifacts と phase 本文を一致させた
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
