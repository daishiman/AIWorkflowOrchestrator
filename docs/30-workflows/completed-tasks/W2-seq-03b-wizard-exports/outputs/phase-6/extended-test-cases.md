# 拡張テストケース

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 目的

基本テストで網羅されていないエッジケースを補完する。

## エッジケース一覧

### EC-01: 同名エクスポートの型安全性

`SkillInfoStepProps` と `DescribeStepProps` は Props 構造が異なる。
型エラーなしにコンパイルされることで、混在参照が発生しないことを保証する。

```typescript
// NG: DescribeStepProps を SkillInfoStepProps として扱うとコンパイルエラー
import type { SkillInfoStepProps } from "../wizard/index";
const p: SkillInfoStepProps = { description: "" }; // 型エラー
```

### EC-02: 名前空間汚染チェック

`wizardIndex` オブジェクトのキー一覧が想定外のシンボルを含まないこと。

```typescript
const keys = Object.keys(wizardIndex);
expect(keys).not.toContain("DescribeStep");
expect(keys).not.toContain("ConfigureStep");
```

### EC-03: SkillInfoStep の null カテゴリ初期状態

`formData.category === null` の状態でレンダリングしてもクラッシュしないこと。

### EC-04: 複数インポートパスの等価性

```typescript
import { SkillInfoStep as A } from "../wizard/index";
import { SkillInfoStep as B } from "../wizard/SkillInfoStep";
expect(A).toBe(B); // 同一参照
```

### EC-05: DescribeStep ファイル直接インポートは依然可能

`index.ts` から削除しただけであり、`DescribeStep.tsx` ファイル自体は残存する。
直接パスインポートはコンパイルできること（deprecated 警告は許容）。
