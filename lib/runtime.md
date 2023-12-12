# 런타임

런타임은 토크나이저, 렉서, 파서를 거쳐서 만들어진 AST를 실행하는 역할을 합니다. 런타임은 AST를 순회하면서 각 노드를 실행합니다. 런타임을 구현하는데는 여러 방법이 있지만, 이 튜토리얼에서는 **분할정복(Divide and Conquer)** 방식을 사용합니다.

AST는 언뜻 보면 복잡해보이지만, 각 노드만 떼어서 보면 간단한 연산입니다. 예를 들어, 다음과 같은 AST가 있다고 가정해보겠습니다.

```javascript
[
    Print {
        value: BinaryCalculation {
            operator: AdditionOperator { },
            left: StringValue { value: '비만도는 ' },
            right: Variable { name: '비만도' },
        },
    },
]
```

-   `Print` 노드는 `value`의 값을 출력합니다
-   `BinaryCalculation` 노드는 `operator`의 연산자로 `left`와 `right`를 계산합니다
-   `AdditionOperator`는 두 값을 더하는 연산을 제공합니다

각 노드의 동작만 제대로 정의해주고, 런타임은 각 노드를 순회하면서 동작을 실행하면 됩니다.

앞에서 보았다시피, 각 노드를 클래스로 정의하였습니다. 그리고 그 상속 관계는 다음과 같습니다.

-   Token
    -   Executable
        -   Evaluable
            -   NumberValue
            -   StringValue
            -   Variable
            -   BinaryCalculation
        -   SetVariable
        -   Print
    -   Operator
    -   Keyword
    -   LineBreak

이제 각 노드의 동작을 정의해보겠습니다.

## Token

일반 토큰 노드를 나타내는 클래스입니다. 특별한 일을 하지는 않고, 상속을 위한 클래스입니다.

```javascript
class Token {
	constructor(value) {
		this.value = value
	}
}
```

## Executable (inherit Token)

실행 가능한 노드를 나타내는 클래스입니다. 노드를 실행하는 `execute` 메서드를 정의하겠습니다.

이 노드는 AST에 직접 들어가지는 않습니다. 다른 노드들의 상속을 위해 사용합니다.

```javascript
class Executable extends Token {
	execute() {}
}
```

## Evaluable (inherit Executable)

계산 가능한 노드를 나타내는 클래스입니다. 노드의 계산 결과를 제공하는 `eval` 메서드를 정의하겠습니다.

이 노드 또한 AST에 직접 들어가지는 않습니다. 다른 노드들의 상속을 위해 사용합니다.

```javascript
class Evaluable extends Executable {
	eval() {
		// 계산 결과를 반환합니다
	}
	execute() {
		this.eval()
	}
}
```

## NumberValue & StringValue (inherit Evaluable)

숫자와 문자를 나타내는 클래스입니다. `eval` 메서드에서는 자기 자신을 반환합니다.

```javascript
class NumberValue extends Evaluable {
	eval() {
		return this
	}
}
```

## Operator (inherit Token)

연산자를 나타내는 클래스입니다. `+`, `-`, `*`, `/` 등의 연산자를 나타냅니다. 연산자는 연산의 방법을 제공해야 합니다. 이를 위해 `calculate` 메서드를 정의합니다.

```javascript
class Operator extends Token {
	calculate(left, right) {
		// 연산자가 수행할 연산을 정의합니다
		// 예를 들어, 덧셈 연산자는 다음과 같이 정의할 수 있습니다

		if (this.value === '+') {
			// 좌항과 우항이 어떤 타입인지에 따라 다른 연산을 수행합니다
			// 둘 다 숫자라면, 두 값을 더해서 새로운 NumberValue를 반환합니다

			if (left instanceof NumberValue && right instanceof NumberValue) {
				return new NumberValue(left.value + right.value)
			}

            // 이와 동일하게, 나머지 타입에 대해서도 연산을 정의합니다
            ...
		}

        // 나머지 연산자에 대해서도 동일하게 정의합니다
        ...
	}
}
```

## Keyword (inherit Token)

`:`와 같이, 흐름에 있어서 의미를 가지는 노드입니다. 다만 파싱 과정에서 다른 노드들로 대체되기 때문에, 런타임에서는 사용되지 않습니다.

```javascript
class Keyword extends Token {}
```

## LineBreak (inherit Token)

줄바꿈을 나타내는 노드입니다. 런타임에서는 무시하고 넘어갑니다.

```javascript
class LineBreak extends Token {}
```

## BinaryCalculation (inherit Evaluable)

두 값을 연산하는 노드입니다. `left`와 `right`를 `operator`로 계산합니다.

```javascript
class BinaryCalculation extends Evaluable {
	constructor(left, operator, right) {
		// 파싱의 과정에서 left, operator, right의 순서로 자식 노드가 constructor에 전달됩니다
		super()

		// property에 저장해둡니다
		this.left = left
		this.operator = operator
		this.right = right
	}
	eval() {
		// left와 right의 값을 계산합니다
		const left = this.left.eval()
		const right = this.right.eval()

		// operator의 calculate 메서드를 호출합니다
		return this.operator.calculate(left, right)
	}
}
```

## SetVariable (inherit Executable)

```javascript
class SetVariable extends Executable {
	constructor(name, value) {
		super()
		this.name = name
		this.value = value
	}

	execute() {
		const value = this.value.eval()
		// 엥? 값을 일단 계산하긴 했는데, 어디에 저장해야 할까요?
	}
}
```

변수를 클래스의 프로퍼티에 저장할 수는 없습니다. 다른 연산에서 변수의 값을 참조하기 어렵기 때문입니다. 그렇기 때문에, 변수를 저장하는 별도의 공간인 **스코프 (Scope)**를 만들겠습니다.

### 스코프 (Scope)

스코프는 변수를 저장하는 공간입니다. 스코프는 두 가지 기능을 제공합니다.

-   변수를 저장합니다
-   변수를 참조합니다

간단하게 Map으로 구현하겠습니다.

```javascript
const scope = new Map()
```

스코프의 구현은 위가 끝입니다.

### 스코프를 사용하기

스코프를 사용해서 SetVariable 노드를 다시 구현해보겠습니다.

```javascript
class SetVariable extends Executable {
	constructor(name, value) {
		super()
		this.name = name
		this.value = value
	}

	execute(scope) {
		const value = this.value.eval()
		scope.set(this.name, value)
	}
}
```

`execute` 메소드에서 `scope`를 인자로 받았습니다. 이제 `execute` 메소드를 호출할 때엔 항상 `scope`를 전달해주면 됩니다.

## Variable (inherit Evaluable)

변수의 값을 가져오는 노드입니다. `name`을 가집니다.

```javascript
class Variable extends Evaluable {
	constructor(name) {
		super()
		this.name = name
	}

	eval(scope) {
		return scope.get(this.name)
	}
}
```

## Print (inherit Executable)

값을 출력하는 노드입니다. `value`를 가집니다. `value`는 `evaluable`의 인스턴스여야 합니다.

```javascript
class Print extends Executable {
	constructor(value) {
		super()
		this.value = value
	}

	execute(scope) {
		const value = this.value.eval(scope)
		console.log(value)
	}
}
```

이제 모든 구상이 끝났습니다. [이제 코드를 직접 작성해보겠습니다.](./token.js)
