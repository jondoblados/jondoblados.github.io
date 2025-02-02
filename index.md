{% for post in site.posts limit:1 %}
  <h2>{{ post.title }}</h2>
  <span><strong>{{ post.date | date: "%-d %B %Y" }}</strong></span>
  {{ post.content }}
{% endfor %}

<h2>Posts Listing</h2>
<ul>
  {% for post in site.posts offset:1 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%-d %B %Y" }})
    </li>
  {% endfor %}
</ul>

<hr />
<ul>
{% for category in site.categories %}
  <li><a name="{{ category | first }}">{{ category | first }}</a>
    <ul>
    {% for post in category.last %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
    </ul>
  </li>
{% endfor %}
</ul>