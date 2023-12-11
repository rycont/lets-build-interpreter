# 토크나이저와 렉서 직접 만들어보기

약속 프로그래밍 언어의 토크나이저를 만들기 위해서는 약속 프로그래밍 언어의 문법을 이해해야 합니다. 예시 코드를 다시 살펴보겠습니다.

```
키: 170
몸무게: 60
비만도: 키 / 몸무게 / 몸무게

"비만도는" + 비만도 보여주기
```

다음과 같은 규칙으로 구현하고자 합니다.

1. Token은 한글의 나열이다.
2. `/`, `+`는 Operator이다
3. `:`는 Keyword이다
4. `\n`은 LineBreak이다
5. NumberValue는 0 ~ 9의 나열이다. 다만 첫 문자는 0일 수 없다.
6. StringValue는 `"`로 시작하고 `"`로 끝난다. 개행이 포함될 수 없다.

그렇다면 예시코드는 다음과 같이 처리될 수 있습니다

```javascript
[
    Token { value: "키" },

    // Token이라는 클래스의 인스턴스이고,
    // value라는 프로퍼티에 "키"라는 값이 담겨있다는 뜻입니다.

    Keyword { value: ":" },
    NumberValue { value: 170 },
    LineBreak {},
    Token { value: "몸무게" },
    Keyword { value: ":" },
    NumberValue { value: 60 },
    LineBreak {},
    Token { value: "BMI" },
    Keyword { value: ":" },
    Token { value: "키" },
    Operator { value: "/" },
    Token { value: "몸무게" },
    Operator { value: "/" },
    Token { value: "몸무게" },
    LineBreak {},
    StringValue { value: "BMI는" },
    Operator { value: "+" },
    Token { value: "BMI" },
    Token { value: "보여주기" },
]
```

뭔가 실제 의미와 일치하지 않는 부분이 있습니다. 첫 토큰인 `키`는 실제로는 변수를 나타냅니다. 그러나 처리 결과에선 `Token`이라는 별 의미 없는 유형으로 처리되었습니다. 변수를 올바르게 처리하기 위해 한가지 규칙을 추가하겠습니다.

약속에서의 모든 변수는 선언을 해줘야 사용할 수 있습니다. 그렇기 때문에, 변수를 선언하는 부분을 찾는다면 선언된 모든 변수를 가져올 수 있습니다. 해당 변수들의 이름과 일치하는 토큰의 유형을 변수로 올바르게 바꿔주면 됩니다.

-   변수명 처리
    1.  `Token` 다음에 `Keyword { value: ":" }`가 온다면, 앞의 `Token`을 변수로 인식한다.
    2.  모든 변수 명을 기억해두고, 변수명과 일치하는 모든 `Token`을 `Variable` 클래스의 인스턴스로 변환한다.

위 규칙에 일치하는 토큰을 모두 찾아보겠습니다.

```
[
    Token { value: "키" },
    Keyword { value: ":" },
]
```

```
[
    Token { value: "몸무게" },
    Keyword { value: ":" },
]
```

```
[
    Token { value: "BMI" },
    Keyword { value: ":" },
]
```

변수는 `키`, `몸무게`, `BMI`가 되고, 이와 일치하는`Token`을 `Variable`로 변환해주면 결과는 다음과 같습니다.

```javascript
[
    Variable { value: "키" },
    Keyword { value: ":" },
    NumberValue { value: 170 },
    LineBreak {},
    Variable { value: "몸무게" },
    Keyword { value: ":" },
    NumberValue { value: 60 },
    LineBreak {},
    Variable { value: "BMI" },
    Keyword { value: ":" },
    Variable { value: "키" },
    Operator { value: "/" },
    Variable { value: "몸무게" },
    Operator { value: "/" },
    Variable { value: "몸무게" },
    LineBreak {},
    LineBreak {},
    StringValue { value: "BMI는" },
    Operator { value: "+" },
    Variable { value: "BMI" },
    Token { value: "보여주기" },
]
```

이제 이 규칙을 따르는 토크나이저를 짜보겠습니다

[다음: ./tokenizer.js](./tokenizer.js)
