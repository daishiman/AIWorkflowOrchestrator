# Phase 2: 検証マトリクス

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 1. Contract 検証（Phase 4 / 9 で使用）

| ID   | 検証対象                    | 検証方法              | 期待結果                                                   |
| ---- | --------------------------- | --------------------- | ---------------------------------------------------------- |
| V-C1 | TranscriptProvenance 型定義 | TypeScript コンパイル | sourceType / sharedAt / sessionTitle が required           |
| V-C2 | WorkspaceChatMessage 拡張   | TypeScript コンパイル | transcriptProvenance が optional で追加                    |
| V-C3 | shareSelectionToChat action | Unit test             | Chat composer に text が挿入される                         |
| V-C4 | attachRecentOutput action   | Unit test             | Chat attachment に直近出力が追加される                     |
| V-C5 | pasteSession action         | Unit test             | Chat attachment に session 全文が追加される                |
| V-C6 | metadata 永続化             | Unit test             | ChatMessage.metadata.transcriptProvenance に保存される     |
| V-C7 | metadata 復元               | Unit test             | 保存された provenance が WorkspaceChatMessage に復元される |
| V-C8 | dismiss 後の metadata 保持  | Unit test             | dismiss しても DB の metadata は削除されない               |

## 2. Integration 検証（Phase 6 / 11 で使用）

| ID   | 検証対象            | 検証方法         | 期待結果                                             |
| ---- | ------------------- | ---------------- | ---------------------------------------------------- |
| V-I1 | OP-1 E2E フロー     | Integration test | 選択 -> CTA -> composer 挿入 -> provenance chip 表示 |
| V-I2 | OP-2 E2E フロー     | Integration test | CTA -> attachment 追加 -> provenance chip 表示       |
| V-I3 | OP-3 E2E フロー     | Integration test | CTA -> attachment 追加 -> provenance chip 表示       |
| V-I4 | Handoff Card 非競合 | Integration test | Handoff Card と Transcript CTA が同時表示可能        |
| V-I5 | 履歴復元            | Integration test | Chat 再読込後に provenance chip が復元される         |

## 3. Manual 検証（Phase 11 で使用）

| ID   | 検証対象                | 手順                                                    | 期待結果                                              |
| ---- | ----------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| V-M1 | OP-1 選択 -> 送信       | Transcript でテキスト選択 -> 「チャットへ送る」クリック | Chat composer に選択テキストが入る                    |
| V-M2 | OP-2 直近出力添付       | 「直近出力を添付」クリック                              | Chat に attachment chip が表示される                  |
| V-M3 | OP-3 Session 貼付       | 「セッションを貼り付ける」クリック                      | Chat に attachment chip が表示される                  |
| V-M4 | Provenance chip 表示    | OP-1/2/3 実行後                                         | Chat 側に source type + sharedAt の chip が表示される |
| V-M5 | Provenance chip dismiss | chip の dismiss CTA クリック                            | chip が非表示になる                                   |
| V-M6 | Provenance inspect      | chip の inspect CTA クリック                            | Transcript の元位置にナビゲートする                   |
| V-M7 | 履歴復元                | Chat を閉じて再度開く                                   | provenance chip が復元される                          |
| V-M8 | Handoff Card 共存       | Terminal handoff 提案中に OP-1 を実行                   | 両方が表示され、互いに干渉しない                      |
| V-M9 | auto-send 禁止確認      | 全操作実行後                                            | composer に挿入/添付されるが自動送信されない          |

## 4. Quality Assurance 検証（Phase 9 で使用）

| ID   | 検証対象           | 観点                      | 検証コマンド                             |
| ---- | ------------------ | ------------------------- | ---------------------------------------- |
| V-Q1 | P31 安全性         | Zustand 無限ループ回避    | 個別セレクタ使用確認                     |
| V-Q2 | P48 安全性         | non-null assertion 禁止   | `grep -rn '!' \| grep -v node_modules`   |
| V-Q3 | P5 安全性          | リスナー二重登録回避      | useEffect cleanup 確認                   |
| V-Q4 | P42 バリデーション | .trim() 3段バリデーション | 文字列入力のバリデーション確認           |
| V-Q5 | CTA 上限           | primary 1 + secondary 1   | 各 surface の CTA 数カウント             |
| V-Q6 | auto-send 禁止     | no-op boundary            | 自動送信パスが存在しないことを確認       |
| V-Q7 | 型安全             | any / as 禁止             | `grep -rn 'as ' \| grep -v node_modules` |

## 5. Documentation 検証（Phase 12 で使用）

| ID   | 検証対象                | 検証方法                                                         |
| ---- | ----------------------- | ---------------------------------------------------------------- |
| V-D1 | implementation-guide.md | Part 1（中学生レベル概念説明）+ Part 2（開発者向け）が揃っている |
| V-D2 | system-spec 同期        | workflow 正本の Task06 ステータスが更新されている                |
| V-D3 | LOGS.md 2ファイル更新   | aiworkflow-requirements + task-specification-creator 両方更新    |
| V-D4 | topic-map.md 再生成     | `node generate-index.js` 実行済み                                |
| V-D5 | 未タスク検出            | unassigned-task-detection.md が作成されている                    |

## 6. Phase 別検証マッピング

| Phase                      | 使用する検証 ID                          |
| -------------------------- | ---------------------------------------- |
| Phase 3 (設計レビュー)     | V-C1, V-C2 (型設計の妥当性)              |
| Phase 4 (テスト作成)       | V-C1 ~ V-C8 (contract test 設計)         |
| Phase 5 (実装)             | V-C3 ~ V-C8 (実装の正しさ)               |
| Phase 6 (テスト拡充)       | V-I1 ~ V-I5 (integration test 追加)      |
| Phase 7 (カバレッジ)       | V-C + V-I の coverage 集計               |
| Phase 8 (リファクタリング) | V-Q1 ~ V-Q7 (品質観点)                   |
| Phase 9 (品質検証)         | V-Q1 ~ V-Q7 (最終確認)                   |
| Phase 10 (最終レビュー)    | 全 V-\* の整合確認                       |
| Phase 11 (手動テスト)      | V-M1 ~ V-M9 (manual walkthrough)         |
| Phase 12 (ドキュメント)    | V-D1 ~ V-D5 (documentation completeness) |
