# Windrose V1.7
Windrose is a TTRPG system that involves rolling colored d6s.<br/>
The effort of this project is to develop windrose character sheets and API scripts to be used in [Roll20](https://roll20.net/welcome).<br/>
V1 to V2 will require re-implment tokens and setting up character sheets.
# Installation
This api requires Pro level subscribtion on roll20. The code provided are both an API scripts and a character sheet. These must be used together.
### API Installation
Navigate to the Game Details Page of the target game. Once there, Select API Scripts from Settings dropdown.
<p align="center">
  <img align="middle" src="https://roll20.zendesk.com/hc/article_attachments/360067045633/API_Test___Roll20__Online_virtual_tabletop__1_.png" width= "60%"/>
</p>
In this area two new scripts will be added by pressing the New Script link.
<p align="center">
  <img align="middle" src="https://roll20.zendesk.com/hc/article_attachments/360067047013/Roll20__Online_virtual_tabletop_for_pen_and_paper_RPGs_and_board_games.png" width="60%"/>
</p>

The first script that should be added is the WindroseCore.js. This is the core API for the scripting done for windrose system.<br/>
The name the script added does not matter and can be named anything.<br/>
Copy the entire text of the WindroseCore.js into this new script.<br/>
<br/>
The next script is WindroseChangeTokenImage.js an optional script that is an edited version of ChangeTokenImage.js.<br/>
This scripts allows the Token Image change automaticly based on selected swing.<br/>
Again, create a new script using the link and copy all the code over.<br/>
Once, installed the Image Set property must be checked in the character sheet. In addtion, a rollable table must be used as the token.<br/>
 <img align="middle" src="https://raw.githubusercontent.com/Ozarke/windrose/main/assets/github/config_imageset.png" width="50%"/>
 <img align="middle" src="https://raw.githubusercontent.com/Ozarke/windrose/main/assets/github/rolltable_example.png"/> <br/>
Roll tables should be ordered ["red","blue","yellow","green","purple","orange","black","grey","white"]. If you have red, blue and green images checked. Order the rolltable default, red, blue, green skipping yellow.
If a an image is unavailable just leave the image setting unchecked for that attribute.

### Character Sheet Installation
Navigate to the Game Details Page of the target game. Once there, Select Game Settings from Settings dropdown.<br/>
Scroll down to Character Sheet Template.<br/>
From the drop down select Custom.<br/>
In this area copy windrose.html to the HTML Layout section and windrose.css to the CSS Sytling section.

# Version
V1.00 intial version.<br/>
V1.01 added Roll to Do and Roll to Dye template.<br/>
V1.02 added white and grey dye, fixed colors for character sheets swing, added version attribute and new initializtion function.<br/>
V1.03 added Gifts Section, Improved Config Area, Increased width of character sheet.<br/>
V1.04 added tooltip for attribute level and attribute name. Updated colors for green, purple, and orange. <br/>
V1.05 improved set image for attributes. <br/>
V1.06 fixed issues with legacy code. Added bond section, Added simple rolls, Fixed minor issues with JS. <br/>
V1.07 added ignite, roll to recover, attribute image checkbox, health max and min, swingless rolls to do have 1d6, and made character sheet dye match sequence of chat.
