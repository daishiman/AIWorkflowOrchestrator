# Phase 8 リファクタログ

## 実施内容

| 項目             | Before                            | After                                                                              |
| ---------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| 実行コマンド公開 | script実体はあるが run公開不足    | scriptsへ公開し run一覧で発見可能化                                                |
| 文書記法         | node直実行/exec node が混在       | `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` に統一 |
| 監査記録         | current/baseline の読み分けが曖昧 | `audit-split-log.md` で明示分離                                                    |

## 差分効果

- 再取得手順が実行者依存からコマンド依存へ移行。
- Phase 11/12 の運用文書と実行経路が一致。
