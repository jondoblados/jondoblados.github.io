{% if page.title %}
<h2><a href="{{ site.url }}">Home</a> / {{ page.title }}</h2>
{% endif %}
<h2>Posts in Tech</h2>
<ul>
  {% for post in site.categories.tech %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %B" }} <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
