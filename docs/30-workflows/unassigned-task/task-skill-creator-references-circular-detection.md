# SkillCreatorVerificationEngine references参照循環検出実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1821
```

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-SDK-REF-CIRCULAR-001                                   |
| タスク名     | SkillCreatorVerificationEngine references参照循環検出実装 |
| 分類         | 改善                                                      |
| 対象機能     | SkillCreatorVerificationEngine (Layer3 L3-003/L3-004検証) |
| 優先度       | 低                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | Phase 11（UT-IMP-SDK-06 Layer3/4 verify拡張テスト）       |
| 発見日       | 2026-04-01                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorVerificationEngine` の Layer3 検証（L3-003/L3-004）は、`references/*.md` ファイルの
**存在確認**と**内容の充実度（substantial description）** を検査する。
しかし、references間でリンクが相互参照し合う「循環参照」が発生しても、現時点では検出されない。

具体的に問題となる構造は以下のような依存グラフである:

```
references/overview.md  →（リンク）→  references/detail.md
references/detail.md    →（リンク）→  references/concepts.md
references/concepts.md  →（リンク）→  references/overview.md  ← A→B→C→A の循環
```

このような循環（サイクル）は、スキルの参照情報を辿る自動化ツールや将来のドキュメント
生成処理が無限ループに陥るリスクをはらんでいる。

### 1.2 問題点・課題

1. **循環参照の無検出**: `[text](other.md)` 形式のリンクが references ディレクトリ内で
   互いに参照し合う構造を、現行 L3-003/L3-004 では検出できない
2. **スキル品質の劣化**: 循環参照はドキュメントの依存関係を複雑化させ、
   スキルのメンテナンスコストを高める
3. **将来の自動化リスク**: ドキュメント自動生成・インデックス作成処理が
   循環参照を踏んで無限ループする可能性がある
4. **発見が困難**: 人間がレビューしても、複数ファイルにまたがる多段階の循環は
   目視で発見しにくい

### 1.3 放置した場合の影響

- スキルが増えるにつれて循環参照が静かに蓄積し、将来の品質ゲートで大量修正が必要になる
- 自動化ツールが references を走査する際にスタックオーバーフローや無限ループが発生する
- L3 検証の「品質保証」という目的が形骸化する（存在は確認できるが構造的健全性は保証できない）

---

## 2. 何を達成するか（What）

### 2.1 目的

`validateLayer3` 関数内に「references ディレクトリ内の Markdown ファイルが相互に形成する
依存グラフにサイクルがないこと」を検証する新チェック項目を追加する。
サイクルが検出された場合は `warning` として報告する。

### 2.2 最終ゴール

- 新チェック ID `L3-005` を `validateLayer3` 内に実装する
- `references/*.md` ファイル内の `[text](*.md)` 形式リンクを抽出し、
  依存グラフを構築してサイクルを DFS（深さ優先探索）で検出する
- サイクルを検出した場合は `warning` を emit し、サイクルを構成するファイルパスを
  `evidenceSummary` に記録する
- サイクルがない正常ケースでは `info` を emit する
- 既存の L3-003/L3-004 の挙動を一切変更しない

### 2.3 スコープ

#### 含むもの

- `SkillCreatorVerificationEngine.ts` への L3-005 チェック追加
- `SkillCreatorVerificationEngine.test.ts` への L3-005 テストケース追加
  （循環あり fixture・循環なし fixture・リンクなし fixture）
- references 内の相対パス正規化ロジック（`../references/other.md` 等への対応）
- 存在しないリンク先のハンドリング（warning または skip）の設計と実装

#### 含まないもの

- agents/ ディレクトリ内の Markdown 循環参照検出（別問題）
- SKILL.md から references への外部リンク循環検出
- 外部 URL（https://...）を含むリンクの検証
- 自動修正機能（仕様書の生成・リンク削除は対象外）

### 2.4 成果物

| 成果物                                        | 説明                                                      |
| --------------------------------------------- | --------------------------------------------------------- |
| `SkillCreatorVerificationEngine.ts` 修正      | `validateLayer3` に L3-005 チェックを追加                 |
| `SkillCreatorVerificationEngine.test.ts` 修正 | L3-005 向けテストケース追加（最低3ケース）                |
| fixture ファイル（循環あり）                  | テスト内インメモリ fixture（A→B→C→A を構成する3ファイル） |
| fixture ファイル（循環なし）                  | テスト内インメモリ fixture（有向非巡回グラフ構造）        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js の `path` モジュールが利用可能であること（既存コードと同じ環境）
- `fs/promises` が利用可能であること（既存コードと同じ）
- `SkillCreatorVerificationEngine.ts` の `validateLayer3` 関数の実装（line 290-345 付近）を
  事前に読んで理解していること
