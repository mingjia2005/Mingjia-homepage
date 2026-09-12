---
layout: page
title: projects
permalink: /projects/
description: Research projects in embodied AI, robotics, and intelligent systems.
nav: true
nav_order: 3
display_categories: [research]
horizontal: true
---

<div class="projects">
{% assign sorted_projects = site.projects | sort: "importance" %}
<div class="container">
  <div class="row row-cols-1 row-cols-md-2">
  {% for project in sorted_projects %}
    {% include projects_horizontal.liquid %}
  {% endfor %}
  </div>
</div>
</div>
