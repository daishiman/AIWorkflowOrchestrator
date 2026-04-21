# [#1975] "[UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001] スキル作成ウィザード 日本語入力リアルタイムプレビュー UX 改善"

## メタ情報

```yaml
task_id: UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001
task_name: スキル作成ウィザード 日本語入力リアルタイムプレビュー UX 改善
category: -
target_feature: -
priority: low
scale: small-medium
status: open
source_phase: -
created_date: 2026-04-06
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001.md
```

| 項目       | 内容         |
| ---------- | ------------ |
| 優先度     | low          |
| 規模       | small-medium |
| ステータス | open         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-IPC-SKILL-NAME-001（2026-04-06）の Phase 12 close-out において、スキル作成ウィザードの
UX 改善が未タスクとして検出された。

同タスクでは `toWizardSkillName()` の正規化フローを修正し、日本語・特殊文字を自動的に `-` へ変換し、
変換結果が空になる場合は `"new-skill"` にフォールバックする仕組みが Main プロセス（Node.js）側に実装された。

しかし現状では、ユーザーが日本語でスキルの説明を入力しても、入力欄の下に「このスキルのディレクトリ名は
`xxx-yyy` になります」という案内が表示されない。特に日本語・絵文字・記号だけを入力した場合、
最終的に `"new-skill"` という全く異なる名前が使われることになるが、ユーザーはそれを事前に知る手段がない。

### 1.2 問題点・課題

1. **変換結果の不透明性**: 日本語・特殊文字を入力しても、実際に作られるディレクトリ名がどうなるかが
   ウィザードの UI 上でまったく確認できない。`"new-skill"` フォールバックが適用される場合も
   ユーザーには見えない。

2. **`toWizardSkillName()` が Main プロセスにのみ存在**: 現在この関数は
   `apps/desktop/src/main/services/skill/SkillService.ts` の `private` メソッドとして実装されており、
   Renderer（ブラウザ環境）から直接呼び出せない。リアルタイムプレビューを実装するには、
   shared 関数化またはブラウザ側に重複実装するかを決める必要がある。

3. **IME（日本語入力）における `onChange` の誤発火**: 日本語入力中（変換確定前）にも `onChange` が
   発火するため、debounce だけでは変換途中の不完全な文字列でプレビューが更新されてしまい、
   ユーザーに混乱を与える可能性がある。`onCompositionStart`/`onCompositionEnd` との組み合わせが必要。

4. **アクセシビリティ未整備**: スクリーンリーダーがリアルタイム更新されるプレビューを読み上げるには
   `aria-live` 属性が必要だが、現状そのような UI 要素が存在しない。

### 1.3 放置した場合の影響

- 日本語ユーザーが意図せず `new-skill` という名前でスキルを作成し続けることになる。
  同名スキルが重複して作成されると混乱が生じる。
- アクセシビリティ要件を満たせず、スクリーンリーダーユーザーの体験が低下する。
- `toWizardSkillName()` が Main プロセス専用の private メソッドのまま残り続けると、
  テスト・再利用・Renderer 側での利用がすべて困難になる（設計上の技術的負債）。

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル作成ウィザードの説明入力フォームに「スキル名プレビュー」を追加し、
ユーザーが入力中にリアルタイムで作成されるスキルのディレクトリ名を確認できるようにする。
特に日本語・特殊文字入力時に `"new-skill"` フォールバックが適用されることを事前に伝える。

### 2.2 最終ゴール

- 説明入力フォームの下部に `スキル名: xxx-yyy` 形式のプレビューが表示される。
- 日本語のみ入力した場合は `スキル名: new-skill（※自動フォールバック）` のように
  ユーザーに明示的に通知される。
- IME 確定後にのみプレビューが更新される（確定前の変換中に更新されない）。
- `aria-live="polite"` でスクリーンリーダーが更新を読み上げられる。
- `toWizardSkillName()` が `packages/shared` に移動し、Main/Renderer 双方から import できる。

### 2.3 スコープ

#### 含むもの

- `toWizardSkillName()` の `packages/shared` への移動と export
- スキル作成ウィザードの説明入力ステップ（`DescribeStep` または対応するコンポーネント）への
  リアルタイムプレビュー UI の追加
- IME 対応（`onCompositionStart`/`onCompositionEnd` フラグによる確定判定）
- debounce 処理（300ms 程度）
- `aria-live="polite"` によるアクセシビリティ対応
- `"new-skill"` フォールバック時の視覚的な警告表示（例: 黄色テキスト、アイコン）
- 対応するユニットテスト

#### 含まないもの

- スキル名の手動編集 UI（別タスク）
- スキル名の重複チェックのリアルタイム確認（別タスク）
- スキル名プレビューの国際化（i18n）対応（別タスク）
- 既存スキルの名前変更機能（別タスク）

### 2.4 成果物

