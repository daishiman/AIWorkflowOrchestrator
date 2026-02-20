# SkillEditor シンタックスハイライト対応 - タスク指示書

## メタ情報

```yaml
issue_number: 834
```

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | TASK-9A-C-001                          |
| タスク名     | SkillEditor シンタックスハイライト対応 |
| 分類         | 改善                                   |
| 対象機能     | SkillEditor / SkillCodeEditor          |
| 優先度       | 中                                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 未実施                                 |
| 発見元       | Phase 1（要件定義）- 将来拡張ポイント  |
| 発見日       | 2026-02-19                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9A-C で実装した SkillEditor コンポーネントでは、`SkillCodeEditorProps` に `language` プロパティが「将来のシンタックスハイライト用」として定義されている。現実装では textarea のプレーンテキスト表示のみで、シンタックスハイライトは未実装。`getLanguage` ユーティリティ関数で拡張子→言語マッピング（typescript, javascript, markdown, json, yaml, css, html, shell, python, plaintext の10言語）は準備済みであり、DOM 層では `data-language={language}` 属性でファイル言語情報を保持している。

### 1.2 問題点・課題

- **コード可読性の低下**: プレーンテキスト表示では TypeScript/JSON/YAML/Markdown 等のスキルファイルの構造が視覚的に把握しにくい
- **編集効率の低下**: シンタックスハイライトがないため、括弧の対応やインデント構造が識別しにくく、スキル編集時のミスが発生しやすい
- **ユーザー体験**: 開発者向けツールとしてシンタックスハイライトは基本的な期待機能であり、未対応はUX品質の低下に繋がる

### 1.3 放置した場合の影響

- スキルファイルの編集効率が低いまま継続
- 他のコードエディター機能（行番号表示、括弧マッチング等）の追加基盤がない
- TASK-9A-C-003（Monaco/CodeMirror移行）に直接進む場合、中間的な改善の選択肢がなくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCodeEditor コンポーネントにシンタックスハイライト機能を追加し、スキルファイルの視覚的識別性とコード可読性を向上させる。

### 2.2 最終ゴール

- `getLanguage()` が返す10言語（typescript, javascript, markdown, json, yaml, css, html, shell, python, plaintext）のシンタックスハイライト表示
- 行番号の表示
- 現行 textarea の編集体験（Tab 2スペース挿入、Cmd+S 保存、スペルチェック無効）を維持
- パフォーマンス基準: 500行以下のファイルでハイライト処理が100ms以内に完了

### 2.3 スコープ

#### 含むもの

- シンタックスハイライトライブラリの選定・導入（highlight.js または Prism.js）
- SkillCodeEditor コンポーネントのハイライト対応改修
- 行番号表示の追加
- `getLanguage()` が返す全10言語のハイライト対応
- 既存テスト（39ケース）の維持・拡張

#### 含まないもの

- Monaco Editor / CodeMirror 等のフルエディター移行（TASK-9A-C-003 で対応）
- コード補完・インテリセンス
- ファイル作成・削除機能（TASK-9A-C-002 で対応）
- ダークモード対応テーマ（別途対応）

### 2.4 成果物

| 成果物               | パス                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| SkillCodeEditor 改修 | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`                |
| ハイライトテーマCSS  | `apps/desktop/src/renderer/components/skill/syntax-highlight-theme.css`         |
| テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx` |
| 実装ガイド           | `docs/30-workflows/TASK-9A-C-001-syntax-highlighting/implementation-guide.md`   |

---

## 3. どのように実行するか（How）

### 3.1 技術選定

#### ライブラリ候補比較

| 項目               | highlight.js                   | Prism.js                         | 推奨     |
| ------------------ | ------------------------------ | -------------------------------- | -------- |
| バンドルサイズ     | ~1MB（全言語） / ~50KB（選択） | ~300KB（全言語） / ~30KB（選択） | Prism.js |
| 言語サポート       | 197言語                        | 297言語                          | 同等     |
| React統合          | react-highlight / 手動         | prism-react-renderer             | Prism.js |
| メンテナンス状況   | アクティブ                     | アクティブ                       | 同等     |
| ツリーシェイキング | 言語個別インポート可能         | プラグインベースで選択可能       | 同等     |
| textarea統合       | overlay パターンが必要         | overlay パターンが必要           | 同等     |

