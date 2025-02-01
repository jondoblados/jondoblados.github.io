{% for post in site.posts limit:1 %}
  {{ post.content }}
{% endfor %}

<ul>
  {% for post in site.posts offset:1 limit:5 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>