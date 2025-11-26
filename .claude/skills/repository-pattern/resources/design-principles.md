# Repository設計原則

## 1. コレクション抽象化原則

Repositoryは永続化されたオブジェクトのコレクションとして振る舞う。

**原則**:
- メモリ内コレクションと同様のインターフェースを提供
- クライアントは永続化メカニズムを意識しない
- オブジェクトの追加、削除、検索のみに集中

**適用チェックリスト**:
- [ ] `add(entity)` でオブジェクトを追加できるか？
- [ ] `remove(entity)` でオブジェクトを削除できるか？
- [ ] `findById(id)` でオブジェクトを取得できるか？
- [ ] クライアントコードにSQLやORM固有の記述がないか？

## 2. 集約ルート原則

RepositoryはAggregate Root（集約ルート）に対してのみ提供する。

**原則**:
- 1つの集約ルートに対して1つのRepository
- 集約内部のエンティティは集約ルート経由でアクセス
- 集約の境界を尊重した設計

**判断基準**:
- [ ] このエンティティは独立して存在できるか？
- [ ] 他のエンティティなしでは意味をなさないか？
- [ ] ライフサイクルが親エンティティに依存するか？

**例**:
```
✅ WorkflowRepository（集約ルート）
❌ WorkflowStepRepository（集約内部エンティティ）
→ WorkflowRepository経由でStepにアクセス
```

## 3. ドメイン表現原則

Repositoryのインターフェースはドメイン言語で表現する。

**原則**:
- メソッド名はビジネス用語を使用
- 技術的な詳細を隠蔽
- ドメインエキスパートが理解できる命名

**命名パターン**:
```
✅ findPendingWorkflows()
✅ findWorkflowsByUser(userId)
✅ findCompletedAfter(date)

❌ findByStatusIn(["PENDING", "PROCESSING"])
❌ selectWhereUserIdEquals(userId)
❌ queryWithCompletedAtGreaterThan(date)
```

## 4. 永続化無関心原則

ドメイン層はデータ永続化の詳細を知らない。

**原則**:
- ドメインエンティティはDBアノテーションを含まない
- Repositoryインターフェースは共通ドメイン層に配置
- 実装の詳細はインフラ層に隠蔽

**レイヤー配置**:
```
shared/core/interfaces/        # インターフェース（DB非依存）
shared/infrastructure/database/  # 実装（DB依存）
```

## 5. 単一責任原則

RepositoryはCRUD操作と検索のみを担当する。

**Repositoryの責務**:
- オブジェクトの永続化（Create）
- オブジェクトの取得（Read）
- オブジェクトの更新（Update）
- オブジェクトの削除（Delete）
- 検索条件によるフィルタリング

**Repositoryの責務外**:
- ビジネスルールの適用
- バリデーション
- トランザクション制御（通常は呼び出し側）
- ドメインイベントの発行

## 6. インターフェース分離原則

クライアントは使用するメソッドのみに依存する。

**パターン**:
```
// 読み取り専用インターフェース
interface ReadOnlyRepository<T> {
  findById(id): Promise<T | null>
  findAll(): Promise<T[]>
}

// 書き込みインターフェース
interface WritableRepository<T> {
  add(entity: T): Promise<void>
  update(entity: T): Promise<void>
  remove(entity: T): Promise<void>
}

// 完全なRepository
interface Repository<T> extends ReadOnlyRepository<T>, WritableRepository<T> {}
```

## 7. 依存性逆転原則

高レベルモジュールは低レベルモジュールに依存しない。

**適用**:
- ドメイン層がRepositoryインターフェースを定義
- インフラ層がインターフェースを実装
- 依存性注入でインスタンスを提供

**依存方向**:
```
UseCases → IRepository（インターフェース）
               ↑
         Repository（実装）
```

## 判断フローチャート

### Repositoryを作成すべきか？

```
エンティティがある
    ├─ 独立して永続化が必要？
    │   ├─ Yes → 集約ルートか？
    │   │   ├─ Yes → ✅ Repositoryを作成
    │   │   └─ No → ❌ 集約ルートのRepository経由
    │   └─ No → ❌ Repositoryは不要
```

### メソッドをRepositoryに追加すべきか？

```
新しい検索条件が必要
    ├─ データアクセスに関するか？
    │   ├─ Yes → ビジネスロジックを含むか？
    │   │   ├─ Yes → ❌ サービス層で実装
    │   │   └─ No → ✅ Repositoryに追加
    │   └─ No → ❌ 適切な層で実装
```
