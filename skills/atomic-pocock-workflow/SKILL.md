---
name: atomic-pocock-workflow
description: >-
  Runs g-workflow phases (explore, plan, task, execute, review, commit, status, config).
  Use when the user invokes /g-explore, /g-plan, /g-task, /g-execute, /g-delegate,
  /g-review, /g-commit, /g-status, /g-config, /g-settings, or mentions g-workflow or atomic-pocock-workflow.
---

# Atomic Workflow (g-workflow)

Pi 패키지 스킬이다. 프롬프트·에이전트는 이 패키지가 등록한다. `~/.agents/skills/atomic-pocock-workflow`, `~/.pi/agent/prompts/g-*.md`, `~/.pi/agent/agents/g-*.md`를 남겨 두면 패키지가 가려지고 충돌 경고가 난다.

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

- 패키지 저장소: `skills/atomic-pocock-workflow/`, `prompts/`, `agents/`, `README.md`, `settings.example.json`
- 필요하면 `~/.pi/agent/settings.json`의 `packages`와 `subagents`

## 단계

| 단계 | 커맨드 | 산출물 | 다음 |
|---|---|---|---|
| 0 | `/g-explore` | `EXPLORE-<slug>.md` | 탐색 보고 후 `/g-plan` 안내 |
| 1 | `/g-plan` 또는 사용자가 쓴 PLAN | `PLAN-<slug>.md` | 막힌 질문 없으면 **자동** Phase 2 |
| 2 | (자동) `g-tasker` | `TASKS-<slug>.md` | **자동** Phase 3 |
| 3 | (자동) `g-worker` | 코드 + 체크된 TASKS | **자동** Phase 4 |
| 4 | (자동) `g-reviewer` | `REVIEW-<slug>.md` + 테스트 | 보고. 커밋은 수동 |
| 5 | `/g-commit` | 커밋 (푸시 없음) | 사용자가 원할 때만 PR |
| — | `/g-status` | 진행 보고 | 이어서 할 커맨드 |
| — | `/g-config` (`/g-settings`) | 설정 조회 및 대화형 변경 | 설정 확인 및 저장 |

슬러그: 의도에서 만든 짧은 ASCII kebab-case (`space-notes`, `mcp-http`).

## 기본 파이프라인 (Plan 이후 자동)

사람 게이트는 **PLAN뿐**이다. 모델은 스킬이 아니라 서브에이전트에 붙는다. 그래서 단계마다 자식을 띄우고, 그 자식이 스킬을 읽게 한다.

PLAN이 있고 막힌 질문(보안·범위·데이터 손실)이 없으면 부모는 멈추지 않는다.

1. `g-tasker`를 `async: true`로 띄운다.
2. TASKS의 의존 순서대로 `g-worker`를 `async: true`로 띄운다. `parallel: yes`이고 파일이 안 겹치면 같이 띄워도 된다. 워크트리당 쓰기 워커는 하나.
3. 항목마다 **이 세션이** `done` 명령을 다시 실행하고 통과할 때만 `[x]`.
4. 열린 항목이 없으면 `g-reviewer`를 `async: true`로 띄운다.
5. 결과를 한국어로 보고한다. 커밋하지 않는다.

멈추는 경우:

- PLAN에 막힌 질문이 있다
- 사용자가 「계획만」/「태스크만」/「구현만」이라고 했다
- 항목 `done`이 실패했다
- `/g-commit` 또는 「커밋해」가 없다 → 커밋하지 않는다

사용자가 이미 `PLAN-<slug>.md`를 써 두었거나 메시지에 계획을 주면 Phase 1 자식을 건너뛴다. `/g-plan`에 의도만 있으면 `g-planner`가 PLAN을 쓴 뒤 위 루프로 들어간다.

자식을 띄울 때 task **첫 줄**에 강제 스킬 경로를 적는다. 부모의 `available_skills`에서 찾고, 없으면 「이 스킬 없음. atomic-pocock-workflow만으로 진행」이라고 적는다. 브리프에 비밀·토큰·`.env`를 넣지 않는다.

## 하네스

### Pi

오케스트레이터는 이 세션이다. 구현/계획/리뷰가 필요하면 `subagent` 툴로 아래 에이전트를 띄운다.

