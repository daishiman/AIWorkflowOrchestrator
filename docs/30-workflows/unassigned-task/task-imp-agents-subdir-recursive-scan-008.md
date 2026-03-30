# SkillCreatorVerificationEngine agents/ サブディレクトリ再帰探索対応 - タスク指示書

## メタ情報

```yaml
issue_number: 1734
```

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | task-imp-agents-subdir-recursive-scan-008                           |
| タスク名     | SkillCreatorVerificationEngine agents/ サブディレクトリ再帰探索対応 |
| 分類         | 改善（imp）                                                         |
| 対象機能     | SkillCreatorVerificationEngine / Layer 1 検証 (L1-003)              |
| 優先度       | 低（P2）                                                            |
| 見積もり規模 | 小                                                                  |
| ステータス   | 未実施                                                              |
| 発見元       | Phase 12                                                            |
| 発見日       | 2026-03-29                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01 で実装された `SkillCreatorVerificationEngine` の L1-003 チェックは、
`agents/` ディレクトリ直下のエントリ数のみをカウントすることで
「agents/ が空でないこと」を確認する設計になっている。

しかし、スキルの agents/ にサブディレクトリ構造（例: `agents/core/main.md`）が
存在する場合、直下にファイルが存在しなくてもディレクトリエントリは存在するため
L1-003 はパスするが、そのサブディレクトリ内に実際の agent spec が存在するかどうかを
確認していない。さらに Layer 2 の L2-005 チェックが対象とするのも
`agents/` 直下の `.md` ファイルのみであるため、サブディレクトリ配下の agent spec は
完全に検証されない状態になる。

### 1.2 問題点・課題

| 問題点                                                                 | 影響                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| L1-003 が `fs.readdir(agentsDir)` の直下エントリ数のみをカウントする   | サブディレクトリのみの構造でも非空と判定されるため false negative が発生しない |
| L2-005 が `agents/` 直下の `.md` ファイルのみを検証対象とする          | `agents/core/main.md` 等のサブディレクトリ内 agent spec が検証されない         |
| サブディレクトリ構造の agent spec がゼロのスキルが「正常」と判定される | 不完全なスキルが誤ってパスしてしまう                                           |

### 1.3 放置した場合の影響

| 影響カテゴリ | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| 品質保証     | サブディレクトリ構造を使ったスキルで L1/L2 検証が機能せず、品質チェックが形骸化する |
| 拡張性       | 将来 agents/ にサブディレクトリ構造が標準化された場合に全スキルで検証が通らなくなる |
| 開発体験     | スキル作成者がサブディレクトリ構造を使った場合に検証エラーが出ず問題を見逃す        |

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorVerificationEngine` の L1-003 チェックと Layer 2 の agent spec 検証を
`agents/` 直下だけでなくサブディレクトリ内の `.md` ファイルも再帰的にスキャンする
実装に改善し、false negative を排除する。

### 2.2 最終ゴール

- `agents/` 配下（サブディレクトリ含む）の `.md` ファイルを再帰的に検出する
- L1-003 が「`agents/` 配下（再帰）に `.md` ファイルが 1 件以上存在すること」を検証する
- L2-005/L2-006 がサブディレクトリ内の `.md` ファイルも検証対象とする
- 無限ループ防止のため再帰深度を制限する（最大深度: 3）

### 2.3 スコープ

#### 含むもの

- `agents/` ディレクトリの再帰スキャンユーティリティ関数の実装
- L1-003 の判定ロジックを再帰スキャン結果ベースに変更
- L2-005/L2-006 の検証対象を再帰スキャン結果の `.md` ファイル全件に変更
- 再帰深度制限（`maxDepth` オプション、デフォルト: 3）

#### 含まないもの

- シンボリックリンクの追跡（シンボリックリンクは無視する）
- `agents/` 以外のディレクトリへの再帰スキャン適用
- ファイルウォッチャーとの統合

### 2.4 成果物

| 成果物                     | 説明                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| 再帰スキャンユーティリティ | `collectMdFilesRecursive(dir, maxDepth)` 内部ヘルパー関数                       |
| L1-003 ロジック変更        | `validateLayer1()` 内 L1-003 を再帰スキャン結果で判定するよう更新               |
| L2-005/L2-006 ロジック変更 | `validateLayer2()` 内 agent spec 検証を再帰スキャン結果に対して実行するよう更新 |
| ユニットテスト             | `SkillCreatorVerificationEngine.test.ts` へのサブディレクトリ対応テスト追加     |

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

- Node.js `fs.readdir` の `{ withFileTypes: true }` オプション
- 再帰ディレクトリスキャンのパターン（深度制限付き）
- シンボリックリンク検出（`Dirent.isSymbolicLink()`）
- Vitest での仮想ファイルシステムモック

### 3.4 推奨アプローチ

```typescript
// 再帰スキャンユーティリティ（内部ヘルパー）
async function collectMdFilesRecursive(
  dir: string,
  maxDepth: number,
  currentDepth = 0,
): Promise<string[]> {
  if (currentDepth > maxDepth) return [];
  let result: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue; // シンボリックリンクはスキップ
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await collectMdFilesRecursive(
          fullPath,
          maxDepth,
          currentDepth + 1,
        );
        result = result.concat(sub);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        result.push(fullPath);
      }
    }
  } catch {
    // 読み取り失敗は空配列を返す
  }
  return result;
}

