const fetch = require('node-fetch');
const Discord = require('discord.js');
var levenshtein = require('fast-levenshtein');
const {elements,ailments,monster_list } = require('../ressources/config.json');
const {src_thumbnail} = require('../ressources/src_thb.json')
module.exports = {
    name: 'info',
    description: 'i give one monster info',
    aliases: ['weak'],
    execute(message, args) {

      function capitalize(string) {

        mots = string.split("-")
        var sortie = ""

        for (var i = 0; i < mots.length; i++) {
          mot = mots[i];
          sortie += mot.charAt(0).toUpperCase() + mot.slice(1) + "-";
        }
        return sortie.slice(0,sortie.length-1)
      }


      const msg = message.content.slice(5,message.length).toLowerCase();
       if(msg === ``){
            return;
       }
       console.log(msg)
      var monstre = "" //will contain the correct name for the url
      var prettyname = "" //will contain a pretty name for the monster, with capitalized letters
      const monster_name = msg.split(" ");
      for (var i = 0; i < monster_name.length; i++) {
          name_bits = monster_name[i]
          monstre +=  capitalize(name_bits) + "+";
          prettyname +=  capitalize(name_bits) + " ";
      }

        monstre = monstre.slice(0,monstre.length-1).replace(/\'/g,'%27')
        prettyname = prettyname.slice(0,prettyname.length-1)
        var wiki = "https://monsterhunterworld.wiki.fextralife.com/" + monstre //The url we are fetching
        console.log(wiki)


        function wik(doc){
          //We first create 'weaknesses', the string containing the monster's weaknesses.


          const begin_weak = doc.indexOf('<td>Weakness</td>');
          const end_weak =  doc.indexOf('<td>Resistances</td>');

          var weaknesses = ``;

          const doc2 = doc.substring(begin_weak,end_weak);
          for (var i=0; i < elements.length; i++){

            if (doc2.includes(elements[i])){
              current_elt = elements[i].replace(/ /g,'_');
              elt = client.emojis.find(emoji => emoji.name === current_elt.toLowerCase() + "_weakness");
              weaknesses = weaknesses.concat(`${elt}` + ` ` + elements[i] + `\n`)
              }
            }
          if (weaknesses === ``) {
            weaknesses = `None`
          }


          //Now we create 'ail', the string containing the ailments.

          var ail= "";
          const begin_ailment = doc.indexOf('<td>Ailments</td>');
          const end_ailment = doc.indexOf('<td>Weakness</td>')
          const docail = doc.substring(begin_ailment,end_ailment)
          for (var i=0; i<ailments.length;i++){
            if (docail.includes(ailments[i])){
              current_ail = ailments[i].replace(/ /g, '_');
              emoj_ail = client.emojis.find(emoji => emoji.name === current_ail.toLowerCase + "_ailment");
              ail = ail.concat(emoj_ail + ` ` + ailments[i]+`\n`);
            }
          }
          if (ail === ``){
            ail = `None`
          }

          //We now create the embed.

          var doc_thumb = src_thumbnail
          var begin_narrow_document= doc_thumb.indexOf(monstre);
          doc_thumb=doc_thumb.substring(begin_narrow_document,doc_thumb.length-1)
          begin_narrow_document = doc_thumb.indexOf('data-src=')+10
          doc_thumb=doc_thumb.substring(begin_narrow_document,doc_thumb.length-1)
          const end_thumbnail = doc_thumb.indexOf('.png')+4;
          doc_thumb = doc_thumb.substring(0,end_thumbnail);

          // //Finally, let's add one random note.
          // const begin_trivia = doc.indexOf('<h2><span class="mw-headline" id="Notes">Notes</span></h2>');
          // var doc_trivia = doc.substring(begin_trivia);
          // const end_trivia = doc_trivia.indexOf('</p></div>')-6;
          // var doc_trivia = doc_trivia.substring(0,end_trivia);
          // const begin_narrow_trivia = doc_trivia.indexOf("<ul>")+4;
          // doc_trivia = doc_trivia.substring(begin_narrow_trivia);
          // const garbage_tab = doc_trivia.split("<li>");
          // const trivia_tab = []
          // var incrementer = true

          // //We have to deal with lists within lists....

          // for (var i = 0; i < garbage_tab.length;i++){
          //   if (garbage_tab[i].includes("</ul>")){
          //     incrementer = true;
          //     trivia_tab[trivia_tab.length-1]+="-"+garbage_tab[i]
          //   }
          //   else if (garbage_tab[i].includes("<ul>")){
          //     incrementer = false;
          //     trivia_tab.push(garbage_tab[i])
          //   }
          //   else {
          //     if (incrementer){
          //       trivia_tab.push(garbage_tab[i])
          //     }
          //   else {
          //       trivia_tab[trivia_tab.length-1]+="-"+garbage_tab[i]
          //     }
          //   }
          // }

          // for (var i = 1; i<trivia_tab.length;i++){
          //   if (trivia_tab[i].length <= 0 || trivia_tab[i].length>=1024){
          //     trivia_tab.splice(i, 1);
          //   }
          // }
          // const trivia = trivia_tab[Math.floor((Math.random())*trivia_tab.length)]



          // //now we cleanup the trivia.
          // const trivia_bits = trivia.split('href=')
          // var final_trivia = trivia_bits[0]
          // for (var i = 1; i<trivia_bits.length;i++){
          //   var ugly_trivia = trivia_bits[i]
          //   var link = "https://monsterhunter.fandom.com"
          //   var begin_link = 1
          //   var end_link = ugly_trivia.indexOf("title")
          //   const wikilink = ugly_trivia.substring(begin_link,end_link-2).replace(/\(/g, "%28").replace(/\)/g,"%29")
          //   link += wikilink
          //   begin_link = ugly_trivia.indexOf(">")+1
          //   end_link = ugly_trivia.indexOf("<")
          //   const link_name = ugly_trivia.substring(begin_link,end_link)
          //   var end_of_trivia = ugly_trivia.substring(ugly_trivia.indexOf("</a>")+4)
          //   final_trivia += "["+link_name+"]("+link+")"+end_of_trivia

          // }

          // final_trivia = final_trivia.replace(/<i>/g, "")
          //   .replace(/<a/g, "")
          //   .replace(/<\/i>/g, "")
          //   .replace(/<\/li>/g, '')
          //   .replace(/<ul>/g, '')
          //   .replace(/<\/ul>/g,'')

          //   if (final_trivia.includes("class")){
          //     final_trivia = ""
          //   }


          //Now creating the embed message
          var embed = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setTitle("Monster : ".concat(prettyname.replace(/%27/g,"\'")))
            .setURL(wiki)
            //.setDescription(wiki)
            .addField("Weakness(es) : ", weaknesses, true)
            .addField("Ailment(s) : ",ail, true )
            // if (final_trivia.length > 0 && final_trivia.length<1024){
            //   embed.addField("Note :",final_trivia)
            // }
            if (doc_thumb.includes(".png")){embed.setThumbnail(doc_thumb);} //If there is a fitting image, then it is the thumbnail

              console.log("Success. (" + prettyname + ")"); //Let's put in the logs that the request is a success
              return ({embed}) //Let's return the final message
            }

            var a_trouve = false
            //If the monster is in the list
            for (var i=0;i<monster_list.length;i++){
              if (monstre === monster_list[i]){
              fetch(wiki)
                  .then(res => res.text())
                  .then(body => message.channel.send(wik(body)))
                  .catch(console.error)
                  a_trouve = true
                  break;
                }
              }
            //Otherwise we look for the first occurence of the monster in the list
            if (!a_trouve){
              monstre2 = monstre.charAt(0).toLowerCase() + monstre.slice(1)
              for (var i=0;i<monster_list.length;i++){
                if (monster_list[i].includes(monstre) || monster_list[i].includes(monstre2)){
                  monstre = monster_list[i]
                  prettyname=monster_list[i].replace(/_/g," ")
                  prettyname = prettyname.charAt(0).toUpperCase() + prettyname.slice(1)
                  wiki = "https://monsterhunter.fandom.com/wiki/" + monster_list[i]
                  fetch(wiki)
                      .then(res => res.text())
                      .then(body => message.channel.send(wik(body)))
                      .catch(console.error)
                      a_trouve = true;
                    break;
                  }
                }
              }
              if (!a_trouve){
                var min_dist = 999999999;
                var closest_monster = "";
                for (var i=0;i<monster_list.length;i++){
                  var distance = levenshtein.get(monstre2.replace(/%27/g,"'"), monster_list[i].replace(/%27/g,"'")); // 3
                  if (min_dist > distance){
                    closest_monster = monster_list[i];
                    min_dist = distance;
                  }
                  console.log(closest_monster)
                }
                var suggestedyname=closest_monster.replace(/_/g," ").replace(/%27/g,"'");
                suggestedyname = (closest_monster.charAt(0).toUpperCase() + suggestedyname.slice(1)).toLowerCase();
                               if (msg == "<@510472551332315157>"){
                 message.channel.send("Im not a monster! I'm the palibot!");
             }
             else{
                message.channel.send("Sorry Master, I can't find the meownster ! Did you mean **" + suggestedyname + "** ? " + "\nIf not, please try `pali help`  :crying_cat_face:")
                }
              }
            try{console.log("[info]" + message.guild.name + ` (${message.guild.memberCount} users)` + " -> "+ msg + ` (request by ${message.author.username})`);
            
          } catch(e) {
            console.log("[info]" + " -> "+ prettyname + ` (request by ${message.author.username})`);
        } //Nice logs
         if (!a_trouve){

              console.log("failure. Suggestion -> " + suggestedyname);
             
            }

      }}