**推奨**: `prism-react-renderer`（Prism.js の React ラッパー）を使用する。理由:

1. React コンポーネントとしてネイティブに統合可能（JSX でトークン描画）
2. バンドルサイズが highlight.js より軽量
3. 必要な言語のみのインポートで最小構成が可能
4. 既存の React Testing Library テストパターンと親和性が高い

### 3.2 アーキテクチャ設計

#### textarea + overlay パターン

シンタックスハイライトは「textarea 上に透明なハイライトレイヤーを重ねる」overlay パターンで実装する。

```
┌──────────────────────────────────┐
│ SkillCodeEditor                  │
│  ┌────────────────────────────┐  │
│  │ <div> ハイライトオーバーレイ  │  │  ← 可視: ハイライト済みコード
│  │   (pointer-events: none)   │  │
│  ├────────────────────────────┤  │
│  │ <textarea>                 │  │  ← 不可視: 入力受付（color: transparent）
│  │   (実際の編集領域)          │  │
│  └────────────────────────────┘  │
│  ┌────┐                          │
│  │行番号│                         │  ← 左側固定カラム
│  └────┘                          │
└──────────────────────────────────┘
```

**構成要素**:

1. **行番号カラム**: 左側固定幅（`w-12`）で行番号を表示
2. **ハイライトオーバーレイ**: `<pre><code>` 内に `prism-react-renderer` でトークン化したコードを描画（`pointer-events: none` で入力を透過）
3. **textarea**: テキスト色を透明（`color: transparent`）にし、キャレットのみ表示（`caret-color: #1D1D1F`）。スクロール同期必須

#### スクロール同期

textarea の `onScroll` イベントで overlay の `scrollTop` / `scrollLeft` を同期する。

```typescript
const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
  if (overlayRef.current) {
    overlayRef.current.scrollTop = e.currentTarget.scrollTop;
    overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
  }
};
```

### 3.3 コンポーネント設計

#### 改修後の SkillCodeEditorProps（変更なし）

```typescript
export interface SkillCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  isReadOnly?: boolean;
}
```

Props インターフェースは変更不要。既存の `language` プロパティをそのままハイライト言語として使用する。

#### 内部構造

```typescript
export const SkillCodeEditor: React.FC<SkillCodeEditorProps> = ({
  value,
  onChange,
  language,
  isReadOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);

  const lineCount = value.split("\n").length;

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="flex h-full font-mono text-sm">
      {/* 行番号 */}
      <div className="w-12 bg-[#F5F5F7] text-right pr-2 pt-4 select-none text-[#86868B]">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="leading-5">{i + 1}</div>
        ))}
      </div>

      {/* エディター領域 */}
      <div className="relative flex-1 overflow-hidden">
        {/* ハイライトオーバーレイ */}
        <pre
          ref={overlayRef}
          className="absolute inset-0 p-4 overflow-hidden pointer-events-none leading-5 whitespace-pre-wrap break-words"
          aria-hidden="true"
        >
          {/* prism-react-renderer でトークン化されたコード */}
        </pre>

        {/* 入力用 textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          readOnly={isReadOnly}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-4 resize-none focus:outline-none bg-transparent text-transparent leading-5 whitespace-pre-wrap break-words"
          style={{ caretColor: "#1D1D1F" }}
          data-language={language}
        />
      </div>
    </div>
  );
};
```

---

## 3.5 実装課題と解決策（TASK-9A-Cからの教訓）

| 課題                            | 発見経緯                                                | 解決策                                                                | 教訓                               |
| ------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------- |
| APIレート制限                   | 4並列エージェント実行時に3/4がレート制限に到達          | 並列エージェント数を2-3に制限、ファイル書き込みはレート制限前に完了   | 並列実行の上限を意識した設計が必要 |
| complete-phase.jsパス解決エラー | `scripts/complete-phase.js`ではなく正しいフルパスが必要 | `.claude/skills/task-specification-creator/scripts/complete-phase.js` | スキルディレクトリの構造を事前確認 |
| 大規模仕様書のコンテキスト管理  | Phase 4/6のファイルが40KB超                             | 要約ベースの参照で全文読み込みを回避                                  | Progressive Disclosureを徹底       |