// L1-003 変更イメージ
if (agentsDirExists) {
  const mdFiles = await collectMdFilesRecursive(agentsDir, 3);
  checks.push(
    createCheck(
      "L1-003",
      "layer1",
      mdFiles.length > 0 ? "info" : "error",
      mdFiles.length > 0
        ? `agents/ contains ${mdFiles.length} .md file(s) (recursive)`
        : "agents/ has no .md files (recursive scan)",
      `path: ${agentsDir}, count: ${mdFiles.length}`,
    ),
  );
}

// L2-005/L2-006 変更イメージ
const mdFiles = await collectMdFilesRecursive(agentsDir, 3);
for (const filePath of mdFiles) {
  const file = path.relative(agentsDir, filePath);
  const content = await readFileContent(filePath);
  // ... H1 / 責務 チェック
}
```

---

## 4. 実行手順

### Phase 構成

| Phase | 名称       | 目的                                                           |
| ----- | ---------- | -------------------------------------------------------------- |
| 1     | 設計       | 再帰スキャンの仕様確定（深度制限・シンボリックリンク対応方針） |
| 2     | テスト作成 | サブディレクトリ構造でのテストケース作成（TDD Red）            |
| 3     | 実装       | 再帰スキャン実装と L1-003/L2-005/L2-006 の変更                 |
| 4     | 検証       | 既存テストの継続 PASS と新規テストの PASS 確認                 |

### Phase 1: 設計

#### 目的

再帰スキャンの仕様を確定し、実装方針を決定する。

#### 手順

1. 再帰深度の上限値を決定（推奨: 3、スキル構造の実態に合わせて調整）
2. シンボリックリンクの取り扱い方針を確定（スキップ推奨）
3. `collectMdFilesRecursive` の引数・返り値の型を設計
4. L1-003 の evidenceSummary フォーマットの変更内容を確定
5. L2-005/L2-006 のファイルパス表示形式（相対パス vs 絶対パス）を確定

#### 成果物

- 実装ファイルへのインラインコメント（設計メモ）

#### 完了条件

- [ ] 再帰深度の上限値が決定されている
- [ ] シンボリックリンク対応方針が確定している
- [ ] `collectMdFilesRecursive` のシグネチャが確定している

### Phase 2: テスト作成（TDD Red）

#### 目的

サブディレクトリ構造でのテストケースを作成する。

#### 手順

1. `agents/core/main.md` 構造での L1-003 通過テスト
2. `agents/` 直下にファイルなし・サブディレクトリのみで L1-003 が検出するテスト
3. サブディレクトリ内 agent spec の L2-005 H1 チェックテスト
4. サブディレクトリ内 agent spec の L2-006 責務チェックテスト
5. 深度制限（maxDepth=3）でそれ以上の深さが無視されるテスト
6. シンボリックリンクがスキップされるテスト

#### 成果物

- `SkillCreatorVerificationEngine.test.ts` への新規テスト追加

#### 完了条件

- [ ] サブディレクトリ関連テストが 6 件以上作成されている
- [ ] テストが FAIL 状態（実装前）

### Phase 3: 実装（TDD Green）

#### 目的

再帰スキャン機能を実装してテストを PASS させる。

#### 手順

1. `collectMdFilesRecursive` ヘルパー関数を `SkillCreatorVerificationEngine.ts` に追加
2. `validateLayer1()` 内の L1-003 ロジックを `collectMdFilesRecursive` ベースに変更
3. `validateLayer2()` 内の agent spec ループを `collectMdFilesRecursive` ベースに変更
4. L2-005/L2-006 の evidenceSummary でサブディレクトリパスが表示されることを確認

#### 成果物

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` の更新

#### 完了条件

- [ ] 全テストが PASS
- [ ] 型チェックが PASS
- [ ] Lint エラーなし

### Phase 4: 検証

#### 目的

既存テストの継続 PASS と新規テストの PASS を確認する。

#### 手順

1. 全テストスイートを実行して既存テストが引き続き PASS することを確認
2. 深度制限の動作を確認（深度 4 のファイルが無視される）
3. シンボリックリンクスキップの動作を確認

#### 成果物

- テスト実行結果（CI ログ）

#### 完了条件

- [ ] 既存テストが全て PASS
- [ ] 新規テストが全て PASS
- [ ] 型チェックが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `agents/core/main.md` の構造で L1-003 が通過する
- [ ] `agents/` 直下にファイルなし・サブディレクトリのみ・サブディレクトリ内に `.md` あり → L1-003 が通過する
- [ ] `agents/` 配下（再帰）に `.md` ファイルが 1 件もない場合 L1-003 が error になる
- [ ] サブディレクトリ内 agent spec に対して L2-005/L2-006 が実行される
- [ ] 再帰深度が 3 に制限されている（depth 4 以上のファイルは無視）
- [ ] シンボリックリンクがスキップされる

