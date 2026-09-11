---
description: g-workflow Phase 3. TASKS 항목을 구현한다. 기본 워커는 g-worker.
argument-hint: "[agent|agy|self|item-id]"
---
`~/.agents/skills/atomic-workflow/SKILL.md`를 읽고 Phase 3을 수행한다.

Pi 세션이다. `agy`/`codex`/`cursor-agent` CLI를 직접 호출하지 마라. 위임은 `subagent`만 쓴다.

인자: ${@:-}

규칙:
- TASKS가 없으면 Phase 2를 먼저 한다.
- 인자가 `self`이면 이 세션이 구현한다.
- 인자가 `agy` / `flash` / `pro` / `sonnet`이면 `g-worker`를 해당 Antigravity 모델로 `async: true`로 띄운다 (`antigravity/gemini-3-8-flash:high`, `antigravity/gemini-3-1-pro:high`, `antigravity/claude-sonnet-4-6`).
- 그 외 구현 항목은 `g-worker`를 `async: true`로 (기본: sonnet-4.6, 쿼터 부족 시 composer-2.5 / grok-4.6).
- 항목마다 구현 후 **이 세션이** `done` 명령을 다시 실행하고 통과할 때만 `[x]`. 실패면 `막힘:`과 로그를 남기고 멈춘다.
- AskAntigravity는 사용자가 agy CLI 원샷을 분명히 원할 때만. 폴백 체인이 없다.

커밋·푸시하지 않는다. 한국어로 무엇이 끝났는지 보고한다.
