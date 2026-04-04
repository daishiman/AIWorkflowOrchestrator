# SkillCreatorVerificationEngine Layer 1/2 検証結果キャッシュ実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1741
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | task-perf-verification-engine-cache-007                         |
| タスク名     | SkillCreatorVerificationEngine Layer 1/2 検証結果キャッシュ実装 |
| 分類         | パフォーマンス（perf）                                          |
| 対象機能     | SkillCreatorVerificationEngine / 性能最適化                     |
| 優先度       | 低（P2）                                                        |
| 見積もり規模 | 小                                                              |
| ステータス   | 未実施                                                          |
| 発見元       | Phase 12                                                        |
| 発見日       | 2026-03-29                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01 で実装された `SkillCreatorVerificationEngine` は、`verify()` が呼び出されるたびに
ファイルシステムへアクセスして Layer 1/2 のチェックを実行する設計になっている。
現在のスキル数が少ない段階では問題ないが、スキル数が 50 以上に増えた場合や
verify→improve→re-verify ループが繰り返される運用フローでは、ファイル I/O が
性能ボトルネックになる可能性がある。

### 1.2 問題点・課題

| 問題点                                                      | 影響                                        |
| ----------------------------------------------------------- | ------------------------------------------- |
| verify 呼び出しのたびに全スキルの SKILL.md を読み直す       | I/O 負荷が高い（特にスキル数 50+ 以上）     |
| キャッシュ機構がないため短時間の重複検証でも毎回 I/O が発生 | verify→improve→re-verify ループでの応答遅延 |
| 検証結果の再利用機構がない                                  | CPU 時間・I/O 帯域の無駄な消費              |

### 1.3 放置した場合の影響

| 影響カテゴリ     | 内容                                                 |
| ---------------- | ---------------------------------------------------- |
| ユーザー体験     | スキル改善ループ時の応答が遅くなり、操作性が低下する |
| システム負荷     | 不要なファイル I/O が継続的に発生する                |
| スケーラビリティ | スキル数が増加するにつれ検証時間が線形に増加する     |

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorVerificationEngine` に TTL ベースのインメモリキャッシュを実装し、
短時間内の重複 verify 呼び出しでファイル I/O を省略することで検証応答時間を改善する。

### 2.2 最終ゴール

- 同一スキルディレクトリへの verify 呼び出しが TTL 内ではキャッシュ結果を返す
- TTL 経過後または明示的なキャッシュ無効化で再検証が実行される
- キャッシュ機構はオプションで無効化可能（テスト・デバッグ対応）
- 50 スキル環境で verify→improve→re-verify ループが体感上高速化される

### 2.3 スコープ

#### 含むもの

- `Map<string, CacheEntry>` によるスキルディレクトリ単位のインメモリキャッシュ
- TTL（Time To Live）ベースの有効期限管理（デフォルト: 30 秒）
- キャッシュ無効化 API（`invalidateCache(skillDir?: string)`）
- キャッシュ有効/無効を切り替えるオプション（`VerificationEngineOptions.cacheTtlMs`）

#### 含まないもの

- 永続化キャッシュ（Redis / SQLite 等）
- ファイル変更検知による自動無効化（fs.watchFile / chokidar）
- 分散キャッシュ・クロスプロセスキャッシュ

### 2.4 成果物

| 成果物               | 説明                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| キャッシュ実装       | `SkillCreatorVerificationEngine.ts` に `CacheEntry` 型とキャッシュロジックを追加 |
| オプション型         | `VerificationEngineOptions` インターフェース（`cacheTtlMs` フィールド）          |
| キャッシュ無効化 API | `invalidateCache(skillDir?: string): void`                                       |
| ユニットテスト       | `SkillCreatorVerificationEngine.test.ts` へのキャッシュ動作テスト追加            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-P0-01（`SkillCreatorVerificationEngine` 実装）が完了していること
- 既存の `SkillCreatorVerificationEngine.test.ts` が全て PASS していること

### 3.2 依存タスク

| タスクID   | タイトル                            | 状態 |
| ---------- | ----------------------------------- | ---- |
| TASK-P0-01 | SkillCreatorVerificationEngine 実装 | 完了 |

### 3.3 必要な知識

- TypeScript `Map` データ構造
- キャッシュ設計パターン（TTL、インメモリ）
- Vitest 非同期テスト・タイマーモック（`vi.useFakeTimers`）

### 3.4 推奨アプローチ

```typescript
// キャッシュエントリ型
interface CacheEntry {
  checks: RuntimeSkillCreatorVerifyCheck[];
  timestamp: number;
}

