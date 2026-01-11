# テストケース - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 4（テスト作成）      |

---

## 1. ユニットテスト

### 1.1 CommunitySummarizer.summarize()

| TC ID   | テストケース           | 入力                      | 期待結果                                   |
| ------- | ---------------------- | ------------------------- | ------------------------------------------ |
| TC-S-01 | 正常な要約生成         | 有効なCommunity, entities | Result.ok(CommunitySummary)                |
| TC-S-02 | 子コミュニティ要約使用 | useChildSummaries=true    | 子要約がプロンプトに含まれる               |
| TC-S-03 | 埋め込み生成           | generateEmbedding=true    | embedding が number[] で存在               |
| TC-S-04 | 埋め込み生成スキップ   | generateEmbedding=false   | embedding が undefined                     |
| TC-S-05 | LLM失敗時エラー        | LLM.generate()がエラー    | Result.err(LLMエラー)                      |
| TC-S-06 | JSONパース失敗         | 不正なJSON応答            | Result.err("No JSON found")                |
| TC-S-07 | 埋め込み失敗時も続行   | embedSingle()がエラー     | Result.ok、embedding=undefined             |
| TC-S-08 | スタイル指定           | summaryStyle="technical"  | 技術的スタイルガイドがプロンプトに含まれる |

### 1.2 CommunitySummarizer.summarizeAll()

| TC ID   | テストケース           | 入力                       | 期待結果                              |
| ------- | ---------------------- | -------------------------- | ------------------------------------- |
| TC-A-01 | 全コミュニティ要約生成 | CommunityStructure         | 全要約がsummaries[]に含まれる         |
| TC-A-02 | 階層順処理             | level 0,1,2 のコミュニティ | level 2→1→0 の順で処理                |
| TC-A-03 | 並列処理制限           | maxConcurrency=3           | 同時に3件のみ処理                     |
| TC-A-04 | 部分失敗継続           | 一部でLLMエラー            | failedCommunities[]に記録、他は成功   |
| TC-A-05 | 統計情報集計           | 複数コミュニティ           | totalTokensUsed, processingTimeMs正確 |

### 1.3 CommunitySummarizer.searchSummaries()

| TC ID   | テストケース       | 入力                   | 期待結果               |
| ------- | ------------------ | ---------------------- | ---------------------- |
| TC-Q-01 | セマンティック検索 | query="プログラミング" | 関連要約が返却         |
| TC-Q-02 | レベル指定検索     | level=0                | level=0 の要約のみ返却 |
| TC-Q-03 | limit制限          | limit=5                | 最大5件のみ返却        |
| TC-Q-04 | 類似度順ソート     | query="TypeScript"     | 最も類似した要約が先頭 |
| TC-Q-05 | クエリ埋め込み失敗 | embedSingle()がエラー  | Result.err返却         |

### 1.4 CommunitySummarizer.updateSummary()

| TC ID   | テストケース  | 入力              | 期待結果                          |
| ------- | ------------- | ----------------- | --------------------------------- |
| TC-U-01 | 要約更新      | 有効なcommunityId | 新しいCommunitySummary            |
| TC-U-02 | 存在しないID  | 無効なcommunityId | Result.err("Community not found") |
| TC-U-03 | createdAt更新 | 既存要約あり      | createdAtが新しい日時             |

---

## 2. プロンプトテスト

### 2.1 buildCommunitySummaryPrompt()

| TC ID   | テストケース               | 入力                     | 期待結果                         |
| ------- | -------------------------- | ------------------------ | -------------------------------- |
| TC-P-01 | エンティティリスト含有     | entities配列             | プロンプトにエンティティ情報含む |
| TC-P-02 | エンティティ上位20件制限   | 25件のentities           | 上位20件のみプロンプトに含む     |
| TC-P-03 | 関係リスト含有             | relations配列            | プロンプトに関係情報含む         |
| TC-P-04 | 関係上位30件制限           | 40件のrelations          | 上位30件のみプロンプトに含む     |
| TC-P-05 | 子コミュニティ要約含有     | childSummaries配列       | 子要約セクションが含まれる       |
| TC-P-06 | 子要約なし時セクション省略 | childSummaries=[]        | 子要約セクションなし             |
| TC-P-07 | detailedスタイル           | summaryStyle="detailed"  | "詳細で包括的な"ガイド含む       |
| TC-P-08 | conciseスタイル            | summaryStyle="concise"   | "簡潔で要点を押さえた"ガイド含む |
| TC-P-09 | technicalスタイル          | summaryStyle="technical" | "技術的な観点から"ガイド含む     |
| TC-P-10 | JSON出力形式指定           | 任意の入力               | JSON形式指示が含まれる           |
| TC-P-11 | maxSummaryTokens反映       | maxSummaryTokens=300     | "300トークン以内"が含まれる      |
| TC-P-12 | maxKeywords反映            | maxKeywords=15           | "最大15個"が含まれる             |

