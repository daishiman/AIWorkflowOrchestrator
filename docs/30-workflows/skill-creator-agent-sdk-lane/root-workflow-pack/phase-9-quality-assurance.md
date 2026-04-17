# Phase 9: 品質保証

## 目的

root / child の構造、参照、依存、実行粒度を最終点検する。

## 実行タスク

- 参照パス整合
- child task 粒度確認
- verify / route / session の論点漏れ確認
- Claude Agent SDK / Node SDK 公式ドキュメントとの前提ズレ確認

## 品質観点

- root / child の参照パスが実体と一致している
- child task が `index.md + phase-1-13` の完全構成になっている
- `query()` / `permissionMode` / `canUseTool` / sessions への理解が公式前提と衝突していない
- TypeScript / Node SDK 前提が現行公式ページの記述と矛盾していない

## 成果物

| 成果物   | パス                           | 説明        |
| -------- | ------------------------------ | ----------- |
| 品質保証 | `phase-9-quality-assurance.md` | QA 観点一覧 |

## 完了条件

- [ ] child task が単独実行可能な粒度である
- [ ] root / child の依存順が明確である
- [ ] 公式ドキュメント前提との認識ズレがない
- [ ] **本Phase内の全タスクを100%実行完了**
