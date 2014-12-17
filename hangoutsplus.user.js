// ==UserScript==
// @name        google hangouts+
// @namespace   https://plus.google.com/hangouts/*
// @include     https://plus.google.com/hangouts/*
// @description Improvements to Google Hangouts
// @version     1.3
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require     https://raw.githubusercontent.com/hazzik/livequery/master/dist/jquery.livequery.min.js
// @downloadURL https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js
// ==/UserScript==

// User preferences

/* Most of these settings are meant to be edited using the commands while in google hangouts.
To access a list of commands, enter the command !? into the text area of hangouts. */

// Chat message blacklist. Use full names.
var chatBlacklist = [];

// When true users on the blacklist have their messages completely removed without a trace.
// When false, their entry will appear in the chatbox, but their message will be replaced with "<message deleted>"
var purgeBlacklistedMessages = false;

// When true, emulates a twitch.tv style of deleting messages, allowing the user to click them to reveal what was said.
var selectiveHearing = true;

// Keeps scroll position until you scroll back down. Issues on some browser installations
var enableScrollingFix = true;

// Disable emoticons
var disableEmoticons = true;

// Word highlighting
var highlightMatchPatterns = [];
var highlightSoundFilePath = 'https://www.gstatic.com/chat/sounds/hangout_alert_cc041792a9494bf2cb95e160aae459fe.mp3';

// supports #000, #FFFFFF, and rgba(r,g,b,a) as STRING colors
var highlightColor = 'rgba(255,255,0,0.1)';

// Word sound alerting. Use Regular Expression
var soundMatchPatterns = [
	'.*[Nn][Yy][Aa][Nn][Pp][Aa][Ss][Uu].*'//,
	//'.*[Nn][Ii][Cc][Oo]\\s[Nn][Ii][Cc][Oo]\\s[Nn][Ii].*',
	//'.*[Tt][Ii][Mm][Oo][Tt][Ee][Ii].*',
	//'.*[Tt][Uu][Tt][Uu][Rr][Uu].*',
	//'.*[Ww][Ee][Hh].*',
	//'.*[Qq]_[Qq].*',
	//'^\/.*[WwBb][Zz][Zz].*',
	//'^\/.*[Ss][Kk][Ii][Tt][Tt][Ee][Rr].*',
	//'.*[Ww][Aa][Nn][Gg][Pp][Aa][Ss][Uu].*'
];
var soundMatchURLs = [
	'https://dl.dropboxusercontent.com/u/12577282/cnd/nyanpasu.wav'//,
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/niconiconi.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/timotei.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/tuturu.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/weh1.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/weh2.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/bzz.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/skitter.wav',
	//'https://dl.dropboxusercontent.com/u/12577282/cnd/wangpasu3.wav'
];

// Focus chat text area when the window regains focus
var focusChatFromBlur = true;

// Replace certain words in your message before they're sent
var replacementPatterns = [
	'/scripturl'//,
	//'/sup',
	//'/flex',
	//'/raise',
	//'/sparkles',
	//'/eyebrows',
	//'/shock',
	//'o_/',
	//'xoxo'
];
var replacementValues = [
	'https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js'//,
	//'¯\\_(ツ)_/¯',
	//'ᕦ༼ຈل͜ຈ༽ᕤ',
	//'ヽ༼ຈل͜ຈ༽ﾉ',
	//'(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
	//'( ͡° ͜ʖ ͡°)',
	//'∑(゜Д゜;)',
	//'´ ▽ ` )ﾉ',
	//'(づ￣ ³￣)づ'
];

// * Do not edit below this line * //

