# Phase 12: スキルフィードバックレポート

## 境界マトリクス

| 対象ファイル                       | 役割                                             |
| ---------------------------------- | ------------------------------------------------ |
| `implementation-guide.md`          | current facts と future example の境界を明示する |
| `documentation-changelog.md`       | 変更点だけを列挙する                             |
| `system-spec-update-summary.md`    | 仕様更新の要否だけを判断する                     |
| `skill-feedback-report.md`         | 根本原因・予防ルール・次回確認に再利用する       |
| `UT-RT-02-TYPE-EXPANSION-TEST-001` | 将来の union 拡張時の follow-up 境界を持つ       |

## 根本原因

| 原因            | 内容                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| truthiness 依存 | `success === false` と `!success` の差が、`undefined` の扱いまで変える |
| 境界の曖昧さ    | current facts と将来例が同じ温度で語られると、事実と仮説が混ざる       |

## 予防ルール

| ルール                     | 内容                                               |
| -------------------------- | -------------------------------------------------- |
| strict equality を維持する | `success === false` を使い、truthiness に戻さない  |
| 将来例を明示する           | 追加バリアントの例は必ず「将来例」とラベル付けする |
| 役割を分離する             | 変更点・更新要否・教訓を別ファイルで管理する       |

## 次回確認

| チェック     | 内容                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| union 拡張時 | `typecheck` → `vitest` → `verify-unassigned-links` の順で再確認する                                          |
| 記述更新時   | `implementation-guide.md` / `documentation-changelog.md` / `system-spec-update-summary.md` の 3 点を同期する |
| 再発防止     | `task-specification-creator` の設計書に current facts / future example の境界を明記する                      |

## スキル改善提案

| スキル                     | 改善提案                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| task-specification-creator | Phase 2 設計書に `switch(result.type)` / `assertNever(result.type)` / `assertNever(result)` の役割分担を最初から固定で書く |
| aiworkflow-requirements    | `architecture-implementation-patterns.md` に module-local assertNever の具体例を追加する                                   |

## 新規 Pitfall 候補

| #        | Pitfall                                                                   | 対策                                                              |
| -------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| P-NEW-01 | mixed union に `boolean` 判別子が含まれると、truthiness 判定に戻りやすい  | 正規化 helper で discriminated outcome に変換してから switch する |
| P-NEW-02 | 将来例と current facts を同じ段落で書くと、実装済みか未実装かが曖昧になる | 将来例は必ず「将来例」と明示し、事実とは分離する                  |

## 完了確認

- [x] ワークフロー改善点を記録した
- [x] 技術的教訓を記録した
- [x] スキル改善提案を記録した
- [x] 新規 Pitfall 候補を記録した（改善点なしでも出力必須 → 2件記録）
- [x] 本Phase内の全タスクを100%実行完了
