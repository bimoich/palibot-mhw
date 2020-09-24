import fetch from 'node-fetch'
import Discord from 'discord.js'
// const fetch = require('node-fetch');
// const Discord = require('discord.js');
var levenshtein = require('fast-levenshtein');
const { elements, ailments, monster_list, locations, blights } = require('../ressources/config.json');
const { src_thumbnail } = require('../ressources/src_thb.json')
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
      return sortie.slice(0, sortie.length - 1)
    }


    const msg = message.content.slice(5, message.length).toLowerCase();
    if (msg === ``) {
      return;
    }
    var monstre = "" //will contain the correct name for the url
    var prettyname = "" //will contain a pretty name for the monster, with capitalized letters
    const monster_name = msg.split(" ");
    for (var i = 0; i < monster_name.length; i++) {
      name_bits = monster_name[i]
      monstre += capitalize(name_bits) + "+";
      prettyname += capitalize(name_bits) + " ";
    }

    monstre = monstre.slice(0, monstre.length - 1).replace(/\'/g, '%27')
    prettyname = prettyname.slice(0, prettyname.length - 1)
    var wiki = "https://monsterhunterworld.wiki.fextralife.com/" + monstre //The url we are fetching

    function wik(doc) {
      //We first create 'weaknesses', the string containing the monster's weaknesses.


      const docStartIndex = doc.indexOf('Weakness</td>');
      const docEndIndex = doc.indexOf('Resistances</td>');
      let weaknesses = ``;

      const rawData = doc.substring(docStartIndex, docEndIndex);
      for (var i = 0; i < elements.length; i++) {

        if (rawData.includes(elements[i])) {
          current_elt = elements[i].replace(/ /g, '_');
          elementStartIndex = rawData.indexOf(current_elt + "</a>")
          elementData = rawData.substring(elementStartIndex, elementStartIndex + 20)

          weaknesses = weaknesses.concat(current_elt + "  "
            + barrothCheck(starCounter(elementData), current_elt) + `\n`)
        }
      }
      if (weaknesses === ``) {
        weaknesses = `None`
      }

      //Now we create 'blight', the string containing the blights.

      var blight = "";
      const blightStartIndex = doc.indexOf('<td>Ailments</td>');
      const blightEndIndex = doc.indexOf('<td>Weakness</td>')
      const blightDoc = doc.substring(blightStartIndex, blightEndIndex)
      for (var i = 0; i < blights.length; i++) {
        if (blightDoc.includes(blights[i])) {
          current_blight = blights[i].replace(/ /g, '_');
          emoji_blight = client.emojis.find(emoji => emoji.name === current_blight.toLowerCase + "_ailment");
          blight = blight.concat(blights[i] + `\n`);
        }
      }
      if (blight === ``) {
        blight = `None`
      }

      //Now we create 'ail', the string containing the ailments.

      var ail = "";
      const beginAilment = doc.indexOf('<th>Weakness Level</th>');
      const endAilment = doc.indexOf('<th>Weak Point</th>')
      const ailDoc = doc.substring(beginAilment, endAilment)
      console.log(ailDoc)
      for (var i = 0; i < ailments.length; i++) {
        current_ail = ailments[i].replace(/ /g, '_');
        ailmenteEndIndex = nthIndexOf(ailDoc, "</td>", i + 1)
        ailmentData = ailDoc.substring(ailmenteEndIndex - 10, ailmenteEndIndex)

        ail = ail.concat(current_ail + "  " + starCounter(ailmentData) + `\n`)
      }
      if (ail === ``) {
        ail = `None`
      }

      //Now we create 'locs', the string containing the locations.

      var locs = "";
      const beginLocations = doc.indexOf('<td>Location(s)</td>');
      const endLocations = doc.indexOf('<td>Tempered Lv.</td>')
      const locationDoc = doc.substring(beginLocations, endLocations)
      for (var i = 0; i < locations.length; i++) {
        if (locationDoc.includes(locations[i])) {
          current_loc = locations[i].replace(/\+/g, ' ');
          locs = locs.concat(current_loc + `\n`);
        }
      }
      if (locs === ``) {
        locs = `Not yet on the list, will include Iceborne areas soon.`
      }

      //We now create the embed.

      var doc_thumb = src_thumbnail
      var begin_narrow_document = doc_thumb.indexOf(monstre);
      doc_thumb = doc_thumb.substring(begin_narrow_document, doc_thumb.length - 1)
      begin_narrow_document = doc_thumb.indexOf('data-src=') + 10
      doc_thumb = doc_thumb.substring(begin_narrow_document, doc_thumb.length - 1)
      const end_thumbnail = doc_thumb.indexOf('.png') + 4;
      doc_thumb = doc_thumb.substring(0, end_thumbnail);

      //Now creating the embed message
      var embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("Monster : ".concat(prettyname.replace(/%27/g, "\'")))
        .setURL(wiki)
        .setTimestamp()
        .addField("Weakness(es)", weaknesses, true)
        .addField("Ailment(s)", ail, true)
        .addField("Blight(s)", blight, true)
        .addField("Location(s): ", locs, false)

      if (doc_thumb.includes(".png")) { embed.setThumbnail(doc_thumb); } //If there is a fitting image, then it is the thumbnail

      console.log("Success. (" + prettyname + ")"); //Let's put in the logs that the request is a success
      return ({ embed }) //Let's return the final message
    }

    /**
     * Get position of key in data of the 'n' occurences
     * @param {*} data 
     * @param {String} keyToSearch 
     * @param {Int} n 
     */
    function nthIndexOf(data, keyToSearch, n) {
      var L = data.length, i = -1;
      while (n-- && i++ < L) {
        i = data.indexOf(keyToSearch, i);
        if (i < 0) break;
      }
      return i;
    }

    /**
     * Get the number of star in acquired data, then print into discord 
     * star emoji.
     * @param {*} data 
     */
    function starCounter(data) {
      const n = data.match(new RegExp("⭐", "g"))
      if (n) {
        return `${"\:star:".repeat(n.length)}`
      } else {
        return ""
      }
    }

    /**
     * Do special check for barroth elemental weakness due to mud
     * @param {String} data 
     * @param {String} element 
     */
    function barrothCheck(data, element) {
      if (monstre.toLowerCase() === "barroth") {
        if (element.toLowerCase() === "fire") {
          return `${data}(\:x:)`
        } else if (element.toLowerCase() === "water") {
          return `\:x:(${data})`
        } else {
          return data
        }
      } else {
        return data
      }
    }

    var a_trouve = false
    //If the monster is in the list
    for (var i = 0; i < monster_list.length; i++) {
      if (monstre === monster_list[i]) {
        fetch(wiki)
          .then(res => res.text())
          .then(body => message.channel.send(wik(body)))
          .catch(console.error)
        a_trouve = true
        break;
      }
    }
    //Otherwise we look for the first occurence of the monster in the list
    if (!a_trouve) {
      monstre2 = monstre.charAt(0).toLowerCase() + monstre.slice(1)
      for (var i = 0; i < monster_list.length; i++) {
        if (monster_list[i].includes(monstre) || monster_list[i].includes(monstre2)) {
          monstre = monster_list[i]
          prettyname = monster_list[i].replace(/_/g, " ")
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
    if (!a_trouve) {
      var min_dist = 999999999;
      var closest_monster = "";
      for (var i = 0; i < monster_list.length; i++) {
        var distance = levenshtein.get(monstre2.replace(/%27/g, "'"), monster_list[i].replace(/%27/g, "'")); // 3
        if (min_dist > distance) {
          closest_monster = monster_list[i];
          min_dist = distance;
        }
        console.log(closest_monster)
      }
      var suggestedyname = closest_monster.replace(/_/g, " ").replace(/%27/g, "'");
      suggestedyname = (closest_monster.charAt(0).toUpperCase() + suggestedyname.slice(1)).toLowerCase();
      if (msg == "<@510472551332315157>") {
        message.channel.send("Im not a monster! I'm the palibot!");
      }
      else {
        message.channel.send("Sorry Master, I can't find the meownster ! Did you mean **" + suggestedyname + "** ? " + "\nIf not, please try `pali help`  :crying_cat_face:")
      }
    }
    try {
      console.log("[info]" + message.guild.name + ` (${message.guild.memberCount} users)` + " -> " + msg + ` (request by ${message.author.username})`);

    } catch (e) {
      console.log("[info]" + " -> " + prettyname + ` (request by ${message.author.username})`);
    } //Nice logs
    if (!a_trouve) {

      console.log("failure. Suggestion -> " + suggestedyname);

    }

  }
}
