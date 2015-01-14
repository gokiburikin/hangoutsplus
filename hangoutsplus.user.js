// ==UserScript==
// @name        google hangouts+
// @namespace   https://plus.google.com/hangouts/*
// @include     https://plus.google.com/hangouts/*
// @description Improvements to Google Hangouts
// @version     2.06
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://raw.githubusercontent.com/hazzik/livequery/master/dist/jquery.livequery.min.js
// @downloadURL https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js
// ==/UserScript==

// User preferences
/* Most of these settings are meant to be edited using the commands while in google hangouts.
To access a list of commands, enter the command !? into the chat. */

function initializeVariables()
{
	/* It's not suggested that you actually change anything here. Use the script commands to make changes
	to the data stored here instead. */

	// Chat message blacklist. Use full names.
	chatBlacklist = [];

	// When true users on the blacklist have their messages completely removed without a trace.
	// When false, their entry will appear in the chatbox, but their message will be replaced with "<message deleted>"
	purgeBlacklistedMessages = false;

	// When true, emulates a twitch.tv style of deleting messages, allowing the user to click them to reveal what was said.
	selectiveHearing = true;

	// Keeps scroll position until you scroll back down.
	enableScrollingFix = true;

	// Disable emoticons
	disableEmoticons = true;

	// User Aliases
	aliases = [];

	// Word highlighting
	highlights = [];
	highlightSoundFilePath = 'https://www.gstatic.com/chat/sounds/hangout_alert_cc041792a9494bf2cb95e160aae459fe.mp3';

	// supports #000, #FFFFFF, and rgba(r,g,b,a) as STRING colors
	highlightColor = 'rgba(0,128,255,0.2)';

	// Uses the colour of usernames as the background colour
	invertNameColor = false;

	// Word sound alerting. Use Regular Expression
	soundAlerts = [];

	// Focus chat text area when the window regains focus
	focusChatFromBlur = true;

	// Replace certain words in your message before they're sent

	replacements = [];
}

// * Do not edit below this line * //

// Saves the preferences to local storage
function savePreferences()
{
	try
	{
		if (localStorageTest())
		{
			localStorage.setItem('scriptVersion', JSON.stringify(scriptVersion));
			localStorage.setItem('aliases', JSON.stringify(aliases));
			localStorage.setItem('blacklist', JSON.stringify(chatBlacklist));
			localStorage.setItem('highlights', JSON.stringify(highlights));
			localStorage.setItem('replacements', JSON.stringify(replacements));
			localStorage.setItem('soundAlerts', JSON.stringify(soundAlerts));
			localStorage.setItem('highlightColor', JSON.stringify(highlightColor));
			localStorage.setItem('selectiveHearing', JSON.stringify(selectiveHearing));
			localStorage.setItem('purgeMode', JSON.stringify(purgeBlacklistedMessages));
			localStorage.setItem('enableScrollingFix', JSON.stringify(enableScrollingFix));
		}
	}
	catch (exception)
	{
		console.log("[hangouts+]: Failed to save preferences.");
	}
}

// Loads the preferences from local storage, if they exist
function loadPreferences()
{
	try
	{
		var results = '';
		if (localStorageTest())
		{
			// 1.43 is for the first version that the scriptVersion was introduced
			currentVersion = tryLoadPreference('scriptVersion', 1.43);
			aliases = tryLoadPreference('aliases', []);
			blacklist = tryLoadPreference('blacklist', []);
			highlights = tryLoadPreference('highlights', []);
			replacements = tryLoadPreference('replacements', []);
			soundAlerts = tryLoadPreference('soundAlerts', []);
			highlightColor = tryLoadPreference('highlightColor', highlightColor);
			selectiveHearing = tryLoadPreference('selectiveHearing', selectiveHearing);
			purgeBlacklistedMessages = tryLoadPreference('purgeMode', purgeBlacklistedMessages);
			enableScrollingFix = tryLoadPreference('enableScrollingFix', enableScrollingFix);
			migrate(currentVersion, scriptVersion);

			results = 'Loaded ' + blacklist.length + ' blacklist entries, ';
			results += highlights.length + ' highlights, ';
			results += replacements.length + ' replacements, and ';
			results += soundAlerts.length + ' sound alerts.';
		}
		else
		{
			currentVersion = 0.00;
		}
		addSystemMessage('[hangouts+]:' + results);
		loadCustomEmoticonList();
		loadCustomEmojiList();
	}
	catch (exception)
	{
		console.log("[hangouts+]: Failed to load preferences.");
	}
}


// Clears the preferences from local storage
function clearPreferences()
{
	localStorage.removeItem('blacklist');
	localStorage.removeItem('aliases');
	localStorage.removeItem('highlights');
	localStorage.removeItem('replacements');
	localStorage.removeItem('soundAlerts');
	localStorage.removeItem('highlightColor');
	localStorage.removeItem('selectiveHearing');
	localStorage.removeItem('purgeMode');
	localStorage.removeItem('enableScrollingFix');
}