| 種別     | ファイル                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- |
| 移動     | `apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` 削除        |
| 新規作成 | `packages/shared/src/utils/skillName.ts`（`toWizardSkillName()` を export）                 |
| 新規作成 | `packages/shared/src/utils/__tests__/skillName.test.ts`                                     |
| 修正     | `apps/desktop/src/main/services/skill/SkillService.ts`（shared から import する形に変更）   |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`（プレビュー UI 追加）  |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.preview.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-IPC-SKILL-NAME-001 が完了していること（`toWizardSkillName()` の正規化ロジックが確定）
- `packages/shared` の TypeScript ビルド設定が Renderer から import できる状態であること
- `pnpm install` が完了しており、monorepo のパッケージ解決が正常であること

### 3.2 依存タスク

| タスクID                    | 状態 | 内容                                                 |
| --------------------------- | ---- | ---------------------------------------------------- |
| TASK-FIX-IPC-SKILL-NAME-001 | 完了 | `toWizardSkillName()` の正規化ロジック実装（参照元） |

### 3.3 必要な知識

- React の `onCompositionStart`/`onCompositionEnd` イベントと IME の仕組み
- `useCallback` + `useRef` によるコンポジションフラグ管理
- debounce パターン（`setTimeout` / `clearTimeout` または `lodash.debounce`）
- `aria-live` 属性と WAI-ARIA ライブリージョン
- `packages/shared` への関数移動と monorepo の import パス設定（Vite alias / tsconfig paths）

### 3.4 推奨アプローチ

1. **`toWizardSkillName()` を shared 化する**: 純粋関数（副作用なし）であるため、
   `packages/shared/src/utils/skillName.ts` に移動して export する。
   Main プロセス側の `SkillService.ts` は shared から import するように変更する。

2. **コンポジションフラグで IME 確定を検出する**: `useRef<boolean>` でフラグを管理し、
   `onCompositionStart` で `true`、`onCompositionEnd` で `false` にセットする。
   `onChange` のタイミングでフラグが `true`（変換中）なら更新をスキップする。

3. **debounce で更新頻度を制御する**: `onCompositionEnd` または `onChange`（IME 確定後）の後、
   300ms の debounce でプレビューを更新する。

4. **`aria-live="polite"` で読み上げ対応する**: プレビュー表示 `<span>` に `aria-live="polite"` と
   `role="status"` を付与し、スクリーンリーダーが変更を検知できるようにする。

5. **`"new-skill"` フォールバック時は警告を表示する**: 変換結果が `"new-skill"` になった場合は
   プレビューテキストを黄色系のスタイルで表示し、「入力内容をスキル名に変換できないため自動名称を使用します」
   のような補足メッセージを添える。

### 3.5 苦戦箇所（事前想定）

| 苦戦ポイント                           | 詳細                                                                                                          | 推奨対策                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `toWizardSkillName()` の shared 移動   | 現在 Main プロセス限定の `private` メソッド。monorepo の import パス設定（Vite alias / tsconfig paths）が必要 | `packages/shared/src/utils/skillName.ts` に純粋関数として export し、テスト側から Renderer/Main 両方で使用  |
| IME 確定前 `onChange` 誤発火           | 日本語入力（IME）では変換確定前にも `onChange` が発火するため、debounce だけでは不十分                        | `onCompositionStart/End` フラグで確定判定を行い、確定後のみプレビューを更新する                             |
| `"new-skill"` フォールバックの UI 設計 | 警告表示の視覚デザインをプロジェクトの既存スタイル（Tailwind）に合わせる必要がある                            | 既存の警告コンポーネント（`ProvenanceWarningSummary` 等）を参考にスタイルを統一する                         |
| テスト環境での IME シミュレーション    | Vitest/jsdom 環境でコンポジションイベント（`compositionstart`/`compositionend`）を正確に発火させにくい        | `fireEvent.compositionStart` / `fireEvent.compositionEnd` を使い、`compositionend` 後に `change` を発火する |

---

## 4. 実行手順（Phase 1〜13）

### Phase 構成

| Phase | 名称                 | ステータス | 概要                                                                 |
| ----- | -------------------- | ---------- | -------------------------------------------------------------------- |
| 1     | 要件定義             | open       | スコープ・受入条件・インベントリ確定                                 |
| 2     | 設計                 | open       | 変更ファイル一覧・IME 対応戦略・コンポーネント設計                   |
| 3     | 設計レビュー         | open       | Phase 4 進行可否の判定                                               |
| 4     | テスト作成           | open       | テストマトリクス・TDD Red ケース作成                                 |
| 5     | 実装                 | open       | shared 移動・プレビュー UI・IME 対応・debounce・aria-live            |
| 6     | テスト拡充           | open       | エッジケース・回帰ガード追加                                         |
| 7     | カバレッジ確認       | open       | 変更ファイルの line/branch カバレッジ実測                            |
| 8     | リファクタリング     | open       | 重複除去・命名整理・対象/Before/After/理由テーブル記録               |
| 9     | 品質検証             | open       | typecheck / lint / test 通過確認                                     |
| 10    | 最終レビュー         | open       | 受入条件チェック・ブロッカー判定                                     |
| 11    | 手動テスト（VISUAL） | open       | 実機での UI 確認・スクリーンショット取得                             |
| 12    | ドキュメント更新     | open       | 実装ガイド Part1/2・仕様書更新・未タスク検出・フィードバックレポート |
| 13    | PR 作成              | open       | ユーザー明示承認後のみ実施                                           |

---

### Phase 1: 要件定義

**ステータス**: open

#### 目的

タスクの受入条件、タスク分類、コードインベントリを確定する。

#### タスク分類（Phase 1 時点）

- **タスク種別**: VISUAL タスク（`DescribeStep.tsx` への UI 追加を含む）
- **影響 Process**: Renderer（ブラウザ環境）および Main（Node.js 環境）
- **変更のある既存コンポーネント**: `SkillService.ts`（Main）、`DescribeStep.tsx`（Renderer）
- **新規追加**: `packages/shared/src/utils/skillName.ts`

#### 受入条件（AC）

| AC    | 内容                                                                                     |
| ----- | ---------------------------------------------------------------------------------------- |
| AC-1  | `toWizardSkillName(description: string): string` が `packages/shared` から import 可能   |
| AC-2  | `SkillService.ts` が `packages/shared` の `toWizardSkillName` を使用している             |
| AC-3  | `DescribeStep`（または対応コンポーネント）の説明入力フォーム下部にプレビューが表示される |
| AC-4  | 入力が英数字の場合、`スキル名: my-skill` のように変換後の名前が表示される                |
| AC-5  | 入力が日本語のみの場合、`スキル名: new-skill` と警告メッセージが表示される               |
| AC-6  | IME 入力中（変換確定前）はプレビューが更新されない                                       |
| AC-7  | IME 確定後（`compositionend` 発火後）300ms の debounce でプレビューが更新される          |
| AC-8  | プレビュー要素に `aria-live="polite"` と `role="status"` が付与されている                |
| AC-9  | `pnpm --filter @repo/shared typecheck` が PASS する                                      |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する                                     |
| AC-11 | `packages/shared/src/utils/__tests__/skillName.test.ts` が PASS する                     |
| AC-12 | `DescribeStep.preview.test.tsx` が PASS する                                             |

#### 手順

1. `apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` の実装と
   正規化ロジックを精読し、完全に理解する
2. `apps/desktop/src/renderer/components/skill/wizard/` 配下を確認し、
   説明入力フォームがどのコンポーネントに実装されているかを特定する
3. `packages/shared/src/` の既存 utils ディレクトリ構造を確認する
4. 上記の AC-1〜AC-12 を仕様書に記録する

#### 成果物

- 受入条件（AC）一覧
- コードインベントリ（変更対象ファイル一覧）

#### 完了条件

- AC-1〜AC-12 が明文化されている
- VISUAL タスクとして分類されていることが記録されている

---

### Phase 2: 設計

**ステータス**: open

#### 目的

変更ファイル一覧・IME 対応戦略・コンポーネント設計を確定する。

#### 変更ファイル一覧

| 変更種別 | ファイルパス                                                                                     | 変更内容                                                  |
| -------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| 新規作成 | `packages/shared/src/utils/skillName.ts`                                                         | `toWizardSkillName()` を純粋関数として export             |
| 新規作成 | `packages/shared/src/utils/__tests__/skillName.test.ts`                                          | 上記の単体テスト                                          |
| 修正     | `apps/desktop/src/main/services/skill/SkillService.ts`                                           | `private toWizardSkillName()` を削除し shared から import |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`（または対応コンポーネント） | プレビュー UI・IME 対応・debounce・aria-live 追加         |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.preview.test.tsx`      | プレビュー機能のユニットテスト                            |
| 修正     | `packages/shared/src/index.ts`（または utils/index.ts）                                          | `toWizardSkillName` の re-export 追加                     |

#### IME 対応設計

```typescript
// コンポジションフラグのパターン
const isComposingRef = useRef(false);
const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleCompositionStart = () => {
  isComposingRef.current = true;
};