// Saves the preferences to local storage
function savePreferences()
{
	if (window['localStorage'] !== null)
	{
		/*localStorage['blacklist'] = JSON.stringify(chatBlacklist);
		localStorage['highlightMatchPatterns'] = JSON.stringify(highlightMatchPatterns);
		localStorage['highlightColor'] = highlightColor;
		localStorage['replacementPatterns'] = JSON.stringify(replacementPatterns);
		localStorage['replacementValues'] = JSON.stringify(replacementValues);
		localStorage['soundMatchPatterns'] = JSON.stringify(soundMatchPatterns);
		localStorage['soundMatchURLs'] = JSON.stringify(soundMatchURLs);
		localStorage['selectiveHearing'] = selectiveHearing;*/
		localStorage.setItem('blacklist',JSON.stringify(chatBlacklist));
		localStorage.setItem('highlightMatchPatterns',JSON.stringify(highlightMatchPatterns));
		localStorage.setItem('replacementPatterns',JSON.stringify(replacementPatterns));
		localStorage.setItem('replacementValues',JSON.stringify(chatBlacklist));
		localStorage.setItem('soundMatchPatterns',JSON.stringify(soundMatchPatterns));
		localStorage.setItem('soundMatchURLs',JSON.stringify(soundMatchURLs));
		localStorage.setItem('highlightColor',highlightColor);
		localStorage.setItem('selectiveHearing',selectiveHearing);
		if (purgeBlacklistedMessages)
		{
			localStorage.setItem('purgemode','on');
		}
		else
		{
			localStorage.setItem('purgemode', 'off');
		}
	}
}

// Loads the preferences from local storage, if they exist
function loadPreferences()
{
	if (window['localStorage'] !== null)
	{
		if (localStorage.getItem('blacklist'))
		{
			chatBlacklist = JSON.parse(localStorage.getItem('blacklist'));
		}
		if (localStorage.getItem('highlightMatchPatterns'))
		{
			highlightMatchPatterns = JSON.parse(localStorage.getItem('highlightMatchPatterns'));
		}
		if (localStorage.getItem('highlightColor'))
		{
			highlightColor = localStorage.getItem('highlightColor');
		}
		if (localStorage.getItem('replacementPatterns'))
		{
			replacementPatterns = JSON.parse(localStorage.getItem('replacementPatterns'));
		}
		if (localStorage.getItem('replacementValues'))
		{
			replacementValues = JSON.parse(localStorage.getItem('replacementValues'));
		}
		if (localStorage.getItem('soundMatchPatterns'))
		{
			soundMatchPatterns = JSON.parse(localStorage.getItem('soundMatchPatterns'));
		}
		if (localStorage.getItem('soundMatchURLs'))
		{
			soundMatchURLs = JSON.parse(localStorage.getItem('soundMatchURLs'));
		}
		if (localStorage.getItem('selectiveHearing'))
		{
			selectiveHearing = localStorage.getItem('selectiveHearing');
		}
		if (localStorage.getItem('purgeMode'))
		{
			if (localStorage.getItem('purgeMode') == 'on')
			{
				purgeBlacklistedMessages = true;
			}
			else
			{
				purgeBlacklistedMessages = false;
			}
		}
	}
}

// Clears the preferences from local storage
function clearPreferences()
{
	localStorage.removeItem('blacklist');
	localStorage.removeItem('highlightMatchPatterns');
	localStorage.removeItem('replacementPatterns');
	localStorage.removeItem('replacementValues');
	localStorage.removeItem('soundMatchPatterns');
	localStorage.removeItem('soundMatchURLs');
	localStorage.removeItem('highlightColor');
	localStorage.removeItem('selectiveHearing');
	localStorage.removeItem('purgemode');
}

// Returns a new element that replicates the hangouts chat line break
function newChatLineBreak()
{
	var chatLineBreak = document.createElement('hr');
	chatLineBreak.className = 'Kc-Nd';
	return chatLineBreak;
}

// Returns a new element that replicates the hangouts system message
function newChatLineSystemMessage(message)
{
	var outerDiv = document.createElement('div');
	var middleDiv = document.createElement('div');
	var innerDiv = document.createElement('div');
	outerDiv.className = ' Fm Eq Kc-we';
	middleDiv.className = 'Kc-Oc';
	innerDiv.className = 'Kc-Ca Fm';
	innerDiv.innerHTML = message;
	middleDiv.appendChild(innerDiv);
	outerDiv.appendChild(middleDiv);
	return outerDiv;
}

// Used to add false system messages to the chat area
function addSystemMessage(message)
{
	if (chat)
	{
		chat.appendChild(newChatLineSystemMessage(message));
		chat.scrollTop = chat.scrollHeight;
	}
}

