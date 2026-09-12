---
layout: page
title: Multi-Robot Dynamic Coverage
description: Distributed planning for workload adaptation in dynamic environments.
importance: 2
category: research
---

## Overview

This project studies multi-robot coverage when targets are sparse, clustered, and dynamically changing.
The goal is to reduce idle motion and adapt the team's workload as the spatial distribution evolves.

## Method

The system combines distributed dynamic Bernoulli Thompson Sampling, Beta-distribution belief updates,
distributed PHD estimation, and a Lloyd–Voronoi coverage framework.
Neighbor-to-neighbor communication supports decentralized coordination without a global controller.