---

## 4. 実行手順

### Phase構成（小〜中規模: 3 Phase）

| Phase | 名称             | 内容                                                                 |
| ----- | ---------------- | -------------------------------------------------------------------- |
| A     | テスト設計・実装 | テストケース設計 → ライブラリ導入 → SkillCodeEditor改修 → テスト実行 |
| B     | 品質検証         | Lint・型チェック・全テスト実行 → カバレッジ確認 → リファクタリング   |
| C     | ドキュメント     | 実装ガイド作成 → システム仕様書更新 → 未タスク検出                   |

### Phase A: テスト設計・実装

#### Step 1: ライブラリ導入

```bash
pnpm --filter @repo/desktop add prism-react-renderer
```

**確認事項**:

- `apps/desktop/package.json` の `dependencies` に `prism-react-renderer` が追加されていること
- `pnpm typecheck` が通ること

#### Step 2: テストケース設計

以下のテストケースを `SkillCodeEditor.test.tsx` に追加する。

| テストケース                                          | 検証内容                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| ハイライトオーバーレイが描画される                    | `pre` 要素が `aria-hidden="true"` で存在すること                           |
| 言語に応じたトークン化が行われる                      | TypeScript コードで `.token` クラスを持つ span が生成されること            |
| 行番号が正しく表示される                              | 5行のコードで 1〜5 の行番号が表示されること                                |
| 空ファイルで行番号が1行だけ表示される                 | 空文字列で行番号「1」のみ表示                                              |
| textarea のテキストが透明である                       | `color: transparent` スタイルが適用されていること                          |
| キャレット色が設定されている                          | `caret-color: #1D1D1F` スタイルが適用されていること                        |
| 既存テスト: 値が表示される                            | textarea に value が設定されていること（既存テストの維持）                 |
| 既存テスト: onChange が呼ばれる                       | テキスト入力で onChange コールバックが実行されること（既存テストの維持）   |
| 既存テスト: readOnly モード                           | `isReadOnly=true` で textarea が読み取り専用であること（既存テストの維持） |
| plaintext 言語でもエラーなく描画される                | `language="plaintext"` で正常描画されること                                |
| スクロール同期: textarea スクロールでオーバーレイ同期 | textarea の scrollTop 変更が overlay に反映されること                      |

**テスト環境注意事項**:

- テスト環境: happy-dom（P39: userEvent 使用禁止）
- `fireEvent` + `act()` で実装すること
- テスト実行: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`

#### Step 3: SkillCodeEditor 改修

1. `prism-react-renderer` から `Highlight` コンポーネントと `themes` をインポート
2. 行番号カラムを追加
3. overlay パターンでハイライトレイヤーを追加
4. textarea を `color: transparent` + `caret-color` で不可視化
5. `onScroll` でスクロール同期を実装
6. Tab 2スペース挿入機能を維持

#### Step 4: テーマ CSS の作成

- Apple Human Interface Guidelines 準拠のライトモードテーマを作成
- カラーパレット:
  - キーワード: `#007AFF`（アクセント）
  - 文字列: `#34C759`（成功）
  - コメント: `#86868B`（セカンダリテキスト）
  - 数値: `#FF9500`（警告）
  - 関数: `#AF52DE`
  - 演算子: `#1D1D1F`（プライマリテキスト）

### Phase B: 品質検証

#### Step 1: Lint・型チェック

```bash
cd apps/desktop && pnpm lint && pnpm typecheck
```

#### Step 2: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

**合格基準**:

- 既存39テスト + 新規テスト全てが PASS
- カバレッジ: Line 80%以上、Branch 60%以上

#### Step 3: リファクタリング

- 不要な CSS クラスの整理
- コンポーネント分割の必要性を検討（行番号を別コンポーネントに分離するか）

