# TASK-043B SkillManagementPanel Import List 実装ガイド

## メタ情報

| 項目           | 内容                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| タスクID       | TASK-043B                                                                                        |
| 作成日         | 2026-03-06                                                                                       |
| 対象           | SkillManagementPanel import list refinement                                                      |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                            |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                               |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`             |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx`                |

## Part 1: 中学生向けの説明

### この画面がやっていること

この画面は、スマホの「インストール済みアプリ一覧」と「まだ入れていないアプリ一覧」を一つの場所で整理するイメージです。

- 上の段は、もう入っているスキルの棚です
- 下の段は、まだ入っていないスキルの棚です
- 検索欄は、棚の中から名前や説明で探すための虫眼鏡です
- 「追加する」を押すと確認ダイアログが開き、本当に入れるか確認します

### 追加の流れ

1. まだ入っていないスキルで「追加する」を押します
2. ダイアログで中身を確認します
3. もう一度「追加する」を押します
4. 追加に成功したら、ダイアログが閉じて、元の一覧に戻ります
5. 画面は「追加しました」と伝え、キーボード操作中でも迷子にならないように次の注目先へ戻します

### 大事な工夫

- 説明が空でも落ちないように、代わりの文を出します
- 検索対象が `null` でも落ちないように、文字列へ安全に直してから比較します
- 「追加APIが成功っぽく終わったが、実際には一覧が変わっていない」ケースでは成功扱いにしません
- ダイアログを開いている間は、親画面と子画面でエラーを二重に叫ばないようにしています

## Part 2: 技術者向けの説明

### 変更の責務分離

| コンポーネント         | 役割                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `SkillManagementPanel` | 2セクション構成、検索、状態出し分け、成功メッセージ、フォーカス復帰 |
| `SkillImportDialog`    | 追加確認、リソース内訳表示、フォーカストラップ、最終成功判定        |

### 主要型とシグネチャ

```ts
type View = "list" | "editor" | "analysis" | "create";

interface SkillImportDialogProps {
  skill: SkillMetadata;
  isOpen: boolean;
  onClose: () => void;
  onImported?: (skillName: string) => void;
}

function normalizeSearchText(value: unknown): string;
function toDisplayText(value: unknown, fallback?: string): string;
function getSkillResourceCount(skill: SkillMetadata | ImportedSkill): number;
function matchesQuery(
  skill: Pick<SkillMetadata, "name" | "description">,
  normalizedQuery: string,
): boolean;
```

### Store 契約

今回の実装では新規 IPC や public I/F を追加せず、既存の Store 契約を再利用しています。

```ts
fetchSkills(): Promise<void>
removeSkill(name: string): Promise<void>
importSkill(name: SkillMetadata["name"]): Promise<void>
clearSkillError(): void
```

利用している selector / state:

- `useImportedSkills`
- `useAvailableSkillsMetadata`
- `useSkillError`
- `useIsLoadingSkills`
- `useIsImportingSkill`
- `useImportingSkillName`
- `useFetchSkills`
- `useRemoveSkill`
- `useClearSkillError`
- `useAppStore.getState()`

### 追加成功判定の要点

`importSkill()` は失敗時に throw せず `skillError` だけ更新する経路があるため、戻り値だけでは成功判定できません。そこで `SkillImportDialog` では post-condition で確定しています。

```ts
const wasImportedBefore = useAppStore
  .getState()
  .importedSkills.some((importedSkill) => importedSkill.name === skill.name);

await importSkill(skill.name);

const { importedSkills, skillError: latestSkillError } = useAppStore.getState();
const isImportedAfter = importedSkills.some(
  (importedSkill) => importedSkill.name === skill.name,
);

if (latestSkillError || (!wasImportedBefore && !isImportedAfter)) {
  return;
}
```

この条件で以下を防いでいます。

- action は resolve したが state 反映が失敗している
- stale error が残っていて成功扱いにしてしまう
- 既に import 済みの skill を idempotent に扱う

### 画面状態の整理

| 状態              | 表示                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `isLoadingSkills` | section 本文の代わりに loading surface                              |
| imported 0件      | imported section に empty state                                     |
| available 0件     | available section に empty state                                    |
| 検索ヒット 0件    | no-result state                                                     |
| `skillError` あり | dialog 未開時のみ panel alert、dialog open 時は dialog alert に限定 |
| import 成功       | live region 相当の status message と focus 復帰                     |

### フォーカス制御

- dialog open 時: 最初の focusable 要素へ移動
- dialog 内: `Tab` / `Shift+Tab` でフォーカストラップ
- `Escape`: import 実行中でなければ close
- import 成功後: 追加した skill card または trigger へ `scheduleFocus` で復帰

### エッジケース

1. `description` が `null` / 空文字でも `toDisplayText()` で防御する
2. `agents` / `references` などの resource 配列が未定義でも `toSafeArray()` で防御する
3. `skillError` が parent / dialog で二重表示されないよう、panel 側の alert を抑止する
4. dark mode / mobile width でも CTA が 44px 以上を維持する
5. imported / available が同時に変化する mixed state を前提に section ごとに件数表示を固定する

### テストで固定した契約

- panel unit + integration: 21 tests PASS
- dialog unit: 31 tests PASS
- targeted vitest total: 52 tests PASS
- typecheck: PASS
- coverage:
  - `SkillManagementPanel.tsx` lines 95.92 / branches 90.00 / functions 90.00
  - `SkillImportDialog.tsx` lines 74.67 / branches 78.78 / functions 66.66
- manual screenshot coverage: expected 9 / covered 9 PASS

### 実装時に見るべき順序

1. `SkillManagementPanel.tsx` の state と section 出し分けを見る
2. `SkillImportDialog.tsx` の成功判定と focus trap を見る
3. integration test で success / failure / alert dedupe の契約を見る
4. Phase 11 screenshots で light / dark / mobile の視覚結果を見る