- TypeScript の `async/await` パターンを理解していること

### 3.2 依存タスク

| タスク                                      | ステータス | 関係                                   |
| ------------------------------------------- | ---------- | -------------------------------------- |
| UT-IMP-SDK-06 Layer3/4 verify拡張テスト実装 | 完了       | 本タスクはそこで deferred された項目   |
| `SkillCreatorVerificationEngine.ts` 実装    | 完了       | 修正対象ファイル（既存実装を拡張する） |

### 3.3 必要な知識

#### グラフ理論（サイクル検出）

依存グラフのサイクル（循環）を検出するアルゴリズムは **DFS（深さ優先探索）+ 再帰スタック**
による方法が代表的である。

```
概念:
  各ノード（ファイル）の状態を 3 種類で管理する
    - "unvisited" : まだ訪問していない
    - "visiting"  : 現在の DFS パス上にある（再帰スタック内）
    - "visited"   : DFS が完了した（サイクルなし）

  あるノード v を訪問中に、隣接ノード w が "visiting" 状態であれば、
  v → w というエッジが「後退辺（back edge）」であり、サイクルが確定する。
```

#### Markdown リンクの抽出

Markdown の `[text](path.md)` 形式リンクは以下の正規表現で抽出する:

```
/\[(?:[^\]]*)\]\(([^)]+\.md)\)/g
```

- キャプチャグループ1: リンク先のパス（例: `./detail.md` や `other.md`）
- `https://` 等の外部URLは `.md` で終わらないため自然に除外される
- フラグメント付き（`other.md#section`）の場合は `#` 以降を除去して判定する

#### 相対パスの正規化

`path.resolve` を使い、リンク元ファイルの絶対パスを基準に相対パスを解決する:

```typescript
// 例: リンク元が /skill/references/overview.md
//     リンク先が ../references/detail.md の場合
const resolved = path.resolve(path.dirname(linkSourcePath), linkTarget);
// → /skill/references/detail.md
```

### 3.4 推奨アプローチ

**Phase 1 で仕様を固める（設計先行）**:

1. `validateLayer3` 関数の末尾（`return checks;` の直前）に L3-005 チェックを追加する位置を確定する
2. references ディレクトリ内の全 `.md` ファイルを列挙する
3. 各ファイルを読み込み、`\[.*?\]\((.*?\.md)\)` パターンでリンク先を抽出する
4. 相対パスを `path.resolve` で絶対パスに正規化し、同じ `references/` ディレクトリ内を
   指しているものだけを依存エッジとして採用する（ディレクトリ外参照は無視）
5. DFS でサイクル検出を行う
6. サイクルが1件以上存在すれば `warning`、なければ `info` を emit する

**テスト戦略**:

- `createSkillFixture` ユーティリティ（既存）の `referenceFiles` オプションを利用して
  インメモリ fixture を作成する（ディスクへの書き込みは既存パターンに準拠）
- 最低3ケースのテストを追加する（後述「6. 検証方法」参照）

---

## 4. 実行手順

### Phase 構成

| Phase | 名称             | 概要                                                |
| ----- | ---------------- | --------------------------------------------------- |
| 1     | 要件・設計       | L3-005 の仕様確定・アルゴリズム設計                 |
| 2     | 実装             | `validateLayer3` への L3-005 追加・ヘルパー関数実装 |
| 3     | テスト作成       | fixture 作成・テストケース記述                      |
| 4     | 品質確認         | lint/typecheck/テスト実行・カバレッジ確認           |
| 5     | ドキュメント更新 | 仕様書・LOGS.md 更新                                |

---

### Phase 1: 要件・設計

#### 目的

L3-005 チェックの動作仕様を詳細に定め、実装前に設計上の判断を確定させる。

#### 手順

1. `SkillCreatorVerificationEngine.ts` の `validateLayer3` 関数（line 290-345 付近）を精読し、
   既存の L3-003/L3-004 の構造を把握する