const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
  isComposingRef.current = false;
  // 確定後に debounce でプレビュー更新
  schedulePreviewUpdate(e.currentTarget.value);
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (isComposingRef.current) return; // IME 変換中はスキップ
  schedulePreviewUpdate(e.target.value);
};

const schedulePreviewUpdate = (value: string) => {
  if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
  previewTimerRef.current = setTimeout(() => {
    setSkillNamePreview(toWizardSkillName(value));
  }, 300);
};
```

#### プレビュー UI 設計

```tsx
// フォールバック検出と表示分岐
const isFallback =
  skillNamePreview === "new-skill" && description.trim().length > 0;

<div aria-live="polite" role="status" className="mt-1 text-sm">
  {description.trim().length > 0 && (
    <>
      <span className={isFallback ? "text-yellow-600" : "text-gray-600"}>
        スキル名: <code>{skillNamePreview}</code>
      </span>
      {isFallback && (
        <span className="ml-2 text-yellow-600 text-xs">
          ※ 入力内容をスキル名に変換できないため自動名称を使用します
        </span>
      )}
    </>
  )}
</div>;
```

#### 手順

1. Phase 1 のインベントリをもとに変更ファイル一覧を確定する
2. IME 対応のコンポジションフラグパターンを設計する
3. プレビュー UI のコンポーネント設計（JSX 構造・スタイリング）を確定する
4. `packages/shared` の tsconfig.json と Vite alias の設定を確認し、
   Renderer から `packages/shared` が正しく import できることを確認する

#### 成果物

- 変更ファイル一覧テーブル（上記）
- IME 対応のコード設計（上記）
- プレビュー UI の JSX 設計（上記）

#### 完了条件

- 変更ファイル一覧が「新規作成」「修正」で分類されて記録されている
- IME 対応戦略が「コンポジションフラグ + debounce」で確定している
- プレビュー UI の JSX 設計が確定している

---

### Phase 3: 設計レビュー

**ステータス**: open

#### 目的

Phase 2 の設計が AC を満たし、Phase 4 のテスト作成に進められるかを判定する。

#### レビューチェックリスト

| チェック項目                                                           | 判定   |
| ---------------------------------------------------------------------- | ------ |
| `toWizardSkillName()` が純粋関数（副作用なし）として shared 化できるか | 要確認 |
| IME 確定判定がコンポジションフラグで正しく実装できるか                 | 要確認 |
| `packages/shared` への import が Renderer / Main 双方で機能するか      | 要確認 |
| プレビュー UI が既存スタイル（Tailwind）に整合するか                   | 要確認 |
| `aria-live="polite"` がスクリーンリーダーで機能することを確認できるか  | 要確認 |
| AC-1〜AC-12 を全て満たす設計になっているか                             | 要確認 |
| テスト可能な設計（純粋関数 + コンポーネント分離）になっているか        | 要確認 |

#### 手順

1. Phase 2 の設計資料を精読し、上記チェックリストを評価する
2. CRITICAL 問題（Phase 4 進行不可レベル）があれば Phase 2 へ差し戻す
3. MINOR 問題は未タスク候補として記録し、Phase 4 へ進む

#### 成果物

- 設計レビュー結果（PASS / FAIL）
- MINOR 指摘事項リスト（あれば）

#### 完了条件

- チェックリスト全項目が PASS または MINOR として記録されている
- Phase 4 進行可否が明確に判定されている

---

### Phase 4: テスト作成（TDD Red）

**ステータス**: open

#### 目的

実装前にテストを作成し（TDD Red 状態）、テストマトリクスを確定する。

#### テストマトリクス

| TC    | 対象                  | 入力                                  | 期待出力/動作                                              | テストファイル                  |
| ----- | --------------------- | ------------------------------------- | ---------------------------------------------------------- | ------------------------------- |
| TC-01 | `toWizardSkillName()` | `"My Skill"` 英数字スペース           | `"my-skill"`                                               | `skillName.test.ts`             |
| TC-02 | `toWizardSkillName()` | `"日本語スキル"` 日本語のみ           | `"new-skill"`                                              | `skillName.test.ts`             |
| TC-03 | `toWizardSkillName()` | `"my---skill"` 連続ハイフン           | `"my-skill"`                                               | `skillName.test.ts`             |
| TC-04 | `toWizardSkillName()` | `"  "` 空白のみ                       | `"new-skill"`                                              | `skillName.test.ts`             |
| TC-05 | `toWizardSkillName()` | `"Hello 世界"` 英数字+日本語混合      | `"hello-"`（または `"hello"` 末尾トリム後）                | `skillName.test.ts`             |
| TC-06 | `toWizardSkillName()` | 50文字超の長い入力                    | 50文字で切り取られた変換結果                               | `skillName.test.ts`             |
| TC-07 | プレビュー UI         | 英数字を入力後 300ms 経過             | プレビューに変換後のスキル名が表示される                   | `DescribeStep.preview.test.tsx` |
| TC-08 | プレビュー UI         | 日本語のみを入力後 300ms 経過         | `"new-skill"` と警告メッセージが表示される                 | `DescribeStep.preview.test.tsx` |
| TC-09 | IME 対応              | `compositionstart` → `change` → 300ms | プレビューが更新されない（IME 変換中のためスキップ）       | `DescribeStep.preview.test.tsx` |
| TC-10 | IME 対応              | `compositionend` 後 300ms 経過        | プレビューが更新される                                     | `DescribeStep.preview.test.tsx` |
| TC-11 | アクセシビリティ      | プレビュー要素の属性確認              | `aria-live="polite"` かつ `role="status"` が付与されている | `DescribeStep.preview.test.tsx` |
| TC-12 | プレビュー UI         | 入力が空の場合                        | プレビューが表示されない（または空状態）                   | `DescribeStep.preview.test.tsx` |
| TC-13 | debounce              | 300ms 以内に連続入力した場合          | 最後の入力から 300ms 後にのみプレビューが更新される        | `DescribeStep.preview.test.tsx` |

#### 手順

1. `packages/shared/src/utils/__tests__/skillName.test.ts` を作成し、TC-01〜TC-06 を記述する（Red 状態）
2. `DescribeStep.preview.test.tsx` を作成し、TC-07〜TC-13 を記述する（Red 状態）
3. `pnpm vitest run` を実行して全テストが FAIL することを確認する（TDD Red 確認）
4. 命名規則が Phase 1 で確認した既存コードの camelCase / kebab-case と整合しているか確認する

#### 成果物

- `packages/shared/src/utils/__tests__/skillName.test.ts`（Red 状態）
- `DescribeStep.preview.test.tsx`（Red 状態）
- TDD Red 確認のテスト実行ログ

#### 完了条件

- TC-01〜TC-13 がテストファイルとして作成されている
- 全テストが意図した理由（実装がないため）で FAIL している

---

### Phase 5: 実装

**ステータス**: open

#### 目的

Phase 4 で作成したテストを Green にする実装を行う。

#### 実装計画

**新規作成ファイル**:

- `packages/shared/src/utils/skillName.ts` — `toWizardSkillName()` 実装
- `packages/shared/src/utils/__tests__/skillName.test.ts` — Phase 4 で作成済み
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.preview.test.tsx` — Phase 4 で作成済み

