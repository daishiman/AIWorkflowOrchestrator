# テストケース一覧 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容       |
| -------------- | ---------- |
| タスクID       | CONV-08-01 |
| Phase          | 4          |
| 文書バージョン | 1.0.0      |
| 作成日         | 2026-01-09 |

---

## 1. エンティティ操作テスト

### 1.1 upsertEntity

| テストID | テスト名                           | Given                             | When                                                                 | Then                                | AC     |
| -------- | ---------------------------------- | --------------------------------- | -------------------------------------------------------------------- | ----------------------------------- | ------ |
| E-UP-001 | 新規エンティティを作成する         | DBに「Alice」が存在しない         | ExtractedEntity{name:"Alice", type:"person", confidence:0.9}でupsert | Result.okでStoredEntityが返却される | AC-001 |
| E-UP-002 | 正規化名が正しく生成される         | -                                 | name="TypeScript 5.x"でupsert                                        | normalizedName="typescript 5x"      | AC-001 |
| E-UP-003 | mentionCountが1で初期化される      | DBに該当エンティティが存在しない  | 新規エンティティをupsert                                             | mentionCount=1                      | AC-001 |
| E-UP-004 | idがEntityId形式である             | -                                 | 新規エンティティをupsert                                             | idがUUID形式                        | AC-001 |
| E-UP-005 | createdAtが設定される              | -                                 | 新規エンティティをupsert                                             | createdAtが現在時刻付近             | AC-001 |
| E-UP-006 | 既存エンティティとマージされる     | DBに"alice"(normalizedName)が存在 | 同一normalizedNameでupsert                                           | 既存エンティティが更新される        | AC-002 |
| E-UP-007 | mentionCountがインクリメントされる | 既存エンティティのmentionCount=3  | 同一エンティティをupsert                                             | mentionCount=4                      | AC-002 |
| E-UP-008 | aliasesがマージされる              | 既存aliases=["アリス"]            | aliases=["Alice-san"]でupsert                                        | aliasesに両方含まれる               | AC-002 |
| E-UP-009 | chunkIdsに追加される               | -                                 | chunkId="chunk-2"でupsert                                            | chunkIdsに"chunk-2"が含まれる       | AC-002 |
| E-UP-010 | updatedAtが更新される              | -                                 | 既存エンティティをupsert                                             | updatedAtが更新される               | AC-002 |
| E-UP-011 | embeddingが更新される              | 既存embedding=null                | embedding=[0.1,0.2,...]でupsert                                      | embeddingが新しい値に更新           | AC-002 |

### 1.2 getEntity

| テストID | テスト名                   | Given                       | When                    | Then                        | AC     |
| -------- | -------------------------- | --------------------------- | ----------------------- | --------------------------- | ------ |
| E-GT-001 | IDで既存エンティティを取得 | id="entity-123"が存在       | getEntity("entity-123") | Result.okでStoredEntity返却 | AC-003 |
| E-GT-002 | 存在しないIDでnull返却     | id="entity-999"が存在しない | getEntity("entity-999") | Result.okでnull返却         | AC-003 |

### 1.3 getEntityByName

| テストID | テスト名                         | Given                                | When                       | Then                        | AC     |
| -------- | -------------------------------- | ------------------------------------ | -------------------------- | --------------------------- | ------ |
| E-GN-001 | 正規化名で既存エンティティを取得 | normalizedName="tokyo"が存在         | getEntityByName("tokyo")   | Result.okでStoredEntity返却 | AC-004 |
| E-GN-002 | 存在しない名前でnull返却         | normalizedName="unknown"が存在しない | getEntityByName("unknown") | Result.okでnull返却         | AC-004 |

### 1.4 findEntities

