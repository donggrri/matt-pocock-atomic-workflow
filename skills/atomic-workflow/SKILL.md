---
name: atomic-workflow
description: >-
  Runs g-workflow phases (plan, task, execute, review, commit, status).
  Use when the user invokes /g-plan, /g-task, /g-execute, /g-delegate,
  /g-review, /g-commit, /g-status, or mentions g-workflow or atomic-workflow.
---

# Atomic Workflow (g-workflow)

전역 스킬이다. Pi는 `~/.pi/agent/prompts/g-*.md`와 `~/.pi/agent/agents/g-*.md`를 쓴다. Cursor 슬래시는 `~/.cursor/commands/g-*.md`. Codex/agy가 커맨드 파일을 읽으면 `~/.agents/commands/g-*.md`.

사용자에게는 한국어로 말한다. 템플릿은 [reference.md](reference.md), 위임은 [workers.md](workers.md), 모델은 [models.md](models.md), 테스트는 [testing.md](testing.md)를 이 파일을 읽은 뒤에만 연다.

## 바로 할 일

1. 이 파일 전체를 읽는다.
2. 하네스를 가른다. `PI_CODING_AGENT` 또는 `PI_SESSION_ID`가 있으면 **Pi**. 아니면 **Cursor**.
3. Cursor면 채팅 제목을 3~5단어로 `rename_chat` 한다. Pi면 건너뛴다.
4. 의도가 **워크플로 자체 수정**인지 **제품 기능**인지 가른다.

**PLAN 위치 규칙** (템플릿 필드는 양쪽 동일):

- **제품 기능**: 워크스페이스 루트에 `PLAN-<slug>.md`를 쓴다. 홈·스킬 폴더에 쓰지 않는다.
- **워크플로 자체** (g-workflow·스킬·커맨드·패키지 수정·검토): `~/.pi/agent/g-workflow/PLAN-<slug>.md`를 쓴다. 제품 루트에 쓰지 않는다.

워크플로 자체일 때 같이 맞추는 파일 목록:

- `~/.agents/skills/atomic-workflow/`
- `~/.agents/commands/g-*.md`
- `~/.cursor/skills/atomic-workflow/`
- `~/.cursor/commands/g-*.md`
- `~/.pi/agent/agents/g-*.md`
- `~/.pi/agent/prompts/g-*.md`
- 필요하면 `~/.pi/agent/settings.json`의 `subagents`

## 단계

| 단계 | 커맨드 | 산출물 | 다음 |
|---|---|---|---|
| 1 | `/g-plan` | `PLAN-<slug>.md` | 막힌 질문 없으면 `/g-task` |
| 2 | `/g-task` | `TASKS-<slug>.md` | `/g-execute` |
| 3 | `/g-execute` 또는 `/g-delegate` | 코드 + 체크된 TASKS | `/g-review` |
| 4 | `/g-review` | `REVIEW-<slug>.md` + 테스트 | 통과 시 `/g-commit` |
| 5 | `/g-commit` | 커밋 (푸시 없음) | 사용자가 원할 때만 PR |
| — | `/g-status` | 진행 보고 | 이어서 할 커맨드 |

슬러그: 의도에서 만든 짧은 ASCII kebab-case (`space-notes`, `mcp-http`).

## 한 메시지에 여러 커맨드

`/g-plan /g-execute /g-review`처럼 묶이면 **빠진 산출물부터** 순서대로 한다.

- Plan에 막힌 질문(보안·범위·데이터 손실)이 있으면 거기서 멈춘다.
- Task 파일이 없으면 Execute 전에 Phase 2를 한다.
- `/g-commit` 또는 「커밋해」가 없으면 커밋하지 않는다.
- 푸시는 사용자가 분명히 요청할 때만 한다.

## 하네스

### Pi

오케스트레이터는 이 세션이다. 구현/계획/리뷰가 필요하면 `subagent` 툴로 아래 에이전트를 띄운다.

| 단계 | 에이전트 | 기본 |
|---|---|---|
| recon | `scout` | 코드가 낯설 때만 |
| plan | `g-planner` | 한두 파일이면 self |
| task | `g-tasker` | 한두 항목이면 self |
| execute | `g-worker` | `self`를 말한 경우만 직접 구현 |
| review | `g-reviewer` | 항상 자식 권장 |
| commit/status | self | 서브에이전트 금지 |