// The actual chat area div
var chat;
// The text area used to send chat messages
var textArea;
// The node of the last received chat message
/* This is used as a mutation observer object because hangouts does not make a new div in the main chat
window when the same user posts multiple messages before another user or system message is received */
var lastMessageNode;

// The chat mutation observer
/* This watches for any children added to the main chat area div. Based on what it is, it will parse
the message to purge, highlight, or play sounds. Blacklisted messages are not added to the chat area when 
purgemode is enabled. */
var chatObserver = new MutationObserver(function(mutations)
{
	mutations.forEach(function(mutation)
	{
		for (var i = 0; i < mutation.addedNodes.length; i++)
		{
			var node = mutation.addedNodes[i];
			if (node)
			{
				if (node.classList.contains('Kc-we'))
				{
					lastMessageNode = node;
					lastMessageObserver.disconnect();
					if (lastMessageNode && lastMessageNode.firstChild && lastMessageNode.firstChild.childNodes.length > 0 && lastMessageNode.firstChild.childNodes[1])
					{
						lastMessageObserver.observe(lastMessageNode.firstChild.childNodes[1],
						{
							attributes: true,
							childList: true,
							characterData: true
						});
					}
					var chatMessage = node;
					if (!node.childNodes[0].childNodes[0].classList.contains('Kc-Ca'))
					{
						var chatMessageSender = chatMessage.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0];
						var chatMessageMessage = chatMessage.childNodes[0].childNodes[1].childNodes[1];
						handleNewMessage(node, chatMessageSender, chatMessageMessage);
					}
				}
				if (node.classList.contains('Kc-Nd'))
				{
					chat.removeChild(node);
				}
			}
		}
		scrollFix();
	});
});

// The last message mutation observer
/* This must be used in order to capture and alter messages sent by the same person in succession,
as the top level mutation observer will not capture changes to its children. */
var lastMessageObserver = new MutationObserver(function(mutations)
{
	mutations.forEach(function(mutation)
	{
		for (var i = 0; i < mutation.addedNodes.length; i++)
		{
			var node = mutation.addedNodes[i];
			handleNewMessage(lastMessageNode, lastMessageNode.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0], node);
		}
		scrollFix();
	});
});

// If the scroll fix is enabled and the user has scrolled, keep the scroll bar in place
/* Hangouts always scrolls the chat to the maximum when a new message arrives. This is called after 
the mutation observer so that after hangouts scrolls to the bottom, this scrolls back up to where it
was. */
function scrollFix()
{
	if (enableScrollingFix && fixedScrolling)
	{
		chat.scrollTop = fixedScrollingPosition;
	}
}

// Returns the outcome of a regex test
function regexMatch(text, pattern)
{
	var regex = new RegExp(pattern);
	return regex.test(text);
}