| 단계 | 에이전트 | 기본 |
|---|---|---|
| explore / recon | `g-explorer` / `scout` | 코드가 낯설거나 탐색/리서치 필요 시 |
| plan | `g-planner` | PLAN이 이미 있으면 건너뜀. 그 외는 항상 자식 |
| task | `g-tasker` | 항상 자식. `self`를 말한 경우만 직접 |
| execute | `g-worker` | 항상 자식. `self`를 말한 경우만 직접 |
| review | `g-reviewer` | 항상 자식 |
| commit/status/config | self | 서브에이전트 금지 |

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

## Phase 0 — Explore

1. 코드베이스 구조, 설정, 기존 `EXPLORE-*.md` / `PLAN-*.md`를 검토한다.
2. 코드가 낯설거나 아키텍처/외부 라이브러리 리서치가 필요할 때 `/g-explore`를 실행한다.
3. `subagent`로 `g-explorer`를 `async: true`로 띄워 [reference.md](reference.md) 템플릿으로 `EXPLORE-<slug>.md`를 작성한다 (제품 기능이면 워크스페이스 루트, 워크플로 자체면 `~/.pi/agent/g-workflow/`).
4. 핵심 대상 파일, 인터페이스/타입, 아키텍처 흐름, 리스크, 권장 방향을 정리한다.
5. 탐색 완료 후 `/g-plan`으로 이어지도록 안내한다. 코드를 직접 변경하거나 커밋하지 않는다.

## Phase 1 — Plan

1. 코드·문서·기존 `EXPLORE-*.md`/`PLAN-*.md`/`TASKS-*.md`를 읽는다. `EXPLORE-<slug>.md`가 있으면 탐색 결과를 계획에 즉시 반영한다.
2. 필요하면 웹 검색. 코드가 낯설고 탐색 보고서가 없으면 Pi에서 `g-explorer` 또는 `scout`를 먼저 띄워도 된다.
3. 워크트리 규칙에 따라 격리 여부를 정한다.
4. [reference.md](reference.md) 템플릿으로 PLAN 위치 규칙에 따라 `PLAN-<slug>.md`를 쓴다: 제품 기능이면 워크트리(또는 현재 루트), 워크플로 자체면 `~/.pi/agent/g-workflow/`. 사용자가 이미 계획을 줬으면 이 세션이 저장만 한다. 아니면 `g-planner`에게 맡긴다. 그릴링으로 사용자를 붙잡지 않는다.
5. 한 줄 목표, 하지 않을 것, 의존 순서, 위험, 막힌 질문을 넣는다.
6. 막힌 질문이 있거나 사용자가 「계획만」이면 멈추고 계획을 보여 준다. 아니면 **기본 파이프라인**으로 Phase 2부터 자동 진행한다.

## 단계 스킬 (강제)

스킬에는 모델이 없다. 모델은 `settings.json`의 `subagents.agentOverrides.<에이전트>`에만 있다. 그래서 단계 에이전트를 유지하고, 그 에이전트가 스킬을 읽도록 강제한다.

자식 frontmatter: `inheritSkills: false` + 아래 `skills`. 없으면 atomic-pocock-workflow만으로 진행한다. `setup-matt-pocock-skills`는 레포 최초 1회이며 매 단계마다 돌리지 않는다. `implement`는 자동 파이프라인에 넣지 않는다.

| 단계 | 에이전트 | 강제 스킬 | 적용 방식 |
|---|---|---|---|
| explore | `g-explorer` | `atomic-pocock-workflow` | EXPLORE-<slug>.md만 쓴다. 코드베이스 탐색, 인터페이스 식별, 리서치 전담. 코드 수정 금지 |
| plan | `g-planner` | `atomic-pocock-workflow`, `codebase-design`, `way-finder`, `grill-me` | PLAN만 쓴다. 필요 시 `grill-me`로 모호함을 해소하고 `way-finder`로 대안을 검토. 용어/ADR이 필요하면 `domain-modeling` |
| task | `g-tasker` | `atomic-pocock-workflow`, `to-tickets` | 수직 슬라이스·의존만 가져온다. 산출물은 `TASKS-<slug>.md`. 트래커 발행·사용자 퀴즈 금지 |
| execute | `g-worker` | `atomic-pocock-workflow`, `tdd` | 로직은 red→green. 커밋 금지 |
| review | `g-reviewer` | `atomic-pocock-workflow`, `code-review` | Standards / Spec 두 축을 **이 에이전트가 직접**. Spec = PLAN+TASKS. 손자 금지. 산출물은 `REVIEW-<slug>.md` |

설치: `npx skills add mattpocock/skills`. 이 머신처럼 `~/.codex/skills`에 있으면 Pi `settings.json`의 `skills` 배열에 그 경로를 넣는다.

## 오케스트레이션