런 로그: `~/.pi/agent/g-workflow/runs/<slug>/`
증거: `~/.pi/agent/g-workflow/evidence/<YYYY-MM-DD>-<slug>/`

- `rename_chat`, `move_agent_to_root`를 호출하지 않는다.
- `scripts/ensure-workers.ps1`으로 CLI를 설치하지 않는다.
- `agy`를 인자 없이 실행하지 않는다.
- Cursor/Antigravity 모델을 쓰는 자식은 `async: true`로 띄운다. 포그라운드에는 확장 프로바이더가 없다.
- 모델 폴백은 에이전트 `fallbackModels`가 한다. [models.md](models.md).

### Cursor

기존 제약:

- **Plan 모드**는 쓰기 금지. 동의를 구하지 않고 모드를 바꾸지 않는다.
- 워크트리를 만들었으면 즉시 `cursor-app-control.move_agent_to_root`로 옮긴다.
- 셸은 PowerShell이다. heredoc 대신 here-string.
- 이 머신 git 설정·`--no-verify`·force push는 하지 않는다.

런 로그: `~/.cursor/g-workflow/runs/<slug>/`
증거: `~/.cursor/g-workflow/evidence/<YYYY-MM-DD>-<slug>/`

구현을 CLI에 넘길 때만 [workers.md](workers.md)의 PowerShell 경로를 쓴다.

## 워크트리

조건이 맞을 때만 만든다. 항상 만들라는 뜻이 아니다.

**만든다** (쓰기가 허용된 모드, git 저장소):

- 기능이 여러 파일에 걸치거나
- 현재 워크트리에 이번 일과 무관한 변경이 있거나
- 사용자가 병렬/격리를 원할 때

위치: 저장소 부모의 `../<repo>-<slug>`, 브랜치 `feat/<slug>`. 이미 있으면 재사용한다. 명령은 [reference.md](reference.md).

**만들지 않는다**:

- Cursor Plan 모드
- git 저장소가 아님 → 현재 폴더에서 진행하고 그 사실을 말한다
- 한두 파일 수정, 문서만, 워크플로 설정만
- 이미 해당 `feat/<slug>` 워크트리 안에 있음

Pi에서는 워크트리를 만든 뒤 그 경로를 작업 `cwd`로 쓴다. Cursor 루트 이동 툴은 없다.

## 웹 검색

외부 API·보안·인프라·처음 쓰는 라이브러리면 검색한다. 이미 아는 코드의 로컬 리팩터는 검색하지 않는다. 「best practices」만 있는 검색은 하지 않는다.

## 프로젝트 문서

저장소에 `docs/README.md`가 있으면 그 표를 따른다. 없으면 `README.md`를 본다.

- 자격 증명·실토큰은 문서·커밋에 넣지 않는다.
- 워크플로 설정(`~/.cursor/...`, `~/.pi/...`, `~/.agents/...`)만 고친 세션에서는 제품 문서에 기능 상태를 적지 않는다.

## Phase 1 — Plan

1. 코드·문서·기존 `PLAN-*.md`/`TASKS-*.md`를 읽는다.
2. 필요하면 웹 검색. 코드가 낯설면 Pi에서 `scout`를 먼저 띄워도 된다.
3. 워크트리 규칙에 따라 격리 여부를 정한다.
4. [reference.md](reference.md) 템플릿으로 PLAN 위치 규칙에 따라 `PLAN-<slug>.md`를 쓴다: 제품 기능이면 워크트리(또는 현재 루트), 워크플로 자체면 `~/.pi/agent/g-workflow/`. Pi에서 범위가 크면 `g-planner`에게 맡긴다.
5. 한 줄 목표, 하지 않을 것, 의존 순서, 위험, 막힌 질문을 넣는다.
6. 같은 메시지에 이후 단계가 있고 막힌 질문이 없으면 Phase 2로 간다. 아니면 계획만 보여주고 멈춘다.

## 오케스트레이션