| テストID | テスト名               | Given                               | When                                                       | Then                  | AC     |
| -------- | ---------------------- | ----------------------------------- | ---------------------------------------------------------- | --------------------- | ------ |
| E-FD-001 | タイプで検索           | type="person"が5件存在              | findEntities({types:["person"]})                           | 5件のStoredEntity返却 | AC-005 |
| E-FD-002 | 複数タイプで検索       | person5件, organization3件          | findEntities({types:["person","organization"]})            | 8件返却               | AC-005 |
| E-FD-003 | 名前パターンで検索     | "Tokyo Tower","Tokyo Station"が存在 | findEntities({namePattern:"tokyo%"})                       | 2件返却               | AC-005 |
| E-FD-004 | mentionCountでフィルタ | mentionCount=1,3,5,10が存在         | findEntities({minMentionCount:5})                          | 2件返却               | AC-005 |
| E-FD-005 | limit適用              | 10件のエンティティが存在            | findEntities({limit:3})                                    | 3件返却               | AC-005 |
| E-FD-006 | offset適用             | 10件のエンティティが存在            | findEntities({limit:3,offset:2})                           | 3件返却（3番目から）  | AC-005 |
| E-FD-007 | 複合条件で検索         | -                                   | findEntities({types:["person"],minMentionCount:3,limit:5}) | 条件全てを満たす結果  | AC-005 |
| E-FD-008 | 条件なしで全件取得     | 10件のエンティティが存在            | findEntities({})                                           | 10件返却              | AC-005 |

### 1.5 findSimilarEntities

| テストID | テスト名                         | Given                              | When                                  | Then                             | AC     |
| -------- | -------------------------------- | ---------------------------------- | ------------------------------------- | -------------------------------- | ------ |
| E-FS-001 | 類似エンティティを検索           | 埋め込み付きエンティティ10件       | findSimilarEntities(embedding,5,0.7)  | 5件以下返却                      | AC-006 |
| E-FS-002 | 類似度降順でソート               | -                                  | findSimilarEntities(embedding,5,0.5)  | 類似度降順で返却                 | AC-006 |
| E-FS-003 | 閾値以上のみ返却                 | -                                  | findSimilarEntities(embedding,10,0.7) | 全ての結果が類似度0.7以上        | AC-006 |
| E-FS-004 | 閾値を満たす結果がない           | 類似度0.9以上が存在しない          | findSimilarEntities(embedding,5,0.9)  | 空配列返却                       | AC-006 |
| E-FS-005 | 埋め込みがないエンティティは除外 | embedding=nullのエンティティが存在 | findSimilarEntities(embedding,10,0.5) | embedding=nullは結果に含まれない | AC-006 |

### 1.6 deleteEntity

| テストID | テスト名                     | Given                            | When                             | Then                        | AC     |
| -------- | ---------------------------- | -------------------------------- | -------------------------------- | --------------------------- | ------ |
| E-DL-001 | エンティティを削除           | id="entity-to-delete"が存在      | deleteEntity("entity-to-delete") | Result.okでvoid返却         | AC-007 |
| E-DL-002 | 削除後は取得できない         | 上記削除後                       | getEntity("entity-to-delete")    | null返却                    | AC-007 |
| E-DL-003 | 関連する関係もCASCADE削除    | エンティティに関連する関係が存在 | deleteEntity(id)                 | 関連する関係も削除される    | AC-007 |
| E-DL-004 | 存在しないエンティティの削除 | id="non-existent"が存在しない    | deleteEntity("non-existent")     | Result.okでvoid返却（冪等） | -      |

---

## 2. 関係操作テスト

### 2.1 addRelation