**修正ファイル**:

- `apps/desktop/src/main/services/skill/SkillService.ts` — `private toWizardSkillName()` を削除し shared から import
- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` — プレビュー UI 追加（IME 対応・debounce・aria-live）
- `packages/shared/src/index.ts` または `packages/shared/src/utils/index.ts` — `toWizardSkillName` を re-export

#### 実装タスク一覧

**Task 5-1: `toWizardSkillName()` を shared へ移動する**

1. `packages/shared/src/utils/skillName.ts` を新規作成し、`SkillService.ts` の実装を移植する
2. `packages/shared/src/utils/index.ts`（なければ新規作成）から `toWizardSkillName` を export する
3. `packages/shared/src/index.ts` に `export * from "./utils"` または個別 re-export を追加する
4. `SkillService.ts` の `private toWizardSkillName()` を削除し、`packages/shared` から import する
5. `pnpm --filter @repo/shared typecheck` が PASS することを確認する
6. `pnpm --filter @repo/desktop typecheck` が PASS することを確認する

**Task 5-2: `DescribeStep.tsx` にプレビュー UI を追加する**

1. `toWizardSkillName` を `packages/shared` から import する
2. コンポジションフラグ（`useRef<boolean>`）を追加する
3. `onCompositionStart`/`onCompositionEnd` ハンドラを実装する
4. `onChange` にコンポジションチェックを追加する
5. debounce ロジック（300ms）を実装する
6. プレビュー `<div>` を JSX に追加する（`aria-live="polite"` / `role="status"` / `"new-skill"` フォールバック警告含む）
7. `pnpm vitest run` で TC-07〜TC-13 が Green になることを確認する

#### 成果物

- `packages/shared/src/utils/skillName.ts`（実装済み）
- 修正済み `SkillService.ts`
- 修正済み `DescribeStep.tsx`
- `pnpm vitest run` の Green 確認ログ

#### 完了条件

- TC-01〜TC-13 が全て Green になっている
- `pnpm --filter @repo/shared typecheck` が PASS している
- `pnpm --filter @repo/desktop typecheck` が PASS している

---

### Phase 6: テスト拡充

**ステータス**: open

#### 目的

エッジケース・回帰ガードを追加し、テストの網羅性を高める。

#### 追加テストケース

| TC    | 対象                       | 内容                                                                              |
| ----- | -------------------------- | --------------------------------------------------------------------------------- |
| TC-14 | `toWizardSkillName()` 回帰 | TASK-FIX-IPC-SKILL-NAME-001 で修正された既知のバグケース（元のテストからコピー）  |
| TC-15 | プレビュー UI エッジケース | 50文字ちょうどの入力でプレビューが正しく表示されるか                              |
| TC-16 | プレビュー UI エッジケース | 入力を空にした後、プレビューが非表示になるか                                      |
| TC-17 | IME 回帰テスト             | `compositionend` 直後に再度 `compositionstart` が来た場合の二重更新を防げるか     |
| TC-18 | アクセシビリティ回帰       | `"new-skill"` フォールバック時、警告テキストも `aria-live` の読み上げ対象になるか |

#### 手順

1. 既存の `skillName.test.ts` に TC-14〜TC-15 を追加する
2. `DescribeStep.preview.test.tsx` に TC-16〜TC-18 を追加する
3. `pnpm vitest run` で全テストが PASS することを確認する

#### 成果物

- 拡充済みテストファイル（2ファイル）
- テスト実行 PASS ログ

#### 完了条件

- TC-01〜TC-18 が全て PASS している

---

### Phase 7: カバレッジ確認

**ステータス**: open

#### 目的

変更したファイルの line カバレッジ・branch カバレッジを実測し、品質基準を満たしていることを確認する。

#### カバレッジ対象ファイル（変更ファイルのみ）

| ファイル                                          | 目標 line | 目標 branch |
| ------------------------------------------------- | --------- | ----------- |
| `packages/shared/src/utils/skillName.ts`          | 100%      | 100%        |
| `apps/desktop/src/.../DescribeStep.tsx`（変更行） | 90%+      | 80%+        |

> 全体カバレッジは参考値。変更ブロックの line/branch 実測を証跡として残すこと。

#### 手順

1. `pnpm --filter @repo/shared vitest run --coverage` を実行する
2. `packages/shared/src/utils/skillName.ts` の line/branch カバレッジを記録する
3. `pnpm --filter @repo/desktop vitest run --coverage` を実行する
4. `DescribeStep.tsx` の変更行付近の line/branch カバレッジを記録する
5. 目標未達の場合は Phase 6 へ戻りテストを追加する

#### 成果物

- カバレッジレポート（`outputs/phase-7/coverage-result.md`）

#### 完了条件

- `skillName.ts` が line 100% / branch 100% を達成している
- `DescribeStep.tsx` 変更行が line 90%+ / branch 80%+ を達成している

---

### Phase 8: リファクタリング

**ステータス**: open

#### 目的

実装後の重複除去・命名整理・設計改善を記録する。

#### リファクタリング記録テーブル（実施後に記入）

| 対象                         | Before                                  | After                                    | 理由                                           |
| ---------------------------- | --------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `toWizardSkillName()` の配置 | `SkillService.ts` の `private` メソッド | `packages/shared/src/utils/skillName.ts` | Renderer から利用できるように shared 化        |
| IME 判定ロジック             | `onChange` のみ                         | `onCompositionStart/End` + `onChange`    | IME 確定前の誤発火を防ぐため                   |
| プレビュー更新タイミング     | `onChange` 即時更新（debounce なし）    | `onCompositionEnd` + 300ms debounce      | IME 確定後かつ入力落ち着き後にのみ更新するため |

#### 手順

1. 実装コードを見直し、重複ロジック・不要な `console.log` 等を除去する
2. 命名揺れ（camelCase / kebab-case）を確認し、プロジェクト規則に統一する
3. リファクタリング内容を上記テーブルに記録する
4. `pnpm vitest run` で全テストが引き続き PASS することを確認する

#### 成果物

- リファクタリング記録テーブル（上記テーブルに記入済み）

#### 完了条件

- リファクタリング記録が `対象/Before/After/理由` テーブル形式で残っている
- 全テストが PASS している

---

### Phase 9: 品質検証

**ステータス**: open

#### 目的

typecheck / lint / test の全通過を確認する。

#### 手順

1. `pnpm --filter @repo/shared typecheck` を実行して PASS を確認する
2. `pnpm --filter @repo/desktop typecheck` を実行して PASS を確認する
3. `pnpm --filter @repo/shared lint` を実行して PASS を確認する
4. `pnpm --filter @repo/desktop lint` を実行して PASS を確認する
5. `pnpm vitest run` を実行して全テスト PASS を確認する

#### 成果物

- 品質検証結果レポート（`outputs/phase-9/quality-check-result.md`）

#### 完了条件

- typecheck / lint / test が全て PASS している

---

### Phase 10: 最終レビュー

**ステータス**: open

#### 目的

受入条件（AC-1〜AC-12）の充足確認と、Phase 11 手動テストへの進行可否を判定する。

#### 受入条件チェック

| AC    | 内容                                                                                     | 判定   |
| ----- | ---------------------------------------------------------------------------------------- | ------ |
| AC-1  | `toWizardSkillName(description: string): string` が `packages/shared` から import 可能   | 未確認 |
| AC-2  | `SkillService.ts` が `packages/shared` の `toWizardSkillName` を使用している             | 未確認 |
| AC-3  | `DescribeStep`（または対応コンポーネント）の説明入力フォーム下部にプレビューが表示される | 未確認 |
| AC-4  | 入力が英数字の場合、`スキル名: my-skill` のように変換後の名前が表示される                | 未確認 |
| AC-5  | 入力が日本語のみの場合、`スキル名: new-skill` と警告メッセージが表示される               | 未確認 |
| AC-6  | IME 入力中（変換確定前）はプレビューが更新されない                                       | 未確認 |
| AC-7  | IME 確定後（`compositionend` 発火後）300ms の debounce でプレビューが更新される          | 未確認 |
| AC-8  | プレビュー要素に `aria-live="polite"` と `role="status"` が付与されている                | 未確認 |
| AC-9  | `pnpm --filter @repo/shared typecheck` が PASS する                                      | 未確認 |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する                                     | 未確認 |
| AC-11 | `packages/shared/src/utils/__tests__/skillName.test.ts` が PASS する                     | 未確認 |
| AC-12 | `DescribeStep.preview.test.tsx` が PASS する                                             | 未確認 |

#### 手順

1. 上記の AC-1〜AC-12 を一つずつ確認し、PASS / FAIL を記録する
2. CRITICAL 問題（AC FAIL）があれば対応 Phase へ差し戻す
3. MINOR 問題は未タスク候補として記録し、Phase 11 へ進む

#### 成果物

- 最終レビュー結果（`outputs/phase-10/final-review.md`）

#### 完了条件

- AC-1〜AC-12 が全て PASS している
- Phase 11 への進行が承認されている

---

### Phase 11: 手動テスト（VISUAL タスク）

**ステータス**: open

> **VISUAL タスク**: UI 変更を含むため、実機での手動テストとスクリーンショット取得が必須。
> 自動テストのみでは代替不可。

#### 目的

実機（Electron デスクトップアプリ）でのリアルタイムプレビュー動作を目視確認し、
視覚的な品質を検証する。

#### 手動テスト手順

**環境準備**:

```bash
pnpm --filter @repo/desktop dev
```

**テストシナリオ一覧**:

| テストID | 手順                                                                               | 期待する動作                                                              |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| VT-01    | スキル作成ウィザードを開き、説明入力フォームに英数字 `My New Skill` を入力する     | 300ms 後に `スキル名: my-new-skill` が入力フォームの下に表示される        |
| VT-02    | 入力を日本語のみ（例: `ありがとう`）に変更する                                     | `スキル名: new-skill` と黄色系の警告テキストが表示される                  |
| VT-03    | 日本語入力中（IME 変換中、確定前）にプレビューを観察する                           | 変換中（下線のある状態）はプレビューが更新されない                        |
| VT-04    | 日本語入力を確定（スペースキーや Enter で変換確定）する                            | 確定後 300ms でプレビューが更新される                                     |
| VT-05    | 入力を空にする                                                                     | プレビューが非表示になる（または空欄になる）                              |
| VT-06    | `Hello 世界！` のような英数字+日本語+記号の混合入力をする                          | 英数字部分のみが変換され、`hello-` のような結果またはフォールバックが表示 |
| VT-07    | スクリーンリーダー（VoiceOver 等）を有効にし、プレビューが読み上げられるか確認する | プレビュー更新時に `aria-live` により読み上げが行われる                   |

#### スクリーンショット取得要件

| スクリーンショット名                  | 内容                                               |
| ------------------------------------- | -------------------------------------------------- |
| `ss-01-english-preview.png`           | VT-01: 英数字入力のプレビュー表示                  |
| `ss-02-japanese-fallback-preview.png` | VT-02: 日本語入力の `new-skill` フォールバック表示 |
| `ss-03-warning-message.png`           | VT-02: 黄色警告テキストの表示                      |

#### 成果物

- 手動テスト結果（`outputs/phase-11/manual-test-result.md`）
- スクリーンショット（`outputs/phase-11/screenshots/`）
- 発見された問題一覧（`outputs/phase-11/discovered-issues.md`）

#### 完了条件

- VT-01〜VT-07 が全て実施され、結果が記録されている
- スクリーンショット 3枚が `outputs/phase-11/screenshots/` に保存されている
- 重大な問題（HIGH）がある場合は修正してから次 Phase に進む

---

### Phase 12: ドキュメント更新

**ステータス**: open

#### 目的

実装ガイド（Part 1/2）、システム仕様書更新、未タスク検出、スキルフィードバックレポートを完成させる。

#### Task 12-1: 実装ガイド作成（2パート構成）

**Part 1: 中学生でも理解できる説明**

---

カラオケで歌を予約するとき、曲名を「あいうえお」と日本語で入力しても、
機械側では `a-i-u-e-o` のようなアルファベットに変換して保存することがありますよね。
でも、変換できない文字だけを入力してしまうと、機械は「名前がつけられない！」と困ってしまいます。

このアプリのスキル作成機能も似ていて、スキルを保存するときに
「ディレクトリ名（フォルダの名前）」が必要なのですが、
日本語や記号だけだとフォルダ名として使えないため、
自動的に `new-skill` という名前に変換されていました。

問題は、**ユーザーがそのことを知らなかった**という点です。
「スキルの名前は自分で決めたはずなのに、気づいたら `new-skill` というよくわからない名前になっていた」
という混乱が起きていました。

この改善では、入力フォームの下に小さく「スキル名: xxx-yyy」と表示することにしました。
日本語だけ入力した場合は「スキル名: new-skill（※自動変換）」と、
警告つきで表示するようにしました。

また、裏側のエンジニアリングでも重要な変更をしました。
変換のルール（`toWizardSkillName` 関数）が「サーバー側だけ」にあったのを、
「サーバーとブラウザ両方で使える共通の場所（`packages/shared`）」に移動しました。
これにより、ブラウザ側でもリアルタイムに変換結果を計算できるようになりました。

さらに、日本語入力（IME）には特別な注意が必要でした。
日本語入力では「ひらがなに変換中」「漢字に変換中」という「途中の状態」があります。
この途中の状態でプレビューを更新してしまうと、変換中の不完全な文字が表示されてしまいます。
そこで「変換が確定したとき（Enterキーやスペースキーで変換確定したとき）」にだけ
プレビューを更新するようにしました。

---

**Part 2: 技術者向けの詳細説明**

```typescript
// packages/shared/src/utils/skillName.ts

