# SkillScanner ページネーション機能 - タスク指示書

## メタ情報

```yaml
issue_number: 477
```

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | task-perf-skillscanner-page-001   |
| タスク名     | SkillScanner ページネーション機能 |
| 分類         | パフォーマンス                    |
| 対象機能     | SkillScanner                      |
| 優先度       | 低                                |
| 見積もり規模 | 小規模                            |
| ステータス   | 未実施                            |
| 発見元       | Phase 12: ドキュメント更新        |
| 発見日       | 2026-01-24                        |
| 関連タスク   | TASK-2A（SkillScanner実装）       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-2Aで実装されたSkillScannerは、scanAll()で全スキルを一度に返す設計となっている。
現状のスキル数（数十件程度）では問題ないが、将来的にスキル数が1000件を超える
エンタープライズ環境などでは、一度に全スキルを返すことがメモリ・レスポンス時間の
両面で問題となる可能性がある。

### 1.2 問題点・課題

| 問題点                     | 影響                    |
| -------------------------- | ----------------------- |
| 全スキルの一括返却         | メモリ使用量の増大      |
| スキル一覧UIの初期表示遅延 | 1000+スキル時にUXが低下 |
| 必要以上のデータ転送       | IPC通信のオーバーヘッド |

### 1.3 放置した場合の影響

| 影響カテゴリ     | 内容                                  |
| ---------------- | ------------------------------------- |
| ユーザー体験     | 大量スキル環境でUI表示が遅延          |
| メモリ効率       | 不要なスキルデータがメモリに滞留      |
| スケーラビリティ | 1000+スキル環境での実用性が制限される |

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillScannerにページネーション機能を追加し、大量スキル環境でも
効率的にスキル一覧を取得できるようにする。

### 2.2 最終ゴール

- ページ単位（デフォルト: 50件）でスキルを取得可能
- オフセットベースのページネーション
- 総スキル数の取得API
- 既存のscanAll()との互換性維持（オプショナル機能）

### 2.3 スコープ

#### 含むもの

- scanAll()へのオプショナルページネーションパラメータ追加
- getSkillCount() APIの追加
- ページネーション結果型（PaginatedResult）の定義
- UIコンポーネントとの統合（スキル選択UI）

#### 含まないもの

- カーソルベースページネーション
- サーバーサイドページネーション
- ソート機能（別タスクとして検討）
- フィルタリング機能（別タスクとして検討）

### 2.4 成果物

| 成果物               | 説明                                       |
| -------------------- | ------------------------------------------ |
| ページネーション実装 | `SkillScanner.ts`に追加                    |
| 結果型               | `PaginatedSkillResult`を@repo/sharedに追加 |
| ユニットテスト       | ページネーション動作の検証テスト           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-2A（SkillScanner実装）が完了していること
- キャッシュ機能の実装が望ましい（オプション）

### 3.2 依存タスク

| タスクID | タイトル         | 状態 |
| -------- | ---------------- | ---- |
| TASK-2A  | SkillScanner実装 | 完了 |

### 3.3 必要な知識

- TypeScriptジェネリクス
- 配列のslice操作
- オフセットベースページネーションの概念

### 3.4 推奨アプローチ