2. 以下の設計判断を決定する:
   - **リンク先が references/ 外を指す場合**: グラフエッジに含めない（スキップ）
   - **リンク先ファイルが存在しない場合**: エッジに含めない（存在しないノードは無視）
   - **references/ が存在しない場合**: L3-005 チェックをスキップ（emit しない）
   - **references/ 内に `.md` が1件もない場合**: サイクルなし → `info` を emit する
   - **サイクルが複数存在する場合**: 検出した全サイクルを evidenceSummary に列挙する
3. チェック ID `L3-005`、layer `"layer3"`、severity `"warning"`（サイクルあり）/`"info"`（サイクルなし）を確定する

#### 成果物

- 設計メモ（コメントとして実装時にコード内に記述）

#### 完了条件

- 上記の設計判断が全て確定し、曖昧な点が残っていない

---

### Phase 2: 実装

#### 目的

`validateLayer3` 関数内に L3-005 チェックを実装する。

#### 手順

**ステップ 2-1: Markdown リンク抽出ヘルパー関数の追加**

`SkillCreatorVerificationEngine.ts` のヘルパー関数群（ファイル上部、`// ── helpers ──` セクション）に
以下の関数を追加する:

```typescript
/**
 * Markdown テキスト内の [text](*.md) 形式リンクのパスを抽出する。
 * 外部URL（https://）は除外される。フラグメント（#section）は除去する。
 */
function extractMarkdownMdLinks(content: string): string[] {
  const pattern = /\[(?:[^\]]*)\]\(([^)]+\.md(?:#[^)]*)?\))/g;
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    // フラグメント除去
    const target = match[1].replace(/#[^)]*$/, "");
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      results.push(target);
    }
  }
  return results;
}
```

**ステップ 2-2: DFS サイクル検出ヘルパー関数の追加**

同じヘルパー関数群に追加する:

```typescript
/**
 * 有向グラフ (adjacency list: Map<node, node[]>) にサイクルが存在するか検出する。
 * サイクルが存在する場合、サイクルを構成するノードリストを返す。
 * サイクルがない場合は空配列を返す。
 */
function detectCycles(graph: Map<string, string[]>): string[][] {
  type State = "unvisited" | "visiting" | "visited";
  const state = new Map<string, State>();
  const cycles: string[][] = [];

  for (const node of graph.keys()) {
    state.set(node, "unvisited");
  }

  function dfs(node: string, path: string[]): void {
    state.set(node, "visiting");
    path.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!state.has(neighbor)) continue; // references/ 外ノードは無視
      if (state.get(neighbor) === "visiting") {
        // サイクル検出: path 内のサイクル始点から末尾までを抽出
        const cycleStart = path.indexOf(neighbor);
        cycles.push([...path.slice(cycleStart), neighbor]);
      } else if (state.get(neighbor) === "unvisited") {
        dfs(neighbor, path);
      }
    }

    path.pop();
    state.set(node, "visited");
  }

  for (const node of graph.keys()) {
    if (state.get(node) === "unvisited") {
      dfs(node, []);
    }
  }

  return cycles;
}
```

**ステップ 2-3: `validateLayer3` への L3-005 追加**

`validateLayer3` 関数内の `return checks;` の直前（既存 L3-004 ブロックの後）に追加する:

```typescript
// ── L3-005: references/ 内 Markdown ファイルの循環参照検出 ──
const refsDir = path.join(skillDir, "references");
const refsDirExists2 = await directoryExists(refsDir);
if (refsDirExists2) {
  try {
    const refEntries = await fs.readdir(refsDir);
    const refMdFiles = refEntries.filter((e) => e.endsWith(".md"));

    // 依存グラフ構築
    const graph = new Map<string, string[]>();
    for (const file of refMdFiles) {
      const absPath = path.join(refsDir, file);
      const content = await readFileContent(absPath);
      const neighbors: string[] = [];
      if (content !== null) {
        for (const linkTarget of extractMarkdownMdLinks(content)) {
          const resolved = path.resolve(path.dirname(absPath), linkTarget);
          // references/ 内を指すリンクのみエッジとして採用
          if (path.dirname(resolved) === refsDir) {
            neighbors.push(resolved);
          }
        }
      }
      graph.set(absPath, neighbors);
    }

    // サイクル検出
    const cycles = detectCycles(graph);
    if (cycles.length === 0) {
      checks.push(
        createCheck(
          "L3-005",
          "layer3",
          "info",
          `references/ has no circular dependencies (${refMdFiles.length} files checked)`,
          `path: ${refsDir}`,
        ),
      );
    } else {
      for (const cycle of cycles) {
        const cycleStr = cycle.map((p) => path.basename(p)).join(" → ");
        checks.push(
          createCheck(
            "L3-005",
            "layer3",
            "warning",
            `Circular reference detected in references/: ${cycleStr}`,
            `path: ${refsDir}, cycle: ${cycleStr}`,
          ),
        );
      }
    }
  } catch {
    // references/ read error は L1 で処理済み; ここではスキップ
  }
}
```

