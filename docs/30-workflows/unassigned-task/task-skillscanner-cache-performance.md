# SkillScanner キャッシュ機能 - タスク指示書

## メタ情報

```yaml
issue_number: 475
```

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | task-perf-skillscanner-cache-001 |
| タスク名     | SkillScanner キャッシュ機能      |
| 分類         | パフォーマンス                   |
| 対象機能     | SkillScanner                     |
| 優先度       | 低                               |
| 見積もり規模 | 中規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 12: ドキュメント更新       |
| 発見日       | 2026-01-24                       |
| 関連タスク   | TASK-2A（SkillScanner実装）      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-2Aで実装されたSkillScannerは、毎回ファイルシステムを直接スキャンして
スキルメタデータを取得する設計となっている。現状のスキル数（数十件程度）では
問題ないが、将来的にスキル数が増加した場合やスキャン頻度が高い場合に
パフォーマンス問題が発生する可能性がある。

### 1.2 問題点・課題

| 問題点                           | 影響                             |
| -------------------------------- | -------------------------------- |
| 毎回のファイルシステムアクセス   | I/O負荷が高い                    |
| SKILL.md/YAML解析の重複実行      | CPU負荷・応答時間の増加          |
| スキル数増加時のスケーラビリティ | 100+スキル時に顕著な遅延の可能性 |

### 1.3 放置した場合の影響

| 影響カテゴリ     | 内容                                 |
| ---------------- | ------------------------------------ |
| ユーザー体験     | スキル選択UI表示に遅延が発生         |
| システム負荷     | 不要なI/O・CPU負荷が継続             |
| スケーラビリティ | 大量スキル環境での実用性が制限される |

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillScannerにメモリキャッシュを実装し、スキャン結果を一定時間キャッシュすることで
重複スキャンを回避し、パフォーマンスを向上させる。

### 2.2 最終ゴール

- スキャン結果がTTL（デフォルト: 5分）期間キャッシュされる
- キャッシュヒット時はファイルシステムアクセスをスキップ
- キャッシュの手動クリア（invalidate）機能を提供
- 100+スキル環境でも1秒以内にスキル一覧を表示

### 2.3 スコープ

#### 含むもの

- メモリ内キャッシュの実装（Map<string, CachedResult>）
- TTL（Time To Live）ベースの有効期限管理
- キャッシュ無効化API（invalidateCache）
- SkillScanner.scanAll()のキャッシュ対応

#### 含まないもの

- 永続化キャッシュ（Redis/SQLite等）
- ファイル監視による自動無効化（別タスク: 増分スキャン）
- 分散キャッシュ

### 2.4 成果物

| 成果物         | 説明                             |
| -------------- | -------------------------------- |
| キャッシュ実装 | `SkillScanner.ts`に追加          |
| 設定オプション | `SkillScannerOptions.cacheTtlMs` |
| ユニットテスト | キャッシュ動作の検証テスト       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-2A（SkillScanner実装）が完了していること
- 既存のSkillScannerテストが全てPASSしていること

### 3.2 依存タスク

| タスクID | タイトル         | 状態 |
| -------- | ---------------- | ---- |
| TASK-2A  | SkillScanner実装 | 完了 |

### 3.3 必要な知識

- TypeScript Mapデータ構造
- キャッシュ設計パターン（TTL、LRU）
- Vitest非同期テスト

### 3.4 推奨アプローチ

