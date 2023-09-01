# Robin Hood

Robin Hood is a platformer video game. It is my entry to the JS13KGAME game jam 2023, with the topic 13th Century.

### August 31st, 2023

In the last days I was working on a couple of refactors:

First, I consolidated the sprites in a single sprite sheet. This way I will end up only with two images: one for the tile map and one for the rest of the images.

To do this, I created one SpriteSheet object, and defined animations for each type of entity that will be present on the screen: guards, coins, characters, etc.

This helped me reduce the size of the final ZIP file like this:

11465 bytes ➡️ 9609 bytes

The second refactor was to replace the "guards" array with a "people" array (including the functions that manipulate this array).

This way I ended up with a set of functions that control all the characters, the guards (enemies) and the rich people. The same code enables all the characters to navigate the scene.

Right now I am at 9731 bytes.

![](./gifs/2023-08-31-01.gif)

I can do this!

### August 28th, 2023

It's all about the shrinking!

Not the best weekend: I lost too much time trying to use webpack or vite to bundle the code in a way that I was able to compress the deliverable to a reasonable size: in this case, because of the amount of code I had, no more than 7kb.

I had a problem with the images with the minified version of the code: the images were not loading. I think the problem was in the way I was configuring the project webpack and vite.

Unfortunately, I was not able to solve the issue, and I needed to keep writing the game. So I migrated from TypeScript to just JavaScript.

Not ideal, but once I migrated, I was able to restart coding, now knowing that my project will be able to fit within the 13kb this game jam is all about.

I also started implementing the enemies.

I only have just over 2 weeks, though, and I still have a lot to do!

It's been fun!

![](./gifs/2023-08-28-01.gif)

### August 24th, 2023

Today I finished the implementation of the player's movement and its animations.

Kontra.js has a pretty neat and easy to use system to setup a sprite sheet and create animations for every state you need for your character!

The movement with the animations took me a bit more than a couple of days, because I also had to draw the sprites, but I am really happy with the result!

I feel I will be able to implement the game play pretty fast after this.

![](./gifs/2023-08-24-01.gif)

### August 21st, 2023

8 days have past, and I just have the bare bones of my game! I was moving, so I didn't have much time to work.

At least, I have the idea and a project to build from: it will be a platformer where you are Robin Hood, taking money from the rich to give it to the poor, while you fight the guards!

![](./gifs/2023-08-21-01.gif)