// Handles new messages
/* This function deals with the actual content of the message. */
function handleNewMessage(node, chatMessageSender, chatMessageMessage)
{
	// Highlights
	if (highlightMatchPatterns.length > 0)
	{
		var hasPlayed = false;
		if (!hasPlayed)
		{
			for (var i = 0; i < highlightMatchPatterns.length; i++)
			{
				for (var j = 0; j < chatMessageMessage.childNodes.length; j++)
				{
					if (chatMessageMessage.childNodes[j].nodeType == 3)
					{
						var message = chatMessageMessage.childNodes[j].nodeValue;
						if (regexMatch(message, highlightMatchPatterns[i]))
						{
							chatMessageMessage.style.backgroundColor = highlightColor;
							var audio = new Audio(highlightSoundFilePath);
							audio.play();
							hasPlayed = true;
							break;
						}
					}
				}
				if (hasPlayed)
				{
					break;
				}
			}
		}
	}

	// Blacklist
	for (var j = 0; j < chatBlacklist.length; j++)
	{
		if (chatBlacklist[j].toLowerCase() == chatMessageSender.nodeValue.toLowerCase())
		{
			if (!purgeBlacklistedMessages)
			{

				if (selectiveHearing)
				{
					var deletedMessage = document.createElement("a");
					var originalMessage = chatMessageMessage.innerHTML;
					deletedMessage.innerHTML = '&lt;message deleted&gt';
					deletedMessage.onclick = (function()
					{
						deletedMessage.innerHTML = originalMessage;
					})
					chatMessageMessage.innerHTML = '';
					chatMessageMessage.appendChild(deletedMessage);
				}
				else
				{
					chatMessageMessage.innerHTML = '&lt;message deleted&gt;';
				}
			}
			else
			{
				chat.removeChild(node);
			}
		}
	}

	// Sounds
	for (var i = 0; i < soundMatchPatterns.length; i++)
	{
		var hasPlayed = false;
		if (!hasPlayed)
		{
			for (var j = 0; j < chatMessageMessage.childNodes.length; j++)
			{
				if (chatMessageMessage.childNodes[j].nodeType == 3)
				{
					var message = chatMessageMessage.childNodes[j].nodeValue;
					if (regexMatch(message, soundMatchPatterns[i]))
					{
						var audio = new Audio(soundMatchURLs[i]);
						audio.play();
						hasPlayed = true;
					}
				}
			}
		}
	}

	// Emoticons
	if (disableEmoticons)
	{
		for (var i = 0; i < chatMessageMessage.childNodes.length; i++)
		{
			var node = chatMessageMessage.childNodes[i];
			/* Google handles emoticons in a very straight forward, consistent manner:
			Emoticons are IMG elements with ALT tags.
			The ALT tag is always the text that is replaced with the image, so just re-replace it.*/
			if (node.tagName == 'IMG')
			{
				if (node.alt)
				{
					var replacementText = node.alt;
					var replacementNode = document.createElement('text');
					replacementNode.innerHTML = replacementText;
					chatMessageMessage.insertBefore(replacementNode, node);
					chatMessageMessage.removeChild(node);
				}
			}
		}
	}
}

// Parses the text that is inside the text area for replacements
function parseInputText(text)
{
	var replacementTuples = [];
	for (var i = 0; i < replacementPatterns.length; i++)
	{
		replacementTuples.push(
		{
			'pattern': replacementPatterns[i],
			'value': replacementValues[i]
		});
	}
	replacementTuples.sort(function(a, b)
	{
		return b.pattern.length - a.pattern.length;
	});
	for (var i = 0; i < replacementTuples.length; i++)
	{
		if (regexMatch(text, replacementTuples[i].pattern))
		{
			text = text.replace(new RegExp(replacementTuples[i].pattern, 'g'), replacementTuples[i].value);
		}
	}
	return text;
}

// The big list of commands
function performCommand(command)
{
	// Commands command
	if (command[0] === '!?')
	{
		addSystemMessage('[hangouts+]: !block user<br>[hangouts+]: !unblock user<br>[hangouts+]: !purgemode [on/off]<br>[hangouts+]: !emoticons [on/off]<br>[hangouts+]: !clear<br>[hangouts+]: !blacklist [clear]<br>[hangouts+]: !highlight regExp<br>[hangouts+]: !unhighlight regExp<br>[hangouts+]: !highlights [clear]<br>[hangouts+]: !replace regExp replacement<br>[hangouts+]: !replacements<br>[hangouts+]: !selectivehearing [on/off]<br>[hangouts+]: !alert regExp soundURL<br>[hangouts+]: !alerts<br>[hangouts+]: !factoryreset');
	}
	// Blacklist block command
	else if (command[0] === '!block')
	{
		var merged = '';
		for (var i = 1; i < command.length; i++)
		{
			merged += ' ' + command[i];
		}
		merged = merged.substr(1);
		if (command[1] && chatBlacklist.indexOf(merged) == -1)
		{
			chatBlacklist.push(merged);
			addSystemMessage('[hangouts+]: Blocked user ' + merged + '.');
		}
	}
	// Blacklist unblock command
	else if (command[0] === '!unblock')
	{
		var merged = '';
		for (var i = 1; i < command.length; i++)
		{
			merged += ' ' + command[i];
		}
		merged = merged.substr(1);
		if (command[1] && chatBlacklist.indexOf(merged) != -1)
		{
			chatBlacklist.splice(chatBlacklist.indexOf(merged), 1);
			addSystemMessage('[hangouts+]: Unblocked user ' + merged);
		}
	}
	// Replacements replace command
	/* Handles adding, updating, and removing replacements */
	else if (command[0] === '!replace')
	{
		var merged = '';
		for (var i = 2; i < command.length; i++)
		{
			merged += ' ' + command[i];
		}
		merged = merged.substr(1);
		if (command[1])
		{
			if (replacementPatterns.indexOf(command[1]) == -1)
			{
				replacementPatterns.push(command[1]);
				replacementValues.push(merged);
				addSystemMessage('[hangouts+]: Added replacement pattern ' + command[1] + ' to ' + merged);
			}
			else if (replacementPatterns.indexOf(command[1]) != -1)
			{
				if (!merged || merged.length == 0)
				{
					replacementValues.splice(replacementPatterns.indexOf(command[1]), 1);
					replacementPatterns.splice(replacementPatterns.indexOf(command[1]), 1);
					addSystemMessage('[hangouts+]: Removed replacement pattern ' + command[1] + ' to ' + merged);
				}
				else
				{
					replacementPatterns[replacementPatterns.indexOf(command[1])] = command[1];
					replacementValues[replacementPatterns.indexOf(command[1])] = merged;
					addSystemMessage('[hangouts+]: Updated replacement pattern ' + command[1] + ' to ' + merged);
				}
			}
		}
		else
		{
			addSystemMessage('[hangouts+]: Incomplete command.');
		}
	}
	// Sounds alert command
	/* Handles adding, updating, and removing sound alerts */
	else if (command[0] === '!alert')
	{
		var merged = '';
		for (var i = 2; i < command.length; i++)
		{
			merged += ' ' + command[i];
		}
		merged = merged.substr(1);
		if (command[1])
		{
			if (soundMatchPatterns.indexOf(command[1]) == -1)
			{
				soundMatchPatterns.push(command[1]);
				soundMatchURLs.push(merged);
				addSystemMessage('[hangouts+]: Added alert ' + command[1] + ' plays ' + merged);
			}
			else if (soundMatchPatterns.indexOf(command[1]) != -1)
			{
				if (!merged || merged.length == 0)
				{
					soundMatchURLs.splice(soundMatchPatterns.indexOf(command[1]), 1);
					soundMatchPatterns.splice(soundMatchPatterns.indexOf(command[1]), 1);
					addSystemMessage('[hangouts+]: Removed alert ' + command[1] + ' no longer plays ' + merged);
				}
				else
				{
					soundMatchPatterns[soundMatchPatterns.indexOf(command[1])] = command[1];
					soundMatchURLs[soundMatchPatterns.indexOf(command[1])] = merged;
					addSystemMessage('[hangouts+]: Updated alert ' + command[1] + ' plays ' + merged);
				}
			}
		}
		else
		{
			addSystemMessage('[hangouts+]: Incomplete command.');
		}
	}
	// Replacements list replacements command
	else if (command[0] === '!replacements')
	{
		if (replacementPatterns.length == 0)
		{
			addSystemMessage('[hangouts+]: No replacement patterns exist.');
		}
		else
		{
			addSystemMessage('[hangouts+]: Replacement patterns:');
			for (var i = 0; i < replacementPatterns.length; i++)
			{
				addSystemMessage('\t' + replacementPatterns[i] + ' to ' + replacementValues[i]);
			}
		}
	}
	// Sound alerts list alerts command
	else if (command[0] === '!alerts')
	{
		if (soundMatchPatterns.length == 0)
		{
			addSystemMessage('[hangouts+]: No alerts exist.');
		}
		else
		{
			addSystemMessage('[hangouts+]: Alerts:');
			for (var i = 0; i < soundMatchPatterns.length; i++)
			{
				addSystemMessage('\t' + soundMatchPatterns[i] + ' to ' + soundMatchURLs[i]);
			}
		}
	}
	// Highlights command
	/* Handles listing ans clearing all highlights , as well as changing highlight colour */
	else if (command[0] === '!highlights')
	{
		if (highlightMatchPatterns.length == 0)
		{
			addSystemMessage('[hangouts+]: No highlight patterns.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				while (highlightMatchPatterns.length > 0)
				{
					highlightMatchPatterns.pop();
				}
				addSystemMessage('[hangouts+]: Highlight patterns cleared.');
			}
			// Deprecated
			/*else if (command[1] === 'trim')
			{
				for (var i = 0; i < highlightMatchPatterns.length; i++)
				{
					highlightMatchPatterns[i] = highlightMatchPatterns[i].trim();
				}
				addSystemMessage('[hangouts+]: Highlight patterns trimmed.');
			}*/
			else if (command[1] === 'color')
			{
				if (command.length > 2)
				{
					highlightColor = command[2];
					addSystemMessage('[hangouts+]: Highlight color changed to ' + command[2] + '.');
				}
				else
				{
					addSystemMessage('[hangouts+]: Color parameter missing. Highlight color was not changed.');
				}
			}
			else
			{
				var highlightPatterns = '';
				for (var i = 0; i < highlightMatchPatterns.length; i++)
				{
					highlightPatterns += ',' + highlightMatchPatterns[i];
				}
				highlightPatterns = highlightPatterns.substr(1);
				addSystemMessage('[hangouts+]: Highlight patterns: ' + highlightPatterns);
			}
		}
	}
	// Highlights add highlight command
	else if (command[0] === '!highlight')
	{
		var merged = '';
		for (var i = 1; i < command.length; i++)
		{
			merged += command[i];
		}
		var exists = false;
		if (merged.length > 0 && merged != "")
		{
			if (highlightMatchPatterns.indexOf(merged) == -1)
			{
				highlightMatchPatterns.push(merged);
				addSystemMessage("[hangouts+]: " + merged + ' added to the highlight list.');
			}
			else
			{
				addSystemMessage("[hangouts+]: " + merged + ' is already present in the highlight list.');
			}
		}
		else
		{
			addSystemMessage("[hangouts+]: Incomplete command.");
		}
	}
	// Highlights remove highlight command
	else if (command[0] === '!unhighlight')
	{
		var merged = '';
		for (var i = 1; i < command.length; i++)
		{
			merged += command[i];
		}
		if (merged.length > 0 && merged != "")
		{
			if (highlightMatchPatterns.indexOf(merged) != -1)
			{
				highlightMatchPatterns.splice(highlightMatchPatterns.indexOf(merged), 1);
				addSystemMessage("[hangouts+]: " + merged + ' removed from the highlight list.');
			}
			else
			{
				addSystemMessage("[hangouts+]: " + merged + ' is not present in the highlight list.');
			}
		}
		else
		{
			addSystemMessage("[hangouts+]: Incomplete command.");
		}
	}
	// Black list purge mode command
	/* Handles toggling and viewing status of purge mode */
	else if (command[0] === '!purgemode')
	{
		if (command[1] === 'on')
		{
			purgeBlacklistedMessages = true;
			addSystemMessage('[hangouts+]: Purge mode enabled.');
		}
		else if (command[1] === 'off')
		{
			purgeBlacklistedMessages = false;
			addSystemMessage('[hangouts+]: Purge mode disabled.');
		}
		else
		{
			if (purgeBlacklistedMessages)
			{
				addSystemMessage('[hangouts+]: Purge mode is on.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Purge mode is off.');
			}
		}
	}
	// Blacklist selective hearing command
	/* Handles toggling and viewing status of selective hearing */
	else if (command[0] === '!selectivehearing')
	{
		if (command[1] === 'on')
		{
			selectiveHearing = true;
			addSystemMessage('[hangouts+]: Selective hearing enabled.');
		}
		else if (command[1] === 'off')
		{
			selectiveHearing = false;
			addSystemMessage('[hangouts+]: Selective hearing disabled.');
		}
		else
		{
			if (selectiveHearing)
			{
				addSystemMessage('[hangouts+]:Selective hearing is on.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Selective hearing is off.');
			}
		}
	}
	// Chat clear command
	else if (command[0] === '!clear')
	{
		if (chat)
		{
			chat.innerHTML = '';
			addSystemMessage('[hangouts+]: Chat has been cleared.');
		}
	}
	// Blacklist list command
	/* Handles listing and clearing the blacklist */
	else if (command[0] === '!blacklist')
	{
		if (chatBlacklist.length == 0)
		{
			addSystemMessage('[hangouts+]: No blacklisted users.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				while (chatBlacklist.length > 0)
				{
					chatBlacklist.pop();
				}
				addSystemMessage('[hangouts+]: Blacklist cleared.');
			}
			else
			{
				var blacklistedUsers = '';
				for (var i = 0; i < chatBlacklist.length; i++)
				{
					blacklistedUsers += ',' + chatBlacklist[i];
				}
				blacklistedUsers = blacklistedUsers.substr(1);
				addSystemMessage('[hangouts+]: Blacklisted users: ' + blacklistedUsers);
			}
		}
	}
	// Emoticons command
	/* Handles toggling and viewing status of emoticons */
	else if (command[0] === '!emoticons')
	{
		if (command[1] === 'on')
		{
			disableEmoticons = false;
		}
		else if (command[1] === 'off')
		{
			disableEmoticons = true;
		}
		else
		{
			if (disableEmoticons)
			{
				addSystemMessage('[hangouts+]: Emoticons are on.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Emoticons are off.');
			}
		}
	}
	// Reset all the preferences back to factory defaults
	else if ( command[0] === '!factoryreset')
	{
		clearPreferences();
		addSystemMessage('[hangouts+]: Preferences cleared. Refresh to load defaults.');
	}
	// The command didn't exist
	else
	{
		addSystemMessage('[hangouts+]: Invalid command.');
	}
	savePreferences();
}
// Tracks if the chat blacklist was properly initialized
var chatInit = false;

