---
layout: page
title: CAFE
description: Coming Soon · Closed-loop autonomous task formulation and execution without explicit task input.
img: assets/img/projects/cafe-framework.png
importance: 1
category: research
---

> **Status:** Project materials are coming soon. The manuscript is currently under review at IEEE TASE.

## Overview

CAFE enables an embodied agent to discover useful tasks from the environment instead of waiting for an explicit human instruction.
It maintains structured semantic memory for objects and functional areas, decides when planning should be triggered,
and uses a **Draft–Complete–Audit** planning pipeline to generate executable tasks.

## Closed-Loop Design

Execution results are written back into memory. When an action fails or the environment changes,
the agent can revise its understanding and replan rather than repeating an invalid plan.

## Evaluation

The framework was evaluated in 12 AI2-THOR scenes using task formulation, completion, success,
and goal-completion metrics. It improved the success rate in complex physical scenes from 73.8% to 89.6%.
Real-robot demonstrations were also conducted on a LimoCobot platform.
