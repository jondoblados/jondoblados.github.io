<h2>Posts in Tech</h2>
<ul>
  {% for post in site.categories.tech %}
    {% if post.url %}
      <li>{{ post.date | date: "%-d %B %Y" }} <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
