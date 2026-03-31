# Phase 11 成果物: 発見事項

## 発見事項一覧

### DIS-01: REPO_SKILL_CREATOR_PATH が常時候補に含まれる

| 項目   | 内容                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 重要度 | LOW                                                                                                                           |
| 種別   | 挙動観察（バグではない）                                                                                                      |
| 内容   | `getSkillCreatorRootCandidates()` は env var に加えて `HOME_SKILL_CREATOR_PATH` と `REPO_SKILL_CREATOR_PATH` を常に候補に含む |
| 影響   | テストで `sourceResolver.resolve` を mock しない場合、プロジェクト内の実 skill-creator でテストが通過してしまう               |
| 対応   | テストパターンとして文書化済み（phase-6 extended-test-record.md）                                                             |

### DIS-02: microtask flush 回数の脆弱性

| 項目   | 内容                                                                    |
| ------ | ----------------------------------------------------------------------- |
| 重要度 | LOW                                                                     |
| 種別   | テスト安定性                                                            |
| 内容   | TC-8 (plan.test.ts) の microtask flush 回数が実装変更で崩れる可能性あり |
| 影響   | TASK-P0-04 で dynamic pipeline 追加 → flush 5 → 10 に変更が必要だった   |
| 対応   | 現在 10 回に変更済み。今後の実装変更時は再確認が必要                    |

## まとめ

発見事項は2件（いずれも LOW）。Phase 12 への blocking なし。