```typescript
// ページネーション結果型
interface PaginatedSkillResult {
  items: ScannedSkillMetadata[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ページネーションオプション
interface PaginationOptions {
  page?: number;      // デフォルト: 1
  pageSize?: number;  // デフォルト: 50
}

// SkillScanner拡張
class SkillScanner {
  async scanAll(): Promise<ScannedSkillMetadata[]>;
  async scanAllPaginated(options?: PaginationOptions): Promise<PaginatedSkillResult>;
  async getSkillCount(): Promise<number>;
}

// 実装例
async scanAllPaginated(options?: PaginationOptions): Promise<PaginatedSkillResult> {
  const { page = 1, pageSize = 50 } = options ?? {};
  const allSkills = await this.scanAll();
  const start = (page - 1) * pageSize;
  const items = allSkills.slice(start, start + pageSize);

  return {
    items,
    total: allSkills.length,
    page,
    pageSize,
    hasMore: start + pageSize < allSkills.length,
  };
}
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称       | 目的                         |
| ----- | ---------- | ---------------------------- |
| 1     | 設計       | ページネーションの詳細設計   |
| 2     | テスト作成 | ページネーション動作のテスト |
| 3     | 実装       | ページネーション機能の実装   |
| 4     | UI統合     | スキル選択UIへの統合         |

### Phase 1: 設計

#### 目的

ページネーションの詳細設計を行う。

#### 手順

1. PaginatedSkillResult型の設計
2. PaginationOptions型の設計
3. scanAllPaginated() APIの設計
4. getSkillCount() APIの設計

#### 成果物

- 設計ドキュメント（outputs/phase-1/design.md）

#### 完了条件

- [ ] 結果型が設計されている
- [ ] オプション型が設計されている
- [ ] API設計が完了している

### Phase 2: テスト作成（TDD Red）

#### 目的

ページネーション動作を検証するテストを作成する。

#### 手順

1. 1ページ目の取得テスト
2. 2ページ目以降の取得テスト
3. 最終ページの取得テスト（hasMore=false）
4. 空結果のテスト
5. getSkillCount()のテスト

#### 成果物

- `SkillScanner.test.ts`へのテスト追加

#### 完了条件

- [ ] ページネーションテストが5件以上作成されている
- [ ] テストがFAIL状態（未実装のため）

### Phase 3: 実装（TDD Green）

#### 目的

ページネーション機能を実装してテストをPASSさせる。

#### 手順

1. PaginatedSkillResult型を@repo/sharedに追加
2. PaginationOptions型を追加
3. scanAllPaginated()を実装
4. getSkillCount()を実装

#### 成果物

- `SkillScanner.ts`の更新
- `packages/shared/src/types/skill.ts`の更新

#### 完了条件

- [ ] 全テストがPASS
- [ ] 型チェックがPASS
- [ ] Lintエラーなし

### Phase 4: UI統合

#### 目的

スキル選択UIにページネーションを統合する。

#### 手順

1. スキル選択UIにページネーションコントロールを追加
2. 「もっと読み込む」ボタンまたは無限スクロールを実装
3. UIテストを追加

#### 成果物

- UIコンポーネントの更新
- コンポーネントテスト

#### 完了条件

- [ ] ページネーションがUIで機能する
- [ ] UXが自然で使いやすい

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] scanAllPaginated()で指定ページのスキルを取得可能
- [ ] pageSize指定で取得件数を変更可能
- [ ] hasMoreで次ページの有無を判定可能
- [ ] getSkillCount()で総スキル数を取得可能

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] 型チェック: PASS
- [ ] Lint: エラーなし

### ドキュメント要件

- [ ] システム仕様書（interfaces-agent-sdk.md）に記載
- [ ] 型定義をskill.tsに追加

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ            | 期待結果                         |
| ------ | ------------------- | -------------------------------- |
| TC-001 | page=1, pageSize=50 | 最初の50件が返される             |
| TC-002 | page=2, pageSize=50 | 51-100件目が返される             |
| TC-003 | 最終ページ          | hasMore=false                    |
| TC-004 | スキル0件           | items=[], total=0, hasMore=false |
| TC-005 | getSkillCount()     | 正確な総数が返される             |

### 検証手順

1. ユニットテストを実行: `pnpm --filter @repo/desktop test SkillScanner`
2. 100+スキル環境でUIのページネーション動作を確認
3. 型チェック: `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                           |
| ------------------------ | ------ | -------- | ------------------------------ |
| 内部でフルスキャン実行   | 中     | 高       | キャッシュ機能との併用         |
| ページング中のデータ変更 | 低     | 低       | 増分スキャン機能との併用で検出 |
| 既存APIとの互換性        | 低     | 低       | scanAll()は変更なしで維持      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| SkillScanner型定義         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  |
| SkillScannerアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| TASK-2A実装ガイド          | `docs/30-workflows/TASK-2A/outputs/phase-12/implementation-guide.md`         |

### 参考資料

- [Offset Pagination vs Cursor Pagination](https://uxdesign.cc/why-facebook-says-cursor-pagination-is-the-greatest-d6b98d86b6c0)

---

## 9. 備考

### 発見経緯

TASK-2A Phase 12でのドキュメント更新時に「将来の改善提案」として記録された項目。
1000+スキル環境を想定したスケーラビリティ対策だが、現状は優先度「低」。

### 補足事項

- キャッシュ機能と組み合わせないと内部でフルスキャンが実行される点に注意
- カーソルベースページネーションは将来の拡張として検討
- ソート・フィルタリング機能は別タスクとして切り出し推奨

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