#### 成果物

- `SkillCreatorVerificationEngine.ts` の修正差分（L3-005 チェック追加）

#### 完了条件

- TypeScript のコンパイルエラーが発生しない
- 既存の L3-003/L3-004 テストが引き続き GREEN である

---

### Phase 3: テスト作成

#### 目的

L3-005 の正常ケース・異常ケース・エッジケースを網羅するテストを追加する。

#### 手順

`SkillCreatorVerificationEngine.test.ts` の既存 `describe("validateLayer3", ...)` ブロック内に
以下のテストケースを追加する。

**テスト 1: 循環参照なし（正常ケース）**

```
fixture 構成:
  references/alpha.md  →  [Beta](beta.md) のリンクあり
  references/beta.md   →  [Gamma](gamma.md) のリンクあり
  references/gamma.md  → リンクなし（末端）

期待結果:
  L3-005 の check が存在する
  severity が "info"
  summary に "no circular dependencies" が含まれる
```

**テスト 2: 直接循環（A→B→A）**

```
fixture 構成:
  references/a.md  →  [B](b.md)
  references/b.md  →  [A](a.md)

期待結果:
  L3-005 の check が存在する
  severity が "warning"
  summary に "Circular reference detected" が含まれる
  evidenceSummary に "a.md" と "b.md" の両方が含まれる
```

**テスト 3: 三段階循環（A→B→C→A）**

```
fixture 構成:
  references/p.md  →  [Q](q.md)
  references/q.md  →  [R](r.md)
  references/r.md  →  [P](p.md)

期待結果:
  L3-005 の check が存在する
  severity が "warning"
  summary に "Circular reference detected" が含まれる
```

**テスト 4: references/ が存在しない場合（L3-005 をスキップ）**

```
fixture 構成:
  references/ ディレクトリなし

期待結果:
  checks に L3-005 の ID が含まれない
```

**テスト 5: references/ 内に .md ファイルが存在しない場合**

```
fixture 構成:
  references/ ディレクトリあり（空）

期待結果:
  L3-005 の check が存在する
  severity が "info"
```

fixture の作成には既存の `createSkillFixture` ユーティリティと
`referenceFiles` オプションを使用する。

#### 成果物

- `SkillCreatorVerificationEngine.test.ts` へのテストケース追加（最低5ケース）

#### 完了条件

- 追加した5件のテストがすべて GREEN
- `pnpm --filter @repo/desktop test` で既存テスト含め全 GREEN

---

### Phase 4: 品質確認

#### 目的

lint / typecheck / テストカバレッジを確認し、品質基準を満たしていることを確認する。

#### 手順

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test

# カバレッジ確認（任意）
pnpm --filter @repo/desktop test -- --coverage
```

#### 成果物

- 全コマンドが正常終了（exit code 0）したことの確認

#### 完了条件

- TypeScript エラー 0 件
- ESLint エラー 0 件
- 追加テスト含め全テスト GREEN
- 既存テストのリグレッション 0 件

---

### Phase 5: ドキュメント更新

#### 目的

実装内容をプロジェクト仕様書に反映する。

#### 手順

1. 本タスク仕様書のステータスを「完了」に更新する
2. `.agents/skills/aiworkflow-requirements/references/` の関連ドキュメントを確認し、
   L3-005 チェックの追加を記録する（該当箇所がある場合）
3. `LOGS.md` または `lessons-learned-current.md` に実装上の知見を追記する

#### 成果物

- 本仕様書のステータス更新
- LOGS.md への追記（任意）

#### 完了条件

- ステータスが「完了」に更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validateLayer3` に L3-005 チェックが追加されている
- [ ] references/ が存在しない場合は L3-005 を emit しない
- [ ] references/ 内に .md ファイルが0件の場合は `info` を emit する
- [ ] 循環参照なしの場合は `info` を emit する
- [ ] 直接循環（A→B→A）を検出し `warning` を emit する
- [ ] 三段階循環（A→B→C→A）を検出し `warning` を emit する
- [ ] evidenceSummary にサイクルを構成するファイル名が含まれている
- [ ] references/ 外へのリンクはグラフエッジに含めない
- [ ] 存在しないファイルへのリンクはグラフエッジに含めない

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件
- [ ] `pnpm --filter @repo/desktop test` が全 GREEN（既存テスト含む）
- [ ] L3-005 テストケースが最低5件追加されている
- [ ] 既存 L3-003/L3-004 テストのリグレッションがない

