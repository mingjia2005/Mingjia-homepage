---
layout: page
title: MDCPP
description: Prediction-driven multi-robot coverage planning for workload adaptation.
img: assets/img/projects/mdcpp-simulation.gif
importance: 2
category: research
---

## Overview

This project studies multi-robot coverage when target density and robot capability are unknown or changing.
It predicts future workload from partial observations and dynamically reallocates task regions.

## Method

The system uses an online Gaussian mixture model to estimate unobserved target distributions,
then combines the prediction with an improved Voronoi partition to balance future workload.
Compared with the baseline, the method reduced exploration time by 12.7% and travel distance by 15.2% in coverage experiments.
