# /matt-pocock-atomic-execute

matt-pocock-atomic-workflow Phase 3. TASKS 항목을 worker로 구현한 뒤 기본은 review 자동.

인자 형식: `[agent|agy|self|item-id|구현만]`

`matt-pocock-atomic-workflow` 스킬을 읽고 Phase 3을 수행한다. 「구현만」이 아니면 열린 항목이 끝난 뒤 `reviewer`까지 자동 진행한다.

Cursor 세션이다. `agy`/`pi`/`codex` CLI를 직접 호출하지 마라. 위임은 Task 툴만 쓴다.

인자: 슬래시 뒤에 붙인 텍스트

규칙:
- TASKS가 없으면 Phase 2를 먼저 한다.
- 인자가 `self`이면 이 세션이 구현한다.
- TASKS 항목 `worker:`가 `agy|pi|opencode|codex|claude`이면 Task 툴로 `cli-delegate`를 백그라운드로 띄운다 (`workers.md`·`invoke-worker.sh`).
- 인자가 `agy` / `flash` / `pro` / `sonnet`이면 `worker`를 해당 Antigravity 모델로 백그라운드로 띄운다 (`antigravity/gemini-3-8-flash:high`, `antigravity/gemini-3-1-pro:high`, `antigravity/claude-sonnet-4-6`).
- 그 외 구현 항목은 `worker`를 `async: true`로. task 첫 줄에 `matt-pocock-atomic-workflow`·`tdd` 경로를 적는다. 로직은 `tdd`를 강제한다.
- 항목마다 구현 후 **이 세션이** `done` 명령을 다시 실행하고 통과할 때만 `[x]`. 실패면 `막힘:`과 로그를 남기고 멈춘다.
- AskAntigravity는 사용자가 agy CLI 원샷을 분명히 원할 때만. 폴백 체인이 없다.

커밋·푸시하지 않는다. 한국어로 무엇이 끝났는지 보고한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