### Phase C: ドキュメント

#### Step 1: 実装ガイド作成

- Part 1: 中学生レベル概念説明（「マーカーペンでノートに色を付けるように、コードの種類ごとに色を変えて見やすくする機能」）
- Part 2: 開発者向け実装詳細（overlay パターン、スクロール同期、テーマ設定）

#### Step 2: システム仕様書更新

- `ui-ux-feature-components.md` に SkillEditor シンタックスハイライト仕様を追加
- `interfaces-agent-sdk-skill.md` の SkillCodeEditorProps に補足を追加
- `LOGS.md` 2ファイル更新（P1/P25 対策）
- `topic-map.md` 再生成（P2/P27 対策）

---

## 5. 完了条件チェックリスト

- [ ] `prism-react-renderer` がインストールされている
- [ ] SkillCodeEditor でシンタックスハイライトが表示される
- [ ] `getLanguage()` が返す全10言語（typescript, javascript, markdown, json, yaml, css, html, shell, python, plaintext）でハイライトが正常動作する
- [ ] 行番号が正しく表示される（1始まり、行数と一致）
- [ ] textarea の編集機能（Tab 2スペース挿入、Cmd+S 保存、テキスト入力）が維持されている
- [ ] `isReadOnly` モードが正常に機能する
- [ ] スクロール同期が動作する（textarea と overlay の scrollTop/scrollLeft が一致）
- [ ] 500行以下のファイルでハイライト処理が100ms以内に完了する
- [ ] 既存テスト39件が全て PASS する
- [ ] 新規テストが全て PASS する
- [ ] `pnpm lint` がエラーなしで通る
- [ ] `pnpm typecheck` がエラーなしで通る
- [ ] カバレッジ基準を満たす（Line 80%以上、Branch 60%以上）
- [ ] 実装ガイドが作成されている
- [ ] システム仕様書が更新されている

---

## 6. 検証方法

### 6.1 自動テスト

```bash
# SkillCodeEditor 単体テスト
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx

# SkillEditor 統合テスト（既存テスト維持確認）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/

# カバレッジ計測
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ --coverage
```

### 6.2 手動テスト

| テスト項目                                  | 手順                               | 期待結果                                     |
| ------------------------------------------- | ---------------------------------- | -------------------------------------------- |
| TypeScript ファイルのハイライト表示         | SKILL.md 以外の .ts ファイルを選択 | キーワード・文字列・コメント等が色分けされる |
| JSON ファイルのハイライト表示               | .json ファイルを選択               | キー名・値・括弧が色分けされる               |
| Markdown ファイルのハイライト表示           | SKILL.md を選択                    | 見出し・リンク・コードブロックが色分けされる |
| 行番号の表示確認                            | 複数行のファイルを開く             | 左側に正しい行番号が表示される               |
| 編集時のハイライト更新                      | テキストを入力・削除する           | リアルタイムでハイライトが更新される         |
| スクロール同期確認                          | 長いファイルで上下スクロール       | テキストとハイライトがずれない               |
| Tab キー動作確認                            | エディター内で Tab キーを押す      | 2スペースが挿入される                        |
| Cmd+S 保存動作確認                          | エディター内で Cmd+S を押す        | ファイルが保存される                         |
| 大きいファイル（300行）のパフォーマンス確認 | 300行以上のファイルを開いて編集    | 遅延なくスムーズに動作する                   |

### 6.3 パフォーマンステスト