| テストID | テスト名                 | Given                             | When                                                  | Then                          | AC     |
| -------- | ------------------------ | --------------------------------- | ----------------------------------------------------- | ----------------------------- | ------ |
| R-AD-001 | 新規関係を作成           | source,targetが存在、関係が未存在 | addRelation({sourceId,targetId,type:"uses",evidence}) | Result.okでStoredRelation返却 | AC-008 |
| R-AD-002 | weightが1で初期化        | -                                 | 新規関係を作成                                        | weight=1                      | AC-008 |
| R-AD-003 | 既存関係とマージ         | 同一関係が存在(weight=2)          | addRelation(同一source/target/type)                   | weight=3                      | AC-009 |
| R-AD-004 | evidenceが追加される     | 既存evidence1件                   | addRelation(新evidence付き)                           | evidence2件                   | AC-009 |
| R-AD-005 | Self-loopは拒否          | sourceId=targetId                 | addRelation({sourceId:"e1",targetId:"e1"})            | Result.errでエラー            | AC-010 |
| R-AD-006 | evidence空は拒否         | evidence=[]                       | addRelation({evidence:[]})                            | Result.errでエラー            | AC-010 |
| R-AD-007 | 存在しないsourceでエラー | sourceId存在しない                | addRelation({sourceId:"non-existent"})                | Result.errでエラー            | AC-019 |
| R-AD-008 | 存在しないtargetでエラー | targetId存在しない                | addRelation({targetId:"non-existent"})                | Result.errでエラー            | AC-019 |

### 2.2 getRelation

| テストID | テスト名           | Given                         | When                        | Then                          | AC  |
| -------- | ------------------ | ----------------------------- | --------------------------- | ----------------------------- | --- |
| R-GT-001 | IDで関係を取得     | id="relation-123"が存在       | getRelation("relation-123") | Result.okでStoredRelation返却 | -   |
| R-GT-002 | 存在しないIDでnull | id="relation-999"が存在しない | getRelation("relation-999") | Result.okでnull返却           | -   |

### 2.3 getRelations

| テストID | テスト名           | Given                        | When                                        | Then                       | AC     |
| -------- | ------------------ | ---------------------------- | ------------------------------------------- | -------------------------- | ------ |
| R-GR-001 | 全方向の関係を取得 | entity-1から出る2件、入る3件 | getRelations("entity-1",{direction:"both"}) | 5件返却                    | AC-011 |
| R-GR-002 | 出力方向のみ取得   | entity-1から出る2件、入る3件 | getRelations("entity-1",{direction:"out"})  | 2件返却                    | AC-011 |
| R-GR-003 | 入力方向のみ取得   | entity-1から出る2件、入る3件 | getRelations("entity-1",{direction:"in"})   | 3件返却                    | AC-011 |
| R-GR-004 | タイプでフィルタ   | "uses"2件と"depends_on"1件   | getRelations(id,{types:["uses"]})           | 2件返却                    | AC-011 |
| R-GR-005 | デフォルトはboth   | -                            | getRelations("entity-1")                    | direction="both"と同じ結果 | AC-011 |

### 2.4 findRelations

| テストID | テスト名                  | Given                        | When                                      | Then              | AC     |
| -------- | ------------------------- | ---------------------------- | ----------------------------------------- | ----------------- | ------ |
| R-FR-001 | source/targetヒントで検索 | "Alice"→"Python"の関係存在   | findRelations("Alice","Python")           | 該当関係を返却    | AC-012 |
| R-FR-002 | 関係タイプヒントも使用    | "uses"と"teaches"が存在      | findRelations("Alice","Python","teaches") | "teaches"のみ返却 | AC-012 |
| R-FR-003 | 部分一致で検索            | "Alice Smith"→"Python 3"存在 | findRelations("Alice","Python")           | 該当関係を返却    | AC-012 |

### 2.5 deleteRelation

| テストID | テスト名             | Given                         | When                                 | Then                | AC  |
| -------- | -------------------- | ----------------------------- | ------------------------------------ | ------------------- | --- |
| R-DL-001 | 関係を削除           | id="relation-to-delete"が存在 | deleteRelation("relation-to-delete") | Result.okでvoid返却 | -   |
| R-DL-002 | 削除後は取得できない | 上記削除後                    | getRelation("relation-to-delete")    | null返却            | -   |

---

## 3. グラフトラバーサルテスト

