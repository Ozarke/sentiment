/* global _ */

on('chat:message',function(msg){
    'use strict';

    if('api' !== msg.type) {
        return;
    }
    var args = msg.content.split(/\s+/);
    
    if('!wind' === args[0])
    {
        var character = getObj("character", args[2]);
        if (typeof(character) === "undefined"){
            sendChat("Error", "Character ID passed incorrectly. Please use  &#64;&#123;selected&#124;character_id&#125; or  &#64;&#123;target&#124;character_id&#125;");
            return;
        }
        var code_version = 'V1.07';
        var character_version = getAttrByName(character.id,"version","current");
        if(typeof(character_version) === "undefined")
        {
            init(character);
            createObj("attribute", {
            name: "version",
            current: code_version,
            characterid: character.id
            });
        }
        else if(character_version !== code_version)
        {
            init(character);
            var versionObj = findObjs({
                name: "version",
                _type: "attribute",
                _characterid: character.id
                })[0];
            versionObj.set("current",code_version);
        }
             

        
        switch(args[1]){
            case 'roll-to-dye':
                roll_to_dye(character,args[3],args[4]); // d6s and bonus
                break;
            case 'roll-to-do':
                roll_to_do(character,args[3],args[4],args[5]); // color command, d6, and bonus
                break;
            case 'set-swing':
                set_swing(character,args[3],args[4],args[5]); // color, value, and recalc dye score
                break;
            case 'drop-swing':
                drop_swing(character);
                break;
            case 'ignite':
                ignite(character);
                break;
            case 'recover':
                recover(character);
                break;
            case 'prompt-attribute-change':
                prompt_attribute_change(character,args[3]); // attribute change type
                break; 
            case 'set-attribute-state':
                set_attribute_state(character,args[3],args[4],args[5]); // color, damage type and boolean
                break;
            case 'set-attribute-level':
                set_attribute_level(character,args[3],args[4]); // color and level
                break;
            case 'toggle-whisper':
                toggle_whisper(character);
                break; 
        }
    }
});