// オプション型
interface VerificationEngineOptions {
  cacheTtlMs?: number; // デフォルト: 30000 (30秒)
}

// SkillCreatorVerificationEngine 拡張イメージ
export class SkillCreatorVerificationEngine {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs: number;

  constructor(options: VerificationEngineOptions = {}) {
    this.cacheTtlMs = options.cacheTtlMs ?? 30_000;
  }

  async verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]> {
    const cached = this.cache.get(skillDir);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.checks;
    }
    const layer1Checks = await validateLayer1(skillDir);
    const layer2Checks = await validateLayer2(skillDir);
    const checks = [...layer1Checks, ...layer2Checks];
    this.cache.set(skillDir, { checks, timestamp: Date.now() });
    return checks;
  }

  invalidateCache(skillDir?: string): void {
    if (skillDir) {
      this.cache.delete(skillDir);
    } else {
      this.cache.clear();
    }
  }
}
```

---

## 4. 実行手順

### Phase 構成

| Phase | 名称       | 目的                                 |
| ----- | ---------- | ------------------------------------ |
| 1     | 設計       | キャッシュ設計の詳細化・型定義       |
| 2     | テスト作成 | キャッシュ動作を検証するテストの作成 |
| 3     | 実装       | キャッシュ機能の実装                 |
| 4     | 検証       | 動作確認・パフォーマンス計測         |

### Phase 1: 設計

#### 目的

キャッシュの詳細設計を行い、型定義を確定させる。

#### 手順

1. `CacheEntry` インターフェースの型設計
2. `VerificationEngineOptions` の設計（`cacheTtlMs` フィールド）
3. `invalidateCache` メソッドのシグネチャ設計（全無効化 vs 個別無効化）
4. コンストラクタ引数での TTL 設定方式の確定

#### 成果物

- 設計メモ（インラインコメントとして実装ファイルに記載）

#### 完了条件

- [ ] `CacheEntry` 型が定義されている
- [ ] `VerificationEngineOptions` 型が設計されている
- [ ] `invalidateCache` API のシグネチャが確定している

### Phase 2: テスト作成（TDD Red）

#### 目的

キャッシュ動作を検証するテストを作成する（実装前に FAIL 状態）。

#### 手順

1. キャッシュヒット時（TTL 内の 2 回目呼び出し）のテスト作成
2. キャッシュミス時（初回呼び出し）のテスト作成
3. TTL 期限切れ後に再検証されるテスト作成（`vi.useFakeTimers` 使用）
4. `invalidateCache(skillDir)` 呼び出し後に再検証されるテスト作成
5. `invalidateCache()` 全無効化のテスト作成
6. `cacheTtlMs: 0` でキャッシュ無効化のテスト作成

#### 成果物

- `SkillCreatorVerificationEngine.test.ts` へのテスト追加

#### 完了条件

- [ ] キャッシュ関連テストが 6 件以上作成されている
- [ ] テストが FAIL 状態（実装前）

### Phase 3: 実装（TDD Green）

#### 目的

キャッシュ機能を実装してテストを PASS させる。

#### 手順

1. `CacheEntry` 型を `SkillCreatorVerificationEngine.ts` に追加
2. `VerificationEngineOptions` 型を同ファイルに追加
3. コンストラクタに `options` 引数を追加し `cacheTtlMs` を設定
4. `cache` プロパティ（`Map<string, CacheEntry>`）を追加
5. `verify()` にキャッシュ読み書きロジックを追加
6. `invalidateCache()` メソッドを実装

#### 成果物

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` の更新

#### 完了条件

- [ ] 全テストが PASS
- [ ] 型チェックが PASS
- [ ] Lint エラーなし

### Phase 4: 検証

#### 目的

動作確認とパフォーマンス改善の計測を行う。

#### 手順

1. 既存の全テストが引き続き PASS することを確認
2. 50 スキル環境をシミュレートしたベンチマークを実行（任意）
3. キャッシュなし/ありで verify 応答時間を比較

#### 成果物

- テスト実行結果（CI ログ）

#### 完了条件

