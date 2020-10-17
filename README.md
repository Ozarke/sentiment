# Windrose
Windrose is a beta TTRPG systems that involves rolling colored d6s.<br/>
The effort for this project is to develop windrose character sheets and API scripts to be used in Roll20.<br/>
Versions will be seperated by compatibilty. V1 to V2 will require re-implment tokens and setting up character sheets.
# Installation
This api requires Pro level subscribtion on roll20. The code provided are both an API script and a character sheet. These must be used together.
Fist figure out what version you would like ot use. V1.02 is the most recent.
### API Installation
Navigate to the Game Details Page of the target game. Once there, Select API Scripts from Settings dropdown.
<p align="center">
  <img align="middle" src="https://roll20.zendesk.com/hc/article_attachments/360067045633/API_Test___Roll20__Online_virtual_tabletop__1_.png" width= "40%"/>
</p>
In this area two new sctips will be added by pressing the New Script link.
<p align="center">
  <img align="middle" src="https://roll20.zendesk.com/hc/article_attachments/360067047013/Roll20__Online_virtual_tabletop_for_pen_and_paper_RPGs_and_board_games.png" width="40%"/>
</p>

The first script that should be added is the windrose_api.js. This is the core of the scripting done for windrose system.<br/>
The name the script added does not matter and can be named anything.<br/>
Copy the entire text of the windrose_api.js into this new script.<br/>
<br/>
The next scrip is WindroseChangeTokenImage.js an optional script that is an edited version of ChangeTokenImage.js.<br/>
This scripts allows the Token Image change automaticly based on selected swing.<br/>
Again, create a new script using the link and copy all the code over.

### Character Sheet Installation
Navigate to the Game Details Page of the target game. Once there, Select Game Settings from Settings dropdown.<br/>
Scroll down to Character Sheet Template.<br/>
From the drop down select Custom.<br/>
In this area copy sheet.html to the HTML Layout section and sheet.css to the CSS Sytling section.

# Verisions
V1.00 Intial Version.<br/>
V1.01 Added Roll to Do and Roll to Dye template.<br/>
V1.02 Added white and grey dye, fixed colors for character sheets swing, added version attribute and new initializtion function.<br/>
Note: V1.02 will "re-initialize" characters this will not change setting in the character. It will only add grey and white functionality.
