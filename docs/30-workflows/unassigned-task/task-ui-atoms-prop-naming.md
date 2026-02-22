# UT-UI-ATOMS-PROP-NAMING-001: RelativeTime Props命名統一（updateInterval → refreshInterval）

## メタ情報

| 項目         | 値                                                                       |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-UI-ATOMS-PROP-NAMING-001                                              |
| タスク名     | RelativeTime Props命名統一（仕様書updateInterval → 実装refreshInterval） |
| 優先度       | 低                                                                       |
| 複雑度       | trivial                                                                  |
| 発見元       | TASK-UI-00-ATOMS Phase 10 MINOR指摘 M-1                                  |
| 依存タスク   | なし                                                                     |
| ブロック対象 | なし                                                                     |

## 目的

RelativeTimeコンポーネントの仕様書（00-2-atoms-components.md）に記載されたProps名 `updateInterval` と実装側の Props名 `refreshInterval` の不一致を解消する。機能に影響はないが、仕様書と実装の命名差異は将来のメンテナンスで混乱を招くため統一する。

## Why（なぜ必要か）

- 仕様書と実装の命名不一致はコードレビュー時の混乱を招く
- 新規開発者が仕様書を参照して `updateInterval` を使おうとしたときに動作せず、原因特定に無駄な時間がかかる
- 仕様と実装の乖離は信頼性低下につながる

## 実行タスク

### Task 1: 仕様書の記載修正

仕様書 `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` の RelativeTime セクションにおいて、`updateInterval` の記載を `refreshInterval` に修正する。

**修正対象箇所**:

- Task 7 インターフェース定義の Props名
- 自動更新セクションの説明文

### Task 2: テストコードの確認

`RelativeTime.test.tsx` で `refreshInterval` が正しく使用されていることを確認する（現在正しく使用されているため、確認のみ）。

## 成果物

| #   | 成果物         | パス                                                                                        |
| --- | -------------- | ------------------------------------------------------------------------------------------- |
| 1   | 修正済み仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |

## 完了条件

- [ ] 仕様書のRelativeTimeセクションで `updateInterval` → `refreshInterval` に修正済み
- [ ] 実装コードとテストコードの Props名が仕様書と一致
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/RelativeTime/` が PASS

## 参照資料

- `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx` -- 実装（refreshInterval使用）
- `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx` -- テスト
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` -- 仕様書（Task 7）
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-10/final-review-result.md` -- Phase 10 MINOR M-1

## 親タスク教訓

| 教訓                 | 内容                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 命名不一致の早期検出 | Phase 4（テスト作成）時点で仕様書のProps名とテストのProps名の整合をチェックすべきだった。テストコード作成時に仕様書を直接参照する運用を推奨する |
