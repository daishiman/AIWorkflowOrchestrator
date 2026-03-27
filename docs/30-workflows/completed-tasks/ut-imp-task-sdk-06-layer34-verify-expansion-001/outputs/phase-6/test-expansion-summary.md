# Test Expansion Summary

## 追加する edge case

- evidence 0 件だが verify fail のケース
- provenance が partial なケース
- route snapshot が取得不能なケース
- re-verify action が disabled になるケース

## 追加する regression

- approval / disclosure DTO 混入防止
- persistence / resume invalidation 文言混入防止
- delegated note を owner 情報に昇格させない
