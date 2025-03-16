<h2>Posts in Milestones</h2>
<ul>
  {% for post in site.categories.milestones %}
    {% if post.url %}
      <li>{{ post.date | date: "%Y %B" }} <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