```typescript
// テスト内でパフォーマンス計測
it("500行以下のファイルで100ms以内にハイライトが完了する", () => {
  const largeCode = Array.from({ length: 500 }, (_, i) =>
    `const value${i} = ${i};`
  ).join("\n");

  const start = performance.now();
  render(
    <SkillCodeEditor value={largeCode} onChange={() => {}} language="typescript" />
  );
  const elapsed = performance.now() - start;

  expect(elapsed).toBeLessThan(100);
});
```

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                                                                                                             |
| --------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Electronバンドルサイズ増大        | 中     | 高       | prism-react-renderer は ~30KB（必要言語のみ）で影響は軽微。導入前後でバンドルサイズを計測し、100KB 以上の増加なら言語数を絞る                    |
| happy-dom互換性（P39）            | 高     | 中       | テストは `fireEvent` ベースで実装。`userEvent` は使用しない。テスト追加時は必ず実行確認                                                          |
| パフォーマンス劣化（大ファイル）  | 中     | 中       | 500行超のファイルでは遅延ハイライト（debounce 150ms）を適用。パフォーマンステストで事前検証                                                      |
| overlay スクロール同期のずれ      | 中     | 中       | textarea と overlay で同一の `font-family`、`font-size`、`line-height`、`padding`、`white-space` を厳密に一致させる。テストで同期精度を検証      |
| prism-react-renderer の API 変更  | 低     | 低       | `package.json` でメジャーバージョンを固定（`^` ではなく具体的バージョン指定を検討）。CHANGELOG を確認してからアップデート                        |
| textarea + overlay パターンの限界 | 中     | 低       | 本タスクは中間的な改善。本格的なエディター機能（コード補完・括弧マッチング等）が必要になった場合は TASK-9A-C-003（Monaco/CodeMirror 移行）へ移行 |

---

## 8. 参照情報

### システム仕様書参照テーブル

| ドキュメント             | パス                                                                                        | 利用目的                           |
| ------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| UI機能コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillEditorコンポーネント仕様      |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | textareaパターン・将来移行パターン |
| テストパターン           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | SkillEditorテスト戦略              |
| インターフェース         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | SkillCodeEditorProps型定義         |

### 関連タスク

| タスクID      | タスク名                         | 関連性                                                      |
| ------------- | -------------------------------- | ----------------------------------------------------------- |
| TASK-9A-C     | SkillEditor コンポーネント実装   | 親タスク。本タスクの基盤となるtextareaエディターを実装      |
| TASK-9A-C-002 | ファイル作成・削除機能           | 同時期の改善タスク。UI変更が競合する可能性あり              |
| TASK-9A-C-003 | Monaco/CodeMirror エディター移行 | 本タスクの後続。本タスクで overlay 限界に達した場合の移行先 |
| TASK-9A-B     | ファイル編集 IPC ハンドラ        | SkillEditorが依存するIPC基盤                                |

### 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                           | 本タスクへの影響                                                 |
| ---------- | ---------------------------------- | ---------------------------------------------------------------- |
| P39        | happy-dom環境でのuserEvent非互換   | テストは `fireEvent` ベースで実装する                            |
| P40        | テスト実行ディレクトリ依存         | `cd apps/desktop &&` でテスト実行する                            |
| P11        | PostToolUse フックによる Edit 失敗 | 大量編集後は `git diff --stat` で変更数を検証                    |
| P8         | 幽霊依存                           | `prism-react-renderer` を `apps/desktop/package.json` に明示宣言 |

---

## 9. 備考

### 設計判断の根拠

1. **overlay パターンを選択した理由**: Monaco Editor / CodeMirror の導入（TASK-9A-C-003）は大規模な変更が必要。本タスクは現行 textarea ベースの最小限改修でシンタックスハイライトを実現する中間ステップとして位置づけられる

2. **prism-react-renderer を選択した理由**: React コンポーネントとしてネイティブ統合が可能で、バンドルサイズが小さく（必要言語のみ ~30KB）、Vitest + React Testing Library でのテストが容易

3. **行番号表示を含めた理由**: シンタックスハイライトと行番号表示は一般的にセットで実装される機能であり、overlay パターン導入時に行番号追加のコストが低い

### TASK-9A-C-003 への移行パス

本タスクの overlay パターンは以下の限界がある:

- 大きなファイル（1000行超）でのパフォーマンス
- コード補完・インテリセンス
- 括弧マッチング・自動インデント
- 複数カーソル

これらの機能が必要になった場合は TASK-9A-C-003（Monaco/CodeMirror 移行）に移行する。本タスクの `SkillCodeEditorProps` インターフェースは変更しないため、移行時はコンポーネント内部の置き換えのみで対応可能。
