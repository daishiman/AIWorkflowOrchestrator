# 実行ログ

このファイルはスキルの使用記録を蓄積します。
`scripts/log_usage.mjs` で自動更新されます。

---

## 2026-01-08: chat-multi-llm-switching

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | TASK-CHAT-LLM-SWITCH-001                          |
| 操作         | update-spec                                       |
| 対象ファイル | references/interfaces-llm.md                      |
| 結果         | success                                           |
| 備考         | Multi-LLM Provider Switching 型定義セクション追加 |

---

### 2026-01-08 13:00:00

- **結果**: success
- **Task**: logging-service Phase 12 ドキュメント更新
- **更新内容**:
  - `references/interfaces-converter.md`: IConversionLoggerインターフェース追加
  - `references/database-schema.md`: conversion_logsテーブル追加
  - `references/architecture-file-conversion.md`: ConversionLoggerセクション追加
- **インデックス再生成**: 完了（77ファイル、615キーワード）

---

## 2026-01-10: community-detection-leiden

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | CONV-08-02                                                 |
| 操作         | create-spec / update-spec                                  |
| 対象ファイル | interfaces-rag-community-detection.md（新規）、interfaces-rag.md、architecture-rag.md、topic-map.md |
| 結果         | success                                                    |
| 備考         | Leidenアルゴリズムによるコミュニティ検出機能の仕様追加     |

### 更新詳細

- **新規作成**: `references/interfaces-rag-community-detection.md`
  - ICommunityDetector / ICommunityRepository インターフェース定義
  - Community / CommunityDetectionOptions / CommunityStructure 型定義
  - Leidenアルゴリズム処理フロー
  - 使用例・実装ガイドライン

- **更新**: `references/interfaces-rag.md`
  - ドキュメント構成にCommunity Detection参照追加
  - CommunityId Branded Type追加
  - COMMUNITY_DETECTION_ERROR エラー型追加

- **更新**: `references/architecture-rag.md`
  - 「コミュニティ検出サービス (Leiden Algorithm)」セクション追加（116行）
  - RAGパイプライン位置づけ図
  - アーキテクチャ図・処理フロー

- **更新**: `indexes/topic-map.md`
  - インターフェースセクションにinterfaces-rag-community-detection.md追加

---

（ログエントリはここに追記されます）
