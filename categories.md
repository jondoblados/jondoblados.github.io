<h2>Posts in Tech</h2>
<ul>
  {% for post in site.categories.Tech %}
    {% if post.url %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>