# Slime Mold Grappling Club

The live site can be found at [https://slimemoldgrappling.com](https://slimemoldgrappling.com)

## Manually create a new game:
* copy the file `game_template.md` into the directory for the category of game that you would like to create in `content/games/`. 
* Rename the file to accurately describe your game. Use underscores '_' instead of spaces in the filename.
* Update the fields in the file:
  * title
  * tags (look at the other games in your category for an idea of what tags to use)
  * weight (count the current number of games in the category and add one to find your ewight)
  * the fields for describing the game

## See your changes live with Hugo
run hugo server locally to see live changes on the site in your browser at localhost:1313
```shell
hugo server
```

## Add new content using Hugo
create a new game in an existing folder using hugo:
```shell
hugo new --kind game games/guard_games/supine_guard/closed_guard/wet_dog/_index.md
```

Create a new directory inside of games using hugo:
```shell
hugo new --kind chapter games/mount/_index.md
```

create a new top level section in the lefthand nav bar using hugo:
```shell
hugo new --kind chapter why/_index.md
```

When creating a new game ensure to open the file and change the Weight value to an integer. Weight starts at 1 and determines the order that objects are displayed inside of their container (Top down. 1 is first, highest int is last.). The easiest thing to do is count the number of games in the category you would like to add to, add one to that, and set that as your weight.