### 3.1 traverse

| テストID | テスト名                     | Given                            | When                                              | Then                | AC     |
| -------- | ---------------------------- | -------------------------------- | ------------------------------------------------- | ------------------- | ------ |
| T-TR-001 | 指定深度までトラバース       | A→B→C→Dの関係                    | traverse("A",{maxDepth:2})                        | A,B,Cが訪問される   | AC-013 |
| T-TR-002 | 深度0は開始ノードのみ        | A→Bの関係                        | traverse("A",{maxDepth:0})                        | Aのみ訪問           | AC-013 |
| T-TR-003 | 関係タイプでフィルタ         | A→B(uses), A→C(references)       | traverse("A",{maxDepth:1,relationTypes:["uses"]}) | A,Bが訪問           | AC-013 |
| T-TR-004 | 最大ノード数で打ち切り       | Aから10ノード到達可能            | traverse("A",{maxDepth:10,maxNodes:5})            | 5ノード以下         | AC-013 |
| T-TR-005 | 出力方向のみ探索             | A→B, C→A                         | traverse("A",{maxDepth:1,direction:"out"})        | A,Bが訪問           | AC-013 |
| T-TR-006 | 入力方向のみ探索             | A→B, C→A                         | traverse("A",{maxDepth:1,direction:"in"})         | A,Cが訪問           | AC-013 |
| T-TR-007 | 循環グラフで無限ループしない | A→B→C→A                          | traverse("A",{maxDepth:10})                       | 各ノード1回のみ訪問 | AC-013 |
| T-TR-008 | pathsが正しく記録される      | A→B→C                            | traverse("A",{maxDepth:2})                        | paths配列にパス情報 | AC-013 |
| T-TR-009 | maxDepthReachedが正しい      | A→B→C                            | traverse("A",{maxDepth:2})                        | maxDepthReached=2   | AC-013 |
| T-TR-010 | minRelationWeightでフィルタ  | A→B(weight=0.5), A→C(weight=1.0) | traverse("A",{maxDepth:1,minRelationWeight:0.8})  | A,Cが訪問           | AC-013 |

### 3.2 findShortestPath

| テストID | テスト名            | Given               | When                                 | Then            | AC     |
| -------- | ------------------- | ------------------- | ------------------------------------ | --------------- | ------ |
| T-SP-001 | 最短パスを見つける  | A→B→C→DとA→X→D      | findShortestPath("A","D")            | パス長2(A→X→D)  | AC-014 |
| T-SP-002 | 直接接続のパス      | A→B                 | findShortestPath("A","B")            | パス長1         | AC-014 |
| T-SP-003 | パスが存在しない    | AとZが未接続        | findShortestPath("A","Z")            | null返却        | AC-014 |
| T-SP-004 | 深さ制限でパスなし  | A→B→C→D→E           | findShortestPath("A","E",maxDepth=3) | null返却        | AC-014 |
| T-SP-005 | 同一ノード間のパス  | -                   | findShortestPath("A","A")            | 空パス返却      | AC-014 |
| T-SP-006 | totalWeightが正しい | A→B(w=0.5)→C(w=0.8) | findShortestPath("A","C")            | totalWeight=1.3 | AC-014 |

### 3.3 getNeighbors

| テストID | テスト名                   | Given                    | When                      | Then                      | AC     |
| -------- | -------------------------- | ------------------------ | ------------------------- | ------------------------- | ------ |
| T-NB-001 | 直接の隣接ノード取得       | Aから直接B,C,Dに到達可能 | getNeighbors("A",depth=1) | 3件のGraphNode            | AC-015 |
| T-NB-002 | 2ホップ先まで取得          | A→B→C                    | getNeighbors("A",depth=2) | B,Cを含む                 | AC-015 |
| T-NB-003 | GraphNodeにin/outRelations | A←X, A→B                 | getNeighbors("A",depth=1) | 各ノードにin/outRelations | AC-015 |
| T-NB-004 | デフォルト深度は1          | -                        | getNeighbors("A")         | depth=1と同じ結果         | AC-015 |

