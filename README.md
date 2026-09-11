# g-workflow

Pi 기반 5단계 코딩 워크플로 패키지.  
`/g-plan` → `/g-task` → `/g-execute` → `/g-review` → `/g-commit`

---

## 목차

1. [설치](#1-설치)
2. [settings.json 병합](#2-settingsjson-병합)
3. [로그인](#3-로그인)
4. [이전 에이전트 파일 삭제](#4-이전-에이전트-파일-삭제)
5. [Pi 재시작](#5-pi-재시작)
6. [사용법](#6-사용법)
7. [단계별 모델 바꾸는 법](#7-단계별-모델-바꾸는-법)
8. [하지 말 것](#8-하지-말-것)
9. [선택 사항](#9-선택-사항)

---

## 1. 설치

```bash
pi install git:github.com/donggrri/pi-subagents
pi install git:github.com/donggrri/pi-antigravity-bridge
pi install npm:@rahularya01/pi-cursor
pi install git:<이-저장소-URL>
```

> **`<이-저장소-URL>`** 자리에 이 저장소의 실제 주소를 넣는다.  
> 예: `git:github.com/donggrri/g-workflow`

---

## 2. settings.json 병합

`settings.example.json`을 복사해서 `~/.pi/agent/settings.json`에 병합한다.

```bash
# settings.json이 없으면 그대로 복사
cp settings.example.json ~/.pi/agent/settings.json

# 이미 있으면 두 파일을 직접 열어 agentOverrides 블록을 병합한다
# (jq가 있으면)
jq -s '.[0] * .[1]' ~/.pi/agent/settings.json settings.example.json > /tmp/merged.json
mv /tmp/merged.json ~/.pi/agent/settings.json
```

`YOUR_*` placeholder를 실제 모델 ID로 바꾼다. 예:

```json
"g-planner": {
  "model": "xai/grok-4.6",
  "fallbackModels": ["antigravity/claude-sonnet-4-6"]
}
```

사용 가능한 에이전트 키:  
`g-planner`, `g-tasker`, `g-worker`, `g-reviewer`, `scout`, `oracle`, `researcher`, `reviewer`, `delegate`, `worker`

단계별 키 설명은 `/g-models`를 실행하면 Pi가 안내해 준다.

---

## 3. 로그인

```bash
/login xai
/login cursor
agy          # 최초 한 번 대화형 인증 (이후 불필요)
```

---

## 4. 이전 에이전트 파일 삭제

이전에 직접 만들었던 `~/.pi/agent/agents/g-*.md`가 있으면 지워야 한다.  
남겨 두면 이 패키지가 등록한 에이전트가 가려진다.

```bash
rm ~/.pi/agent/agents/g-planner.md
rm ~/.pi/agent/agents/g-tasker.md
rm ~/.pi/agent/agents/g-worker.md
rm ~/.pi/agent/agents/g-reviewer.md
# 또는 한 번에
rm ~/.pi/agent/agents/g-*.md
```

> **주의**: 삭제하기 전에 내용을 이 저장소의 파일과 비교해서 차이가 있으면 먼저 병합한다.

---

## 5. Pi 재시작

```bash
# Pi CLI를 쓰는 경우
pi restart

# 또는 Pi 앱을 재시작한다
```

재시작 후 `/g-plan` 커맨드가 뜨면 설치 완료.

---

## 6. 사용법

| 커맨드 | 역할 | 산출물 |
|---|---|---|
| `/g-plan` | Phase 1: 계획 | `PLAN-<slug>.md` |
| `/g-task` | Phase 2: 작업 분할 | `TASKS-<slug>.md` |
| `/g-execute` | Phase 3: 구현 위임 | 코드 변경 + 체크된 TASKS |
| `/g-delegate` | Phase 3: 특정 워커에 위임 | 같음 |
| `/g-review` | Phase 4: 리뷰 | `REVIEW-<slug>.md` |
| `/g-commit` | Phase 5: 커밋 (푸시 없음) | git commit |
| `/g-status` | 진행 상황 보고 | 텍스트 요약 |
| `/g-models` | 모델 설정 안내 | 텍스트 안내 |

한 메시지에 여러 커맨드를 붙여도 된다:

```
/g-plan /g-task /g-execute
```

계획에 막힌 질문(보안·범위·데이터 손실)이 있으면 거기서 멈춘다.

---

## 7. 단계별 모델 바꾸는 법

1. `~/.pi/agent/settings.json`을 열고 `subagents.agentOverrides` 안의 해당 에이전트 키를 찾는다.
2. `model`과 `fallbackModels`를 원하는 값으로 바꾼다.
3. Pi를 재시작하거나 새 대화를 열면 적용된다.

```json
{
  "subagents": {
    "agentOverrides": {
      "g-worker": {
        "model": "xai/grok-4.6",
        "fallbackModels": ["antigravity/claude-sonnet-4-6", "cursor/composer-2.5"]
      }
    }
  }
}
```

**에이전트 `.md` 파일을 직접 고치지 말 것.** frontmatter에 `model` 키를 넣으면 settings override가 무시된다.  
자세한 안내는 `/g-models`.

---

## 8. 하지 말 것

- **푸시 금지**: `git push`는 직접 원할 때만. 에이전트는 푸시하지 않는다.
- **비밀 금지**: 토큰·API 키·`.env`를 커밋하거나 워커 브리프에 넣지 않는다.
- **Cursor IDE 슬래시 불필요**: 이 패키지는 Pi용이다. Cursor에서 슬래시 커맨드를 별도로 설정할 필요 없다.
- **에이전트 파일 직접 편집 금지**: `agents/*.md`와 `prompts/*.md`를 직접 고치면 패키지 업데이트 시 덮어써진다. 모델은 settings.json에서만 바꾼다.

---

## 9. 선택 사항

TypeScript 타입 지원이 필요하면:

```bash
npx skills add mattpocock/skills
```

없어도 g-workflow는 정상 동작한다.
