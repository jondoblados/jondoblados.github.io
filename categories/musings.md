<h2>Posts in Musings</h2>
<ul>
  {% for post in site.categories.musings %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %B" }} <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