### ドキュメント要件

- [ ] 本タスク仕様書のステータスが「完了」に更新されている
- [ ] 実装上の知見が LOGS.md または lessons-learned に追記されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                                   | fixture 構成                     | 期待される L3-005 結果                                      |
| --- | ---------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| 1   | 循環なし・有向非巡回グラフ                     | alpha→beta→gamma（末端）         | severity: "info", "no circular dependencies" を含む         |
| 2   | 直接循環 A→B→A                                 | a.md↔b.md                        | severity: "warning", a.md と b.md が evidenceSummary に記録 |
| 3   | 三段階循環 A→B→C→A                             | p.md→q.md→r.md→p.md              | severity: "warning", "Circular reference detected" を含む   |
| 4   | references/ ディレクトリが存在しない           | references/ なし                 | L3-005 チェックが checks に存在しない                       |
| 5   | references/ 内に .md ファイルが0件             | references/ 空ディレクトリ       | severity: "info"                                            |
| 6   | references/ 外へのリンク（外部リンク除外確認） | a.md → [外部](../assets/img.png) | L3-005 は "info"（外部リンクは無視）                        |

### 検証手順

```bash
# 1. 追加テストのみ実行（ファイル指定）
pnpm --filter @repo/desktop test -- \
  SkillCreatorVerificationEngine.test.ts

# 2. L3-005 関連のテストだけフィルタして実行
pnpm --filter @repo/desktop test -- \
  --testNamePattern="L3-005"

# 3. 全テスト実行（リグレッション確認）
pnpm --filter @repo/desktop test

# 4. 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                                      | 影響度 | 発生確率 | 対策                                                                                            |
| ----------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------- |
| DFS 実装でスタックオーバーフロー（references が極端に多い） | 中     | 低       | references が100件を超える場合は処理をスキップし warning を emit するガード条件を追加する       |
| 相対パス正規化の漏れ（`./foo.md` と `foo.md` の同一視失敗） | 高     | 中       | `path.resolve` を必ず経由させることで正規化を保証する。テストで `./` あり・なし両方をカバーする |
| 既存テストへの影響（L3-003/L3-004 テストが壊れる）          | 高     | 低       | 実装前に既存テストを全て GREEN で通過させてから修正を開始し、修正後に再度全テストを実行して確認 |
| フラグメント付きリンク（`other.md#section`）の誤処理        | 中     | 中       | リンク抽出時に `#` 以降を除去する処理を `extractMarkdownMdLinks` に明示的に組み込む             |
| テスト用 fixture の非同期競合（複数テストが同一パスを使用） | 低     | 低       | 既存の `createSkillFixture` が Date.now() + random で一意なディレクトリを生成するため問題なし   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                              | 用途                                          |
| ----------------------------------------- | --------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | スキル構造・references/ ディレクトリ仕様      |
| `quality-requirements.md`                 | テストカバレッジ基準・Layer3 品質要件         |
| `architecture-implementation-patterns.md` | ヘルパー関数パターン・DFS実装パターン         |
| `testing-component-patterns.md`           | Vitest fixture パターン・非同期テストの書き方 |

### 参考ファイルパス

| ファイルパス                                                                              | 該当箇所                    | 内容                                            |
| ----------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | line 290-345                | 現行 L3-003/L3-004 実装（修正対象）             |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | `createSkillFixture`        | テスト用 fixture ヘルパー（再利用する）         |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | `referenceFiles` オプション | references/ 内ファイルを fixture に配置する方法 |

### 苦戦箇所記録

本タスクは UT-IMP-SDK-06（Layer3/4 verify拡張テスト実装、Phase 11）の実施中に発見・Defer された。
以下に、実装時に注意すべき難所を詳細に記録する。

#### 難所 1: Markdown リンク抽出正規表現

