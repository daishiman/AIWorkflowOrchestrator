# 未タスク指示書: UT-IMP-IMPLEMENTATION-ANCHOR-PATH-VALIDATOR-001

```yaml
issue_number:
```

## メタ情報

| 項目       | 値                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | UT-IMP-IMPLEMENTATION-ANCHOR-PATH-VALIDATOR-001                                                                                |
| 由来       | lessons-learned L-UT-EXEC-01-001（docs-only close-out でも Implementation Anchor を追記する時は target path 実在確認を必須化） |
| ステータス | unassigned                                                                                                                     |
| 優先度     | 低                                                                                                                             |
| 作成日     | 2026-03-27                                                                                                                     |
| 関連仕様書 | task-specification-creator Phase 12（implementation-guide.md 生成フロー）                                                      |

## 目的

Phase 12 の implementation-guide.md に記載される Implementation Anchor（参照先ファイルパス）が実在するかを自動検証し、存在しないパスへの参照を事前に検知・報告する仕組みを構築する。これにより、開発者がドキュメントを読んだ際に存在しないファイルを探して時間を浪費する問題を防止する。

## 背景

- Phase 12 の implementation-guide.md に「Implementation Anchor」として参照先ファイルパスを記載する際、そのパスが実際に存在するか確認されていなかった
- docs-only タスク（コード変更なし）でも Anchor パスを追記することがあり、typo や renamed ファイルへの参照が残る
- 結果として implementation-guide を読んだ開発者が存在しないファイルを探して時間を浪費する
- `ls` + `grep` レベルの簡易チェックで防げる問題だが、手動では忘れやすい
- 本タスクは lessons-learned L-UT-EXEC-01-001 から派生した改善タスクである

## 実行タスク

1. **パーサー作成**: Phase-12 outputs（`outputs/phase-12/implementation-guide.md`）内のファイルパス参照を正規表現で抽出するパーサーを作成する
2. **バリデーター実装**: 抽出したパスに対して `fs.existsSync` または `ls` で実在確認を行うバリデーターを実装する
3. **エラーレポート出力**: パス不在時のエラーレポート（ファイル名、行番号、参照パス）を出力する機能を実装する
4. **フロー組み込み**: task-specification-creator の Phase 12 実行フローに組み込み可能なスクリプトとして整備する
5. **候補提案（fuzzy match）**: renamed ファイルの候補提案（fuzzy match）を検討し、可能であれば実装する

## 受入基準

- [ ] implementation-guide.md 内のファイルパス参照を正しく抽出できる
- [ ] 存在しないパスを検知してエラーレポートを出力できる
- [ ] エラーレポートにファイル名・行番号・参照パスが含まれる
- [ ] Phase 12 フローで実行可能

## 苦戦箇所・知見（親タスクからの引き継ぎ）

- **手動確認の限界**: docs-only タスクでは「コード変更がないから確認不要」と思い込みがちだが、Anchor パスの記載は発生するため確認漏れが起きやすい
- **パス抽出の正規表現設計**: implementation-guide.md 内のパス表記は複数形式（コードブロック内、インラインコード、相対パス、絶対パスなど）があるため、正規表現は柔軟に設計する必要がある
- **renamed ファイルへの対処**: ファイルが rename された場合、単純な存在確認だけでは不十分。fuzzy match による候補提案があると修正が容易になる
- **実行タイミング**: Phase 12 の出力生成直後に自動実行されるのが理想。手動実行だと忘れやすいため、フローへの組み込みが重要