function capitalize(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function roll_to_dye(obj,d6,bonus) {
    var colors = ["red","blue","yellow","green","purple","orange","black","grey","white"];
    var swing_color = getAttrByName(obj.id,"swing_color","Current");
    var background_color = '';    
    var header_url = '';
    header_url = 'https://raw.githubusercontent.com/Ozarke/windrose/main/assets/Roll-to-dye.jpg';
    if(swing_color !== "" && getAttrByName(obj.id,swing_color + "_hidden") === 'false')
    {
            background_color = swing_color;
            header_url = 'https://raw.githubusercontent.com/Ozarke/windrose/main/assets/Roll-to-dye-clear.png';
    }            
    var outstr = '&{template:roll}{{color='+ background_color + '}}{{title=[Dye](' + header_url + ')}} ';
    var roll_val = 0;
    var roll_level = 0;
    var total_val = 0;
    var attribute = 0;
    
    if(isNaN(parseInt(d6)))
    {
            outstr = 'Passed a non-number for d6s';
            sendCustomChat(obj, outstr,true);
            return;
    }
    if(isNaN(parseInt(bonus)))
    {
            outstr = 'Passed a non-number for bonus';
            sendCustomChat(obj, outstr,true);
            return;
    }
    var colorstr = '';
    var color_name = '';
    var questionmarks = '';
    var swing_color = getAttrByName(obj.id,"swing_color","Current");
    for(i=0; i<colors.length; i++)
    {
        if(getAttrByName(obj.id, colors[i]+'_enabled','Current') === 'true'){
            if(getAttrByName(obj.id, colors[i]+'_hidden') === 'true' && getAttrByName(obj.id, 'whisper','Current') === 'false')
            {
                questionmarks += 'H';
                colorstr = questionmarks;
            }
            else
                colorstr = colors[i];
            outstr +='{{' + colorstr;
            attribute = findObjs({
                name: colors[i] + '_value',
                _type: 'attribute',
                _characterid: obj.id
            }, {caseInsensitive: true})[0];

            if(getAttrByName(obj.id,colors[i] + '_wounded','Current') === 'true'){
                    outstr += '= [W](!wind set-swing ' + obj.id +' ' + colors[i] + ' '+ roll_val+ ' true)}}';  
                    attribute.set('current','W');
            }else{ 
                if(getAttrByName(obj.id,colors[i] + '_lockedout','Current') === 'true'){              
                        outstr += '= [L](!wind set-attribute-state ' + obj.id + ' ' + colors[i] + ' ' +'_lockedout'+ ' ' +'false)}}';
                        attribute.set('current','L');
                }else{
                    roll_level = 0;
                    roll_level = parseInt(getAttrByName(obj.id, colors[i]+'_level','Current'));
                    if(colors[i] === swing_color)
                    {
                            roll_val = parseInt(getAttrByName(obj.id,"swing_value","Current"));
                            total_val += roll_level;                                                        
                    }
                    else
                        roll_val = randomInteger(6);

                    total_val += roll_val; 
                    attribute.set('current',roll_val);
                    if(getAttrByName(obj.id, colors[i]+'_hidden') === 'true' && getAttrByName(obj.id, 'whisper','Current') === 'false')
                    {
                        outstr += '= [H](!wind hidden '+obj.id+')}}';
                        if(colors[i] === swing_color)
                            outstr += '{{swing=+ [H](!wind hidden '+obj.id+') **Attribute Level**}}';
                    }
                    else
                    {
                        if(roll_val !== 6 && roll_val !== 1)
                            outstr += '= [' + roll_val + ']';
                        else if (roll_val === 6)
                                outstr += '= [<div style="color:#247305">' + roll_val + '</div>]';
                             else
                                outstr += '= [<div style="color:#730505">' + roll_val + '</div>]';
                        outstr+= '(!wind set-swing ' + obj.id +' ' + colors[i] + ' '+ roll_val+ ' true)}}';
                        if((colors[i] === swing_color) && (roll_level !==0))
                            outstr += '{{swing=+ [['+ roll_level +']] **Attribute Level**}}';
                        outstr += '{{'+colors[i]+'_level='+roll_level+'}}';
                        color_name = getAttrByName(obj.id, colors[i]+'_name');
                        if(color_name !== '' && color_name !== 'Attribute Name')
                            outstr += '{{'+colors[i]+'_name='+color_name+'}}';                 
                    }                       
                }
            }
        }
    }
    
    if(parseInt(d6) !== 0)
    {
        outstr += '{{d6s= ';
        if(d6 > 0)
        {
            for(i = 0; i<parseInt(d6);i++)
            {
                roll_val = randomInteger(6);

                outstr += '+ [[' + roll_val + ']] ';
                total_val += roll_val;
            }
        }
        else
        {
            for(i = 0; i<-parseInt(d6);i++)
            {
                roll_val = randomInteger(6);

                outstr += '+ [[-' + roll_val + ']] ';
                total_val -= roll_val;
            } 
        }
        outstr += '}}';
    }
    
    if (typeof(bonus) !== 'undefined' && parseInt(bonus) !== 0)
    {
        outstr += '{{bonus=+ [['+parseInt(bonus)+']] ** Bonus **}}';
        total_val += parseInt(bonus);
    }

    outstr += '{{total= [['+ total_val + ']]}}';
    
    var dye_val = findObjs({
        name: 'dye_value',
        _type: 'attribute',
        _characterid: obj.id
    }, {caseInsensitive: true})[0];
    
    dye_val.set('current',total_val);
    
    sendCustomChat(obj, outstr);
}

function roll_to_do(obj,selection,d6,bonus) {
    var swing_color = '';
    var background_color = '';  
    var crit_fail = false;
    var crit_succ = false;
    swing_color = getAttrByName(obj.id,"swing_color","Current");
    if(selection === "swing")
    {        
        if((swing_color !== "" && getAttrByName(obj.id,swing_color + "_hidden") === 'false') || getAttrByName(obj.id, 'whisper','Current') === 'true')
            background_color = swing_color;
    }
    var outstr = '&{template:roll}{{color='+ background_color + '}}{{title=[Do](https://raw.githubusercontent.com/Ozarke/windrose/main/assets/Roll-to-do-clear.png)}} ';
    var roll_val = 0;
    var total_val = 0;
    var i;
    
    if(isNaN(parseInt(d6)))
    {
            outstr = 'Passed a non-number for d6s';
            sendCustomChat(obj, outstr,true);
            return;
    }
    if(isNaN(parseInt(bonus)))
    {
            outstr = 'Passed a non-number for bonus';
            sendCustomChat(obj, outstr,true);
            return;
    }
    
    roll_val = randomInteger(20);
    if (roll_val === 20)
        crit_succ = true;
    if (roll_val === 1)
        crit_fail = true;
    
    total_val += roll_val;
    outstr += '{{d20=';
    if(roll_val !== 20 && roll_val !== 1)
        outstr += + roll_val;
        else if (roll_val === 20)
                outstr += '<div style="color:#247305">' + roll_val + '</div>';
            else
                outstr += '<div style="color:#730505">' + roll_val + '</div>';    
    outstr += '}}';
    var swing_value = parseInt(getAttrByName(obj.id,'swing_value',"Current"));
    switch (selection){
        case 'swing':
            if(swing_color !== '')
            {
                var swing_level = parseInt(getAttrByName(obj.id,swing_color + '_level',"Current"));
                total_val += swing_value + swing_level;
                if(getAttrByName(obj.id, swing_color +'_hidden') !== 'true' || getAttrByName(obj.id, 'whisper','Current') === 'true')
                {
                    outstr += '{{' + swing_color+ '= ['+swing_value+'](!wind ignite '+obj.id+')}}';
                    if(swing_level !== 0)
                    {
                        outstr += '{{swing=+ [['+ swing_level +']] **Attribute Level**}}';
                    }
                }
                else
                {
                    outstr += '{{H= [H](!wind ignite '+obj.id+')}}';
                    outstr += '{{swing=+ [H](!wind ignite '+obj.id+') **Attribute Level**}}';                    
                }
            break;
            }
            //if no swing use none.
        case 'none':
            if(swing_color !== '')
                drop_swing(obj);
            var roll_val = randomInteger(6);
            total_val += roll_val;
            
            outstr += '{{swing= No Swing}}';
            outstr += '{{'+ 'grey' +'= ';
                if(roll_val !== 6 && roll_val !== 1)
                    outstr += '[' + roll_val + ']';
                else if (roll_val === 6)
                        outstr += '[<div style="color:#247305">' + roll_val + '</div>]';
                    else
                         outstr += '[<div style="color:#730505">' + roll_val + '</div>]';
            outstr += '(!wind dye '+obj.id+')}}';            
            break;
            
        default:
            var roll_val = randomInteger(6);
            if(swing_color !== '')
                drop_swing(obj);
            if(getAttrByName(obj.id,selection + '_wounded','Current') === 'false' &&  getAttrByName(obj.id,selection + '_lockedout','Current') === 'false' && getAttrByName(obj.id,selection + '_enabled','Current') === 'true')
            {
                var color_level = parseInt(getAttrByName(obj.id,selection + '_level',"Current"));
                total_val += roll_val + color_level;
                if(getAttrByName(obj.id,selection + '_hidden') === 'false' || getAttrByName(obj.id, 'whisper','Current' === 'true'))
                    {
                    outstr += '{{'+ selection +'= ';
                    if(roll_val !== 6 && roll_val !== 1)
                            outstr += '[' + roll_val + ']';
                        else if (roll_val === 6)
                                outstr += '[<div style="color:#247305">' + roll_val + '</div>]';
                             else
                                outstr += '[<div style="color:#730505">' + roll_val + '</div>]';
                    outstr += '(!wind dye '+obj.id+')}}';
                    if(color_level !== 0)
                        {
                        outstr += '{{swing=+ [['+ color_level +']] **Attribute Level**}}';
                        }
                    }
                else
                {
                    outstr += '{{H= [H](!wind hidden '+obj.id+')}}';
                    outstr += '{{swing=+ [H](!wind hidden '+obj.id+') **Attribute Level**}}';
                }
            }
            else
            {
                sendCustomChat(obj, 'attribute is either wounded,lockedout or not enabled, please select a diffrent attribute',true);
                return;
            }
            break;
    }

    if(parseInt(d6) !== 0)
    {
        outstr += '{{d6s= ';
        if(d6 > 0)
        {
            for(i = 0; i<parseInt(d6);i++)
            {
                roll_val = randomInteger(6);

                outstr += '+ [[' + roll_val + ']] ';
                total_val += roll_val;
            }
        }
        else
        {
            for(i = 0; i<-parseInt(d6);i++)
            {
                roll_val = randomInteger(6);

                outstr += '+ [[-' + roll_val + ']] ';
                total_val -= roll_val;
            } 
        }
        outstr += '}}';
    }
    if(parseInt(bonus) !== 0)
    {
        total_val += parseInt(bonus);
        outstr += '{{bonus=+ [['+parseInt(bonus)+']] ** Bonus **}}';
    }
    
    outstr += '{{total= [[' + total_val + ']]}}';
    //if(crit_fail)
    //    outstr += '{{desc=[fail](https://en.bloggif.com/tmp/23c06fc335c4ec7d17a2384e658cca5e/text.gif)}}';
    //if(crit_succ)
    //    outstr += '{{desc=[succ](https://en.bloggif.com/tmp/23c06fc335c4ec7d17a2384e658cca5e/text.gif)}}';
    sendCustomChat(obj, outstr);
}

function prompt_attribute_change(obj,status) {
    var colors = ["red","yellow","blue","green","orange","purple","black","white","grey"];
    var outstr = '&{template:custom}{{color='+ getAttrByName(obj.id,"swing_color","Current") + '}} {{title=Change Attribute '+ capitalize(status)  + ' Status}} ';
    
    for(i=0; i<colors.length; i++)
    {   
        switch(status)
        {
            case 'enable':
                outstr += '{{' + colors[i] + '=';
                if(getAttrByName(obj.id,colors[i] + '_enabled') === 'true'){
                    outstr += ' [Disable](!wind set-attribute-state ' + obj.id +' '+ colors[i]+' '+'_enabled'+' '+'false)}}';  
                }else{
                    outstr += ' [Enable](!wind set-attribute-state '  + obj.id +' '+ colors[i]+' '+'_enabled'+' '+'true)}}';
                }
                break;
            case 'lock':                
                if(getAttrByName(obj.id, colors[i]+'_enabled') === 'true'){
                    outstr += '{{' + colors[i] + '=';
                    if(getAttrByName(obj.id,colors[i] + '_lockedout','Current') === 'true'){              
                        outstr += ' [Unlock](!wind set-attribute-state ' + obj.id + ' ' + colors[i] + ' ' +'_lockedout'+ ' ' +'false)}}';  
                    }else{
                        outstr += ' [Lock](!wind set-attribute-state '   + obj.id + ' ' + colors[i] + ' ' +'_lockedout' + ' ' +'true)}}';
                    }                
                }
                break;
            case 'wound':
                if(getAttrByName(obj.id, colors[i]+'_enabled') === 'true'){
                    outstr += '{{' + colors[i] + '=';
                    if(getAttrByName(obj.id,colors[i] + '_wounded','Current') === 'true'){
                        outstr += ' [Heal](!wind set-attribute-state '  + obj.id + ' '+ colors[i] +' '+'_wounded'+' '+'false)}} ';  
                    }else{
                        outstr += ' [Wound](!wind set-attribute-state ' + obj.id + ' '+ colors[i] +' '+'_wounded'+' '+'true)}} ';
                    }
                }
                break;
        }
    }
    sendCustomChat(obj, outstr, true);
}

function set_attribute_state(obj,color,type,value) {
    var outstr = '';
    var attribute = findObjs({
        name: color+type,
        _type: 'attribute',
        _characterid: obj.id
        }, {caseInsensitive: true})[0];
        
    if (typeof(attribute) === "undefined"){
        sendChat("Error", "Attribute Entered In-Correctly. Try: red _wounded");
        return;
    }
    
    attribute.set('current',value);
    
    var action = '';
    switch(type)
    {
        case '_wounded':
            if(value === 'true')
            {
                action = 'wounded';
                drop_swing(obj);
            }
            else
                action = 'healed';
            break;
        case '_lockedout':
            if(value === 'true')
            {
                action = 'locked';
                if(getAttrByName(obj.id,'swing_color','Current') === color)
                    drop_swing(obj);
            }
            else
                action = 'unlocked';
            break;
    
        case '_enabled':
            if(value === 'false')
            {
                action = 'disabled';
                if(getAttrByName(obj.id,'swing_color','Current') === color)
                    drop_swing(obj);
            }
            else
                action = 'enabled';
            break;
    }
    outstr += 'has '+action+' ';
    if(getAttrByName(obj.id,color+'_hidden') === 'false')
            outstr += color;
        else
            outstr += '???';
    sendCustomChat(obj, outstr,'/em ');
}

function set_attribute_level(obj,color,value)
{
    var outstr = '';
    var attribute = findObjs({
        name: color+'_level',
        _type: 'attribute',
        _characterid: obj.id
    }, {caseInsensitive: true})[0];
    
    if (typeof(attribute) === "undefined"){
        sendChat("Error", "Attribute Entered In-Correctly. Try: red _wounded");
        return;
    }
    
    attribute.set("current",value);
    outstr += 'has set ';
    if(getAttrByName(obj.id,color+'_hidden') === 'false')
        outstr += color;
    else
    {
        outstr += '???';       
        value = '???';
    }
    outstr += ' to level ' + value;
    sendCustomChat(obj, outstr,'/em ');    
}

function set_swing(obj,color,value,recalc_dye) {
    var outstr = '';
    var swing_value = 0;
    var old_swing ='';
    var dye_value = 0;
    
    if(getAttrByName(obj.id,color + '_wounded','Current') === 'false' &&  getAttrByName(obj.id,color + '_lockedout','Current') === 'false' && getAttrByName(obj.id,color + '_enabled','Current') === 'true')
    {
        var swing_color = findObjs({
            name: 'swing_color',
            _type: 'attribute',
            _characterid: obj.id
        }, {caseInsensitive: true})[0];

        if(recalc_dye === 'true')
        {    
            old_swing = swing_color.get('current');

            var dye = findObjs({
            name: 'dye_value',
            _type: 'attribute',
            _characterid: obj.id
            }, {caseInsensitive: true})[0];

            dye_value = dye.get('current');
            if(old_swing === '')
            {
                dye_value += parseInt(getAttrByName(obj.id, color+'_level','Current'));
            }
            else
            {
                dye_value += parseInt(getAttrByName(obj.id, color+'_level','Current')) - (parseInt(getAttrByName(obj.id, old_swing+'_level','Current')));
            }
            if(dye_value === dye.get('current'))
                recalc_dye = false;
            else
               dye.set('current',dye_value);
        }

        swing_color.set('current',color);

        var swing = findObjs({
            name: 'swing_value',
            _type: 'attribute',
            _characterid: obj.id
        }, {caseInsensitive: true})[0];

        if( typeof(value) === "undefined")
        {
            swing_value = getAttrByName(obj.id, color+'_value','Current'); 
            if(typeof(swing_value) === "undefined")
            {
                sendChat("Error", "Color Entered In-Correctly. Try: red or yellow");
                return;
            }
        }
        else
        {
            swing_value = parseInt(value);
            if(isNaN(swing_value))
            {
                swing_value = 1;
                outstr += 'value passed was either L or W default ';
            }
        }

        swing.set('current',swing_value);
        outstr += 'swing is a ';
        if(getAttrByName(obj.id,color+'_hidden') === 'false')
            outstr += color;
        else
        {
            outstr += '???';
            dye_value = '??';
            swing_value = '?';
        }
        outstr +=' ' + swing_value; 
        if(recalc_dye ==='true')
        {
           if(old_swing !== '' && getAttrByName(obj.id,old_swing+'_hidden') === 'true')
              dye_value = '??';
           outstr += ' with a new roll to dye of ' + dye_value;
        }
        outstr += '!';
        set_image(obj,color);
        sendCustomChat(obj, outstr, '/em ');
    }
    else
    {
        outstr = 'swing was not set the attribute selected is either locked, wounded or not enabled';
        sendCustomChat(obj, outstr, true);
    }

}

function set_image(obj,color)
{
    var colors = ["red","blue","yellow","green","purple","orange","black","grey","white"];
    var i;
    var index = 0;
    var count = 0;
    var enabled_count = 0;
    if(color !== '')
        for(i=0; i<colors.length; i++)
        {   
            if(getAttrByName(obj.id,colors[i] + '_img') === 'true'){
                enabled_count = enabled_count + 1;
                if(colors[i] === color)
                {
                        index = enabled_count;
                        break;
                }
            }
        }
    
    var control = obj.get('controlledby').split(/,/);
    if((getAttrByName(obj.id, 'whisper','Current') !== 'true' || _.contains(control,'all') === true) && getAttrByName(obj.id, 'image_set','Current') === 'true')
    {
        let tokens = findObjs({type:'graphic', represents: obj.id});
        if(typeof tokens != "undefined" && tokens != null && tokens.length != null && tokens.length > 0)
        {
            if(tokens[0].get("sides").split("|").length<(index+1))
                index = 0;
            tokens.forEach(token => sendChat(obj.get("name"),'!change-token-img --token_id '+token.id+' --set '+index));
        }
    }
}

function sendCustomChat(obj,outstr,special){
    var name = obj.get("name");
    var control = obj.get('controlledby').split(/,/);
    if((getAttrByName(obj.id, 'whisper','Current') === 'true' || special === true) && _.contains(control,'all') === false)
    {
        sendChat(name, '/w "'+ name +'" '+ outstr);
    }    
    else
    {
        if(typeof(special) === "undefined" || special === false)
            sendChat(name, outstr);
        else
            sendChat(name, special + outstr);
    }
}

function toggle_whisper(obj) {
    var whisper = findObjs({
        name: 'whisper',
        _type: 'attribute',
        _characterid: obj.id
    }, {caseInsensitive: true})[0];
    
    var name = obj.get("name");
    var control = obj.get('controlledby').split(/,/);
    
    if(_.contains(control,'all')  === false)
        if(getAttrByName(obj.id, 'whisper','Current') === 'true')
        {
            whisper.set('current','false');
            sendChat(name, '/w "'+name +'" has been set to Public');
        }
        else
        {
            whisper.set('current','true');
            sendChat(name, '/w "'+name+'" has been set to Private');
            set_image(obj,'');
        }
    else
        sendChat(name, 'Controlled by all, whisper has no affect.');
}

function drop_swing(obj) {
    var outstr = '';

    var swing_color = findObjs({
        name: 'swing_color',
        _type: 'attribute',
        _characterid: obj.id
    }, {caseInsensitive: true})[0];
    var color = swing_color.get('current');
    if(color !== '')
    {
        swing_color.set('current','');

        var swing_value = findObjs({
            name: 'swing_value',
            _type: 'attribute',
            _characterid: obj.id
        }, {caseInsensitive: true})[0];

        swing_value.set('current',0);

        outstr = 'has dropped ';
        if(getAttrByName(obj.id,color+'_hidden') === 'false')
            outstr += color;
        else
            outstr += '???';
        outstr += ' swing!';
        sendCustomChat(obj, outstr, '/em ');
        set_image(obj,'');
    }
    else
    {
        outstr += 'has no active swing.';
        sendCustomChat(obj, outstr, true);
    }
}

function ignite(obj) {
    var outstr = '';
    var swing_color = findObjs({
        name: 'swing_color',
        _type: 'attribute',
        _characterid: obj.id
    }, {caseInsensitive: true})[0];
    var color = swing_color.get('current');
    if(color !== '')
    {
        swing_color.set('current','');

        var swing_value = findObjs({
            name: 'swing_value',
            _type: 'attribute',
            _characterid: obj.id
        }, {caseInsensitive: true})[0];

        swing_value.set('current',0);
        
        var attribute = findObjs({
        name: color+'_lockedout',
        _type: 'attribute',
        _characterid: obj.id
        }, {caseInsensitive: true})[0];
    
        attribute.set('current','true');

        outstr = 'has ignited there ';
        if(getAttrByName(obj.id,color+'_hidden') === 'false')
            outstr += color;
        else
            outstr += '???';
        outstr += ' swing it is now locked out!';
        sendCustomChat(obj, outstr, '/em ');
        set_image(obj,'');
    }
    else
    {
        outstr += 'has no active swing.';
        sendCustomChat(obj, outstr, true);
    }
}

function recover(obj) {
    var colors = ["red","yellow","blue","green","orange","purple","black","white","grey"];
    var swing_color = getAttrByName(obj.id,"swing_color","Current");
    var background_color = '';    
    var header_url = '';
    header_url = 'https://raw.githubusercontent.com/Ozarke/windrose/main/assets/Roll-to-dye.jpg';
    if(swing_color !== "" && getAttrByName(obj.id,swing_color + "_hidden") === 'false')
    {
            background_color = swing_color;
            header_url = 'https://raw.githubusercontent.com/Ozarke/windrose/main/assets/Roll-to-dye-clear.png';
    } 
    var outstr = '&{template:roll}{{color='+ background_color + '}}{{title=[Dye](' + header_url + ')}} ';
    var roll_val = 0;
    var roll_level = 0;
    var level_total = 0;
    var total_val = 0;
    var attribute = 0;
    var colorstr = '';
    var color_name = '';
    var questionmarks = '';
    for(i=0; i<colors.length; i++)
    {
        if(getAttrByName(obj.id, colors[i]+'_enabled','Current') === 'true'){
            if(getAttrByName(obj.id, colors[i]+'_hidden') === 'true' && getAttrByName(obj.id, 'whisper','Current') === 'false')
            {
                questionmarks += 'H';
                colorstr = questionmarks;
            }
            else
                colorstr = colors[i];
            outstr +='{{' + colorstr;
            attribute = findObjs({
                name: colors[i] + '_value',
                _type: 'attribute',
                _characterid: obj.id
            }, {caseInsensitive: true})[0];

            if(getAttrByName(obj.id,colors[i] + '_wounded','Current') === 'true'){
                    outstr += '= [W](!wind set-swing ' + obj.id +' ' + colors[i] + ' '+ roll_val+ ' true)}}';  
                    attribute.set('current','W');
            }else{
                    roll_level = 0;
                    roll_level = parseInt(getAttrByName(obj.id, colors[i]+'_level','Current'));
                    if(colors[i] === swing_color)
                        roll_val = parseInt(getAttrByName(obj.id,"swing_value","Current"));
                    else
                        roll_val = randomInteger(6);

                    total_val += roll_val + roll_level; 
                    level_total += roll_level;
                    attribute.set('current',roll_val);
                    if(getAttrByName(obj.id, colors[i]+'_hidden') === 'true' && getAttrByName(obj.id, 'whisper','Current') === 'false')
                    {
                        outstr += '= [H](!wind hidden '+obj.id+')}}';
                        if(colors[i] === swing_color)
                            outstr += '{{swing=+ [H](!wind hidden '+obj.id+') **Attribute Level**}}';
                    }
                    else
                    {
                        if(roll_val !== 6 && roll_val !== 1)
                            outstr += '= [' + roll_val + ']';
                        else if (roll_val === 6)
                                outstr += '= [<div style="color:#247305">' + roll_val + '</div>]';
                             else
                                outstr += '= [<div style="color:#730505">' + roll_val + '</div>]';
                        outstr+= '(!wind set-swing ' + obj.id +' ' + colors[i] + ' '+ roll_val+ ' true)}}';                            
                        outstr += '{{'+colors[i]+'_level='+roll_level+'}}';
                        color_name = getAttrByName(obj.id, colors[i]+'_name');
                        if(color_name !== '' && color_name !== 'Attribute Name')
                            outstr += '{{'+colors[i]+'_name='+color_name+'}}';                 
                    }                       
            }
        }
    }
    outstr += '{{swing=+ [['+ level_total +']] **Total Attribute Levels**}}';
    outstr += '{{total= [['+ total_val + ']]}}';
    
    sendCustomChat(obj, outstr);
}

function init(obj) {
    var attributes = ["red","yellow","blue","green","orange","purple","black","white","grey"];
    var command = ["enabled","value","name","wounded","lockedout","level"];
    var i;
    var name = obj.get("name");

    
    //Red Yellow Blue should be enabled by defaul      
    if (typeof (findObjs({name: "whisper", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
        createObj("attribute", {
            name: 'whisper',
            current: 'false',
            characterid: obj.id
        });
    if (typeof (findObjs({name: "image_set", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
        createObj("attribute", {
            name: 'image_set',
            current: 'false',
            characterid: obj.id
        });

    for (i = 0; i < 3; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[0], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[0], // Enabled
                current: 'true',
                characterid: obj.id
            });
    }

    for (i = 3; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[0], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[0], // Enabled
                current: 'false',
                characterid: obj.id
            });
    }

    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[1], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[1], // Value
                current: 1,
                characterid: obj.id
            });
    }
    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[2], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[2], // Name
                current: '',
                characterid: obj.id
            });
    }
    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[3], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[3], // Wounded
                current: 'false',
                characterid: obj.id
            });
    }

    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[4], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[4], // Lockedout
                current: 'false',
                characterid: obj.id
            });
    }

    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_" + command[5], _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_" + command[5], // Level
                current: 0,
                characterid: obj.id
            });
    }

    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_hidden", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_hidden", // Hidden
                current: 'false',
                characterid: obj.id
            });
    }
    
    for (i = 0; i < attributes.length; i++)
    {
        if (typeof (findObjs({name: attributes[i] + "_img", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
            createObj("attribute", {
                name: attributes[i] + "_img", // Hidden
                current: 'false',
                characterid: obj.id
            });
    }
    
    if (typeof (findObjs({name: "dye_value", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
        createObj("attribute", {
            name: "dye_value",
            current: 0,
            characterid: obj.id
        });

    if (typeof (findObjs({name: "do_value", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
        createObj("attribute", {
            name: "do_value",
            current: 0,
            characterid: obj.id
        });
    if (typeof (findObjs({name: "swing_color", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
        createObj("attribute", {
            name: "swing_color",
            current: "",
            characterid: obj.id
        });

    if (typeof (findObjs({name: "swing_value", _type: "attribute", _characterid: obj.id})[0]) === "undefined")
        createObj("attribute", {
            name: "swing_value",
            current: '0',
            characterid: obj.id
        });

    var mac;
    mac = findObjs({name: "roll-to-do", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "roll-to-do",
        action: "!wind roll-to-do @{character_id} swing 0  0",
        istokenaction: true,
        characterid: obj.id
    });
    
    mac = findObjs({name: "roll-to-do-c", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "roll-to-do-c",
        action: "!wind roll-to-do @{character_id} ?{Choose attribute |swing|none|red|blue|yellow|green|purple|orange|black|grey|white} ?{Choose amount of d6|0}  ?{Bonus|0}",
        istokenaction: true,
        characterid: obj.id
    });

    mac = findObjs({name: "roll-to-dye", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "roll-to-dye",
        action: "!wind roll-to-dye @{character_id} 0 0",
        istokenaction: true,
        characterid: obj.id
    });
    
    mac = findObjs({name: "roll-to-dye-c", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "roll-to-dye-c",
        action: "!wind roll-to-dye @{character_id} ?{Choose amount of d6|0} ?{Bonus|0}",
        istokenaction: true,
        characterid: obj.id
    });

    mac = findObjs({name: "drop-swing", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "drop-swing",
        action: "!wind drop-swing @{character_id}",
        istokenaction: true,
        characterid: obj.id
    });

    mac = findObjs({name: "lock-attribute", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "lock-attribute",
        action: "!wind prompt-attribute-change @{character_id} lock",
        istokenaction: true,
        characterid: obj.id
    });

    mac = findObjs({name: "wound-attribute", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "wound-attribute",
        action: "!wind prompt-attribute-change @{character_id} wound",
        istokenaction: true,
        characterid: obj.id
    });

    mac = findObjs({name: "enable-attribute", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "enable-attribute",
        action: "!wind prompt-attribute-change @{character_id} enable",
        istokenaction: false,
        characterid: obj.id
    });

    mac = findObjs({name: "toggle-whisper", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "toggle-whisper",
        action: "!wind toggle-whisper @{character_id}",
        istokenaction: true,
        characterid: obj.id
    });

    mac = findObjs({name: "set-swing", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "set-swing",
        action: "!wind set-swing @{character_id} ?{Choose color |red|blue|yellow|green|purple|orange|black|grey|white}  ?{value|1|2|3|4|5|6}",
        istokenaction: true,
        characterid: obj.id
    });
    
    mac = findObjs({name: "ignite", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "ignite",
        action: "!wind ignite @{character_id}",
        istokenaction: true,
        characterid: obj.id
    });
    
    mac = findObjs({name: "recover", _type: "ability", _characterid: obj.id})[0];
    if (typeof (mac) !== "undefined")
        mac.remove();
    createObj("ability", {
        name: "recover",
        action: "!wind recover @{character_id}",
        istokenaction: true,
        characterid: obj.id
    });

    sendChat(name, 'Character Initialized');
}