/**
 * スキル作成ウィザードの description 入力からスキルディレクトリ名を生成する。
 * 純粋関数（副作用なし）。Main / Renderer 双方から利用可能。
 *
 * @param description - スキルの説明文（任意の文字列）
 * @returns スキルディレクトリ名（kebab-case、空になる場合は "new-skill"）
 */
export function toWizardSkillName(description: string): string {
  const normalized = description
    .slice(0, 50) // 最大50文字に切り詰め
    .trim() // 前後の空白を除去
    .toLowerCase() // 小文字化
    .replace(/[^a-z0-9-]/g, "-") // 非許容文字（日本語・記号等）を "-" へ
    .replace(/-+/g, "-") // 連続ハイフンを単一に圧縮
    .replace(/^-+|-+$/g, ""); // 先頭・末尾のハイフンを除去
  return normalized || "new-skill"; // 空文字の場合は "new-skill" フォールバック
}
```

```typescript
// DescribeStep.tsx での IME 対応パターン

const isComposingRef = useRef(false);
const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const [skillNamePreview, setSkillNamePreview] = useState("");

// IME 確定後のみプレビューを更新する
const schedulePreviewUpdate = useCallback((value: string) => {
  if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
  previewTimerRef.current = setTimeout(() => {
    setSkillNamePreview(value.trim() ? toWizardSkillName(value) : "");
  }, 300); // 300ms debounce
}, []);

