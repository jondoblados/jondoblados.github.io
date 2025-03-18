---
layout: categories
title: "Posts in Musings"
---
Found {{ site.categories.musings | size }} posts.
<ul>
  {% for post in site.categories.musings %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %b" }} - <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
