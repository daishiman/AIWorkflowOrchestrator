# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 2                                                        |
| Phase名    | 設計                                                     |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 1: 要件定義                                        |
| 次Phase    | Phase 3: 設計レビュー                                    |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

Phase 1 の要件定義をもとに、SkillLifecyclePanel.tsx の最小変更設計を確定する。

## 実行タスク

### Task 1: 変更対象の差分設計

#### 削除する行・ブロック

```typescript
// 削除1: request state
const [request, setRequest] = useState("");

// 削除2: handleCreate 関数全体
const handleCreate = async () => {
  // ... 旧生成ロジック
};

// 削除3: handlePrepare 関数全体
const handlePrepare = async () => {
  // ... 旧方針決定ロジック
};
```

#### 削除する JSX ブロック

```tsx
// 削除4: 「1. 依頼をまとめる」セクション全体
<section>
  {/* テキストエリア */}
  <textarea
    data-testid="skill-lifecycle-request-input"
    value={request}
    onChange={(e) => setRequest(e.target.value)}
    // ...
  />
  {/* 「スキルを生成する」ボタン */}
  <button
    data-testid="skill-lifecycle-create-button"
    onClick={handleCreate}
    // ...
  >
    スキルを生成する
  </button>
  {/* 「方針を決める」ボタン */}
  <button
    data-testid="skill-lifecycle-prepare-button"
    onClick={handlePrepare}
    // ...
  >
    方針を決める
  </button>
</section>
```

#### 追加する JSX ブロック

```tsx
// 追加: 「1. スキルを作成する」セクション
<section>
  <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
    <h3 className="text-base font-semibold text-[var(--text-primary)]">
      1. スキルを作成する
    </h3>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">
      スキルの目的・機能・連携ツールをガイドに沿って設定し、
      AIと対話しながらスキルを生成します。
    </p>
    <button
      type="button"
      className={lifecycleButtonStyles.primary}
      onClick={onOpenSkillWizard}
      data-testid="skill-lifecycle-open-wizard-button"
    >
      スキル作成ウィザードを開く →
    </button>
  </div>
</section>
```

### Task 2: Props インターフェース変更設計

```typescript
// Before
interface SkillLifecyclePanelProps {
  onClose: () => void;
}

// After
interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenSkillWizard: () => void; // 追加
}
```

### Task 3: 変更影響範囲の確認

```bash
# SkillLifecyclePanel の呼び出し箇所を確認し、onOpenSkillWizard を渡す必要がある箇所を特定
rg -n "SkillLifecyclePanel" apps/desktop/src/ --glob "*.tsx" --glob "*.ts"
```

影響ファイル候補:

| ファイル                               | 変更内容                                   |
| -------------------------------------- | ------------------------------------------ |
| SkillLifecyclePanel.tsx                | 本タスクの直接改修対象                     |
| SkillLifecyclePanel の親コンポーネント | onOpenSkillWizard を渡す必要あり（要確認） |

### Task 4: data-testid 設計

| 要素                         | data-testid                          | 変更種別 |
| ---------------------------- | ------------------------------------ | -------- |
| テキストエリア（削除）       | `skill-lifecycle-request-input`      | 削除     |
| 「スキルを生成する」（削除） | `skill-lifecycle-create-button`      | 削除     |
| 「方針を決める」（削除）     | `skill-lifecycle-prepare-button`     | 削除     |
| ウィザードボタン（追加）     | `skill-lifecycle-open-wizard-button` | 追加     |

### Task 5: 変更最小化の原則確認

このタスクは「最小変更」を原則とする。以下の要素は変更しない:

- 「2. スキルを確認する」以降のセクション
- `onClose` Props
- ファイルの import 文（変更不要なもの）
- 既存の CSS クラス定数（`lifecycleButtonStyles` 等）

### Task 6: SubAgent 分割設計

- UI 変更、props 変更、テスト影響、Phase 11/12 引き継ぎを別 lane に分ける
- 独立して検証できるものは並列、props と caller 影響のような依存があるものは直列で扱う
- Phase 3 ではこの分割をそのままレビュー観点に流用する

## 並列化方針

| SubAgent | 担当                   | 並列性 | 主な責務                                                          |
| -------- | ---------------------- | ------ | ----------------------------------------------------------------- |
| A        | JSX 置換               | 可     | request state / old buttons の削除と wizard button 追加を設計する |
| B        | Props / caller         | 可     | `onOpenSkillWizard` の追加と呼び出し元影響を設計する              |
| C        | テスト                 | 可     | 削除要素の非存在確認と button click test を設計する               |
| D        | Phase 11 / 12 引き継ぎ | 直列   | UI task 証跡と canonical outputs の受け渡しを設計する             |

## 参照資料

| 資料名      | パス                                                    | 説明       |
| ----------- | ------------------------------------------------------- | ---------- |
| 要件定義書  | `outputs/phase-1/requirements.md`                       | 直前成果物 |
| レーンindex | `docs/30-workflows/skill-wizard-redesign-lane/index.md` | 設計根拠   |

## 成果物

| 成果物 | パス                        | 説明                              |
| ------ | --------------------------- | --------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 差分設計・Props変更・影響範囲一覧 |

## 完了条件

- [ ] 削除するコードブロックが全て特定されている
- [ ] 追加するJSXブロックが定義されている
- [ ] Props インターフェースの変更が設計されている
- [ ] 変更影響範囲が確認されている
- [ ] data-testid の変更一覧が定義されている
- [ ] 変更最小化の原則が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
