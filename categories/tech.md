---
layout: categories
title: "Posts in Tech"
---

<ul>
  {% for post in site.categories.tech %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %b" }} - <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
