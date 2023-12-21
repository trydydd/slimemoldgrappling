run hugo server locally to see live changes on the site in your browser at localhost:1313
```shell
hugo server
```

create a new game in an existing folder:
```shell
hugo new --kind game games/guard_games/closed_guard/wet_dog/_index.md
```

Create a new directory inside of games:
```shell
hugo new --kind chapter games/mount/_index.md
```

create a new top level section in the lefthand nav bar:
```shell
hugo new --kind chapter why/_index.md
```

When creating a new `_index.md` ensure to open the file and change the Weight value to an integer. Weight starts at 1 and determines the order that objects are displayed inside of their container (Top down. 1 is first, highest int is last.)