{% for post in site.posts limit:1 %}
  <h2>{{ post.title }}</h2>
  <span>{{ post.date | date: "%-d %B %Y" }}</span>
  {{ post.content }}
{% endfor %}

<h2>More musings ...</h2>
<ul>
  {% for post in site.posts offset:1 limit:5 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }} ({{ post.date | date: "%-d %B %Y" }})</a>
    </li>
  {% endfor %}
</ul>