```typescript
// キャッシュエントリ型
interface CacheEntry {
  data: ScannedSkillMetadata[];
  timestamp: number;
}

// SkillScannerOptionsの拡張
interface SkillScannerOptions {
  aiworkflowSkillsDir?: string;
  claudeSkillsDir?: string;
  cacheTtlMs?: number; // デフォルト: 5分 (300000)
}

// キャッシュロジック
class SkillScanner {
  private cache: CacheEntry | null = null;
  private readonly cacheTtlMs: number;

  async scanAll(): Promise<ScannedSkillMetadata[]> {
    if (this.isCacheValid()) {
      return this.cache!.data;
    }
    const result = await this.doScan();
    this.cache = { data: result, timestamp: Date.now() };
    return result;
  }

  invalidateCache(): void {
    this.cache = null;
  }
}
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称       | 目的                   |
| ----- | ---------- | ---------------------- |
| 1     | 設計       | キャッシュ設計の詳細化 |
| 2     | テスト作成 | キャッシュ動作のテスト |
| 3     | 実装       | キャッシュ機能の実装   |
| 4     | 検証       | パフォーマンス検証     |

### Phase 1: 設計

#### 目的

キャッシュの詳細設計を行う。

#### 手順

1. キャッシュエントリの型定義を設計
2. SkillScannerOptionsへのcacheTtlMsオプション追加設計
3. invalidateCacheメソッドのシグネチャ設計

#### 成果物

- 設計ドキュメント（outputs/phase-1/design.md）

#### 完了条件

- [ ] キャッシュエントリ型が定義されている
- [ ] オプション型が拡張されている
- [ ] 無効化APIが設計されている

### Phase 2: テスト作成（TDD Red）

#### 目的

キャッシュ動作を検証するテストを作成する。

#### 手順

1. キャッシュヒット時のテスト作成
2. キャッシュミス時のテスト作成
3. TTL期限切れ時のテスト作成
4. invalidateCache呼び出し時のテスト作成

#### 成果物

- `SkillScanner.test.ts`へのテスト追加

#### 完了条件

- [ ] キャッシュ関連テストが5件以上作成されている
- [ ] テストがFAIL状態（未実装のため）

### Phase 3: 実装（TDD Green）

#### 目的

キャッシュ機能を実装してテストをPASSさせる。

#### 手順

1. CacheEntry型をSkillScanner.tsに追加
2. cacheプロパティとcacheTtlMsプロパティを追加
3. isCacheValid()メソッドを実装
4. scanAll()にキャッシュロジックを追加
5. invalidateCache()メソッドを実装

#### 成果物

- `SkillScanner.ts`の更新

#### 完了条件

- [ ] 全テストがPASS
- [ ] 型チェックがPASS
- [ ] Lintエラーなし

### Phase 4: パフォーマンス検証

#### 目的

キャッシュによるパフォーマンス改善を検証する。

#### 手順

1. 100スキル環境をシミュレート
2. キャッシュなし/ありでの応答時間を計測
3. 結果をレポートに記録

#### 成果物

- パフォーマンス検証レポート

#### 完了条件

- [ ] キャッシュヒット時の応答時間が10ms以下
- [ ] キャッシュミス時と比較して90%以上の改善

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] scanAll()がキャッシュ結果を返す（TTL内）
- [ ] TTL期限切れ時に再スキャンが実行される
- [ ] invalidateCache()でキャッシュがクリアされる
- [ ] cacheTtlMsオプションでTTLをカスタマイズ可能

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] 型チェック: PASS
- [ ] Lint: エラーなし

### ドキュメント要件

- [ ] システム仕様書（interfaces-agent-sdk.md）に記載
- [ ] 実装ガイドに使用方法を記載

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ            | 期待結果                     |
| ------ | ------------------- | ---------------------------- |
| TC-001 | 初回scanAll()       | ファイルスキャンが実行される |
| TC-002 | 2回目scanAll()      | キャッシュから返される       |
| TC-003 | TTL期限切れ後       | 再スキャンが実行される       |
| TC-004 | invalidateCache()後 | 次のscanAll()で再スキャン    |

### 検証手順

1. ユニットテストを実行: `pnpm --filter @repo/desktop test SkillScanner`
2. パフォーマンステストを実行
3. 型チェック: `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                              |
| ---------------- | ------ | -------- | --------------------------------- |
| キャッシュ不整合 | 中     | 低       | invalidateCache()の適切な呼び出し |
| メモリ使用量増加 | 低     | 低       | スキル数は有限なので影響軽微      |
| TTL設定の複雑化  | 低     | 低       | デフォルト値を適切に設定          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| SkillScanner型定義         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  |
| SkillScannerアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| TASK-2A実装ガイド          | `docs/30-workflows/TASK-2A/outputs/phase-12/implementation-guide.md`         |

### 参考資料

- [Node.js キャッシュパターン](https://nodejs.org/en/docs/guides/)
- [TypeScript Map](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

---

## 9. 備考

### 発見経緯

TASK-2A Phase 12でのドキュメント更新時に「将来の改善提案」として記録された項目。
現状は優先度「低」だが、スキル数が100を超える環境では実装を検討すべき。

### 補足事項

- 増分スキャン機能（別タスク）と組み合わせることで更に効果的
- Redis等の外部キャッシュは将来の拡張として検討

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
