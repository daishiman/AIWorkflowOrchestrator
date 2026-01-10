# 受け入れ基準: コミュニティ検出 (Leiden)

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-08-02                |
| タスク名 | コミュニティ検出 (Leiden) |
| 作成日   | 2026-01-10                |
| 形式     | Given-When-Then (GWT)     |

---

## AC-001: コミュニティ検出

### AC-001-1: 基本的なコミュニティ検出

```gherkin
Scenario: 接続されたグラフからコミュニティを検出する
  Given Knowledge Graphに10個以上のエンティティが存在する
    And エンティティ間に20個以上のリレーションが存在する
  When LeidenAlgorithm.detect()を実行する
  Then CommunityDetectionResultが返される
    And result.structure.communities.length >= 1
    And result.structure.totalModularity > 0
    And result.processingTimeMs > 0
```

### AC-001-2: 空グラフの処理

```gherkin
Scenario: 空のグラフに対してコミュニティ検出を実行する
  Given Knowledge Graphにエンティティが存在しない
  When LeidenAlgorithm.detect()を実行する
  Then 空のCommunityStructureが返される
    And result.structure.communities.length === 0
    And result.structure.levels === 0
```

### AC-001-3: 孤立ノードの処理

```gherkin
Scenario: 接続のないノードを含むグラフで検出を実行する
  Given 5個のエンティティが存在する
    And 2個のエンティティのみが相互接続されている
    And 3個のエンティティは孤立している
  When LeidenAlgorithm.detect()を実行する
  Then 接続されたエンティティは同一コミュニティに属する
    And 孤立エンティティは個別コミュニティまたは除外される
```

---

## AC-002: 階層的コミュニティ構造

### AC-002-1: 複数レベルの階層構造

```gherkin
Scenario: 階層的なコミュニティ構造を生成する
  Given 50個以上のエンティティが存在する
    And 複数のクラスター構造を持つグラフである
  When detect()をmaxLevels=3で実行する
  Then result.structure.levels <= 3
    And レベル0のコミュニティが存在する
    And レベル1以上のコミュニティにはparentCommunityIdが設定される
```

### AC-002-2: 親子関係の整合性

```gherkin
Scenario: 親子関係が正しく設定される
  Given 階層的なコミュニティ構造が検出された
  When 子コミュニティの親を確認する
  Then 子コミュニティのparentCommunityIdが親コミュニティのidと一致する
    And 親コミュニティのchildCommunityIdsに子コミュニティのidが含まれる
```

### AC-002-3: エンティティのマッピング

```gherkin
Scenario: エンティティからコミュニティへのマッピングが正しい
  Given コミュニティ検出が完了した
  When entityToCommunityマップを確認する
  Then 全エンティティがいずれかのコミュニティに属している
    And 階層レベルごとにコミュニティIDが格納されている
```

---

## AC-003: パラメータ制御

### AC-003-1: resolution パラメータ

```gherkin
Scenario: resolutionパラメータでコミュニティサイズを制御する
  Given 同一のKnowledge Graphが存在する
  When resolution=0.5で検出を実行する
    And resolution=2.0で検出を実行する
  Then resolution=2.0の結果はresolution=0.5より多くのコミュニティを持つ
```

### AC-003-2: maxLevels パラメータ

```gherkin
Scenario: maxLevelsで階層深度を制限する
  Given 100個以上のエンティティが存在する
  When maxLevels=2で検出を実行する
  Then result.structure.levels <= 2
```

### AC-003-3: minCommunitySize パラメータ

```gherkin
Scenario: minCommunitySizeで最小サイズを制限する
  Given グラフにコミュニティが存在する
  When minCommunitySize=5で検出を実行する
  Then 全コミュニティのmemberEntityIds.length >= 5
    または サイズ未満のエンティティは親コミュニティに統合される
```

### AC-003-4: seed パラメータによる再現性

```gherkin
Scenario: seedパラメータで再現可能な結果を得る
  Given 同一のKnowledge Graphが存在する
  When seed=12345で検出を2回実行する
  Then 両方の結果でコミュニティ構造が完全に一致する
```

---

## AC-004: 永続化

### AC-004-1: 検出結果の保存

```gherkin
Scenario: コミュニティ検出結果をDBに保存する
  Given コミュニティ検出が成功した
  When saveResults()を実行する
  Then Result.ok(undefined)が返される
    And communitiesテーブルにコミュニティが保存される
    And entity_communitiesテーブルにマッピングが保存される
```

### AC-004-2: 既存コミュニティの置換

```gherkin
Scenario: 再検出時に既存コミュニティを置換する
  Given 以前の検出結果がDBに保存されている
  When 新しい検出を実行しsaveResults()を呼ぶ
  Then 既存のコミュニティが削除される
    And 新しいコミュニティが保存される
```

---

## AC-005: コミュニティ取得

### AC-005-1: エンティティIDからの取得

