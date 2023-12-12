// 코드를 직접 작성해보겠습니다

// 상속을 위한 최상위 클래스입니다.
export class Token {
	constructor(value) {
		this.value = value
	}
}

/*
실행 가능한 노드를 나타내는 클래스입니다.
노드를 실행하는 `execute` 메서드를 정의하겠습니다.

이 노드는 AST에 직접 들어가지는 않습니다.
다른 노드들의 상속을 위해 사용합니다.
*/
export class Executable extends Token {
	execute() {}
}

/*
계산 가능한 노드를 나타내는 클래스입니다.
노드의 계산 결과를 제공하는 `eval` 메서드를 정의하겠습니다.

이 노드 또한 AST에 직접 들어가지는 않습니다.
다른 노드들의 상속을 위해 사용합니다.
*/
export class Evaluable extends Executable {
	eval() {}
	execute() {
		this.eval()
	}
}

/*
숫자와 문자를 나타내는 클래스입니다.
`eval` 메서드에서는 자기 자신을 반환합니다.
*/
export class NumberValue extends Evaluable {
	eval() {
		return this
	}
}

export class StringValue extends Evaluable {
	eval() {
		return this
	}
}

/*
연산자를 나타내는 클래스입니다.
`+`, `-`, `*`, `/` 등의 연산자를 나타냅니다.

연산자는 연산의 방법을 제공해야 합니다.
이를 위해 `calculate` 메서드를 정의합니다.

이 튜토리얼에서는 `+`와 `/`만을 다루겠습니다.
*/

export class Operator extends Token {
	calculate(left, right) {
		if (this.value === '+') {
			if (left instanceof NumberValue && right instanceof NumberValue) {
				return new NumberValue(left.value + right.value)
			}
			if (left instanceof StringValue && right instanceof StringValue) {
				return new StringValue(left.value + right.value)
			}
			if (left instanceof StringValue && right instanceof NumberValue) {
				return new StringValue(left.value + right.value)
			}
			if (left instanceof NumberValue && right instanceof StringValue) {
				return new StringValue(left.value + right.value)
			}
		}

		if (this.value === '/') {
			if (left instanceof NumberValue && right instanceof NumberValue) {
				return new NumberValue(left.value / right.value)
			}

			throw new Error('숫자만 나눌 수 있습니다')
		}

		throw new Error('알 수 없는 연산자입니다')
	}
}

/*
흐름에 있어서 의미를 가지는 노드입니다.
파싱 과정에서 다른 노드들로 대체되기 때문에, 런타임에서는 사용되지 않습니다.
*/
export class Keyword extends Token {}

/*
줄바꿈을 나타내는 노드입니다. 런타임에서는 무시하고 넘어갑니다.
*/
export class LineBreak extends Token {}

/*
두 값을 연산하는 노드입니다. left와 right를 operator로 계산합니다.
여기서도 scope를 사용합니다!
*/
export class BinaryCalculation extends Evaluable {
	constructor(left, operator, right) {
		super()
		this.left = left
		this.operator = operator
		this.right = right
	}

	eval(scope) {
		const left = this.left.eval(scope)
		const right = this.right.eval(scope)

		return this.operator.calculate(left, right)
	}
}

export class SetVariable extends Executable {
	constructor(variable, _, value) {
		super()
		this.name = variable.value
		this.value = value
	}

	execute(scope) {
		const value = this.value.eval(scope)
		scope.set(this.name, value)
	}
}

export class Variable extends Evaluable {
	eval(scope) {
		return scope.get(this.value)
	}
}

export class Print extends Executable {
	execute(scope) {
		const value = this.value.eval(scope)
		console.log(value.value)
	}
}

// 토큰과 노드의 동작을 모두 정의했습니다!
// 이제 프로그램을 실행하는 방법을 알아보겠습니다

// [실행하기](./run.js)
