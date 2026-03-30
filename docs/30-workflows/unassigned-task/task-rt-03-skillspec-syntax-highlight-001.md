# skillSpec シンタックスハイライト対応（Result Panel） - タスク指示書

## メタ情報

```yaml
issue_number: 1752
task_id: TASK-RT-03-SKILLSPEC-HIGHLIGHT-001
task_name: skillSpec シンタックスハイライト対応
priority: 低
scale: 小規模
status: 未実施
```

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-RT-03-SKILLSPEC-HIGHLIGHT-001                            |
| タスク名     | skillSpec シンタックスハイライト対応（PlanResultDetailPanel） |
| 分類         | UI改善                                                        |
| 対象機能     | PlanResultDetailPanel の skillSpec 折りたたみセクション       |
| 優先度       | LOW                                                           |
| 見積もり規模 | XS（1セクション改修 + 軽量ライブラリ追加）                    |
| ステータス   | unassigned                                                    |
| 発見元       | TASK-RT-03 Phase 11 未タスク検出                              |
| 作成日       | 2026-03-30                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-03（Skill Creation Result Panel）の `PlanResultDetailPanel.tsx` では、plan 結果の `skillSpec` フィールド（スキル仕様の YAML/Markdown テキスト）を折りたたみ表示（`<details>` / `<summary>`）するセクションを実装した。現状はプレーンテキスト（`<pre>` タグ）として表示されており、構文のハイライトがない。

既存の `task-9a-c-syntax-highlighting.md`（TASK-9A-C-001）は `SkillEditor` の textarea 向けのシンタックスハイライトであり、本タスクは Result Panel の **読み取り専用** skillSpec 表示向けの別タスクである。

### 1.2 問題点・課題

- skillSpec が長いマークダウン/YAML 形式のテキストの場合、プレーンテキスト表示では構造が把握しにくい
- ヘッダー・セクション・コードブロック等の視覚的区別がなく、内容のスキャンに時間がかかる
- 既存の `MarkdownRenderer` コンポーネント（`markdown-syntax-highlight` タスクで実装済み）が存在するが、Result Panel での活用が未検討

### 1.3 放置した場合の影響

- **短期**: skillSpec が短い場合はプレーンテキストでも大きな問題はない
- **中期**: 複雑なスキル仕様書（多数のセクション・コードブロック）を確認する場合に UX が低下する
- **長期**: verify/improve フェーズでも同様の skillSpec 表示が必要になった際に対応が必要になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`PlanResultDetailPanel` の skillSpec セクションに構文ハイライトを追加し、マークダウン/YAML 形式の skillSpec が視覚的に読みやすい状態で表示される。

### 2.2 最終ゴール

- skillSpec がマークダウン形式の場合、ヘッダー・コードブロック・リストがハイライト表示されること
- skillSpec が YAML 形式の場合、キー/値・コメントがハイライト表示されること
- 折りたたみ（details/summary）の展開後にハイライトが正常に表示されること
- 既存の `MarkdownRenderer` コンポーネント（存在する場合）の再利用を優先すること

### 2.3 スコープ

| 対象       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| スコープ内 | PlanResultDetailPanel の skillSpec セクションへのハイライト適用              |
| スコープ内 | YAML 形式 skillSpec への対応（prism-react-renderer または MarkdownRenderer） |
| スコープ外 | SkillEditor の textarea シンタックスハイライト（TASK-9A-C-001 が対応）       |
| スコープ外 | ExecuteResultDetailPanel の skillSpec 以外のフィールド                       |

---

## 3. どう実装するか（How）

### 3.1 対応方針

まず既存の `MarkdownRenderer` コンポーネント（`apps/desktop/src/renderer/components/molecules/MarkdownRenderer/`）の再利用を検討する。Markdown 形式の skillSpec であれば `<MarkdownRenderer content={skillSpec} />` に置き換えるのみで対応可能。YAML 形式の場合は `prism-react-renderer` の `Highlight` コンポーネントを使用する。

### 3.2 修正箇所

| ファイル                    | 修正内容                                             |
| --------------------------- | ---------------------------------------------------- |
| `PlanResultDetailPanel.tsx` | skillSpec セクションを `MarkdownRenderer` に切り替え |

### 3.3 実装例（コード）

```tsx
// Before（プレーンテキスト）
<pre className="text-xs font-mono whitespace-pre-wrap break-all">
  {result.skillSpec}
</pre>;

// After（MarkdownRenderer 再利用）
import { MarkdownRenderer } from "../molecules/MarkdownRenderer";

<MarkdownRenderer content={result.skillSpec} className="text-xs" />;

// YAML 形式の場合（prism-react-renderer）
import { Highlight, themes } from "prism-react-renderer";

<Highlight theme={themes.dracula} code={result.skillSpec} language="yaml">
  {({ className, style, tokens, getLineProps, getTokenProps }) => (
    <pre className={`${className} text-xs overflow-auto`} style={style}>
      {tokens.map((line, i) => (
        <div key={i} {...getLineProps({ line })}>
          {line.map((token, key) => (
            <span key={key} {...getTokenProps({ token })} />
          ))}
        </div>
      ))}
    </pre>
  )}
</Highlight>;
```

### 3.4 実装前確認事項

1. `MarkdownRenderer` コンポーネントのパスと props インターフェースを確認（`apps/desktop/src/renderer/components/molecules/MarkdownRenderer/`）
2. skillSpec フィールドの形式（Markdown/YAML/その他）を型定義で確認
3. `prism-react-renderer` が既に desktop パッケージに追加されているか確認

---

## 4. 関連する苦戦箇所・Pitfall

- **TASK-RT-03 での苦戦**: Tailwind CSS カスタムプロパティとシンタックスハイライトライブラリのテーマ（例: prism の dracula テーマ）が競合する可能性がある。背景色の二重適用を避けるため、ハイライトコンポーネントのコンテナには Tailwind の背景クラスを付与せず、ライブラリのテーマに委ねることが安全
- **既存 MarkdownRenderer との互換性**: `markdown-syntax-highlight` タスクで実装された `MarkdownRenderer` は Kanagawa Dragon テーマ固有の設定になっている可能性がある。アプリのテーマ設定との整合性を確認すること
- **折りたたみ後のハイライト再描画**: `<details>` 要素の展開時に Prism.js の再ハイライトが必要なケースがある。`prism-react-renderer` は React の再レンダリングに依存するため通常問題ないが、MutationObserver が必要な場合は `useEffect` での処理が必要

---

## 5. 受入基準

- [ ] skillSpec がマークダウン形式の場合にシンタックスハイライトが表示されること
- [ ] skillSpec が YAML 形式の場合にシンタックスハイライトが表示されること
- [ ] 折りたたみ展開後にハイライトが正常に表示されること
- [ ] 既存テスト（PlanResultDetailPanel 14件を含む53件）が全て PASS すること
- [ ] TypeScript 型チェック・ESLint がエラー 0件であること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` - UIコンポーネント設計パターン

### 6.2 関連タスク・コンポーネント

- TASK-9A-C-001: SkillEditor シンタックスハイライト（別スコープ・参照のみ）
- `apps/desktop/src/renderer/components/molecules/MarkdownRenderer/` - 再利用候補コンポーネント

### 6.3 タスク成果物（発見元）

- `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/outputs/phase-12/unassigned-task-detection.md` - 未タスク #5
