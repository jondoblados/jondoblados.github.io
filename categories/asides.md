---
layout: categories
title: "Posts in Asides"
---
Found {{ site.categories.asides | size }} posts.
<ul>
  {% for post in site.categories.asides %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %b" }} - <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