부모는 파이프라인만 돌린다. 단계 일은 해당 모델의 자식이 한다. Commit만 부모.

Pi 워커: `g-explorer` · `g-planner` · `g-tasker` · `g-worker` · `g-reviewer` · `scout` · `oracle` · `self`.
Cursor CLI 워커: `agy` · `codex` · `cursor` · `opencode` · `self`.

1. 사용자가 워커를 지목했거나 TASKS에 `worker:`가 있으면 [workers.md](workers.md)를 읽는다. 기본 구현 워커는 `g-worker`.
2. Pi면 `subagent`만 호출한다. Cursor CLI 경로면 `ensure-workers.ps1` / `invoke-worker.ps1`만 쓴다.
3. 브리프 첫 줄에 강제 스킬 경로. 비밀·토큰·`.env` 금지.
4. 워커가 끝나면 오케스트레이터가 `git diff`와 테스트를 직접 확인한다. 「완료」로그를 믿지 않는다.
5. 워크트리당 쓰기 워커는 하나. 워커는 커밋·푸시하지 않는다.
6. `agy`를 인자 없이 실행하지 않는다 (TUI 정지).

## Phase 2 — Task

1. 현재 루트의 `PLAN-<slug>.md`를 읽는다. 없으면 Phase 1부터.
2. `g-tasker`가 `TASKS-<slug>.md`를 만든다. 각 항목은 한 번에 검증 가능한 크기.
3. `id`, 체크박스, `files`, `depends`, `parallel`, `worker`, `done`을 적는다.
4. 같은 파일을 안 건드리는 독립 항목만 `parallel: yes`.
5. 제품 기능이면 [testing.md](testing.md)대로 테스트 항목을 넣는다. `done`에 실제 명령을 적는다.
6. Pi 구현 항목의 기본 `worker`는 `g-worker`. 문서 항목은 `self`.
7. 사용자가 「태스크만」이 아니면 **기본 파이프라인**으로 Phase 3으로 간다.

## Phase 3 — Execute

1. `TASKS-<slug>.md`가 없으면 Phase 2를 먼저 한다.
2. `worker`가 `self`이거나 사용자가 `self`를 말한 경우만 이 세션이 구현한다. 기본은 `g-worker`.
3. Pi에서 `g-worker` / 모델 별칭은 `subagent`로 위임한다. Cursor CLI면 invoke 스크립트만 쓴다.
4. 항목마다: 위임 → [testing.md](testing.md)의 `done` 명령을 오케스트레이터가 실행 → `[x]`. 실패하면 `막힘:`과 로그 경로를 남기고 멈춘다.
5. PLAN의 「하지 않을 것」을 지킨다. 커밋하지 않는다.
6. 열린 항목이 없고 「구현만」이 아니면 **기본 파이프라인**으로 Phase 4로 간다.

## Phase 4 — Review

1. [testing.md](testing.md)를 읽고 저장소의 단위 테스트·린트를 실행한다. 없으면 REVIEW에 「없음」을 적는다.
2. TASKS의 완료 조건과 diff를 대조한다. 빠진 테스트·문서를 적는다.
3. 로직 파일이 바뀌었으면 이번 파일만 mutation (`npx stryker run --mutate <파일>`). 생존한 인증·계약 돌연변이는 결함이다. 설정이 없으면 설치하지 않는다.
4. `g-reviewer`가 `REVIEW-<slug>.md`를 쓴다. 실패한 테스트나 break 미만 mutation을 통과로 쓰지 않는다.
5. 제품 기능이 끝났고 검사가 통과하면 `docs/README.md` 표대로 문서를 갱신한다.
6. 커밋하지 않는다. `/g-commit`을 안내한다.

## Phase 5 — Commit

1. `/g-commit` 또는 「커밋해」가 있을 때만 한다. 서브에이전트에 넘기지 않는다.
2. `git status` / `git diff` / `git log`를 본 뒤, 비밀 파일은 제외하고 커밋한다. PLAN/TASKS/REVIEW는 기본적으로 커밋하지 않는다.
3. 산출물 복사본을 하네스 증거 디렉터리에 둔다. 원본은 워크트리에 남긴다.
4. 푸시하지 않는다. 커밋 해시와 남은 일을 보고한다.

## Status

활성 `PLAN-*.md`/`TASKS-*.md`를 현재 루트와 형제 워크트리에서 찾는다. 체크 비율, `worker`, 하네스 `runs/<slug>/` 로그, 막힘, 다음에 칠 커맨드를 짧게 보고한다.