---

## 4. 統計テスト

### 4.1 getStats

| テストID | テスト名               | Given                    | When       | Then                             | AC     |
| -------- | ---------------------- | ------------------------ | ---------- | -------------------------------- | ------ |
| S-ST-001 | エンティティ数を取得   | 10エンティティ           | getStats() | entityCount=10                   | AC-016 |
| S-ST-002 | 関係数を取得           | 15関係                   | getStats() | relationCount=15                 | AC-016 |
| S-ST-003 | タイプ別分布を取得     | person:5, organization:3 | getStats() | entityTypeDistributionが正しい   | AC-016 |
| S-ST-004 | 関係タイプ別分布を取得 | uses:10, references:5    | getStats() | relationTypeDistributionが正しい | AC-016 |
| S-ST-005 | 平均関係数を計算       | 10エンティティ、15関係   | getStats() | averageRelationsPerEntity=3      | AC-016 |
| S-ST-006 | グラフ密度を計算       | 10エンティティ、15関係   | getStats() | graphDensity≈0.167               | AC-016 |
| S-ST-007 | 空のグラフ             | エンティティ0件          | getStats() | entityCount=0, density=0         | AC-016 |

---

## 5. バッチ操作テスト

### 5.1 bulkUpsertEntities

| テストID | テスト名                   | Given                   | When                         | Then                     | AC     |
| -------- | -------------------------- | ----------------------- | ---------------------------- | ------------------------ | ------ |
| B-UE-001 | 複数エンティティを一括挿入 | 10件のExtractedEntity   | bulkUpsertEntities(entities) | 10件のStoredEntity返却   | AC-017 |
| B-UE-002 | バッチ内でマージ発生       | 同一normalizedNameが2件 | bulkUpsertEntities(entities) | 重複エンティティはマージ | AC-017 |
| B-UE-003 | 空配列で成功               | 0件のExtractedEntity    | bulkUpsertEntities([])       | 空配列返却               | AC-017 |
| B-UE-004 | トランザクション内で実行   | -                       | bulkUpsertEntities(entities) | 全て成功または全て失敗   | AC-017 |

### 5.2 bulkAddRelations

| テストID | テスト名                       | Given                       | When                        | Then                    | AC     |
| -------- | ------------------------------ | --------------------------- | --------------------------- | ----------------------- | ------ |
| B-AR-001 | 複数関係を一括追加             | 5件のExtractedRelation      | bulkAddRelations(relations) | 5件のStoredRelation返却 | AC-018 |
| B-AR-002 | アトミック操作（全成功）       | 有効な10件                  | bulkAddRelations(relations) | 全て成功                | AC-018 |
| B-AR-003 | アトミック操作（ロールバック） | 1件がSelf-loop              | bulkAddRelations(relations) | 全てロールバック        | AC-018 |
| B-AR-004 | バッチ内でマージ発生           | 同一source/target/typeが2件 | bulkAddRelations(relations) | 重複関係はマージ        | AC-018 |

---

## 6. エラーハンドリングテスト

| テストID | テスト名                | Given             | When        | Then                        | AC     |
| -------- | ----------------------- | ----------------- | ----------- | --------------------------- | ------ |
| ERR-001  | SelfLoopError           | sourceId=targetId | addRelation | SelfLoopError返却           | AC-010 |
| ERR-002  | EvidenceRequiredError   | evidence=[]       | addRelation | EvidenceRequiredError返却   | AC-010 |
| ERR-003  | EntityNotFoundError     | source存在しない  | addRelation | EntityNotFoundError返却     | AC-019 |
| ERR-004  | DatabaseConnectionError | DB接続なし        | 任意の操作  | DatabaseConnectionError返却 | AC-020 |

---

## 7. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |
