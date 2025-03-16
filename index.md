{% for post in site.posts limit:1 %}
  <h1>{{ post.title }}</h1>
  <span><strong>{{ post.date | date: "%-d %B %Y" }}</strong></span>
  {{ post.content | markdownify | strip_html | truncatewords: 50 }} [ <a href="{{ post.url }}">read more ...</a> ]
{% endfor %}

<h2>Recent Posts Per Category</h2>
<ul>
{% for category in site.categories %}
  <li><a name="{{ category | first }}">{{ category | first }}</a>
    <ul>
    {% for post in category.last limit:3 %}
      <li>
        <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%-d %B %Y" }})
      </li>
    {% endfor %}
    </ul>
  </li>
{% endfor %}
</ul>