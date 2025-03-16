---
layout: categories
title: "Posts in Milestones"
---

<ul>
  {% for post in site.categories.milestones %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %b" }} <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