- [ ] 既存テストが全て PASS
- [ ] キャッシュヒット時の verify() 呼び出しがファイル I/O を発生させない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `verify()` が TTL 内の 2 回目呼び出しでキャッシュ結果を返す
- [ ] TTL 期限切れ後に再検証が実行される
- [ ] `invalidateCache(skillDir)` で特定スキルのキャッシュが削除される
- [ ] `invalidateCache()` で全キャッシュがクリアされる
- [ ] `cacheTtlMs: 0` でキャッシュが無効化される（常に再検証）

### 品質要件

- [ ] テストカバレッジ: Line 80% 以上（キャッシュロジック対象）
- [ ] 型チェック: PASS
- [ ] Lint: エラーなし

### ドキュメント要件

- [ ] `VerificationEngineOptions` の JSDoc コメントに TTL の単位・デフォルト値を記載

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ                                    | 期待結果                                      |
| ------ | ------------------------------------------- | --------------------------------------------- |
| TC-001 | 初回 `verify(skillDir)` 呼び出し            | ファイル I/O が実行され検証結果が返される     |
| TC-002 | TTL 内の 2 回目 `verify(skillDir)` 呼び出し | ファイル I/O なしでキャッシュ結果が返される   |
| TC-003 | TTL 経過後の `verify(skillDir)` 呼び出し    | ファイル I/O が再実行され新しい結果が返される |
| TC-004 | `invalidateCache(skillDir)` 後の呼び出し    | キャッシュが削除され再検証が実行される        |
| TC-005 | `invalidateCache()` 後の呼び出し            | 全キャッシュが削除され再検証が実行される      |
| TC-006 | `cacheTtlMs: 0` での呼び出し                | 毎回ファイル I/O が実行される                 |

### 検証手順

1. ユニットテストを実行: `pnpm --filter @repo/desktop test SkillCreatorVerificationEngine`
2. 型チェック: `pnpm --filter @repo/desktop typecheck`
3. Lint: `pnpm --filter @repo/desktop lint`

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                                                        |
| ---------------------------- | ------ | -------- | --------------------------------------------------------------------------- |
| キャッシュが古い結果を返す   | 中     | 低       | TTL を短く設定（デフォルト 30 秒）、改善後は `invalidateCache()` を呼び出す |
| メモリ使用量の増加           | 低     | 低       | スキル数は有限なため影響軽微。最大エントリ数制限を将来的に検討              |
| TTL 戦略の設計複雑化         | 低     | 中       | 今回は単純な TTL のみ実装。ファイル変更検知は別タスクに分離                 |
| fs.watchFile 連携の検討      | 低     | 低       | 本タスクのスコープ外。別タスク（サブディレクトリ再帰探索）との統合時に検討  |
| テストでのタイマーモック管理 | 低     | 中       | `vi.useFakeTimers()` / `vi.useRealTimers()` のペアを確実に使用              |

---

## 8. 参照情報

### 関連ファイル

| ファイル                                                                                  | 説明             |
| ----------------------------------------------------------------------------------------- | ---------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | 実装対象ファイル |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | テストファイル   |

### 関連タスク

| タスクID                                  | タイトル                             | 関係             |
| ----------------------------------------- | ------------------------------------ | ---------------- |
| TASK-P0-01                                | SkillCreatorVerificationEngine 実装  | 前提タスク       |
| task-imp-agents-subdir-recursive-scan-008 | agents/ サブディレクトリ再帰探索対応 | 同時期発見タスク |
| task-skillscanner-cache-performance       | SkillScanner キャッシュ機能          | 類似パターン     |

### 参考資料

- [MDN: Map](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Vitest: vi.useFakeTimers](https://vitest.dev/api/vi.html#vi-usefaketimers)

---

## 9. 備考

### 発見経緯

TASK-P0-01 の実装スコープ検討時に「将来の最適化」として明示的に除外された項目。
スキル数が少ない現時点では優先度「低」だが、verify→improve→re-verify の繰り返し運用が
標準化された場合は実装を検討する。

### 補足事項

- ファイル変更検知（fs.watchFile）による自動キャッシュ無効化は設計が複雑になるため本タスクのスコープ外とする
- `task-imp-agents-subdir-recursive-scan-008`（再帰探索対応）と同時実装すると、
  両者のテストが互いに干渉しないよう注意が必要
- 将来的にはキャッシュ統計（ヒット率）のログ出力も検討可能

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-03-29 | 初版作成 |
