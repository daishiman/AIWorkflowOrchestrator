# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | 未実施                            |
| 作成日     | 2026-01-18                        |
| 機能名     | clean-architecture-refactoring    |
| タスクID   | ARCH-001                          |

---

## 目的

TDDサイクルの最終フェーズとして、コード品質を改善しつつテストをGreen状態に維持する。

## 背景

Phase 5で「テストを通す最小限の実装」を行ったため、コードの可読性・保守性を向上させるリファクタリングを行う。テストが全てPASSし続けることを確認しながら進める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード重複の除去

**目的**: 重複コードを共通化し、DRY原則を徹底する

**実行手順**:

1. マッパー間の重複を確認する:
   - 日付変換ロジックの共通化
   - 値オブジェクト生成ロジックの共通化

2. Use Case間の重複を確認する:
   - エラーハンドリングパターンの共通化
   - リポジトリ呼び出しパターンの共通化

3. 共通ユーティリティを作成する（必要な場合）:
   ```typescript
   // packages/shared/src/core/utils/date-utils.ts
   export function unixToDate(unix: number): Date {
     /* ... */
   }
   export function dateToUnix(date: Date): number {
     /* ... */
   }
   ```

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run
```

- [ ] リファクタリング後もテストが全てPASSすることを確認

**期待される成果物**:

- 重複除去されたコード
- 共通ユーティリティ（必要な場合）

---

### タスク2: 命名の改善

**目的**: コードの可読性を向上させる

**実行手順**:

1. 変数名・メソッド名を確認する:
   - ユビキタス言語に沿った命名になっているか
   - 意図が明確に伝わる命名になっているか

2. 改善が必要な箇所を修正する:
   - 略語を避け、フルネームを使用
   - 動詞+名詞の形式でメソッド名を統一

3. 型名を確認する:
   - DTO/Entity/Value Objectの区別が明確か
   - 接尾辞が一貫しているか（DTO, Entity, Error等）

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run
```

- [ ] リファクタリング後もテストが全てPASSすることを確認

**期待される成果物**:

- 命名が改善されたコード

---

### タスク3: Result型チェーンの最適化

**目的**: Railway-Oriented Programmingパターンを適切に活用する

**実行手順**:

1. ネストしたif文をResult.flatMapに置き換える:

   ```typescript
   // Before
   const result1 = await operation1();
   if (!result1.ok) return result1;
   const result2 = await operation2(result1.value);
   if (!result2.ok) return result2;

   // After
   return await operation1().flatMap((value1) => operation2(value1));
   ```

2. 早期リターンパターンを適用する:
   - エラーチェックを先に行う
   - 正常系は最後に記述

3. Result型のユーティリティメソッドを活用する:
   - `map()` で値の変換
   - `flatMap()` でResult連鎖
   - `getOrElse()` でデフォルト値

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run
```

- [ ] リファクタリング後もテストが全てPASSすることを確認

**期待される成果物**:

- Result型が適切に活用されたコード

---

### タスク4: エンティティのカプセル化強化

**目的**: ドメインモデルの不変条件をより強固に保護する

**実行手順**:

1. privateフィールドの確認:
   - 全フィールドがprivateになっているか
   - 公開が必要なフィールドはgetterを経由しているか

2. ミューテーションメソッドの確認:
   - 状態変更は必ずメソッド経由か
   - メソッドが不変条件を保護しているか

3. ファクトリメソッドの確認:
   - constructorがprivateになっているか
   - 生成時にバリデーションが行われているか

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run
```

- [ ] リファクタリング後もテストが全てPASSすることを確認

**期待される成果物**:

- カプセル化が強化されたエンティティ

---

### タスク5: 旧実装の削除（Strangler Fig Pattern完了）

**目的**: 旧アーキテクチャのコードを削除する

**実行手順**:

1. フィーチャーフラグ `USE_NEW_CHAT_HISTORY_ARCH` の状態を確認する:
   - 全環境でONになっていることを確認

2. 旧実装を削除する:
   - `packages/shared/src/features/chat-history/chat-history-service.ts`（旧サービス）
   - `packages/shared/src/repositories/chat-session-repository.ts`（旧リポジトリ）
   - `packages/shared/src/repositories/chat-message-repository.ts`（旧リポジトリ）
   - 旧実装を参照しているコード

3. フィーチャーフラグを削除する:
   - フラグの定義を削除
   - フラグによる分岐を削除

4. 不要なimportを整理する:
   - 未使用のimportを削除
   - barrel export (index.ts) を更新

**TDD検証**:

```bash
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが全てPASSすることを確認
- [ ] TypeScript型エラーがないことを確認

**期待される成果物**:

- 旧実装が削除されたクリーンなコードベース

---

### タスク6: ドキュメントコメントの追加

**目的**: 公開APIにJSDocコメントを追加する

**実行手順**:

1. 公開インターフェースにJSDocを追加する:

   ```typescript
   /**
    * チャットセッションを作成する
    * @param input - セッション作成パラメータ
    * @returns 作成されたセッションDTO、またはエラー
    * @example
    * const result = await createSession.execute({ userId: 'user-1' })
    * if (result.ok) {
    *   console.log(result.value.session.id)
    * }
    */
   async execute(input: CreateChatSessionInput): Promise<Result<CreateChatSessionOutput, UseCaseError>>
   ```

2. 複雑なビジネスロジックにコメントを追加する:
   - ピン留め上限チェック
   - プレビュー生成ロジック

3. 型定義にJSDocを追加する:
   - DTO
   - エラー型

**期待される成果物**:

- JSDocコメントが追加されたコード

---

### タスク7: 最終テスト実行

**目的**: 全リファクタリング後にテストがPASSすることを確認する

**実行手順**:

1. 全テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run
   pnpm --filter @repo/desktop test:run
   ```

2. 型チェックを実行する:

   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck
   ```

3. Lintを実行する:

   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/desktop lint
   ```

4. リファクタリングレポートを作成する:
   - 実施したリファクタリングの一覧
   - 削除したコードの一覧
   - コード品質の改善ポイント

**期待される成果物**:

- `outputs/phase-8/refactoring-report.md` - リファクタリングレポート

---

## 参照資料

| 参照資料      | パス               | 内容           |
| ------------- | ------------------ | -------------- |
| Phase 5成果物 | 実装コード群       | 実装コード     |
| Phase 7成果物 | `outputs/phase-7/` | カバレッジ情報 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                 |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | インターフェース仕様 |

---

## 成果物

| 成果物                       | パス                                    | 内容                 |
| ---------------------------- | --------------------------------------- | -------------------- |
| リファクタリングされたコード | 実装ファイル群                          | 品質改善されたコード |
| リファクタリングレポート     | `outputs/phase-8/refactoring-report.md` | リファクタリング内容 |

---

## 統合テスト連携

リファクタ後のアーキテクチャ準拠を確認すること:

- 全アーキテクチャテストがPASSすること
- 旧実装削除後も全テストがPASSすること
- dependency-cruiser違反が0件であること

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] コード重複が除去されている
- [ ] 命名が改善されている
- [ ] Result型チェーンが最適化されている
- [ ] エンティティのカプセル化が強化されている
- [ ] 旧実装が削除されている
- [ ] フィーチャーフラグが削除されている
- [ ] JSDocコメントが追加されている
- [ ] 全テストがPASSしている
- [ ] 型エラーがない
- [ ] Lintエラーがない
- [ ] リファクタリングレポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 8ステータスを更新

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-9-quality.md`