function migrate(currentVersion, scriptVersion)
{
	if (currentVersion == 1.43)
	{
		try
		{
			if (localStorageTest())
			{
				var soundMatchPatterns = tryLoadPreference('soundMatchPatterns', null);
				var soundMatchURLs = tryLoadPreference('soundMatchURLs', null);
				if (soundMatchPatterns != null && soundMatchURLs != null)
				{
					for (var i = 0; i < soundMatchPatterns.length; i++)
					{
						soundAlerts.push(
						{
							'pattern': soundMatchPatterns[i],
							'url': soundMatchURLs[i]
						});
					}
					localStorage.removeItem('soundMatchPatterns');
					localStorage.removeItem('soundMatchURLs');
				}

				var replacementPatterns = tryLoadPreference('replacementPatterns', null);
				var replacementValues = tryLoadPreference('replacementValues', null);
				if (replacementPatterns != null && replacementValues != null)
				{
					for (var i = 0; i < replacementPatterns.length; i++)
					{
						replacements.push(
						{
							'pattern': replacementPatterns[i],
							'replacement': replacementValues[i]
						});
					}
					localStorage.removeItem('replacementPatterns');
					localStorage.removeItem('replacementValues');
				}

				var highlightMatchPatterns = tryLoadPreference('highlightMatchPatterns', null);
				if (highlightMatchPatterns != null)
				{
					for (var i = 0; i < highlightMatchPatterns.length; i++)
					{
						highlights.push(highlightMatchPatterns[i]);
					}
					localStorage.removeItem('highlightMatchPatterns');
				}
			}
			addSystemMessage('[hangouts+]: Migrated from ' + currentVersion + ' to ' + scriptVersion + '.');
		}
		catch (exception)
		{
			addSystemMessage('[hangouts+]: Migration from ' + currentVersion + ' to ' + scriptVersion + ' failed.');
		}
	}
	else
	{
		addSystemMessage('[hangouts+]: No migration.');
	}
}

// Attempt to find and parse a user preference. If it fails, use the default value.
function tryLoadPreference(preference, defaultValue)
{
	var output = defaultValue;
	if (localStorage.getItem(preference))
	{
		output = JSON.parse(localStorage.getItem(preference));
	}
	return output;
}

// Test if localstorage is available
// From http://modernizr.com/
function localStorageTest()
{
	var test = 'test';
	try
	{
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	}
	catch (e)
	{
		return false;
	}
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
	var div = newChatLineSystemMessage(message);
	if (chat)
	{
		chat.appendChild(div);
		scrollChatToBottom();
	}
	return div;
}