---

## 3. 統合テスト

### 3.1 ILLMProvider統合

| TC ID   | テストケース       | シナリオ            | 期待結果                            |
| ------- | ------------------ | ------------------- | ----------------------------------- |
| TC-I-01 | LLM正常呼び出し    | generate()成功      | JSONレスポンスがパースされる        |
| TC-I-02 | LLMエラー処理      | generate()失敗      | Result.errが返却                    |
| TC-I-03 | temperature設定    | summarize()呼び出し | temperature=0.3で呼び出される       |
| TC-I-04 | responseFormat設定 | summarize()呼び出し | responseFormat="json"で呼び出される |

### 3.2 IEmbeddingProvider統合

| TC ID   | テストケース       | シナリオ                  | 期待結果                         |
| ------- | ------------------ | ------------------------- | -------------------------------- |
| TC-I-05 | 埋め込み正常生成   | embedSingle()成功         | CommunitySummary.embeddingに格納 |
| TC-I-06 | 埋め込み失敗継続   | embedSingle()失敗         | embedding=undefinedで要約は成功  |
| TC-I-07 | クエリ埋め込み生成 | searchSummaries()呼び出し | クエリが埋め込みに変換される     |

### 3.3 IKnowledgeGraphStore統合

| TC ID   | テストケース               | シナリオ               | 期待結果                             |
| ------- | -------------------------- | ---------------------- | ------------------------------------ |
| TC-I-08 | エンティティ取得           | summarizeAll()呼び出し | findEntities()が呼び出される         |
| TC-I-09 | 関係取得                   | summarize()呼び出し    | getRelationsByEntity()が呼び出される |
| TC-I-10 | コミュニティ内関係フィルタ | 複数関係あり           | コミュニティ内の関係のみ返却         |

### 3.4 ICommunityRepository統合

| TC ID   | テストケース           | シナリオ                | 期待結果                      |
| ------- | ---------------------- | ----------------------- | ----------------------------- |
| TC-I-11 | 子コミュニティ要約取得 | useChildSummaries=true  | getSummary()が呼び出される    |
| TC-I-12 | 要約保存               | summarize()成功         | updateSummary()が呼び出される |
| TC-I-13 | コミュニティ取得       | updateSummary()呼び出し | findById()が呼び出される      |

---

## 4. E2Eフローテスト

| TC ID   | テストケース       | シナリオ                                 | 期待結果                         |
| ------- | ------------------ | ---------------------------------------- | -------------------------------- |
| TC-E-01 | 単一要約生成フロー | Community→プロンプト→LLM→埋め込み→DB保存 | 要約がDBに保存される             |
| TC-E-02 | 階層要約生成フロー | 子→親の順で要約生成                      | 親要約に子要約が反映             |
| TC-E-03 | 検索フロー         | 要約生成→検索                            | 生成した要約が検索結果に含まれる |
| TC-E-04 | 更新フロー         | 要約生成→更新                            | 新しい要約でDBが更新される       |

---

## 5. エッジケーステスト

| TC ID   | テストケース     | 入力                        | 期待結果                         |
| ------- | ---------------- | --------------------------- | -------------------------------- |
| TC-E-01 | 空のコミュニティ | memberEntityIds=[]          | 適切なエラーまたはデフォルト要約 |
| TC-E-02 | 単一エンティティ | memberEntityIds.length=1    | 正常に要約生成                   |
| TC-E-03 | 大量エンティティ | memberEntityIds.length=100+ | 上位20件のみ使用、正常に処理     |
| TC-E-04 | 大量関係         | relations.length=50+        | 上位30件のみ使用、正常に処理     |
| TC-E-05 | 深い階層         | level=5                     | 正常に処理                       |

---

## 完了条件

- [x] ユニットテストケースが設計されている（21件）
- [x] プロンプトテストケースが設計されている（12件）
- [x] 統合テストケースが設計されている（13件）
- [x] E2Eテストケースが設計されている（4件）
- [x] エッジケーステストが設計されている（5件）
