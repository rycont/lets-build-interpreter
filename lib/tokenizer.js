/*

토크나이저를 작성해보겠습니다. 규칙은 다음과 같습니다.

1. Token은 한글의 나열이다.
2. `:`, `/`, `+`는 Operator이다
3. `\n`은 LineBreak이다
4. NumberValue는 0 ~ 9의 나열이다. 다만 첫 문자는 0일 수 없다.
5. StringValue는 `"`로 시작하고 `"`로 끝난다. 개행이 포함될 수 없다.

- 변수명 처리
    1. `Token` 다음에 `Keyword { value: ":" }`가 온다면, 앞의 `Token`을 변수로 인식한다.
    2. 모든 변수 명을 기억해두고, 변수명과 일치하는 모든 `Token`을 `Variable` 클래스의 인스턴스로 변환한다.

변수명 처리는 1 ~ 5 처리가 끝나고 난 뒤에 후처리로 진행하면 좋을 것 같습니다.
*/

// `tokens.js`는 추후 작성합니다. 지금은 토크나이저가 작동하는 방식에 집중해주세요.
import {
	LineBreak,
	NumberValue,
	Operator,
	StringValue,
	Token,
	Variable,
	Keyword,
} from './tokens.js'

export function tokenizer(_code) {
	// code에서 맨 앞의 한 글자를 보고 어떤 유형인지 판단한 뒤, 남은 부분을 처리하는 형식으로 작성하겠습니다

	// Mutable Method를 사용할 예정이기에 Shallow Copy를 만들겠습니다
	const code = [..._code]

	// 처리가 완료된 토큰은 tokens 배열에 쌓겠습니다
	const tokens = []

	// 모든 code를 처리해야 하기 때문에 code의 길이를 기준으로 삼는 루프를 작성하겠습니다.
	// code.length가 0이 될 때까지 반복하겠습니다.

	while (code.length) {
		// 가장 먼저 Token인지 판단하겠습니다
		// Token은 한글의 나열이기 때문에, 첫 글자가 한글인지 확인해야 합니다
		if ('가' <= code[0] && code[0] <= '힣') {
			// 가장 앞에 있는 글자가 한글이므로, Token이라고 판단하고 처리하겠습니다

			let value = ''
			// 한글이 아닌 글자가 나올 때까지 하나의 Token으로 인식해야 합니다.

			while (code.length && '가' <= code[0] && code[0] <= '힣') {
				value += code.shift()
			}

			// Token이 완성되었으므로, 인스턴스를 생성해 tokens 배열에 추가하겠습니다
			tokens.push(new Token(value))

			continue
		}

		// Token이 아니라면, Operator인지 확인해야 합니다
		// Operator는 `/`, `+`이므로, 이를 확인하겠습니다
		if (['/', '+'].includes(code[0])) {
			// Operator이므로, tokens 배열에 추가하겠습니다
			tokens.push(new Operator(code.shift()))

			continue
		}

		// Operator도 아니라면, Keyword인지 확인해야 합니다
		// Keyword는 `:`이므로, 이를 확인하겠습니다
		if (code[0] === ':') {
			// Keyword이므로, tokens 배열에 추가하겠습니다
			tokens.push(new Keyword(code.shift()))

			continue
		}

		// Keyword도 아니라면, LineBreak인지 확인해야 합니다
		// LineBreak는 `\n`입니다.

		if (code[0] === '\n') {
			code.shift()
			tokens.push(new LineBreak())
			continue
		}

		// LineBreak도 아니라면, NumberValue인지 확인해야 합니다
		// NumberValue의 첫 글자는 1 ~ 9입니다.

		if ('1' <= code[0] && code[0] <= '9') {
			let numberValue = ''

			// NumberValue는 0 ~ 9의 나열이므로, 이를 확인하겠습니다.
			while (code.length && '0' <= code[0] && code[0] <= '9') {
				numberValue += code.shift()
			}

			tokens.push(new NumberValue(Number(numberValue)))
			continue
		}

		// NumberValue도 아니라면, StringValue인지 확인해야 합니다
		// StringValue의 첫 글자는 `"`입니다.

		if (code[0] === '"') {
			let value = ''

			// 맨 앞의 `"`를 제거합니다
			code.shift()

			// StringValue는 `"`로 시작하고 `"`로 끝납니다.
			// 개행이 포함될 수 없습니다.

			while (code.length && code[0] !== '"') {
				value += code.shift()
			}

			// `"`를 제거합니다
			code.shift()

			tokens.push(new StringValue(value))
			continue
		}

		// 위의 규칙에 해당하지 않는다면 공백인지 확인해야 합니다.
		if (code[0] === ' ') {
			code.shift()
			continue
		}

		// 모든 경우에 해당하지 않는다면, code의 첫 글자가 잘못된 것입니다.
		// 이를 에러로 처리하겠습니다.

		throw new Error(`잘못된 글자입니다: ${code[0]}`)
	}

	// 이렇게 기본적인 토크나이징은 끝났습니다.
	// 이제 변수명을 처리하겠습니다.

	const variables = []

	// tokens에서 Token 다음에 Keyword { value: ":" }가 오는 곳을 찾아야 합니다
	for (let i = 0; i < tokens.length - 1; i++) {
		// Token 다음에 Keyword가 오는 곳을 찾았습니다
		if (
			tokens[i] instanceof Token && // Token이고
			tokens[i + 1] instanceof Keyword && // 그 다음에 Keyword가 오고
			tokens[i + 1].value === ':' // Keyword의 value가 ":"라면
		) {
			// 앞 Token의 value를 변수로 인식하겠습니다
			variables.push(tokens[i].value)
		}
	}

	// 변수명을 모두 찾았습니다.
	// 이제 변수명과 일치하는 Token을 Variable 클래스의 인스턴스로 변환하겠습니다.

	for (let i = 0; i < tokens.length; i++) {
		if (
			tokens[i] instanceof Token && // Token이고
			variables.includes(tokens[i].value) // 변수명과 일치한다면
		) {
			// Variable 클래스의 인스턴스로 변환하겠습니다
			tokens[i] = new Variable(tokens[i].value)
		}
	}

	// 모든 처리가 끝났습니다! tokens를 반환하겠습니다
	return tokens
}

// [다음: Parser 구현하기](./parser.md)