// Tracks if the commands were properly initialized
var textAreaInit = false;

// Tracks if the user has manually scrolled the scrollbar
/* There is currently an issue where this is set to true outside of normal conditions */
var fixedScrolling = false;

// Keeps track of where the scrollbar is
var fixedScrollingPosition = 0;

// The main observer used to load and intialize the script
var hangoutObserver = new MutationObserver(function(mutations)
{
	// Chat initialization
	if (!chatInit)
	{
		chat = document.querySelector('.pq-pA');
		chat.onscroll = function()
		{
			if (enableScrollingFix)
			{
				if (chat.scrollTop != chat.scrollHeight - chat.clientHeight)
				{
					fixedScrolling = true;
					fixedScrollingPosition = chat.scrollTop;
				}
				else
				{
					fixedScrolling = false;
				}
			}
		}
		if (chat && chatObserver)
		{
			chatObserver.observe(chat,
			{
				attributes: true,
				childList: true,
				characterData: true
			});
			chatInit = true;
		}
	}

	// Text area initialization
	if (!textAreaInit)
	{
		textArea = document.querySelector('.Zj');
		if (textArea)
		{
			console.log(textArea);
			textArea.onkeydown = function(event)
			{
				if (event.shiftKey)
				{
					if (event.which == 13)
					{
						textArea.value = textArea.value + '\n';
						return false;
					}
				}
				else if (event.which == 13)
				{
					if (textArea.value[0] == '!')
					{
						var command = textArea.value.split(' ');
						performCommand(command);
						textArea.value = '';
						return false;
					}
					else
					{
						textArea.value = parseInputText(textArea.value);
					}
				}
			}
			textAreaInit = true;
		}
	}
	if (chatInit && textAreaInit)
	{
		loadPreferences();
		// Focus the text area when the window becomes focused
		$(window).focus(function()
		{
			if (focusChatFromBlur)
			{
				textArea.focus();
			}
		});
		hangoutObserver.disconnect();
		addSystemMessage('[hangouts+]: Plugin initialized.');
	}
});
hangoutObserver.disconnect();
hangoutObserver.observe(document.querySelector('body'),
{
	attributes: true,
	childList: true,
	characterData: true
});