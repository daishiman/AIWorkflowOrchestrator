# Phase 2: 設計

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| Phase名    | 設計                             |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| ステータス | pending                          |
| 作成日     | 2026-03-05                       |
| 機能名     | task-056a-a-store-slice-baseline |

## 目的

Slice棚卸し結果を再利用可能な設計フォーマットへ落とし込み、境界判定を機械的に追跡できる形へ変換する。

## 実行タスク

- 台帳設計: Slice Inventoryの列定義を固定
- 境界設計: 新規/拡張/非対象判定マトリクスを設計
- 規約設計: 個別セレクタと命名規約を設計

## 参照資料

| 参照資料           | パス                                                                                        | 内容                    |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------- |
| 要件定義書         | `./phase-1-requirements.md`                                                                 | FR/NFR                  |
| 状態管理パターン   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Slice構成、個別セレクタ |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 命名と型同期            |
| アーキテクチャ総論 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Slice Isolation         |

## 実行手順

### Step 1: Slice Inventoryフォーマット設計

- 列を `sliceName / state / actions / selectors / persistence / ownerView` で固定する。
- 出力例を1件記述し、記載粒度を統一する。

### Step 2: 境界判定マトリクス設計

- 判定種別を `new / extend / no-change / local-useState` で固定する。
- 判定理由を1行で記載する規約を定義する。

### Step 3: セレクタ規約設計

- 合成Hook非推奨を明記する。
- `use{Verb}{Domain}` 命名規約を固定する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                       |
| ---------------- | ------------------------------ |
| API接続          | IPC未変更を明示                |
| 認証フロー       | Auth Slice境界の不変条件を明示 |
| データフロー     | Selector経由での参照安定を明示 |

## 成果物

| 成果物             | パス                                        | 内容             |
| ------------------ | ------------------------------------------- | ---------------- |
| 設計書             | `outputs/phase-2/slice-inventory-design.md` | Inventory列定義  |
| 境界マトリクス設計 | `outputs/phase-2/slice-boundary-design.md`  | 判定ルール       |
| セレクタ規約       | `outputs/phase-2/selector-policy-design.md` | 命名と非推奨規約 |

## 完了条件

- [ ] Inventory列定義が固定済み
- [ ] 境界判定種別が固定済み
- [ ] 命名規約と非推奨規約が定義済み
- [ ] 後続Phaseが参照できる成果物パスが定義済み

## 次のPhase

Phase 3: 設計レビューゲート