```gherkin
Scenario: エンティティIDからコミュニティを取得する
  Given エンティティがコミュニティに属している
  When getCommunitiesForEntity(entityId)を実行する
  Then Result.ok(Community[])が返される
    And 全階層レベルのコミュニティが含まれる
```

### AC-005-2: レベル別取得

```gherkin
Scenario: 特定レベルのコミュニティを取得する
  Given 階層的なコミュニティが存在する
  When getCommunitiesByLevel(0)を実行する
  Then level=0のコミュニティのみが返される
```

### AC-005-3: メンバー取得

```gherkin
Scenario: コミュニティのメンバーエンティティを取得する
  Given コミュニティがメンバーを持っている
  When getCommunityMembers(communityId)を実行する
  Then Result.ok(StoredEntity[])が返される
    And コミュニティのmemberEntityIdsと一致するエンティティが含まれる
```

---

## AC-006: エラーハンドリング

### AC-006-1: グラフ取得エラー

```gherkin
Scenario: グラフデータ取得に失敗した場合
  Given IKnowledgeGraphStoreがエラーを返す
  When detect()を実行する
  Then Result.err(Error)が返される
    And エラーメッセージに原因が含まれる
```

### AC-006-2: 存在しないコミュニティの取得

```gherkin
Scenario: 存在しないコミュニティのメンバーを取得する
  Given 指定IDのコミュニティが存在しない
  When getCommunityMembers(invalidId)を実行する
  Then Result.err(Error)が返される
    And エラーメッセージに"Community not found"が含まれる
```

### AC-006-3: 存在しないエンティティの検索

```gherkin
Scenario: 存在しないエンティティのコミュニティを検索する
  Given 指定IDのエンティティが存在しない
  When getCommunitiesForEntity(invalidId)を実行する
  Then Result.ok([])が返される（空配列）
```

---

## AC-007: パフォーマンス

### AC-007-1: 処理時間

```gherkin
Scenario: 1000ノードのグラフを処理する
  Given 1000個のエンティティと適切な数のリレーションが存在する
  When detect()を実行する
  Then 処理時間が10秒以内である
```

### AC-007-2: メモリ使用量

```gherkin
Scenario: メモリ使用量が制限内である
  Given 1000個のエンティティが存在する
  When detect()を実行する
  Then ヒープメモリ増加がグラフサイズの3倍以内である
```

---

## AC-008: インターフェース実装

### AC-008-1: ICommunityDetector準拠

```gherkin
Scenario: CommunityDetectorがICommunityDetectorを実装する
  Given CommunityDetectorクラスが存在する
  When インターフェースメソッドを確認する
  Then detect, saveResults, getCommunitiesForEntity,
       getCommunitiesByLevel, getCommunityMembersが実装されている
```

### AC-008-2: Result型の使用

```gherkin
Scenario: 全メソッドがResult型を返す
  Given ICommunityDetectorの任意のメソッドを呼ぶ
  When メソッドが完了する
  Then Result<T, Error>型が返される
    And result.success === trueまたはfalse
```

---

## 検証チェックリスト

| AC ID    | シナリオ                     | テスト実装 | 合格 |
| -------- | ---------------------------- | ---------- | ---- |
| AC-001-1 | 基本的なコミュニティ検出     | [ ]        | [ ]  |
| AC-001-2 | 空グラフの処理               | [ ]        | [ ]  |
| AC-001-3 | 孤立ノードの処理             | [ ]        | [ ]  |
| AC-002-1 | 複数レベルの階層構造         | [ ]        | [ ]  |
| AC-002-2 | 親子関係の整合性             | [ ]        | [ ]  |
| AC-002-3 | エンティティのマッピング     | [ ]        | [ ]  |
| AC-003-1 | resolutionパラメータ         | [ ]        | [ ]  |
| AC-003-2 | maxLevelsパラメータ          | [ ]        | [ ]  |
| AC-003-3 | minCommunitySizeパラメータ   | [ ]        | [ ]  |
| AC-003-4 | seedによる再現性             | [ ]        | [ ]  |
| AC-004-1 | 検出結果の保存               | [ ]        | [ ]  |
| AC-004-2 | 既存コミュニティの置換       | [ ]        | [ ]  |
| AC-005-1 | エンティティIDからの取得     | [ ]        | [ ]  |
| AC-005-2 | レベル別取得                 | [ ]        | [ ]  |
| AC-005-3 | メンバー取得                 | [ ]        | [ ]  |
| AC-006-1 | グラフ取得エラー             | [ ]        | [ ]  |
| AC-006-2 | 存在しないコミュニティの取得 | [ ]        | [ ]  |
| AC-006-3 | 存在しないエンティティの検索 | [ ]        | [ ]  |
| AC-007-1 | 処理時間                     | [ ]        | [ ]  |
| AC-007-2 | メモリ使用量                 | [ ]        | [ ]  |
| AC-008-1 | ICommunityDetector準拠       | [ ]        | [ ]  |
| AC-008-2 | Result型の使用               | [ ]        | [ ]  |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
