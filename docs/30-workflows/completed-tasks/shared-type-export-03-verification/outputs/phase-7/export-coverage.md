# エクスポート網羅性確認

## 作成日

2026-01-23

## Phase 7 - Task 7-1: エクスポート網羅性確認

---

## 1. エクスポート確認結果

### 1.1 型エクスポート（export type）

| カテゴリ          | 項目                              | エクスポート済み | 確認結果 |
| ----------------- | --------------------------------- | ---------------- | -------- |
| Entity関連        | StoredEntity                      | ✅               | ✅ PASS  |
| Entity関連        | ExtractedEntity                   | ✅               | ✅ PASS  |
| Entity関連        | EntityMention                     | ✅               | ✅ PASS  |
| Relation関連      | StoredRelation                    | ✅               | ✅ PASS  |
| Relation関連      | ExtractedRelation                 | ✅               | ✅ PASS  |
| Relation関連      | RelationEvidence                  | ✅               | ✅ PASS  |
| Graph関連         | GraphNode                         | ✅               | ✅ PASS  |
| Graph関連         | GraphEdge                         | ✅               | ✅ PASS  |
| Graph関連         | GraphPath                         | ✅               | ✅ PASS  |
| Graph関連         | GraphTraversalResult              | ✅               | ✅ PASS  |
| Graph関連         | GraphStats                        | ✅               | ✅ PASS  |
| **Community関連** | **Community**                     | ✅               | ✅ PASS  |
| **Community関連** | **CommunitySummary**              | ✅               | ✅ PASS  |
| **Community関連** | **CommunityStructure**            | ✅               | ✅ PASS  |
| **Community関連** | **CommunityDetectionOptions**     | ✅               | ✅ PASS  |
| **Community関連** | **CommunityDetectionResult**      | ✅               | ✅ PASS  |
| **Community関連** | **CommunityDetectionStats**       | ✅               | ✅ PASS  |
| **Community関連** | **CommunitySummarizationOptions** | ✅               | ✅ PASS  |
| **Community関連** | **CommunitySummarizationResult**  | ✅               | ✅ PASS  |
| Query関連         | EntityQuery                       | ✅               | ✅ PASS  |
| Query関連         | TraversalOptions                  | ✅               | ✅ PASS  |
| Query関連         | RelationQueryOptions              | ✅               | ✅ PASS  |

### 1.2 値エクスポート（export）

| カテゴリ          | 項目                                | 種別     | エクスポート済み | 確認結果 |
| ----------------- | ----------------------------------- | -------- | ---------------- | -------- |
| **Community検出** | **CommunityErrorCode**              | enum     | ✅               | ✅ PASS  |
| **Community検出** | **CommunityDetectionError**         | class    | ✅               | ✅ PASS  |
| **Community要約** | **CommunitySummarizationErrorCode** | enum     | ✅               | ✅ PASS  |
| **Community要約** | **CommunitySummarizationError**     | class    | ✅               | ✅ PASS  |
| ユーティリティ    | normalizeEntityName                 | function | ✅               | ✅ PASS  |

---

## 2. カウント結果

```bash
# 型エクスポート数
$ grep -c "export type" packages/shared/src/services/graph/index.ts
5

# 値エクスポート数
$ grep -c "export {" packages/shared/src/services/graph/index.ts
3
```

**合計**: 型エクスポート5グループ + 値エクスポート3グループ = 8エクスポートステートメント

---

## 3. Community関連エクスポート詳細

| 型/値 | 名前                            | 種別      | 用途                   |
| ----- | ------------------------------- | --------- | ---------------------- |
| 型    | Community                       | interface | コミュニティ構造       |
| 型    | CommunitySummary                | interface | コミュニティの要約     |
| 型    | CommunityStructure              | interface | 階層的コミュニティ構造 |
| 型    | CommunityDetectionOptions       | interface | 検出オプション         |
| 型    | CommunityDetectionResult        | interface | 検出結果               |
| 型    | CommunityDetectionStats         | interface | 検出統計               |
| 型    | CommunitySummarizationOptions   | interface | 要約オプション         |
| 型    | CommunitySummarizationResult    | interface | 要約結果               |
| 値    | CommunityErrorCode              | enum      | 検出エラーコード       |
| 値    | CommunityDetectionError         | class     | 検出エラークラス       |
| 値    | CommunitySummarizationErrorCode | enum      | 要約エラーコード       |
| 値    | CommunitySummarizationError     | class     | 要約エラークラス       |

---

## 4. 総合判定

| 項目                   | 判定                    |
| ---------------------- | ----------------------- |
| Community型（8種）     | ✅ 全てエクスポート済み |
| Communityエラー（4種） | ✅ 全てエクスポート済み |
| **総合判定**           | **✅ PASS - 漏れなし**  |

---

## 5. 完了確認

- [x] 全てのCommunity関連型がエクスポートされている
- [x] 型（export type）と値（export）が正しく区別されている
- [x] 漏れがないことが確認されている