**問題**: `[text](path.md)` を抽出する正規表現は一見シンプルだが、以下のエッジケースが存在する:

- `[link](path.md#section)` → フラグメント `#section` を除去する必要がある
- `![image](img.png)` → 画像リンクも同じ構文。`.md` フィルタで除外できるが明示すること
- `` `[code](code.md)` `` → コードブロック内のリンクは除外すべきか（現実的には問題にならない）
- `[link](https://example.com/doc.md)` → 外部 URL を除外する必要がある

**解決策**: `!target.startsWith("http")` チェックと `#` 除去を `extractMarkdownMdLinks` に組み込む。

#### 難所 2: サイクル検出アルゴリズムの状態管理

**問題**: DFS でサイクルを検出する際、「現在の DFS パス上にいる（visiting）」と
「DFS が完了した（visited）」を区別しないと、誤検出が発生する。

```
例: A → B → C
        ↓
        D → B  ← B は既に visited であるため、これはサイクルではない
```

**解決策**: 状態を `"unvisited"` / `"visiting"` / `"visited"` の3値で管理し、
`"visiting"` の場合のみサイクルと判定する。

#### 難所 3: 相対パスの正規化

**問題**: Markdown ファイル内のリンクは相対パスで記述される。
`path.resolve(path.dirname(linkSourceFile), linkTarget)` を正しく行わないと、
`./a.md` と `a.md` が別ノードとして扱われたり、
`../references/other.md` が正しく解決されなかったりする。

**解決策**:

- グラフのノード ID として必ず `path.resolve` 後の絶対パスを使用する
- `references/` ディレクトリの絶対パスと比較して、`path.dirname(resolved) === refsDir` で
  references/ 内を指すリンクのみをエッジとして採用する

#### 難所 4: 存在しないファイルへのリンクの扱い

**問題**: `references/a.md` が `[B](nonexistent.md)` というリンクを持つ場合、
`nonexistent.md` はグラフノードとして存在しない。
DFS でこのノードを訪問しようとするとエラーになる可能性がある。

**解決策**: グラフの全ノードは「実際に存在する .md ファイル」のみとする。
`graph.get(node) ?? []` で未知ノードへの参照は空配列として扱い、
`state.has(neighbor)` のチェックで未登録ノードへのエッジを無視する。

#### 難所 5: テスト用 fixture の作成

**問題**: 循環参照を持つファイル群を fixture として作成する場合、
「A のファイル内に B へのリンクを書き、B のファイル内に A へのリンクを書く」
という形になるが、`createSkillFixture` の `referenceFiles` オプションで
`Record<string, string>` 形式で渡すため、内容の文字列を正確に組み立てる必要がある。

**解決策**: テスト内でファイル内容を明示的に文字列リテラルで定義する:

```typescript
// 直接循環の fixture 例
await createSkillFixture(tmpDir, {
  skillMd: MINIMAL_SKILL_MD,
  agents: { "agent.md": MINIMAL_AGENT_MD },
  referenceFiles: {
    "a.md": "# A\n\n[B file](b.md)\n",
    "b.md": "# B\n\n[A file](a.md)\n",
  },
});
```

---

## 9. 備考

### 発見コンテキスト（UT-IMP-SDK-06 Phase 11 の Deferred Item）

本タスクは **UT-IMP-SDK-06（Layer3/4 verify拡張テスト実装）** の Phase 11 実施中に
「実装の対象として有望だが、工数・複雑さの観点から今サイクルには含めない」として
Defer された項目である。

Defer の理由:

- Markdown パーサー相当の処理（リンク抽出）が新規実装コンポーネントとなり、
  既存の L3 実装スコープを大きく超える
- DFS サイクル検出ロジックは単体でテストすべき複雑さを持つ
- 現行のスキル群（`.agents/skills/` 配下）に実際の循環参照が発生していない
  ため、緊急性が低い

### 優先度が「低」である理由

現時点で循環参照を持つスキルが報告されておらず、
検出機能がなくても即座の実害はない。
ただし、スキルが増えるにつれてリスクが高まるため、定期的な見直しを推奨する。

### 実装上の留意事項

- 本チェックは `warning` 止まりであり `error` には昇格させない
  （循環参照はスキルの動作を妨げるものではなく、品質改善の推奨事項であるため）
- 将来的に「references/ 外の assets/ ディレクトリへのリンク循環」も検出対象に
  含めることが考えられるが、それは本タスクのスコープ外とする
