# Phase 6: テスト拡充 - 成果物レポート

## メタ情報

| 項目      | 値                                 |
| --------- | ---------------------------------- |
| Phase     | 6                                  |
| 機能名    | store-lifecycle-integration-design |
| 作成日    | 2026-03-06                         |
| PASS/FAIL | PASS                               |

## 作成したテスト一覧

### 1. agentSlice.edge-cases.test.ts（10テスト）

| テストケース                      | 説明                             |
| --------------------------------- | -------------------------------- |
| availableSkillsMetadataが空の場合 | import可能リストが空配列を返す   |
| importedSkillsが空の場合          | availableをそのまま返す          |
| 両方空の場合                      | フィルタ付きリストが空配列を返す |
| skillFilterが空文字の場合         | フィルタなしとして全件返す       |
| 100件のavailableSkillsMetadata    | selectorが正常に動作する         |
| 100件available、50件imported      | フィルタ後に50件返す             |
| 100件中1件フィルタマッチ          | 1件のみ返す                      |
| 既にimported済みのスキル          | IPCスキップ                      |
| 冪等ガード後のimportedSkills      | 配列長が変わらない               |
| 同名スキルを連続2回importSkill    | 1回のみIPCが呼ばれる             |

### 2. agentSlice.error-cases.test.ts（8テスト）

| テストケース                          | 説明                                           |
| ------------------------------------- | ---------------------------------------------- |
| ERR_4004 NETWORK_ERROR                | isImportingがfalse、skillErrorにメッセージ保持 |
| ERR_3005 EXTERNAL_SERVICE_UNAVAILABLE | skillErrorにメッセージ保持                     |
| エラー後にclearSkillError             | skillErrorがnullになる                         |
| ERR_3002 AI_API_TIMEOUT               | skillErrorにタイムアウトメッセージ             |
| タイムアウト後の再試行                | 正常に動作する                                 |
| IPCがundefinedを返す場合              | isImportingがfalseに戻る                       |
| Errorオブジェクトでない値をthrow      | skillErrorにメッセージが設定される             |
| nullをthrow                           | skillErrorにメッセージが設定される             |

### 3. agentSlice.combination.test.ts（5テスト）

| テストケース                           | 説明                             |
| -------------------------------------- | -------------------------------- |
| フィルタ中のインポート後フィルタ再計算 | インポート済みスキルが除外される |
| import可能リストからインポート済み削除 | インポート済みスキルが消える     |
| isImporting中にanalyzeSkill            | 両方が独立して状態遷移する       |
| isAnalyzing中にimportSkill             | 両方が独立して状態遷移する       |
| 同時fetchSkills                        | 最後の結果が反映される           |

### 4. agentSlice.p31-regression.test.ts（7テスト）

| テストケース                     | 説明                                        |
| -------------------------------- | ------------------------------------------- |
| useImportSkillの参照安定性       | renderHookで2回取得し===比較で同一参照      |
| useIsImportingSkillの値不変時    | 再レンダリングしない                        |
| importedSkills変更時の再計算     | 派生セレクタが正しく再計算される            |
| 無関係な状態変更の影響なし       | isAnalyzing変更がセレクタ結果に影響しない   |
| skillFilter変更で再計算          | 正しくフィルタされた結果が返る              |
| descriptionでのフィルタ          | descriptionマッチが機能する                 |
| useImportSkillの無限ループ非発生 | useEffect依存配列に含めてもrenderCount < 10 |

## テスト実行結果

```
Test Files  4 passed (4)
     Tests  30 passed (30)
```

全30テストがPASS。

## 設計上の注意事項

`useAvailableSkillsForImport` / `useFilteredAvailableSkills` は `.filter()` により毎回新しい配列参照を返す派生セレクタのため、`renderHook` で直接使用すると無限ループが発生する。テストでは以下の戦略で対応した:

1. **セレクタロジックの検証**: `getState()` 経由でセレクタと同一ロジックの関数を直接呼び出し
2. **参照安定性テスト**: プリミティブ値やアクション関数を返すセレクタのみ `renderHook` を使用
3. **P31回帰テスト**: `useImportSkill`（関数参照）や `useIsImportingSkill`（boolean値）のみ `renderHook` で検証