### 品質要件

- [ ] テストカバレッジ: Line 80% 以上（変更箇所対象）
- [ ] 型チェック: PASS
- [ ] Lint: エラーなし
- [ ] 既存テストが全て引き続き PASS

### ドキュメント要件

- [ ] `collectMdFilesRecursive` に JSDoc コメントで深度制限とシンボリックリンク対応を記載

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ                                           | 期待結果                                               |
| ------ | -------------------------------------------------- | ------------------------------------------------------ |
| TC-001 | `agents/core/main.md` 構造                         | L1-003 が通過（非空と判定）                            |
| TC-002 | `agents/` 直下にファイルなし・サブディレクトリのみ | L1-003 がサブディレクトリ内ファイルを検出して通過      |
| TC-003 | `agents/` 配下に `.md` ファイルが 1 件もない       | L1-003 が error                                        |
| TC-004 | `agents/core/main.md` の H1 チェック（L2-005）     | サブディレクトリ内ファイルに対して L2-005 が実行される |
| TC-005 | `agents/core/main.md` の 責務 チェック（L2-006）   | サブディレクトリ内ファイルに対して L2-006 が実行される |
| TC-006 | `agents/a/b/c/d/deep.md`（深度 4）                 | 深度制限により検出されない                             |
| TC-007 | `agents/` 直下にシンボリックリンクが存在           | シンボリックリンクはスキップされる                     |

### 検証手順

1. ユニットテストを実行: `pnpm --filter @repo/desktop test SkillCreatorVerificationEngine`
2. 型チェック: `pnpm --filter @repo/desktop typecheck`
3. Lint: `pnpm --filter @repo/desktop lint`

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                                                     |
| ------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------- |
| 再帰スキャンによる無限ループ         | 高     | 低       | `maxDepth` パラメータで深度を制限する（デフォルト: 3）                                   |
| シンボリックリンクによる循環参照     | 高     | 低       | `Dirent.isSymbolicLink()` でシンボリックリンクをスキップする                             |
| 既存テストの破壊                     | 中     | 低       | L1-003 の evidenceSummary フォーマットが変わるため既存テストのスナップショット確認が必要 |
| L2-005 の check ID 重複              | 低     | 低       | 複数ファイルに対して同一 ID `L2-005` が複数発行されているが既存の設計を踏襲する          |
| パフォーマンス悪化（大量ファイル時） | 低     | 低       | 深度制限と合わせて実用上の問題はない。キャッシュとの組み合わせも有効                     |

---

## 8. 参照情報

### 関連ファイル

| ファイル                                                                                  | 説明             |
| ----------------------------------------------------------------------------------------- | ---------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | 実装対象ファイル |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | テストファイル   |

### 関連実装箇所

- L1-003 チェック: `SkillCreatorVerificationEngine.ts` の `validateLayer1()` 内、`fs.readdir(agentsDir)` で直下エントリ数のみをカウントしている箇所（約 96〜131 行目）
- L2-005/L2-006 チェック: `validateLayer2()` 内、`const entries = await fs.readdir(agentsDir)` で直下 `.md` ファイルのみをフィルタしている箇所（約 256〜316 行目）

### 関連タスク

| タスクID                                | タイトル                            | 関係             |
| --------------------------------------- | ----------------------------------- | ---------------- |
| TASK-P0-01                              | SkillCreatorVerificationEngine 実装 | 前提タスク       |
| task-perf-verification-engine-cache-007 | Layer 1/2 検証結果キャッシュ実装    | 同時期発見タスク |
| task-skillscanner-incremental-scan      | SkillScanner 増分スキャン機能       | 類似パターン     |

### 参考資料

- [Node.js: fs.readdir withFileTypes](https://nodejs.org/api/fs.html#fsreaddirpath-options-callback)
- [Node.js: fs.Dirent](https://nodejs.org/api/fs.html#class-fsdirent)

---

## 9. 備考

### 発見経緯

TASK-P0-01 の実装スコープ検討時に「将来の改善」として明示的に除外された項目。
現在の skills ディレクトリ構造が `agents/` 直下にファイルを配置する形式を
採用している限りは問題が顕在化しないが、ネスト構造が導入された際に即座に対応できるよう
仕様書として記録する。

### 補足事項

- `collectMdFilesRecursive` は `validateLayer2()` の agent spec ループにも適用するため、
  両 Phase をまとめて 1 つの PR で実装することを推奨する
- `task-perf-verification-engine-cache-007`（キャッシュ実装）と同時に作業する場合は、
  再帰スキャンによってファイル I/O が増加するため、キャッシュの効果がより大きくなる
- 深度制限のデフォルト値（3）はスキル構造の実態に合わせて調整可能。
  コンストラクタオプションとして外部から設定できる設計も検討に値する

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-03-29 | 初版作成 |
