{% for post in site.posts limit:1 %}
  <h2>{{ post.title }}</h2>
  <span><strong>{{ post.date | date: "%-d %B %Y" }}</strong></span>
  {{ post.content }}
{% endfor %}

<h2>More musings ...</h2>
<ul>
  {% for post in site.posts offset:1 limit:5 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%-d %B %Y" }})
    </li>
  {% endfor %}
</ul>