Plan / Task / Review 게이트 / Commit은 부모 세션이 소유한다. 구현은 자식에게 넘길 수 있다.

Pi 워커: `g-worker` · `scout` · `oracle` · `reviewer` · `self`.
Cursor CLI 워커: `agy` · `codex` · `cursor` · `opencode` · `self`.

1. 사용자가 워커를 지목했거나 TASKS에 `worker:`가 있으면 [workers.md](workers.md)를 읽는다.
2. Pi면 `subagent`만 호출한다. Cursor CLI 경로면 `ensure-workers.ps1` / `invoke-worker.ps1`만 쓴다.
3. 브리프에 비밀·토큰·`.env`를 넣지 않는다.
4. 워커가 끝나면 오케스트레이터가 `git diff`와 테스트를 직접 확인한다. 「완료」로그를 믿지 않는다.
5. 워크트리당 쓰기 워커는 하나. 워커는 커밋·푸시하지 않는다.
6. `agy`를 인자 없이 실행하지 않는다 (TUI 정지).

## Phase 2 — Task

1. 현재 루트의 `PLAN-<slug>.md`를 읽는다. 없으면 Phase 1부터.
2. `TASKS-<slug>.md`를 만든다. 각 항목은 한 번에 검증 가능한 크기. Pi에서 항목이 많으면 `g-tasker`.
3. `id`, 체크박스, `files`, `depends`, `parallel`, `worker`, `done`을 적는다.
4. 같은 파일을 안 건드리는 독립 항목만 `parallel: yes`.
5. 제품 기능이면 [testing.md](testing.md)대로 테스트 항목을 넣는다. `done`에 실제 명령을 적는다.
6. Pi 구현 항목의 기본 `worker`는 `g-worker`. 문서 항목은 `self`.

## Phase 3 — Execute

1. `TASKS-<slug>.md`가 없으면 Phase 2를 먼저 한다.
2. `worker`가 `self`이거나 비었고 사용자가 위임을 원하지 않으면 이 에이전트가 구현한다.
3. Pi에서 `g-worker` / `agy` / 모델 별칭이 있으면 `subagent`로 위임한다. Cursor CLI면 invoke 스크립트만 쓴다.
4. 항목마다: 구현(또는 위임) → [testing.md](testing.md)의 `done` 명령을 오케스트레이터가 실행 → `[x]`. 실패하면 `막힘:`과 로그 경로를 남기고 멈춘다.
5. PLAN의 「하지 않을 것」을 지킨다. 커밋하지 않는다.

## Phase 4 — Review

1. [testing.md](testing.md)를 읽고 저장소의 단위 테스트·린트를 실행한다. 없으면 REVIEW에 「없음」을 적는다.
2. TASKS의 완료 조건과 diff를 대조한다. 빠진 테스트·문서를 적는다.
3. 로직 파일이 바뀌었으면 이번 파일만 mutation (`npx stryker run --mutate <파일>`). 생존한 인증·계약 돌연변이는 결함이다. 설정이 없으면 설치하지 않는다.
4. `REVIEW-<slug>.md`를 쓴다. Pi면 `g-reviewer`에게 맡겨도 된다. 실패한 테스트나 break 미만 mutation을 통과로 쓰지 않는다.
5. 제품 기능이 끝났고 검사가 통과하면 `docs/README.md` 표대로 문서를 갱신한다.

## Phase 5 — Commit

1. `/g-commit` 또는 「커밋해」가 있을 때만 한다. 서브에이전트에 넘기지 않는다.
2. `git status` / `git diff` / `git log`를 본 뒤, 비밀 파일은 제외하고 커밋한다. PLAN/TASKS/REVIEW는 기본적으로 커밋하지 않는다.
3. 산출물 복사본을 하네스 증거 디렉터리에 둔다. 원본은 워크트리에 남긴다.
4. 푸시하지 않는다. 커밋 해시와 남은 일을 보고한다.

## Status

활성 `PLAN-*.md`/`TASKS-*.md`를 현재 루트와 형제 워크트리에서 찾는다. 체크 비율, `worker`, 하네스 `runs/<slug>/` 로그, 막힘, 다음에 칠 커맨드를 짧게 보고한다.