const handleCompositionStart = () => {
  isComposingRef.current = true;
};
const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
  isComposingRef.current = false;
  schedulePreviewUpdate(e.currentTarget.value); // 確定後に更新
};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (isComposingRef.current) return; // IME 変換中はスキップ
  schedulePreviewUpdate(e.target.value);
};
```

```tsx
// プレビュー表示 JSX（aria-live 対応）
const isFallback =
  skillNamePreview === "new-skill" && description.trim().length > 0;

<div aria-live="polite" role="status" className="mt-1 text-sm min-h-[1.25rem]">
  {skillNamePreview && (
    <span
      className={
        isFallback ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500"
      }
    >
      スキル名: <code className="font-mono">{skillNamePreview}</code>
      {isFallback && (
        <span className="ml-2 text-xs">
          ※ 入力内容をスキル名に変換できないため自動名称を使用します
        </span>
      )}
    </span>
  )}
</div>;
```

**主要な設定値・定数**:

| 名称                  | 値            | 説明                                               |
| --------------------- | ------------- | -------------------------------------------------- |
| DEBOUNCE_MS           | `300`         | プレビュー更新の debounce 遅延（ミリ秒）           |
| SKILL_NAME_MAX_LENGTH | `50`          | スキル名生成時の入力文字数上限                     |
| SKILL_NAME_FALLBACK   | `"new-skill"` | 変換結果が空になった場合のフォールバック値         |
| aria-live             | `"polite"`    | スクリーンリーダーへの通知優先度（操作を妨げない） |

#### Task 12-2: システム仕様書更新

- Step 1-A: 完了タスク記録（`task-workflow-completed.md` へ追記）
- Step 1-B: 実装状況テーブル更新（`spec_created` → 実装完了後は `completed`）
- Step 1-C: 関連タスクテーブル更新（`task-workflow-backlog.md` のステータス更新）
- Step 2: 新規インターフェース追加（`toWizardSkillName` の shared export）がある場合は
  `aiworkflow-requirements` の該当仕様書を更新する

#### Task 12-3: ドキュメント更新履歴作成

- `outputs/phase-12/documentation-changelog.md` を作成する

#### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

- `outputs/phase-12/unassigned-task-detection.md` を作成する
- Phase 10/11 の MINOR 指摘事項を未タスク候補として記録する
- 0件の場合もその旨を記録する

#### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

- `outputs/phase-12/skill-feedback-report.md` を作成する
- `phase12-task-spec-compliance-check.md` を root evidence として残す

#### 成果物

| ファイル                                                 | 内容                                               |
| -------------------------------------------------------- | -------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド Part1（中学生レベル） + Part2（技術者） |
| `outputs/phase-12/system-spec-update-summary.md`         | システム仕様書更新サマリー                         |
| `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴                               |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0件でも出力必須）            |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバックレポート（改善点なしでも必須） |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック（root evidence）             |

