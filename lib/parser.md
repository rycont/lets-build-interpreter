# 파서 직접 만들어보기

> 3. 파서(Parser): 토큰과 토큰 사이의 관계를 분석하고, 의미를 포함하여 구조적으로 재조합 합니다. 재조합된 결과를 AST(Abstract Syntax Tree)라고 합니다.

예시코드를 다시 살펴보겠습니다.

```
키: 170
몸무게: 60
비만도: 키 / 몸무게 / 몸무게

"비만도는 " + 비만도 보여주기
```

이를 파싱하면 다음과 같은 AST가 만들어집니다.

```javascript
[
	SetVariable {
		name: '키',
		value: NumberValue { value: 170 },
    },
    SetVariable {
        name: '몸무게',
        value: NumberValue { value: 60 },
    },
    SetVariable {
        name: '비만도',
        value: BinaryCalculation {
            operator: DivisionOperator { },
            left: BinaryCalculation {
                operator: DivisionOperator { },
                left: Variable { name: '키' },
                right: Variable { name: '몸무게' },
            },
            right: Variable { name: '몸무게' },
        },
    },
    Print {
        value: BinaryCalculation {
            operator: AdditionOperator { },
            left: StringValue { value: '비만도는 ' },
            right: Variable { name: '비만도' },
        },
    },
]
```

## 동작 과정

파서를 직접 만들어보기 전에, 파서가 어떻게 동작하는지 간단히 살펴보겠습니다. 파싱을 하는 방법은 여러가지가 있지만, 이 튜토리얼에서는 `Shift-Reduce` 방식을 사용합니다.

`Shift-Reduce`는 다음과 같은 두가지 동작을 반복하는 방식입니다.

1. Shift: 코드에서 토큰을 하나 가져와서 스택에 넣습니다
2. Reduce: 스택에 있는 토큰을 규칙에 따라 합칩니다
    - Reduce는 더 이상 할 수 없을 때까지 반복합니다
    - 규칙의 길이가 스택보다 짧다면, 스택의 윗 부분에서부터 규칙의 길이만큼의 토큰에만 규칙을 적용합니다

Shift-Reduce 방식으로 파싱을 진행하는 과정을 살펴보겠습니다.

### 준비

```
[
    StringValue { value: "BMI는" },
    Operator { value: "+" },
    Variable { value: "BMI" },
    Token { value: "보여주기" }
]
```

### 규칙

1. `Evaluable`, `Operator`, `Evaluable`은 `BinaryCalculation`으로 합친다.
2. `Evaluable`, `Token { value: "보여주기" }`는 `Print`로 합친다.
3. `Variable`, `Keyword { value: ":" }`, `Evaluable`은 `SetVariable`으로 합친다.

### 과정

-   스택: `[ StringValue { value: "BMI는" } ]`
-   적용 가능한 규칙: 없음
-   **Shift**

---

-   스택: `[ StringValue { value: "BMI는" }, Operator { value: "+" } ]`
-   적용 가능한 규칙: 없음
-   **Shift**

---

-   스택: `[ StringValue { value: "BMI는" }, Operator { value: "+" }, Variable { value: "BMI" } ]`
-   적용 가능한 규칙: 1번 규칙 (`Evaluable`, `Operator`, `Evaluable`은 `BinaryCalculation`으로 합친다)
-   **Reduce**

---

-   스택: `[ BinaryCalculation { ... } ]`
-   적용 가능한 규칙: 없음
-   **Shift**

---

-   스택: `[ BinaryCalculation { ... }, Token { value: "보여주기" } ]`
-   적용 가능한 규칙: 2번 규칙(`Evaluable`, `Token { value: "보여주기" }`는 `Print`로 합친다)
-   **Reduce**

---

이제 남은 토큰이 없으므로 파싱이 완료되었습니다. 스택에는 최종 결과인 `Print`가 남아있습니다.

```
Print {
    value: BinaryCalculation {
        operator: AdditionOperator { },
        left: StringValue { value: 'BMI는 ' },
        right: Variable { name: 'BMI' },
    },
}
```

파서를 구현하는 방법을 알아보았으니, [이제 직접 만들어보겠습니다!](./parser.js)
