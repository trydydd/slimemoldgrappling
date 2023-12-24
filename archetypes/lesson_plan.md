+++ 
archetype = "lesson_plan" 
title = "{{ replace .Name "_" " " | title }}"
weight = X
alwaysopen = false 
+++
**Attribution**: 

---
**Game 1**

{{% include_page_body "content/games/path_to_some_game/_index.md" %}}

---
**Game 2**

{{% include_page_body "content/games/path_to_some_game/_index.md" %}}

---
**Game 3**

{{% include_page_body "content/games/path_to_some_game/_index.md" %}}