#### 完了条件

- 上記 6ファイルが全て作成されている
- `outputs/artifacts.json` と `outputs/phase-12/` が同期されている
- LOGS.md（2ファイル）と SKILL.md（2ファイル）が同一ターンで更新されている

---

### Phase 13: PR 作成

**ステータス**: open

> **重要**: PR 作成はユーザーの明示的な承認後のみ実施する。自動実行しない。

#### 目的

実装・テスト・ドキュメント更新が完了した内容を Pull Request として提出する。

#### 手順

1. ユーザーから PR 作成の明示的な承認を得る
2. `git status` / `git diff` / `git log` を確認する
3. コミットメッセージを作成する（Conventional Commits 形式）
4. PR タイトル・本文を作成する
5. `gh pr create` で PR を作成する

#### PR タイトル（案）

```
feat(skill-wizard): スキル名リアルタイムプレビュー + 日本語入力（IME）対応
```

#### 完了条件

- ユーザーの承認を得た後に PR が作成されている
- CI が PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `toWizardSkillName()` が `packages/shared` から import 可能
- [ ] AC-2: `SkillService.ts` が shared の `toWizardSkillName` を使用している
- [ ] AC-3: 説明入力フォーム下部にプレビューが表示される
- [ ] AC-4: 英数字入力時にプレビューが正しく表示される
- [ ] AC-5: 日本語のみ入力時に `new-skill` + 警告が表示される
- [ ] AC-6: IME 変換中はプレビューが更新されない
- [ ] AC-7: IME 確定後 300ms でプレビューが更新される
- [ ] AC-8: `aria-live="polite"` と `role="status"` が付与されている

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/shared lint` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm vitest run` で TC-01〜TC-18 が全て PASS
- [ ] `skillName.ts` の line 100% / branch 100% カバレッジ

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`（Part1/Part2 両方）
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも出力必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも出力必須）

### 手動テスト要件（Phase 11 VISUAL）

- [ ] VT-01〜VT-07 が全て実施・記録されている
- [ ] スクリーンショット 3枚が保存されている

---

## 6. 検証方法

### 自動テスト

```bash
# shared パッケージの型チェックとテスト
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared vitest run