// The chat mutation observer
/* This watches for any children added to the main chat area div. Based on what it is, it will parse
the message to purge, highlight, or play sounds. Blacklisted messages are not added to the chat area when 
purgemode is enabled. */
var chatObserver = new MutationObserver(function (mutations)
{
	mutations.forEach(function (mutation)
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
						// Retrieves the container of the users name
						var chatMessageSender = chatMessage.childNodes[0].childNodes[1].childNodes[0].childNodes[0];
						if (invertNameColor)
						{
							var color = chatMessageSender.style.backgroundColor;
							chatMessageSender.style.backgroundColor = chatMessageSender.style.color;
							chatMessageSender.style.color = color;

						}
						for (var j = 0; j < aliases.length; j++)
						{
							if (aliases[j].user === chatMessageSender.childNodes[0].nodeValue)
							{
								chatMessageSender.childNodes[0].nodeValue = aliases[j].replacement;
							}
						}
						// Retrieves the container of the text message
						// This can contain multiple child text nodes
						var chatMessageMessage = chatMessage.childNodes[0].childNodes[1].childNodes[1];
						handleNewMessage(node, chatMessageSender.childNodes[0], chatMessageMessage);
						if (popoutChatWindow != null)
						{
							popoutChatAddMessage(chatMessageSender.innerHTML, chatMessageMessage.innerHTML, chatMessageSender.style.color);
						}
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
var lastMessageObserver = new MutationObserver(function (mutations)
{
	mutations.forEach(function (mutation)
	{
		for (var i = 0; i < mutation.addedNodes.length; i++)
		{
			var node = mutation.addedNodes[i];
			handleNewMessage(lastMessageNode, lastMessageNode.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0], node);
			if (popoutChatWindow != null)
			{
				popoutChatAddMessage(lastMessageNode.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].nodeValue, node.innerHTML, lastMessageNode.childNodes[0].childNodes[1].childNodes[0].childNodes[0].style.color);
			}
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
	if (enableScrollingFix)
	{
		scrollChatToBottom();
		if (popoutChatWindow != null)
		{
			popoutChatWindowMessageArea.scrollTop = popoutChatWindowMessageArea.scrollHeight - popoutChatWindowMessageArea.clientHeight;
		}
		if (fixedScrolling)
		{
			chat.scrollTop = fixedScrollingPosition;
		}
	}
}

// Scrolls the chat to the very bottom
function scrollChatToBottom()
{
	chat.scrollTop = chat.scrollHeight - chat.clientHeight;
}

// Checks if the chat is scrolled to the bottom
// Doesn't use abs... because it wasn't working...
function isChatScrolledToBottom()
{
	var isAtBottom = false;
	var difference = chat.scrollTop - (chat.scrollHeight - chat.clientHeight);
	if (difference < 0)
	{
		difference *= -1;
	}
	if (difference < scrollAtBottomThreshold)
	{
		isAtBottom = true;
	}
	return isAtBottom;
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
	if (highlights.length > 0)
	{
		var hasPlayed = false;
		if (!hasPlayed)
		{
			for (var i = 0; i < highlights.length; i++)
			{
				for (var j = 0; j < chatMessageMessage.childNodes.length; j++)
				{
					if (chatMessageMessage.childNodes[j].nodeType == 3)
					{
						var message = chatMessageMessage.childNodes[j].nodeValue;
						if (regexMatch(message, highlights[i]))
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
	for (var j = 0; j < blacklist.length; j++)
	{
		if (blacklist[j].toLowerCase() == chatMessageSender.nodeValue.toLowerCase())
		{
			if (!purgeBlacklistedMessages)
			{

				if (selectiveHearing)
				{
					var deletedMessage = document.createElement("a");
					var originalMessage = chatMessageMessage.innerHTML;
					deletedMessage.innerHTML = '&lt;message deleted&gt';
					deletedMessage.onclick = (function ()
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
	for (var i = 0; i < soundAlerts.length; i++)
	{
		var hasPlayed = false;
		if (!hasPlayed)
		{
			for (var j = 0; j < chatMessageMessage.childNodes.length; j++)
			{
				if (chatMessageMessage.childNodes[j].nodeType == 3)
				{
					var message = chatMessageMessage.childNodes[j].nodeValue;
					if (regexMatch(message, soundAlerts[i].pattern))
					{
						var audio = new Audio(soundAlerts[i].url);
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
		var nodes = chatMessageMessage.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++)
		{
			var node = nodes[i];
			var parent = node.parentNode;
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
					parent.insertBefore(replacementNode, node);
					parent.removeChild(node);
				}
			}
		}
	}

	// Custom emoticons
	// This section should be reworked eventually to not use innerHTML
	// Might also be missing some cases
	if (customEmoticons)
	{
		parseForEmoticons([removeWordBreaks(chatMessageMessage)]);
	}
}

// Parses the text that is inside the text area for replacements
function parseInputText(text)
{
	// Replacements
	var replacementTuples = [];
	for (var i = 0; i < replacements.length; i++)
	{
		replacementTuples.push(
		{
			'pattern': replacements[i].pattern,
			'replacement': replacements[i].replacement
		});
	}
	replacementTuples.sort(function (a, b)
	{
		return b.pattern.length - a.pattern.length;
	});

	var originalText = text;
	for (var i = 0; i < replacementTuples.length; i++)
	{
		try
		{
			if (regexMatch(text, replacementTuples[i].pattern))
			{
				text = text.replace(new RegExp(replacementTuples[i].pattern, 'g'), replacementTuples[i].replacement);
			}
		}
		catch (exception)
		{
			addSystemMessage("replacement failed on " + replacementTuples[i].pattern + ". Probably malformed regex: " + replacementTuples[i].replacement);
			text = originalText;
			break;
		}
	}

	return text;
}

// This function parses chat message nodes for replacement entries in the customEmoticonData array
// and restructures the DOM to replace those entries with the matching image
// Takes some time when the picture is not in cache
function parseForEmoticons(nodes)
{
	while (nodes.length > 0)
	{
		var node = nodes[0];
		if (node.nodeType == 3)
		{
			var nodeValue = node.nodeValue;
			for (var i = 0; i < customEmoticonData.length; i++)
			{
				var emoticon = customEmoticonData[i];
				var matchIndex = nodeValue.indexOf(emoticon.replacement);
				if (matchIndex != -1)
				{
					var image = document.createElement('img');
					image.src = emoticon.url;
					image.style.width = emoticon.width;
					image.style.height = emoticon.height;
					image.title = emoticon.replacement;
					image.alt = emoticon.replacement;
					image.onload = function ()
					{
						if (!fixedScrolling)
						{
							scrollChatToBottom();
						}
					}

					var before = document.createTextNode(nodeValue.substr(0, matchIndex));
					var after = document.createTextNode(nodeValue.substr(matchIndex + emoticon.replacement.length));
					node.parentNode.insertBefore(before, node);
					node.parentNode.insertBefore(image, node);
					node.parentNode.insertBefore(after, node);
					nodes.push(before);
					nodes.push(after);
					node.parentNode.removeChild(node);
					break;
				}
			}
		}
		else
		{
			for (var j = 0; j < node.childNodes.length; j++)
			{
				nodes.push(node.childNodes[j]);
			}
		}
		nodes.shift();
	}
}

// The big list of commands
function performCommand(command)
{
	// Commands command
	if (command[0] === '!?')
	{
		var commands = [
			'clear',
			'block user',
			'unblock user',
			'blacklist [clear]',
			'purgemode [on/off]',
			'emoticons [on/off]',
			'scrollfix [on/off]',
			'selective [on/off]',
			'highlight regExp',
			'unhighlight regExp',
			'highlights [clear]',
			'highlightcolor htmlValidColor',
			'replace regExp [replacement]',
			//'unreplace regExp',
			'replacements [clear]',
			'alert regExp [soundURL]',
			//'unalert regExp',
			'alerts [clear]',
			'refreshemoticons',
			'refreshemojis',
			//'popout'
			'raw message',
			'alias username @ replacement',
			'!scripturl'
		];
		for (var i = 0; i < commands.length; i++)
		{
			addSystemMessage('[hangouts+]: !' + commands[i]);
		}
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
		if (command[1] && blacklist.indexOf(merged) == -1)
		{
			blacklist.push(merged);
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
		if (command[1] && blacklist.indexOf(merged) != -1)
		{
			blacklist.splice(blacklist.indexOf(merged), 1);
			addSystemMessage('[hangouts+]: Unblocked user ' + merged + '.');
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
			var replacementIndex = -1;
			for (var i = 0; i < replacements.length; i++)
			{
				if (replacements[i].pattern === command[1])
				{
					replacementIndex = i;
					break;
				}
			}
			if (replacementIndex == -1 && command[2])
			{
				replacements.push(
				{
					'pattern': command[1],
					'replacement': merged
				});
				addSystemMessage('[hangouts+]: Added replacement pattern ' + command[1] + ' to ' + merged + '.');
			}
			else
			{
				if (!merged || merged.length == 0)
				{
					replacements.splice(replacementIndex, 1);
					addSystemMessage('[hangouts+]: Removed replacement pattern ' + command[1] + '.');
				}
				else
				{
					replacements[replacementIndex].replacement = merged;
					addSystemMessage('[hangouts+]: Updated replacement pattern ' + command[1] + ' to ' + merged + '.');
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
			var soundAlertIndex = -1;
			for (var i = 0; i < soundAlerts.length; i++)
			{
				if (soundAlerts[i].pattern === command[1])
				{
					soundAlertIndex = i;
					break;
				}
			}
			if (soundAlertIndex == -1 && command[2])
			{
				soundAlerts.push(
				{
					'pattern': command[1],
					'url': merged
				});
				addSystemMessage('[hangouts+]: Added alert ' + command[1] + ' plays ' + merged + '.');
			}
			else
			{
				if (!merged || merged.length == 0)
				{
					soundAlerts.splice(soundAlertIndex, 1);
					addSystemMessage('[hangouts+]: Removed alert ' + command[1] + ' no longer plays ' + merged + '.');
				}
				else
				{
					soundAlerts[soundAlertIndex].url = merged;
					addSystemMessage('[hangouts+]: Updated alert ' + command[1] + ' plays ' + merged + '.');
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
		if (replacements.length == 0)
		{
			addSystemMessage('[hangouts+]: No replacement patterns exist.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				replacements = [];
				addSystemMessage('[hangouts+]: Replacements cleared.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Replacement patterns:');
				for (var i = 0; i < replacements.length; i++)
				{
					addSystemMessage('\t' + replacements[i].pattern + ' to ' + replacements[i].replacement);
				}
			}
		}
	}
	// Sound alerts list alerts command
	else if (command[0] === '!alerts')
	{
		if (soundAlerts.length == 0)
		{
			addSystemMessage('[hangouts+]: No alerts exist.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				soundAlerts = [];
				addSystemMessage('[hangouts+]: Alerts cleared.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Alerts:');
				for (var i = 0; i < soundAlerts.length; i++)
				{
					addSystemMessage('\t' + soundAlerts[i].pattern + ' to ' + soundAlerts[i].url);
				}
			}
		}
	}
	// Alias command
	/* Handles adding, updating, and removing aliases */
	else if (command[0] === '!alias')
	{
		var split = -1;
		for (var i = 1; i < command.length; i++)
		{
			if (command[i] === '@')
			{
				split = i;
			}
		}
		var fullUserName = command[1];
		for (var i = 2; i < split; i++)
		{
			fullUserName += ' ' + command[i];
		}
		var merged = '';
		for (var i = split + 1; i < command.length; i++)
		{
			merged += ' ' + command[i];
		}
		merged = merged.substr(1);
		if (split > 0 && command.length > split)
		{
			var aliasIndex = -1;
			for (var i = 0; i < aliases.length; i++)
			{
				if (aliases[i].user === fullUserName)
				{
					aliasIndex = i;
					break;
				}
			}
			if (aliasIndex == -1)
			{
				aliases.push(
				{
					'user': fullUserName,
					'replacement': merged
				});
				addSystemMessage('[hangouts+]: Added alias ' + fullUserName + ' to ' + merged + '.');
			}
			else
			{
				if (!merged || merged.length == 0)
				{
					aliases.splice(aliasIndex, 1);
					addSystemMessage('[hangouts+]: Removed alias ' + fullUserName + '.');
				}
				else
				{
					aliases[aliasIndex].replacement = merged;
					addSystemMessage('[hangouts+]: Updated alias ' + fullUserName + ' now ' + merged + '.');
				}
			}
		}
		else
		{
			addSystemMessage('[hangouts+]: Incomplete command.');
		}
	}
	// Aliases list or clear aliases
	else if (command[0] === '!aliases')
	{
		if (aliases.length == 0)
		{
			addSystemMessage('[hangouts+]: No aliases exist.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				aliases = [];
				addSystemMessage('[hangouts+]: Aliases cleared.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Aliases:');
				for (var i = 0; i < aliases.length; i++)
				{
					addSystemMessage('\t' + aliases[i].user + ' to ' + aliases[i].replacement);
				}
			}
		}
	}
	// Highlights command
	/* Handles listing and clearing all highlights */
	else if (command[0] === '!highlights')
	{
		if (highlights.length == 0)
		{
			addSystemMessage('[hangouts+]: No highlight patterns.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				highlights = [];
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
			else
			{
				var highlightPatterns = '';
				for (var i = 0; i < highlights.length; i++)
				{
					highlightPatterns += ',' + highlights[i];
				}
				highlightPatterns = highlightPatterns.substr(1);
				addSystemMessage('[hangouts+]: Highlight patterns: ' + highlightPatterns);
			}
		}
	}
	// Highlight color command
	// Handles changing the highlight colour
	else if (command[0] === '!highlightcolor')
	{
		if (command.length > 1)
		{
			highlightColor = command[1];
			var div = addSystemMessage('[hangouts+]: Highlight color changed to ' + command[1] + '.');
			div.style.backgroundColor = command[1];
		}
		else
		{
			addSystemMessage('[hangouts+]: Color parameter missing. Highlight color was not changed.');
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
			if (highlights.indexOf(merged) == -1)
			{
				highlights.push(merged);
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
			if (highlights.indexOf(merged) != -1)
			{
				highlights.splice(highlights.indexOf(merged), 1);
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
	// Blacklist purge mode command
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
				addSystemMessage('[hangouts+]: Purge mode is enabled.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Purge mode is disabled.');
			}
		}
	}

	// Blacklist selective hearing command
	/* Handles toggling and viewing status of selective hearing */
	else if (command[0] === '!selective')
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
				addSystemMessage('[hangouts+]: Selective hearing is enabled.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Selective hearing is disabled.');
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
		if (blacklist.length == 0)
		{
			addSystemMessage('[hangouts+]: No blacklisted users.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				chatBlacklistAdditions = [];
				addSystemMessage('[hangouts+]: Blacklist cleared.');
			}
			else
			{
				var blacklistedUsers = '';
				for (var i = 0; i < blacklist.length; i++)
				{
					blacklistedUsers += ',' + blacklist[i];
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
	// Scrolling fix
	/* Handles toggling and viewing status of the scrolling fix */
	else if (command[0] === '!scrollfix')
	{
		if (command[1] === 'on')
		{
			enableScrollingFix = true;
			addSystemMessage('[hangouts+]: Scrolling fix enabled.');
		}
		else if (command[1] === 'off')
		{
			enableScrollingFix = false;
			addSystemMessage('[hangouts+]: Scrolling fix disabled.');
		}
		else
		{
			if (enableScrollingFix)
			{
				addSystemMessage('[hangouts+]: Scrolling fix is enabled.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Scrolling fix is disabled.');
			}
		}
	}
	// Reset all the preferences back to factory defaults
	else if (command[0] === '!factoryreset')
	{
		clearPreferences();
		initializeVariables();
		addSystemMessage('[hangouts+]: Preferences cleared.');
	}
	// Load the list of custom emoticons again
	else if (command[0] === '!refreshemoticons')
	{
		loadCustomEmoticonList();
	}
	// Load the list of custom emojis again
	else if (command[0] === '!refreshemojis')
	{
		loadCustomEmojiList();
	}
	else if (command[0] === '!import')
	{
		var merged = '';
		for (var i = 2; i < command.length; i++)
		{
			merged += command[i];
		}
		if (command[1] === 'replacements')
		{
			if (merged)
			{
				try
				{
					var imports = JSON.parse(merged);
					for (var i = 0; i < imports.length; i++)
					{
						if (imports[i].pattern != null && imports[i].replacement != null)
						{
							var replacementIndex = -1;
							for (var j = 0; j < replacements.length; j++)
							{
								if (replacements[j].pattern === imports[i].pattern)
								{
									replacementIndex = j;
									break;
								}
							}
							if (replacementIndex == -1)
							{
								replacements.push(imports[i]);
							}
							else
							{
								replacements[replacementIndex].replacement = imports[i].replacement;
							}
						}
					}
					addSystemMessage('[hangouts+]: Imported replacements.');
				}
				catch (exception)
				{
					addSystemMessage('[hangouts]+: Could not parse input.');
				}
			}
		}
		else if (command[1] === 'alerts')
		{
			if (merged)
			{
				try
				{
					var imports = JSON.parse(merged);
					for (var i = 0; i < imports.length; i++)
					{
						if (imports[i].pattern != null && imports[i].url != null)
						{
							var alertIndex = -1;
							for (var j = 0; j < soundAlerts.length; j++)
							{
								if (soundAlerts[j].pattern === imports[i].pattern)
								{
									alertIndex = j;
									break;
								}
							}
							if (alertIndex == -1)
							{
								soundAlerts.push(imports[i]);
							}
							else
							{
								soundAlerts[alertIndex].url = imports[i].url;
							}
						}
					}
					addSystemMessage('[hangouts+]: Imported alerts.');
				}
				catch (exception)
				{
					addSystemMessage('[hangouts]+: Could not parse input.');
				}
			}
		}
	}
	// Reset all the preferences back to factory defaults
	else if (command[0] === '!popout')
	{
		initializePopoutChat();
	}
	// Pastes the scripts url into the textarea
	else if (command[0] === '!scripturl')
	{
		textArea.value = 'https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js';
	}
	// The command didn't exist
	else
	{
		addSystemMessage('[hangouts+]: Invalid command.');
	}
	savePreferences();
}


// The main observer used to load and intialize the script
var hangoutObserver = new MutationObserver(function (mutations)
{
	// Chat initialization
	if (!chatInit)
	{
		chat = document.querySelector('.pq-pA');
		if (chat && chatObserver)
		{
			chatObserver.observe(chat,
			{
				attributes: true,
				childList: true,
				characterData: true
			});
			chat.onscroll = function ()
			{
				if (enableScrollingFix)
				{
					textArea.placeholder = 'Enter chat message or link here';
					if (!isChatScrolledToBottom())
					{
						fixedScrolling = true;
						fixedScrollingPosition = chat.scrollTop;
						textArea.placeholder = 'The chat is scrolled up.';
					}
					else
					{
						fixedScrolling = false;
					}
				}
			}
			chatInit = true;
		}
	}

	// Text area initialization
	if (!textAreaInit)
	{
		textArea = document.querySelector('.Zj');
		if (textArea)
		{
			textArea.onkeydown = function (event)
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
					if (textArea.value.substr(0, 5) != '!raw ')
					{
						if (textArea.value[0] === '!')
						{
							var command = textArea.value.split(' ');
							textArea.value = '';
							performCommand(command);
							return false;
						}
						textArea.value = parseInputText(textArea.value);
					}
					else
					{
						textArea.value = textArea.value.substr(5);
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
		$(window).focus(function ()
		{
			if (focusChatFromBlur)
			{
				textArea.focus();
			}
		});
		hangoutObserver.disconnect();
		initializeCustomInterfaceElements();
		addSystemMessage('[hangouts+]: Plugin initialized. Type !? for a list of commands.');
	}
});
initializeVariables();
hangoutObserver.disconnect();
hangoutObserver.observe(document.querySelector('body'),
{
	attributes: true,
	childList: true,
	characterData: true
});

// Variable initialization

// Keeps track of the most up to date version of the script
var scriptVersion = 2.06;

// The version stored in user preferences.
var currentVersion = 0.00;

// Tracks if the chat blacklist was properly initialized
var chatInit = false;

// Tracks if the commands were properly initialized
var textAreaInit = false;

// Tracks if the user has manually scrolled the scrollbar
/* There is currently an issue where this is set to true outside of normal conditions */
var fixedScrolling = false;

// Keeps track of where the scrollbar is
var fixedScrollingPosition = 0;

// The actual chat area div
var chat;

// The text area used to send chat messages
var textArea;

// The node of the last received chat message
/* This is used as a mutation observer object because hangouts does not make a new div in the main chat
window when the same user posts multiple messages before another user or system message is received */
var lastMessageNode;

// The amount of distance between the bottom of the scrollbar and the scroll position that can be assumed at the bottom
var scrollAtBottomThreshold = 12;

// Placeholders
var chatBlacklist;
var purgeBlacklistedMessages;
var selectiveHearing;
var enableScrollingFix;
var disableEmoticons;
var focusChatFromBlur;
var highlightSoundFilePath;
var highlightColor;
var soundAlerts;
var replacements;
var highlights;

var optionsChatButton;
var emoticonsChatButton;
var emoticonsPanel;
var replacementsChatButton;

// Function for removing the wbr elements hangouts automatically adds after every 10th character in a word
function removeWordBreaks(node)
{
	for (var i = 0; i < node.childNodes.length; i++)
	{
		var childNode = node.childNodes[i];
		if (childNode.nodeName === 'WBR')
		{
			if (childNode.previousSibling.nodeType == 3 && childNode.nextSibling.nodeType == 3)
			{
				childNode.previousSibling.nodeValue += childNode.nextSibling.nodeValue;
				node.removeChild(childNode.nextSibling);
				i--;
			}
			node.removeChild(childNode);
		}
	}
	return node;
}

// Custom Emoticons
var customEmoticons = true;

var customEmoticonData = [];
var customEmojiData = [];

function loadCustomEmoticonList()
{
	var listUrl = 'https://dl.dropboxusercontent.com/u/12577282/cnd/emoticonList.txt';
	try
	{
		jQuery.get(listUrl, function (data)
		{
			var emoticonTable = document.getElementById('emoticonTable');
			while (emoticonTable && emoticonTable.childNodes.length > 0)
			{
				emoticonTable.removeChild(emoticonTable.childNodes[0]);
			}
			customEmoticonData = JSON.parse(data);
			for (var i = 0; i < customEmoticonData.length; i++)
			{
				addEmoticonEntry(customEmoticonData[i]);
			}
			addSystemMessage('[hangouts+]: Loaded ' + customEmoticonData.length + ' custom emoticons.');
		});
	}
	catch (exception)
	{
		customEmoticonData = [];
		addSystemMessage('[hangouts+]: Loaded no custom emoticons.');
	}
}

function loadCustomEmojiList()
{
	var listUrl = 'https://dl.dropboxusercontent.com/u/12577282/cnd/emojiList.txt';
	try
	{
		jQuery.get(listUrl, function (data)
		{
			var emojiTable = document.getElementById('emojiTable');
			while (emojiTable && emojiTable.childNodes.length > 0)
			{
				emojiTable.removeChild(emojiTable.childNodes[0]);
			}
			customEmojiData = JSON.parse(data);
			for (var i = 0; i < customEmojiData.length; i++)
			{
				addEmojiEntry(customEmojiData[i]);
			}
			addSystemMessage('[hangouts+]: Loaded ' + customEmojiData.length + ' custom emojis.');
		});
	}
	catch (exception)
	{
		customEmojiData = [];
		addSystemMessage('[hangouts+]: Loaded no custom emojis.');
	}
}

function initializeCustomInterfaceElements()
{
	emoticonsPanel = initializeEmoticonsPanel();
	emojiPanel = initializeEmojiPanel();
	emoticonsChatButton = addCustomChatButton('https://dl.dropboxusercontent.com/u/12577282/cnd/emoticons_icon.png');
	emojiChatButton = addCustomChatButton('https://dl.dropboxusercontent.com/u/12577282/cnd/replacements_icon.png');

	emoticonsChatButton.onclick = function ()
	{
		toggleDiv(emoticonsPanel, 'block');
	}
	emojiChatButton.onclick = function ()
	{
		toggleDiv(emojiPanel, 'block');
	}

	$(document).on('click', function (event)
	{
		if (!$(event.target).closest('#emoticonTable').length && !$(event.target).closest(emoticonsChatButton).length)
		{
			emoticonsPanel.style.display = 'none';
		}
	});

	$(document).on('click', function (event)
	{
		if (!$(event.target).closest('#emojiTable').length && !$(event.target).closest(emojiChatButton).length)
		{
			emojiPanel.style.display = 'none';
		}
	});
}

function addEmoticonEntry(emote)
{
	var container = document.createElement('div');
	var image = document.createElement('img');
	image.src = emote.url;
	image.style.maxWidth = '50px';
	image.style.maxHeight = '50px';
	image.style.cursor = 'pointer';
	image.style.margin = '2px';
	image.style.padding = '2px';
	image.onclick = function ()
	{
		textArea.value += emote.replacement;
		toggleDiv(emoticonsPanel, 'block');
		textArea.focus();
	}
	container.appendChild(image);
	container.style.display = 'inline';
	document.getElementById('emoticonTable').appendChild(container);
}

function initializeEmoticonsPanel()
{
	var panel = document.createElement('div');
	panel.id = 'emoticonTable';
	panel.style.width = '500px';
	panel.style.height = '300px';
	panel.style.position = 'fixed';
	panel.style.right = '40px';
	panel.style.bottom = '20px';
	panel.style.marginLeft = '-500px';
	panel.style.marginTop = '-300px';
	panel.style.backgroundColor = '#fff';
	panel.style.zIndex = '9001';
	panel.style.border = '1px solid #666';
	panel.style.overflowY = 'auto';
	panel.style.overflowX = 'hidden';
	panel.style.display = 'none';
	document.body.appendChild(panel);
	return panel;
}

function addEmojiEntry(emoji)
{
	var link = document.createElement('div');
	link.style.cursor = 'pointer';
	link.style.padding = '4px';
	link.style.border = '1px solid #666';
	link.style.display = 'inline-block';
	link.style.width = '30%';
	link.style.fontSize = '12px';
	link.style.lineHeight = '20px';
	link.appendChild(document.createTextNode(emoji));
	link.onclick = function (event)
	{
		textArea.value += event.target.childNodes[0].nodeValue;
		toggleDiv(emojiPanel, 'block');
		textArea.focus();
	}
	document.getElementById('emojiTable').appendChild(link);
}

function initializeEmojiPanel()
{
	var panel = document.createElement('div');
	panel.id = 'emojiTable';
	panel.style.width = '500px';
	panel.style.height = '300px';
	panel.style.position = 'fixed';
	panel.style.right = '20px';
	panel.style.bottom = '20px';
	panel.style.marginLeft = '-500px';
	panel.style.marginTop = '-300px';
	panel.style.backgroundColor = '#fff';
	panel.style.zIndex = '9001';
	panel.style.border = '1px solid #666';
	panel.style.overflowY = 'auto';
	panel.style.overflowX = 'hidden';
	panel.style.display = 'none';
	document.body.appendChild(panel);
	return panel;
}

function addCustomChatButton(imageUrl)
{
	var chatButtonContainer = $('[aria-label="Emoticon Picker"]')[0].parentNode;
	var customButton = document.createElement('div');
	customButton.className = 'Kc-Qt-b-m';
	var customButtonDiv = document.createElement('div');
	customButtonDiv.style.width = '18px';
	customButtonDiv.style.height = '18px';
	customButtonDiv.style.cursor = 'pointer';
	customButtonDiv.style.background = 'url(' + imageUrl + ')';
	customButton.appendChild(customButtonDiv);
	chatButtonContainer.appendChild(customButton);
	return customButton;
}

function toggleDiv(element, standardDisplay)
{
	if (element.style.display === 'none')
	{
		element.style.display = standardDisplay;
	}
	else
	{
		element.style.display = 'none';
	}
}

// Experimental Popout Chat Feature

// Popout Chat Window
var popoutChatWindow = null;
var popoutChatWindowMessageArea = null;
var popoutChatWindowTextArea = null;

initializePopoutChat = function ()
{
	try
	{
		popoutChatWindow = window.open('about:blank', 'popoutChat', 'width=200,height=400');
		var style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode('' +
			'.message { display: inline; } ' +
			'.messageContainer { padding: 2px; } ' +
			'.messageArea { background-color: #EEE; overflow-y: auto; overflow-x: hidden; position: absolute; bottom: 54px; top: 0px; width: 100%;  } ' +
			'.textArea { font-size: 12px; position: absolute; bottom: 0px; overflow: hidden; height: 54px; width: 100%; margin: 0; padding: 0; border: 1px solid rgba(0,0,0,0.2); resize: none; font-family: "Roboto","Arial"; } ' +
			'html, body { font-size: 12px; width: 100%; height: 100%; padding: 0; margin: 0; font-family: "Roboto","Arial"; } ' +
			'html, body { overflow: hidden; } '
		));
		popoutChatWindow.onload = function ()
		{
			popoutChatWindow.document.getElementsByTagName('html')[0].appendChild(style);
			popoutChatWindowMessageArea = popoutChatWindow.document.createElement('div');
			popoutChatWindowMessageArea.className = 'messageArea';
			popoutChatWindowTextArea = popoutChatWindow.document.createElement('textarea');
			popoutChatWindowTextArea.className = 'textArea';
			popoutChatWindow.document.body.appendChild(popoutChatWindowMessageArea);
			popoutChatWindow.document.body.appendChild(popoutChatWindowTextArea);
			popoutChatWindowTextArea.onkeydown = textArea.onkeydown;
			popoutChatWindowTextArea.onkeyup = textArea.onkeyup;
			popoutChatWindowTextArea.oninput = textArea.oninput;
			popoutChatWindowTextArea.onkeypress = textArea.onkeypress;
			addSystemMessage('[hangouts+]: Popout chat initialized.');
		}
	}
	catch (exception)
	{
		addSystemMessage('hangouts+]: Error creating initializing popout chat window.');
	}
}

popoutChatAddMessage = function (sender, message, senderColor)
{
	var messageContainerDiv = popoutChatWindow.document.createElement("div");
	var messageDiv = popoutChatWindow.document.createElement("div");
	var nameSpan = popoutChatWindow.document.createElement("span");
	if (senderColor != null)
	{
		nameSpan.style.color = senderColor;
		nameSpan.style.display = 'inline';
	}
	nameSpan.appendChild(popoutChatWindow.document.createTextNode(sender + ' : '));
	messageDiv.innerHTML = message;
	messageDiv.className = 'message';
	messageContainerDiv.appendChild(nameSpan);
	messageContainerDiv.appendChild(messageDiv);
	messageContainerDiv.className = 'messageContainer';
	popoutChatWindowMessageArea.appendChild(messageContainerDiv);
}