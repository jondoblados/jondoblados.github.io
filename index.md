{% for post in site.posts limit:3 %}
  <h2>{{ post.title }}</h2>
  <span><strong>{{ post.date | date: "%-d %B %Y" }}</strong></span>
  {{ post.content | markdownify | strip_html | truncatewords: 50 }}  | <a href="{{ post.url }}">read more ...</a>
{% endfor %}

<footer class="site-footer">
<h3>Recent Posts Per Category</h3>
<ul>
{% for category in site.categories %}
  <li><a href="{{ site.url }}/categories/{{ category | first }}.html" name="{{ category | first }}">{{ category | first | capitalize }}</a>
    <ul>
    {% for post in category.last limit:5 %}
      <li>
        <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date_to_string }})
      </li>
    {% endfor %}
    </ul>
  </li>
{% endfor %}
</ul>
</footer>