# desktop パッケージの型チェックとテスト
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop vitest run

# カバレッジ確認
pnpm --filter @repo/shared vitest run --coverage
pnpm --filter @repo/desktop vitest run --coverage
```

### 手動テスト

```bash
# デスクトップアプリを起動
pnpm --filter @repo/desktop dev
```

スキル作成ウィザードを開き、VT-01〜VT-07 のシナリオを実施する。

---

## 7. リスクと対策

| リスク                                                               | 影響度 | 発生確率 | 対策                                                                                   |
| -------------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `packages/shared` の import が Renderer で機能しない                 | 高     | 中       | Phase 1 で tsconfig paths と Vite alias を確認し、テスト環境でも動作するか検証する     |
| IME 確定前後のイベント順序がブラウザ/OS によって異なる               | 中     | 低       | `compositionend` 後に `change` が来るケース・来ないケースを両方テストする              |
| `toWizardSkillName()` の移動で `SkillService.ts` のテストが崩れる    | 中     | 中       | Phase 4 で `SkillService.ts` の既存テストを確認し、import 変更後も PASS することを確認 |
| `"new-skill"` フォールバック警告の視覚デザインが既存スタイルと不整合 | 低     | 中       | 既存の警告コンポーネントの Tailwind クラスを参照し、一貫性を保つ                       |
| Phase 11 手動テストで IME 動作が環境依存になる                       | 中     | 低       | macOS の日本語 IME（ことえり / Google 日本語入力）での動作を確認することを明記する     |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/skill/SkillService.ts` — `toWizardSkillName()` の現在の実装（移動元）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` — スキル作成ウィザードのエントリーポイント
- `apps/desktop/src/renderer/components/skill/wizard/` — ウィザードの各ステップコンポーネント
- `packages/shared/src/` — shared パッケージのソース（移動先）
- `docs/30-workflows/completed-tasks/fix-creator-handler-duplicate-skill-name-validation/` — `toWizardSkillName()` 関連の完了タスク

### 関連タスク

| タスクID                                         | 関係   | 内容                                               |
| ------------------------------------------------ | ------ | -------------------------------------------------- |
| TASK-FIX-IPC-SKILL-NAME-001                      | 発見元 | `toWizardSkillName()` 正規化ロジックの修正（完了） |
| UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001 | 関連   | スキル名パターンの集約化（未実施）                 |

---

## 9. 備考

### 苦戦箇所【記録必須】

> 実行時に迷った点・判断に時間がかかった点・再利用したい回避策を具体的に記録してください。

| 項目     | 内容                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 症状     | `toWizardSkillName()` が Main プロセス専用の `private` メソッドのため、Renderer から直接呼び出せない                           |
| 原因     | Main プロセスと Renderer で共有されるべき純粋関数が、Main プロセス固有のクラスに密結合で実装されていた                         |
| 対応     | `packages/shared/src/utils/skillName.ts` に移動して export し、Main / Renderer 双方から import する共有化を行う                |
| 再発防止 | Main プロセス専用クラスに副作用のない純粋関数を実装するのを避け、最初から `packages/shared` に配置することをガイドラインに明記 |

| 項目     | 内容                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 症状     | 日本語入力（IME）では `onChange` イベントが変換確定前にも発火するため、debounce だけではプレビューが誤更新される |
| 原因     | IME の「変換中」状態と「確定済み」状態を `onChange` 単独では区別できない                                         |
| 対応     | `onCompositionStart`/`onCompositionEnd` フラグ（`useRef<boolean>`）と組み合わせ、確定後のみプレビューを更新する  |
| 再発防止 | 日本語入力を含む入力フォームを実装する際は、最初から IME 対応（コンポジションイベント）を考慮する                |

### 教訓（TASK-FIX-IPC-SKILL-NAME-001 Phase 12 より）

- **Main プロセス専用の純粋関数は shared に配置すべき**: 副作用のない純粋関数を Main プロセスに閉じ込めると、
  Renderer 側での再利用が困難になる。最初から `packages/shared` に配置することで、
  Main / Renderer 双方からの利用が容易になる。

- **IME 対応は最初から考慮すること**: 日本語ユーザーを対象とするフォームでは、
  `onChange` だけでなく `onCompositionStart`/`onCompositionEnd` の組み合わせが必須。
  後から追加すると実装・テストの両面で手戻りが大きくなる。

### 補足事項

- 本タスクは TASK-FIX-IPC-SKILL-NAME-001（2026-04-06）Phase 12 close-out 時の
  未タスク検出レポートで発見された UX 改善タスクである。
- UI 変更を含むため VISUAL タスクに分類されており、Phase 11 での手動テストと
  スクリーンショット取得が必須。
