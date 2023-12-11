import {
	BinaryCalculation,
	DeclareVariable,
	Evaluatable,
	Keyword,
	LineBreak,
	Operator,
	Print,
	Token,
	Variable,
} from './tokens.js'

// 파서를 만들기에 앞서, 규칙을 먼저 정의하겠습니다.
const rules = [
	{
		// 규칙1: 변수 선언
		// Variable, Operator { value: ":" }, Evaluatable를
		// DeclareVariable로 합치겠습니다
		to: DeclareVariable,
		pattern: [
			{
				type: Variable,
			},
			{
				type: Keyword,
				value: ':',
			},
			{
				type: Evaluatable,
			},
			{
				type: LineBreak,
			},
		],
	},
	{
		// 규칙2: 연산자
		// Evaluatable, Operator, Evaluatable를
		// BinaryCalculation으로 합치겠습니다
		to: BinaryCalculation,
		pattern: [
			{
				type: Evaluatable,
			},
			{
				type: Operator,
			},
			{
				type: Evaluatable,
			},
		],
	},
	{
		// 규칙3: 출력
		// Evaluatable, Token { value: "보여주기" }를
		// Print로 합치겠습니다
		to: Print,
		pattern: [
			{
				type: Evaluatable,
			},
			{
				type: Token,
				value: '보여주기',
			},
		],
	},
]

// 규칙은 이 정도면 될 것 같습니다
// 그럼 위 규칙으로 파싱을 할 수 있는 Shift-Reduce 파서를 만들어보겠습니다

export function parser(tokens) {
	// tokens를 받아서 AST를 만들어내는 함수입니다
	// tokens가 빌 때까지 반복합니다

	const stack = []

	tokenloop: while (true) {
		// 먼저 모든 규칙에 대해 Reduce를 시도해보겠습니다

		for (const rule of rules) {
			// 스택이 규칙의 길이보다 짧다면, Reduce를 시도할 수 없습니다
			if (stack.length < rule.pattern.length) continue

			// 규칙의 길이 만큼만 스택에서 가져오겠습니다
			const stackSlice = stack.slice(-rule.pattern.length)

			// 규칙을 만족하는지 확인합니다
			const isSatisfies = rule.pattern.every((pattern, index) => {
				const token = stackSlice[index]

				// 타입이 다르면 규칙에 맞지 않습니다
				if (!(token instanceof pattern.type)) return false

				// 만약 규칙에서 value를 지정했을 때는, 이 또한 일치해야 합니다.
				if ('value' in pattern && token.value !== pattern.value)
					return false

				return true
			})

			// 만약 규칙을 만족한다면, Reduce를 시도합니다
			if (isSatisfies) {
				// 스택에서 규칙의 길이만큼 제거합니다
				stack.splice(-rule.pattern.length, rule.pattern.length)

				// Reduce한 결과를 스택에 넣습니다
				stack.push(new rule.to(...stackSlice))

				// Reduce를 시도했으므로, 다시 처음부터 검사합니다
				continue tokenloop
			}
		}

		// Reduce가 성공하지 못했을 때에 이 부분이 실행됩니다
		// 왜냐하면 Reduce 이후에 continue tokenloop를 했기 때문입니다

		// Shift를 시도합니다
		// 하지만 만약 tokens가 비어있다면, 더 이상 Shift를 시도할 수 없습니다
		if (tokens.length === 0) break
		stack.push(tokens.shift())
	}

	// 파싱이 끝났습니다! 스택을 반환합니다
	return stack
}
