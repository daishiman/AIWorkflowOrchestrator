# SkillInfoStep 実装ガイド

## タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001

---

## Part 1: 中学生向け説明

### スキル情報フォームの入力箱を、1つずつわかりやすく扱う理由

#### たとえ話：窓口の係員

`SkillInfoStep` は、市役所の窓口の係員に例えられます。
窓口には「申請書類を受け取る係員（コンポーネント）」がいて、書類の保管場所（状態）は奥のキャビネット（親コンポーネント）にあります。

- 係員（SkillInfoStep）は書類を直接保管せず、「受け取った情報を親に渡す」だけ
- 市民（ユーザー）が書類を書き直すたびに、係員は「この内容で更新しました」と奥に知らせる
- 「次へ」ボタンは、必要な書類（目的10文字以上＋カテゴリ選択）が揃ったときだけ押せる

#### なぜこの設計が必要か

もし係員が自分でキャビネットを持っていたら：

- 複数の係員（複数のコンポーネント）がバラバラにデータを持って混乱する
- テストするときに「係員の頭の中」を調べなければならず難しい

だから「データは1か所（親）だけが持つ」ルールにしているのです。

#### 3つの入力箱

1. **スキル名**（任意）：書かなくても大丈夫な任意項目。後から決めることもできる
2. **目的・背景**（必須）：10文字以上書かないと次に進めない重要な項目
3. **カテゴリ**（必須）：5種類から1つ選ぶ。「自動化・外部連携・データ分析・コードサポート・その他」

---

## Part 2: 技術者向け説明

### SkillInfoStep の契約と依存関係

#### コンポーネント概要

`SkillInfoStep` はスキル作成ウィザードの Step 0 として機能する、
**controlled component** パターンの React コンポーネントです。

ファイルパス: `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`

#### SkillInfoStepProps

```typescript
interface SkillInfoStepProps {
  /** Step 0 のフォーム全体の入力値。親が状態を保持する。 */
  formData: SkillInfoFormData;
  /** フォーム変更時に親へ全体値を通知するコールバック。 */
  onFormDataChange: (data: SkillInfoFormData) => void;
  /** Step 1 へ進むコールバック。isNextEnabled=true のときのみ有効。 */
  onNext: () => void;
}
```

#### SkillInfoFormData

```typescript
// @repo/shared/types/skillCreator からの subpath import
export interface SkillInfoFormData {
  /** スキル名（任意）。undefined と空文字列は両方許容する。 */
  skillName?: string;
  /** スキルの目的・概要（必須）。10文字以上でバリデーション通過。 */
  purpose: string;
  /** スキルカテゴリ（未選択時は null）。null が未選択の正規表現。 */
  category: SkillCategory | null;
}
```

#### SkillCategory

```typescript
export type SkillCategory =
  | "automation" // 自動化
  | "external-integration" // 外部連携
  | "data-analysis" // データ分析
  | "code-support" // コードサポート
  | "other"; // その他
```

全5値を `CATEGORY_OPTIONS` 定数として chip/button 群で列挙する理由:

- `<select>` と違い、全選択肢を一覧で見せられる
- `aria-pressed` で選択状態をアクセシブルに表現できる
- 5件という少量なので一覧表示がスキャンしやすい

#### wizard/index.ts

```typescript
// SkillInfoStep は以下で re-export されている
export { SkillInfoStep } from "./SkillInfoStep";
```

#### onNext と onFormDataChange の責務分離

| コールバック       | 責務                                           |
| ------------------ | ---------------------------------------------- |
| `onFormDataChange` | フォーム値変更を親に通知（任意のタイミングで） |
| `onNext`           | Step 1 への遷移を親に要求（ボタン押下時のみ）  |

これらを分離することで、フォーム変更とウィザード遷移の2つの関心事が独立する。

#### purposeTouched と isNextEnabled

```typescript
// ローカル state（最小化）
const [purposeTouched, setPurposeTouched] = useState(false);

// 「次へ」の活性条件
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category !== null;

// バリデーションエラー表示条件
const showPurposeError = purposeTouched && formData.purpose.trim().length < 10;
```

- `purposeTouched` は blur 後にエラーを表示するための最小 state
- `isNextEnabled` は `formData`（親管理）から導出されるため state 不要

#### fireEvent ベースのテスト

```typescript
// happy-dom 環境では userEvent 禁止。fireEvent を使用する。
fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
fireEvent.blur(screen.getByLabelText(/目的・背景/));
fireEvent.change(screen.getByLabelText(/スキル名/), {
  target: { value: "テスト" },
});
```

#### 型の公開経路

- `SkillInfoFormData` / `SkillCategory` は `@repo/shared/types/skillCreator` の subpath export
- root `@repo/shared` のバレルファイルへは追加しない（既存の別 `SkillCategory` との衝突回避）

### 画面証跡

`outputs/phase-11/screenshots/` に current task 側の visual evidence を保存済み。
Step 0 の初期表示・入力後・Step 1 遷移・生成中・エラー・完了・Light / Mobile を横断して確認できる。

| ファイル                                                           | 内容                           |
| ------------------------------------------------------------------ | ------------------------------ |
| `outputs/phase-11/screenshots/TC-01-step0-initial-dark.png`        | Step 0 初期表示（Dark）        |
| `outputs/phase-11/screenshots/TC-02-step0-filled-dark.png`         | Step 0 入力後（Dark）          |
| `outputs/phase-11/screenshots/TC-03-step1-configure-dark.png`      | Step 1 設定（Dark）            |
| `outputs/phase-11/screenshots/TC-04-step2-generating-dark.png`     | Step 2 生成中（Dark）          |
| `outputs/phase-11/screenshots/TC-05-step3-complete-dark.png`       | Step 3 完了（Dark）            |
| `outputs/phase-11/screenshots/TC-06-step2-error-dark.png`          | Step 2 エラー（Dark）          |
| `outputs/phase-11/screenshots/TC-07-step0-initial-light.png`       | Step 0 初期表示（Light）       |
| `outputs/phase-11/screenshots/TC-08-step0-initial-mobile-dark.png` | Step 0 初期表示（Mobile Dark） |

#### 使用例

```typescript
import { SkillInfoStep } from "@/components/skill/wizard";

function SkillCreateWizard() {
  const [formData, setFormData] = useState<SkillInfoFormData>({
    purpose: "",
    category: null,
  });

  return (
    <SkillInfoStep
      formData={formData}
      onFormDataChange={setFormData}
      onNext={() => setCurrentStep(1)}
    />
  );
}
```
