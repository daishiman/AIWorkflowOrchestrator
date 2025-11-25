# 安定度メトリクス

## 概要

Robert C. Martin が提唱したパッケージ原則に基づく、
モジュールの安定性を定量化するメトリクス群。

## 主要メトリクス

### 1. Instability（不安定度）

```
I = Ce / (Ca + Ce)
```

- **Ce（Efferent Coupling）**: 他に依存している数（出力）
- **Ca（Afferent Coupling）**: 他から依存されている数（入力）

| I値 | 解釈 |
|----|------|
| 0 | 完全に安定（他に依存しない、多くから依存される） |
| 1 | 完全に不安定（多くに依存、誰からも依存されない） |

### 2. Abstractness（抽象度）

```
A = Na / Nc
```

- **Na**: 抽象クラス・インターフェースの数
- **Nc**: 全クラスの数

| A値 | 解釈 |
|----|------|
| 0 | 完全に具象（実装のみ） |
| 1 | 完全に抽象（インターフェースのみ） |

### 3. Distance from Main Sequence（主系列からの距離）

```
D = |A + I - 1|
```

理想的なモジュールは主系列（A + I = 1）上に位置する。

```
    A
    1 ┼────────────────────●
      │                  ╱  Zone of Uselessness
      │               ╱    （過度に抽象的）
      │            ╱
    0.5┼─────────●─────────
      │       ╱
      │    ╱   Zone of Pain
      │ ╱      （過度に具象的）
    0 ┼●───────────────────
      0      0.5           1  I
```

## 計算例

### モジュール例

```
shared/core/
├── entities/       # 他から多く参照される
├── interfaces/     # 抽象定義
└── errors/

features/auth/
├── schema.ts       # Zodスキーマ
├── executor.ts     # ビジネスロジック
└── index.ts
```

### shared/core の分析

```
Ca（入力）: 10（features、infrastructure から参照）
Ce（出力）: 0（外部依存なし）
Na（抽象）: 5（インターフェース）
Nc（全体）: 8

I = 0 / (10 + 0) = 0（完全に安定）
A = 5 / 8 = 0.625（高い抽象度）
D = |0.625 + 0 - 1| = 0.375（主系列に近い）
```

### features/auth の分析

```
Ca（入力）: 2（app/api から参照）
Ce（出力）: 4（shared/core、shared/infrastructure）
Na（抽象）: 0
Nc（全体）: 3

I = 4 / (2 + 4) = 0.67（やや不安定）
A = 0 / 3 = 0（完全に具象）
D = |0 + 0.67 - 1| = 0.33（許容範囲）
```

## 問題ゾーン

### Zone of Pain（苦痛ゾーン）

- **特徴**: I=0, A=0（安定だが具象的）
- **問題**: 変更が困難、多くに影響
- **例**: 具象クラスのユーティリティ関数群
- **対策**: 抽象化を導入

### Zone of Uselessness（無用ゾーン）

- **特徴**: I=1, A=1（不安定で抽象的）
- **問題**: 誰も使わない抽象
- **例**: 実装のないインターフェース群
- **対策**: 実装を追加または削除

## 計測スクリプト

```javascript
// calculate-metrics.mjs
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, dirname } from 'path';

class StabilityAnalyzer {
  constructor() {
    this.modules = new Map();
  }

  analyze(modulePath, dependencies, dependents) {
    const Ca = dependents.length;  // Afferent
    const Ce = dependencies.length; // Efferent

    const I = Ce === 0 && Ca === 0 ? 0 : Ce / (Ca + Ce);

    return {
      path: modulePath,
      Ca,
      Ce,
      I,
      stability: I < 0.5 ? 'stable' : 'unstable'
    };
  }
}
```

## Clean Architecture との関係

```
レイヤー           理想的なI値    理想的なA値
─────────────────────────────────────────
Entities           0.0           0.8-1.0
Use Cases          0.3           0.5-0.7
Interface Adapters 0.5-0.7       0.2-0.5
Frameworks         0.8-1.0       0.0-0.2
```

## チェックリスト

- [ ] 内側のレイヤーのI値が低いか（0に近い）
- [ ] 内側のレイヤーのA値が高いか（1に近い）
- [ ] 各モジュールのD値が0.3以下か
- [ ] Zone of PainまたはUselessnessに入るモジュールがないか
