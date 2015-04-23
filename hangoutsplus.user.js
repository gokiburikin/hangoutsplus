// ==UserScript==
// @name        google hangouts+
// @namespace   https://plus.google.com/hangouts/*
// @include     https://plus.google.com/hangouts/*
// @description Improvements to Google Hangouts
// @version     3.04
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://raw.githubusercontent.com/hazzik/livequery/master/dist/jquery.livequery.min.js
// @downloadURL https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js
// ==/UserScript==
// TODO: Just run the command when clicking sound buttons

// User preferences
/* Most of these settings are meant to be edited using the commands while in google hangouts.
To access a list of commands, enter the command !? into the chat. */

var hangoutsPlus = {};

// Keeps track of the most up to date version of the script
hangoutsPlus.scriptVersion = 3.04;

function initializeVariables()
{
	/* It's not suggested that you actually change anything here. Use the script commands to make changes
	to the data stored here instead. */

	// Chat message blacklist. Use full names.
	hangoutsPlus.chatBlacklist = [];

	// When true users on the blacklist have their messages completely removed without a trace.
	// When false, their entry will appear in the chatbox, but their message will be replaced with "<message deleted>"
	hangoutsPlus.purgeBlacklistedMessages = false;

	// When true, emulates a twitch.tv style of deleting messages, allowing the user to click them to reveal what was said.
	hangoutsPlus.selectiveHearing = true;

	// Keeps scroll position until you scroll back down.
	hangoutsPlus.scrollingFix = true;

	// Disable emoticons
	hangoutsPlus.emoticons = false;

	// User Aliases
	hangoutsPlus.aliases = [];

	// Enable avatars
	hangoutsPlus.avatars = true;

	// Word highlighting
	hangoutsPlus.highlights = [];
	hangoutsPlus.highlightSoundFilePath = 'https://www.gstatic.com/chat/sounds/hangout_alert_cc041792a9494bf2cb95e160aae459fe.mp3';

	// supports #000, #FFFFFF, and rgba(r,g,b,a) as STRING colors
	hangoutsPlus.highlightColor = 'rgba(0,128,255,0.2)';

	// Uses the colour of usernames as the background colour
	hangoutsPlus.invertNameColor = false;

	// Word sound alerting. Use Regular Expression
	hangoutsPlus.soundAlerts = [];

	// Focus chat text area when the window regains focus
	hangoutsPlus.focusChatFromBlur = true;

	// Replace certain words in your message before they're sent
	hangoutsPlus.replacements = [];

	// Input history
	hangoutsPlus.saveInputHistory = true;
	hangoutsPlus.inputHistory = [];

	hangoutsPlus.autoDisableMic = true;
	hangoutsPlus.autoDisableCam = true;
}

// * Do not edit below this line * //

// Saves the preferences to local storage
function savePreferences()
{
	try
	{
		if (localStorageTest())
		{
			localStorage.setItem('scriptVersion', JSON.stringify(hangoutsPlus.scriptVersion));
			localStorage.setItem('aliases', JSON.stringify(hangoutsPlus.aliases));
			localStorage.setItem('blacklist', JSON.stringify(hangoutsPlus.chatBlacklist));
			localStorage.setItem('emoticons', JSON.stringify(hangoutsPlus.emoticons));
			localStorage.setItem('highlights', JSON.stringify(hangoutsPlus.highlights));
			localStorage.setItem('replacements', JSON.stringify(hangoutsPlus.replacements));
			localStorage.setItem('soundAlerts', JSON.stringify(hangoutsPlus.soundAlerts));
			localStorage.setItem('highlightColor', JSON.stringify(hangoutsPlus.highlightColor));
			localStorage.setItem('selectiveHearing', JSON.stringify(hangoutsPlus.selectiveHearing));
			localStorage.setItem('purgeMode', JSON.stringify(hangoutsPlus.purgeBlacklistedMessages));
			localStorage.setItem('scrollingFix', JSON.stringify(hangoutsPlus.scrollingFix));
			localStorage.setItem('saveInputHistory', JSON.stringify(hangoutsPlus.saveInputHistory));
			localStorage.setItem('avatars', JSON.stringify(hangoutsPlus.avatars));
			localStorage.setItem('autoDisableMic', JSON.stringify(hangoutsPlus.autoDisableMic));
			localStorage.setItem('autoDisableCam', JSON.stringify(hangoutsPlus.autoDisableCam));
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
			hangoutsPlus.currentVersion = tryLoadPreference('scriptVersion', 1.43);
			hangoutsPlus.aliases = tryLoadPreference('aliases', []);
			hangoutsPlus.chatBlacklist = tryLoadPreference('blacklist', []);
			hangoutsPlus.highlights = tryLoadPreference('highlights', []);
			hangoutsPlus.replacements = tryLoadPreference('replacements', []);
			hangoutsPlus.soundAlerts = tryLoadPreference('soundAlerts', []);
			hangoutsPlus.highlightColor = tryLoadPreference('highlightColor', hangoutsPlus.highlightColor);
			hangoutsPlus.selectiveHearing = tryLoadPreference('selectiveHearing', hangoutsPlus.selectiveHearing);
			hangoutsPlus.purgeBlacklistedMessages = tryLoadPreference('purgeMode', hangoutsPlus.purgeBlacklistedMessages);
			hangoutsPlus.scrollingFix = tryLoadPreference('scrollingFix', hangoutsPlus.scrollingFix);
			hangoutsPlus.saveInputHistory = tryLoadPreference('saveInputHistory', hangoutsPlus.saveInputHistory);
			hangoutsPlus.avatars = tryLoadPreference('avatars', hangoutsPlus.avatars);
			hangoutsPlus.emoticons = tryLoadPreference('emoticons', hangoutsPlus.emoticons);
			hangoutsPlus.autoDisableCam = tryLoadPreference('autoDisableCam', hangoutsPlus.autoDisableCam);
			hangoutsPlus.autoDisableMic = tryLoadPreference('autoDisableMic', hangoutsPlus.autoDisableMic);
			//migrate(hangoutsPlus.currentVersion, hangoutsPlus.scriptVersion);

			results = ' Loaded ' + hangoutsPlus.chatBlacklist.length + ' blacklist entries, ';
			results += hangoutsPlus.highlights.length + ' highlights, ';
			results += hangoutsPlus.replacements.length + ' replacements, and ';
			results += hangoutsPlus.soundAlerts.length + ' sound alerts.';
		}
		else
		{
			hangoutsPlus.currentVersion = 0.00;
		}
		addSystemMessage('[hangouts+]:' + results);
		loadCustomEmoticonList();
		loadCustomEmojiList();
		loadCustomSoundsList();
	}
	catch (exception)
	{
		console.log("[hangouts+]: Failed to load preferences: " + exception.message);
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
	localStorage.removeItem('scrollingFix');
	localStorage.removeItem('saveInputHistory');
	localStorage.removeItem('avatars');
	localStorage.removeItem('emoticons');
	localStorage.removeItem('autoDisableMic');
	localStorage.removeItem('autoDisableCam');
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
						hangoutsPlus.soundAlerts.push(
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
						hangoutsPlus.replacements.push(
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
						hangoutsPlus.highlights.push(highlightMatchPatterns[i]);
					}
					localStorage.removeItem('highlightMatchPatterns');
				}
			}
			addSystemMessage('[hangouts+]: Migrated from ' + hangoutsPlus.currentVersion + ' to ' + hangoutsPlus.scriptVersion + '.');
		}
		catch (exception)
		{
			addSystemMessage('[hangouts+]: Migration from ' + hangoutsPlus.currentVersion + ' to ' + hangoutsPlus.scriptVersion + ' failed.');
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
	if (hangoutsPlus.chat)
	{
		hangoutsPlus.chat.appendChild(div);
		scrollChatToBottom();
	}
	return div;
}

// If the scroll fix is enabled and the user has scrolled, keep the scroll bar in place
/* Hangouts always scrolls the chat to the maximum when a new message arrives. This is called after 
the mutation observer so that after hangouts scrolls to the bottom, this scrolls back up to where it
was. */
function scrollFix()
{
	if (hangoutsPlus.scrollingFix)
	{
		scrollChatToBottom();
		if (hangoutsPlus.fixedScrolling)
		{
			hangoutsPlus.chat.scrollTop = hangoutsPlus.fixedScrollingPosition;
		}
	}
}

// Scrolls the chat to the very bottom
function scrollChatToBottom()
{
	hangoutsPlus.chat.scrollTop = hangoutsPlus.chat.scrollHeight - hangoutsPlus.chat.clientHeight;
}

// Checks if the chat is scrolled to the bottom
function isChatScrolledToBottom()
{
	var isAtBottom = false;
	var difference = Math.abs(hangoutsPlus.chat.scrollTop - (hangoutsPlus.chat.scrollHeight - hangoutsPlus.chat.clientHeight));

	if (difference < hangoutsPlus.scrollAtBottomThreshold)
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

// The chat mutation observer
/* This watches for any children added to the main chat area div. Based on what it is, it will parse
the message to purge, highlight, or play sounds. Blacklisted messages are not added to the chat area when 
purgemode is enabled. */

// /me notes
/* The Kc-Ma-m style must:
	unset white-space: nowrap;
	unset text-overflow: ellipsis
	unset overflow: hidden

	The action must be spanned with:
	font-weight: initial;

	The original message node must be removed and the innerHTML must
	be copied over to the same DIV as the user's name
*/
var chatObserver = new MutationObserver(function (mutations)
{
	mutations.forEach(function (mutation)
	{
		// For each mutation to the chat window
		for (var i = 0; i < mutation.addedNodes.length; i++)
		{
			var node = mutation.addedNodes[i];

			// Ensure the mutation has not be nulled
			if (node)
			{
				// If it's a line break don't bother with the other stuff
				if (node.classList.contains('Kc-Nd'))
				{
					hangoutsPlus.chat.removeChild(node);
				}
				else
				{
					// Kc-Va-m is the avatar container class
					if (node.childNodes[0] && node.childNodes[0].childNodes[0] && node.childNodes[0].childNodes[0].classList.contains('Kc-Va-m'))
					{
						node.avatarContainer = node.childNodes[0].childNodes[0];
					}
					if (node.childNodes[0] && node.childNodes[0].childNodes[1])
					{
						if (node.childNodes[0].childNodes[1].childNodes[0] && node.childNodes[0].childNodes[1].childNodes[0].childNodes[0])
						{
							node.senderContainer = node.childNodes[0].childNodes[1].childNodes[0].childNodes[0];
						}
						if (node.childNodes[0].childNodes[1].childNodes[1])
						{
							node.messageContainer = node.childNodes[0].childNodes[1].childNodes[1];
						}
					}

					// Kc-we is the message DIV containing everything about an individual user's consecutive messages
					// If the node is Kc-we, then start tracking observing it for consecutive messages and disconnect the previous observer
					// See lastMessageObserver
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
						newMessageMutationHandler(node);
					}
				}
			}
		}
		scrollFix();
	});
});

// The last message mutation observer
/* This must be used in order to capture and alter messages sent by the same person in succession,
as the top level mutation observer will not capture changes to its children.

Mutation edit handling has been separated into two functions.

This function is what is called when a user speaks without being interrupted by another message.*/
var lastMessageObserver = new MutationObserver(function (mutations)
{
	mutations.forEach(function (mutation)
	{
		for (var i = 0; i < mutation.addedNodes.length; i++)
		{
			var node = mutation.addedNodes[i];
			// The handleNewMessage functions contains edits that can be done even if it's not the first time a user speaks
			node.messageContainer = node;
			node.senderContainer = lastMessageNode.senderContainer;
			handleNewMessage(node);
		}
		scrollFix();
	});
});

/* This function is what is called when a user speaks for the first time since another user or message type
has been received. Aliases, name colour, and removal of avatars happens here. */
var newMessageMutationHandler = function (node)
{
	if (!hangoutsPlus.avatars)
	{
		// node is Kc-we
		// node.firstChild Kc.Oc
		// node.firstChild.firstChild is Kc.Va.m
		// This should remove the entire avatar container, aligning the message to the left
		try
		{
			node.avatarContainer.parentNode.removeChild(node.avatarContainer);
			node.style.borderTop = '1px dashed';
			node.style.paddingBottom = '4px';
			node.style.paddingTop = '2px';
		}
		catch (ex)
		{}
	}

	// Retrieves the container of the users name
	if (hangoutsPlus.invertNameColor)
	{
		var color = node.senderContainer.style.backgroundColor;
		node.senderContainer.style.backgroundColor = node.senderContainer.style.color;
		node.senderContainer.style.color = color;

	}
	for (var j = 0; j < hangoutsPlus.aliases.length; j++)
	{
		// node.senderContainer.childNodes[0] is the user name text node
		if (hangoutsPlus.aliases[j].user === node.senderContainer.childNodes[0].nodeValue)
		{
			node.senderContainer.childNodes[0].nodeValue = hangoutsPlus.aliases[j].replacement;
		}
	}

	// Retrieves the container of the text message
	// This can contain multiple child text nodes
	handleNewMessage(node);
}

var consecutiveMessageMutationHandler = function (node)
{
	// Retrieves the container of the text message
	// This can contain multiple child text nodes
	handleNewMessage(node);
}

// Handles new messages
/* This function handles changes that happen on messages regardless of
if they are the first message sent by the user:
	Parsing for emoticons
	Blacklisting
	Playing sounds
	Highlighting */
function handleNewMessage(node)
{
	if (node.messageContainer)
	{
		removeWordBreaks(node.messageContainer);
	}
	// Highlights
	try
	{
		if (hangoutsPlus.highlights.length > 0 && node.messageContainer)
		{
			var hasPlayed = false;
			if (!hasPlayed)
			{
				for (var i = 0; i < hangoutsPlus.highlights.length; i++)
				{
					for (var j = 0; j < node.messageContainer.childNodes.length; j++)
					{
						if (node.messageContainer.childNodes[j].nodeType == 3)
						{
							var message = node.messageContainer.childNodes[j].nodeValue;
							if (regexMatch(message, hangoutsPlus.highlights[i]))
							{
								node.messageContainer.style.backgroundColor = hangoutsPlus.highlightColor;
								var audio = new Audio(hangoutsPlus.highlightSoundFilePath);
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
	}
	catch (exception)
	{
		console.log('[hangouts+]: Error handling highlight: ' + exception.message);
	}

	// Blacklist
	try
	{
		for (var j = 0; j < hangoutsPlus.chatBlacklist.length; j++)
		{
			if (hangoutsPlus.chatBlacklist[j].toLowerCase() == node.senderContainer.firstChild.nodeValue.toLowerCase())
			{
				if (!hangoutsPlus.purgeBlacklistedMessages)
				{
					if (hangoutsPlus.selectiveHearing)
					{
						var deletedMessage = document.createElement("a");
						var originalMessage = node.messageContainer.innerHTML;
						deletedMessage.innerHTML = '&lt;message deleted&gt';
						deletedMessage.onclick = (function ()
						{
							deletedMessage.innerHTML = originalMessage;
						})
						node.messageContainer.innerHTML = '';
						node.messageContainer.appendChild(deletedMessage);
					}
					else
					{
						node.messageContainer.innerHTML = '&lt;message deleted&gt;';
					}
				}
				else
				{
					hangoutsPlus.chat.removeChild(node);
				}
			}
		}
	}
	catch (exception)
	{
		console.log('[hangouts+]: Error handling blacklist: ' + exception.message);
	}

	try
	{
		// Sounds
		if (node.messageContainer)
		{
			for (var i = 0; i < hangoutsPlus.soundAlerts.length; i++)
			{
				var hasPlayed = false;
				if (!hasPlayed)
				{
					for (var j = 0; j < node.messageContainer.childNodes.length; j++)
					{
						if (node.messageContainer.childNodes[j].nodeType == 3)
						{
							var message = node.messageContainer.childNodes[j].nodeValue;
							if (regexMatch(message, hangoutsPlus.soundAlerts[i].pattern))
							{
								var audio = new Audio(hangoutsPlus.soundAlerts[i].url);
								audio.play();
								hasPlayed = true;
							}
						}
					}
				}
			}
		}
	}
	catch (exception)
	{
		console.log('[hangouts+]: Error handling sounds: ' + exception.message);
	}

	try
	{
		// Emoticons
		if (!hangoutsPlus.emoticons && node.messageContainer)
		{

			var nodes = node.messageContainer.getElementsByTagName("*");
			for (var i = 0; i < nodes.length; i++)
			{
				var subnode = nodes[i];
				var parent = subnode.parentNode;
				/* Google handles emoticons in a very straight forward, consistent manner:
			Emoticons are IMG elements with ALT tags.
			The ALT tag is always the text that is replaced with the image, so just re-replace it.*/
				if (subnode.tagName == 'IMG')
				{
					if (subnode.alt)
					{
						var replacementText = subnode.alt;
						var replacementNode = document.createElement('text');
						replacementNode.innerHTML = replacementText;
						parent.insertBefore(replacementNode, subnode);
						parent.removeChild(subnode);
					}
				}
			}
		}
	}
	catch (exception)
	{
		console.log('[hangouts+]: Error handling emoticons: ' + exception.message);
	}

	try
	{
		if (node.messageContainer && node.messagecontainer.nodeValue.substr(0, 3) === "/me")
		{
			var actionSpan = $('<span style="font-weight:initial;">');
			actionSpan.append(document.createTextNode(node.messageContainer.substr(2)));
			node.messageContainer.appendChild(actionSpan[0]);
		}
	}
	catch (ex)
	{

	}

	// Custom emoticons
	if (hangoutsPlus.customEmoticons)
	{
		parseForEmoticons([node]);
	}

}

// Parses the text that is inside the text area for replacements
function parseInputText(text)
{
	// Replacements
	var replacementTuples = [];
	for (var i = 0; i < hangoutsPlus.replacements.length; i++)
	{
		replacementTuples.push(
		{
			'pattern': hangoutsPlus.replacements[i].pattern,
			'replacement': hangoutsPlus.replacements[i].replacement
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

var updatingEmoticonList = [];
var updateEmoticons = function ()
{
	for (var i = 0; i < updatingEmoticonList.length; i++)
	{

		var image = updatingEmoticonList[i];
		if (image.transform.shaking != null)
		{
			image.transform.translateX = Math.round(Math.random() * image.transform.shaking * 2 - image.transform.shaking);
			image.transform.translateY = Math.round(Math.random() * image.transform.shaking * 2 - image.transform.shaking);
		}
		if (image.transform.rotation != null)
		{
			image.transform.rotation += image.transform.rotating;
		}
		image.style.transform = "scaleX(" + image.transform.scaleX + ") ";
		image.style.transform += "scaleY(" + image.transform.scaleY + ") ";
		image.style.transform += "translateX(" + image.transform.translateX + "px) ";
		image.style.transform += "translateY(" + image.transform.translateY + "px) ";
		image.style.transform += "rotate(" + image.transform.rotation + "deg) ";
	}
}

// This function parses chat message nodes for replacement entries in the customEmoticonData array
// and restructures the DOM to replace those entries with the matching image
// Takes some time when the picture is not in cache
function parseForEmoticons(nodes)
{
	try
	{
		while (nodes.length > 0)
		{
			var node = nodes[0];
			if (node.nodeType == 3)
			{
				var nodeValue = node.nodeValue;
				// Array of emoticon modifiers
				var modifiers = ["$h", "$v", "$s+", "$s-", "$r+", "$r-", "$t"];
				for (var i = 0; i < hangoutsPlus.customEmoticonData.length; i++)
				{
					var emoticon = hangoutsPlus.customEmoticonData[i];
					var matchIndex = nodeValue.indexOf(emoticon.replacement);
					// matchIndex is the index at which the emoticons replacement was found
					if (matchIndex != -1)
					{
						// lengthAdjustment is used to splice the modifier characters out of the message
						var lengthAdjustment = 0;

						// Array of modifiers for this emoticon
						var activeModifiers = [];
						// The image element that will be replacing the emoticon text
						var image = document.createElement('img');
						image.src = emoticon.url;
						image.style.width = emoticon.width;
						image.style.height = emoticon.height;
						image.title = emoticon.replacement;
						image.alt = emoticon.replacement;

						var modifiedEmoticonText = emoticon.replacement;
						var modifiedIndex = matchIndex + emoticon.replacement.length;

						var searchForModifiers = true;
						while (searchForModifiers)
						{
							for (var j = 0; j < modifiers.length;)
							{
								if (modifiedIndex >= nodeValue.length)
								{
									searchForModifiers = false;
									break;
								}
								if (nodeValue.indexOf(modifiers[j], modifiedIndex) === modifiedIndex)
								{
									lengthAdjustment += modifiers[j].length;
									activeModifiers.push(modifiers[j]);
									modifiedIndex += modifiers[j].length;

									j = 0;
									continue;
								}
								j++;
								if (j == modifiers.length - 1)
								{
									searchForModifiers = false;
								}
							}
						}

						// Modifier variables
						var scaleX = 1.0;
						var scaleY = 1.0;
						image.transform = {};
						for (var j = 0; j < activeModifiers.length; j++)
						{
							switch (activeModifiers[j])
							{
							case "$h":
								scaleX *= -1;
								break;
							case "$v":
								scaleY *= -1;
								break;
							case "$s-":
								scaleX *= .25;
								scaleY *= .25;
								break;
							case "$s+":
								scaleX *= 1.25;
								scaleY *= 1.25;
								break;
							case "$t":
								if (image.transform.shaking == null)
								{
									image.transform.shaking = 0;
								}
								image.transform.shaking++;
								image.transform.needsUpdating = true;
								break;
							case "$r+":
								if (image.transform.rotating == null)
								{
									image.transform.rotating = 0;
									image.transform.rotation = 0;
								}
								image.transform.rotating += 1;
								image.transform.needsUpdating = true;
								break;
							case "$r-":
								if (image.transform.rotating == null)
								{
									image.transform.rotating = 0;
									image.transform.rotation = 0;
								}
								image.transform.rotating -= 1;
								image.transform.needsUpdating = true;
								break;
							default:
								break;
							}
						}
						if (scaleX > 4)
						{
							scaleX = 4;
						}
						if (scaleY > 4)
						{
							scaleY = 4;
						}
						image.transform.scaleX = scaleX;
						image.transform.scaleY = scaleY;
						if (image.transform.needsUpdating == true)
						{
							updatingEmoticonList.push(image);
						}

						image.onclick = function ()
						{
							this.style.transform = "initial";
							if (updatingEmoticonList.indexOf(this) != -1)
							{
								updatingEmoticonList.splice(updatingEmoticonList.indexOf(this), 1);
							}
							this.onclick = null;
						}

						image.style.transform = "scaleX(" + image.transform.scaleX + ") ";
						image.style.transform += "scaleY(" + image.transform.scaleY + ") ";
						image.style.transform += "translateX(" + image.transform.translateX + "px) ";
						image.style.transform += "translateY(" + image.transform.translateY + "px) ";
						image.style.transform += "rotate(" + image.transform.rotation + "deg) ";

						image.onload = function ()
						{
							if (!hangoutsPlus.fixedScrolling)
							{
								scrollChatToBottom();
							}
						}

						var before = document.createTextNode(nodeValue.substr(0, matchIndex));
						var after = document.createTextNode(nodeValue.substr(matchIndex + emoticon.replacement.length + lengthAdjustment));
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
	catch (exception)
	{
		console.log('[hangouts+]: Error parsing emoticons: ' + exception.message);
	}
}

// The big list of commands
function performCommand(command)
{
	// Commands command
	if (command[0] === '!?')
	{
		var commands = [
			'alert regExp [soundURL]',
			'alerts [clear]',
			'alias username @ replacement',
			'avatars [on/off]',
			'blacklist [clear]',
			'block user',
			'clear',
			'emoticons [on/off]',
			'highlight regExp',
			'highlights [clear]',
			'highlightcolor htmlValidColor',
			'inputhistory [on/off]',
			'purgemode [on/off]',
			'raw message',
			'refreshemojis',
			'refreshemoticons',
			'replace regExp [replacement]',
			'replacements [clear]',
			'selective [on/off]',
			'scripturl',
			'scrollfix [on/off]',
			'unblock user',
			'unhighlight regExp',
			'modifiers'
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
		if (command[1] && hangoutsPlus.chatBlacklist.indexOf(merged) == -1)
		{
			hangoutsPlus.chatBlacklist.push(merged);
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
		if (command[1] && hangoutsPlus.chatBlacklist.indexOf(merged) != -1)
		{
			hangoutsPlus.chatBlacklist.splice(hangoutsPlus.chatBlacklist.indexOf(merged), 1);
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
			for (var i = 0; i < hangoutsPlus.replacements.length; i++)
			{
				if (hangoutsPlus.replacements[i].pattern === command[1])
				{
					replacementIndex = i;
					break;
				}
			}
			if (replacementIndex == -1 && command[2])
			{
				hangoutsPlus.replacements.push(
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
					hangoutsPlus.replacements.splice(replacementIndex, 1);
					addSystemMessage('[hangouts+]: Removed replacement pattern ' + command[1] + '.');
				}
				else
				{
					hangoutsPlus.replacements[replacementIndex].replacement = merged;
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
			for (var i = 0; i < hangoutsPlus.soundAlerts.length; i++)
			{
				if (hangoutsPlus.soundAlerts[i].pattern === command[1])
				{
					soundAlertIndex = i;
					break;
				}
			}
			if (soundAlertIndex == -1 && command[2])
			{
				hangoutsPlus.soundAlerts.push(
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
					hangoutsPlus.soundAlerts.splice(soundAlertIndex, 1);
					addSystemMessage('[hangouts+]: Removed alert ' + command[1] + ' no longer plays ' + merged + '.');
				}
				else
				{
					hangoutsPlus.soundAlerts[soundAlertIndex].url = merged;
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
		if (hangoutsPlus.replacements.length == 0)
		{
			addSystemMessage('[hangouts+]: No replacement patterns exist.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				hangoutsPlus.replacements = [];
				addSystemMessage('[hangouts+]: Replacements cleared.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Replacement patterns:');
				for (var i = 0; i < hangoutsPlus.replacements.length; i++)
				{
					addSystemMessage('\t' + hangoutsPlus.replacements[i].pattern + ' to ' + hangoutsPlus.replacements[i].replacement);
				}
			}
		}
	}
	// Sound alerts list alerts command
	else if (command[0] === '!alerts')
	{
		if (hangoutsPlus.soundAlerts.length == 0)
		{
			addSystemMessage('[hangouts+]: No alerts exist.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				hangoutsPlus.soundAlerts = [];
				addSystemMessage('[hangouts+]: Alerts cleared.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Alerts:');
				for (var i = 0; i < hangoutsPlus.soundAlerts.length; i++)
				{
					addSystemMessage('\t' + hangoutsPlus.soundAlerts[i].pattern + ' to ' + hangoutsPlus.soundAlerts[i].url);
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
			for (var i = 0; i < hangoutsPlus.aliases.length; i++)
			{
				if (hangoutsPlus.aliases[i].user === fullUserName)
				{
					aliasIndex = i;
					break;
				}
			}
			if (aliasIndex == -1)
			{
				hangoutsPlus.aliases.push(
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
					hangoutsPlus.aliases.splice(aliasIndex, 1);
					addSystemMessage('[hangouts+]: Removed alias ' + fullUserName + '.');
				}
				else
				{
					hangoutsPlus.aliases[aliasIndex].replacement = merged;
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
		if (hangoutsPlus.aliases.length == 0)
		{
			addSystemMessage('[hangouts+]: No aliases exist.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				hangoutsPlus.aliases = [];
				addSystemMessage('[hangouts+]: Aliases cleared.');
			}
			else
			{
				addSystemMessage('[hangouts+]: Aliases:');
				for (var i = 0; i < hangoutsPlus.aliases.length; i++)
				{
					addSystemMessage('\t' + hangoutsPlus.aliases[i].user + ' to ' + hangoutsPlus.aliases[i].replacement);
				}
			}
		}
	}
	// Highlights command
	/* Handles listing and clearing all highlights */
	else if (command[0] === '!highlights')
	{
		if (hangoutsPlus.highlights.length == 0)
		{
			addSystemMessage('[hangouts+]: No highlight patterns.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				hangoutsPlus.highlights = [];
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
				for (var i = 0; i < hangoutsPlus.highlights.length; i++)
				{
					highlightPatterns += ',' + hangoutsPlus.highlights[i];
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
			hangoutsPlus.highlightColor = command[1];
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
			if (hangoutsPlus.highlights.indexOf(merged) == -1)
			{
				hangoutsPlus.highlights.push(merged);
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
			if (hangoutsPlus.highlights.indexOf(merged) != -1)
			{
				hangoutsPlus.highlights.splice(hangoutsPlus.highlights.indexOf(merged), 1);
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
	// Blacklist list command
	/* Handles listing and clearing the blacklist */
	else if (command[0] === '!blacklist')
	{
		if (hangoutsPlus.chatBlacklist.length == 0)
		{
			addSystemMessage('[hangouts+]: No blacklisted users.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				hangoutsPlus.chatBlacklist = [];
				addSystemMessage('[hangouts+]: Blacklist cleared.');
			}
			else
			{
				var blacklistedUsers = '';
				for (var i = 0; i < hangoutsPlus.chatBlacklist.length; i++)
				{
					blacklistedUsers += ',' + hangoutsPlus.chatBlacklist[i];
				}
				blacklistedUsers = blacklistedUsers.substr(1);
				addSystemMessage('[hangouts+]: Blacklisted users: ' + blacklistedUsers);
			}
		}
	}
	// Purge mode command
	else if (command[0] === '!purgemode')
	{
		simpleToggleCommand(command, "purgeBlacklistedMessages", [
			"Purge mode now enabled.",
			"Purge mode now disabled.",
			"Purge mode is enabled.",
			"Purge mode is disabled."
		]);
	}
	// Input history command
	else if (command[0] === '!inputhistory')
	{
		simpleToggleCommand(command, "saveInputHistory", [
			"Input history now enabled.",
			"Input history now disabled.",
			"Input history is enabled.",
			"Input history is disabled."
		]);
	}

	// Blacklist selective hearing command
	else if (command[0] === '!selective')
	{
		simpleToggleCommand(command, "selectiveHearing", [
			"Selective hearing now enabled.",
			"Selective hearing now disabled.",
			"Selective hearing is enabled.",
			"Selective hearing is disabled."
		]);
	}
	// Emoticons command
	else if (command[0] === '!emoticons')
	{

		simpleToggleCommand(command, "emoticons", [
			"Emoticons are now enabled.",
			"Emoticons are now disabled.",
			"Emoticons are enabled.",
			"Emoticons are disabled."
		]);
	}
	// Scrolling fix
	else if (command[0] === '!scrollfix')
	{
		simpleToggleCommand(command, "scrollingFix", [
			"Scrolling fix enabled.",
			"Scrolling fix disabled.",
			"Scrolling fix is enabled.",
			"Scrolling fix is disabled."
		]);
	}
	// Avatar disabling 
	else if (command[0] === '!avatars')
	{
		simpleToggleCommand(command, "avatars", [
			"Avatars are now enabled.",
			"Avatars are now disabled.",
			"Avatars are enabled.",
			"Avatars are disabled."
		]);
	}
	// Auto Disable Mic Handling
	else if (command[0] === '!autodisablemic')
	{
		simpleToggleCommand(command, "autoDisableMic", [
			"Auto disabling microphone on load.",
			"Not auto disabling microphone on load.",
			"Auto disabling microphone on load.",
			"Not auto disabling microphone on load."
		]);
	}
	// Auto Disable Cam Handling
	else if (command[0] === '!autodisablecam')
	{
		simpleToggleCommand(command, "autoDisableCam", [
			"Auto disabling camera on load.",
			"Not auto disabling camera on load.",
			"Auto disabling camera on load.",
			"Not auto disabling camera on load."
		]);
	}
	// Reset all the preferences back to factory defaults
	else if (command[0] === '!factoryreset')
	{
		clearPreferences();
		initializeVariables();
		addSystemMessage('[hangouts+]: Preferences cleared.');
	}
	// Load the list of custom emoticons
	else if (command[0] === '!refreshemoticons')
	{
		loadCustomEmoticonList();
	}
	// Load the list of custom emojis
	else if (command[0] === '!refreshemojis')
	{
		loadCustomEmojiList();
	}
	// Load the list of custom sounds
	else if (command[0] === '!refreshsounds')
	{
		loadCustomSoundsList();
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
							for (var j = 0; j < hangoutsPlus.replacements.length; j++)
							{
								if (hangoutsPlus.replacements[j].pattern === imports[i].pattern)
								{
									replacementIndex = j;
									break;
								}
							}
							if (replacementIndex == -1)
							{
								hangoutsPlus.replacements.push(imports[i]);
							}
							else
							{
								hangoutsPlus.replacements[replacementIndex].replacement = imports[i].replacement;
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
							for (var j = 0; j < hangoutsPlus.soundAlerts.length; j++)
							{
								if (hangoutsPlus.soundAlerts[j].pattern === imports[i].pattern)
								{
									alertIndex = j;
									break;
								}
							}
							if (alertIndex == -1)
							{
								hangoutsPlus.soundAlerts.push(imports[i]);
							}
							else
							{
								hangoutsPlus.soundAlerts[alertIndex].url = imports[i].url;
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
	// Chat clear command
	else if (command[0] === '!clear')
	{
		if (hangoutsPlus.chat)
		{
			updatingEmoticonList = [];
			hangoutsPlus.chat.innerHTML = '';
			addSystemMessage('[hangouts+]: Chat has been cleared.');
		}
	}
	// Blacklist selective hearing command
	else if (command[0] === '!modifiers')
	{
		addSystemMessage("[hangouts+]: Usage : {emote}$h$s+$r+$t$t");
		addSystemMessage("[hangouts+]: $h : Horizontal Flip");
		addSystemMessage("[hangouts+]: $v : Vertical Flip");
		addSystemMessage("[hangouts+]: $s+ : Scale 1.25x");
		addSystemMessage("[hangouts+]: $s- : Scale 0.75x");
		addSystemMessage("[hangouts+]: $r+ : Rotation Speed +1");
		addSystemMessage("[hangouts+]: $r- : Rotation Speed -1");
		addSystemMessage("[hangouts+]: $t : Tremble +1");
	}
	// Reset all the preferences back to factory defaults

	// Pastes the scripts url into the textarea
	else if (command[0] === '!scripturl')
	{
		hangoutsPlus.textArea.value = 'https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js';
	}
	// The command didn't exist
	else
	{
		addSystemMessage('[hangouts+]: Invalid command.');
	}
	savePreferences();
}

function simpleToggleCommand(command, variable, messages)
{
	if (command[1] === 'on')
	{
		hangoutsPlus[variable] = true;
		addSystemMessage("[hangouts+]: " + messages[0]);
	}
	else if (command[1] === 'off')
	{
		hangoutsPlus[variable] = false;
		addSystemMessage("[hangouts+]: " + messages[1]);
	}
	else
	{
		if (hangoutsPlus[variable] == true)
		{
			addSystemMessage("[hangouts+]: " + messages[2]);
		}
		else
		{
			addSystemMessage("[hangouts+]: " + messages[3]);
		}
	}
}


function nextInputHistory()
{
	hangoutsPlus.inputHistoryIndex++;
	if (hangoutsPlus.inputHistoryIndex == hangoutsPlus.inputHistory.length)
	{
		hangoutsPlus.inputHistoryIndex--;
	}
	if (hangoutsPlus.inputHistory.length > 0)
	{
		hangoutsPlus.textArea.value = hangoutsPlus.inputHistory[hangoutsPlus.inputHistoryIndex];
	}
}

function previousInputHistory()
{
	hangoutsPlus.inputHistoryIndex--;
	if (hangoutsPlus.inputHistoryIndex == -2)
	{
		hangoutsPlus.inputHistoryIndex++;
	}
	else if (hangoutsPlus.inputHistory.length > 0 && hangoutsPlus.inputHistoryIndex > -1)
	{
		hangoutsPlus.textArea.value = hangoutsPlus.inputHistory[hangoutsPlus.inputHistoryIndex];
	}
}

function lastInputHistory()
{
	hangoutsPlus.inputHistoryIndex = -1;
}

function simulate(target, evtName)
{
	evt = document.createEvent("MouseEvents");
	evt.initMouseEvent(evtName, true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, target);
	target.dispatchEvent(evt);
}

function simulateClick(target)
{
	simulate(target, "mouseover");
	simulate(target, "mousedown");
	simulate(target, "mouseup");
	simulate(target, "mouseout");
}

// The main observer used to load and intialize the script
var hangoutObserver = new MutationObserver(function (mutations)
{
	// Chat initialization
	if (!hangoutsPlus.chatInit)
	{
		hangoutsPlus.chat = document.querySelector('.pq-pA');
		if (hangoutsPlus.chat && chatObserver)
		{
			chatObserver.observe(hangoutsPlus.chat,
			{
				attributes: true,
				childList: true,
				characterData: true
			});
			hangoutsPlus.chat.onscroll = function ()
			{
				if (hangoutsPlus.scrollingFix)
				{
					hangoutsPlus.textArea.placeholder = 'Enter chat message or link here';
					if (!isChatScrolledToBottom())
					{
						hangoutsPlus.fixedScrolling = true;
						hangoutsPlus.fixedScrollingPosition = hangoutsPlus.chat.scrollTop;
						hangoutsPlus.textArea.placeholder = 'The chat is scrolled up';
					}
					else
					{
						hangoutsPlus.fixedScrolling = false;
					}
				}
			}
			hangoutsPlus.chatInit = true;
		}
	}

	// Text area initialization
	if (!hangoutsPlus.textAreaInit)
	{
		hangoutsPlus.textArea = document.querySelector('.Zj');
		if (hangoutsPlus.textArea)
		{
			$(document)[0].addEventListener('keydown', function (event)
			{
				if ($(hangoutsPlus.textArea).is(":focus"))
				{
					if (hangoutsPlus.saveInputHistory && event.which == 38)
					{
						if (hangoutsPlus.textArea.value.length > 0 && hangoutsPlus.inputHistoryIndex == -1)
						{
							hangoutsPlus.inputHistory.unshift(hangoutsPlus.textArea.value);
							nextInputHistory();
						}

						nextInputHistory();

						event.useCapture = true;
						event.preventDefault();
						event.stopPropagation();
						return false;
					}
					else if (hangoutsPlus.saveInputHistory && event.which == 40)
					{
						previousInputHistory();
						event.useCapture = true;
						event.preventDefault();
						event.stopPropagation();
						return false;
					}
					$(hangoutsPlus.textArea).focus();
				}
			}, true);
			$(hangoutsPlus.textArea)[0].addEventListener('keydown', function (event)
			{
				if (event.shiftKey)
				{
					if (event.which == 13)
					{
						hangoutsPlus.textArea.value = hangoutsPlus.textArea.value + "\n";
						event.useCapture = true;
						event.preventDefault();
						event.stopPropagation();
						return false;
					}
				}
				else if (event.which == 13)
				{
					if (hangoutsPlus.saveInputHistory)
					{
						hangoutsPlus.inputHistory.unshift(hangoutsPlus.textArea.value);
						lastInputHistory();
					}
					if (hangoutsPlus.textArea.value.substr(0, 5) != '!raw ')
					{
						if (hangoutsPlus.textArea.value[0] === '!')
						{
							var command = hangoutsPlus.textArea.value.split(' ');
							hangoutsPlus.textArea.value = '';
							performCommand(command);
							return false;
						}
						hangoutsPlus.textArea.value = parseInputText(hangoutsPlus.textArea.value);
					}
					else
					{
						hangoutsPlus.textArea.value = hangoutsPlus.textArea.value.substr(5);
					}
				}

			}, true);
			hangoutsPlus.textAreaInit = true;
		}
	}

	if (hangoutsPlus.textAreaInit)
	{
		if (!hangoutsPlus.preferencesInit)
		{
			loadPreferences();
			hangoutsPlus.preferencesInit = true;
		}

		if (hangoutsPlus.autoDisableMic && !hangoutsPlus.autoDisableMicInit)
		{
			var micButton = $(".c-N-K.a-b.a-b-G.Ha-ha-Sb-b.IQ[aria-pressed=\"false\"]");
			if (micButton.length > 0)
			{
				simulateClick(micButton[0]);
				hangoutsPlus.autoDisableMicInit = true;
			}
		}

		if (hangoutsPlus.autoDisableCam && !hangoutsPlus.autoDisableCamInit)
		{
			var camButton = $(".c-N-K.a-b.a-b-G.Ha-ha-Sb-b.OQ[aria-pressed=\"false\"]");
			if (camButton.length > 0)
			{
				simulateClick(camButton[0]);
				hangoutsPlus.autoDisableCamInit = true;
			}
		}
	}

	if (hangoutsPlus.chatInit && hangoutsPlus.textAreaInit && (!hangoutsPlus.autoDisableCam || hangoutsPlus.autoDisableCamInit) && (!hangoutsPlus.autoDisableMic || hangoutsPlus.autoDisableMicInit))
	{
		// Focus the text area when the window becomes focused
		$(window).focus(function ()
		{
			if (hangoutsPlus.focusChatFromBlur)
			{
				hangoutsPlus.textArea.focus();
			}
		});
		var audio = new Audio("https://dl.dropboxusercontent.com/u/12577282/cnd/success.wav");
		audio.play();
		hangoutObserver.disconnect();
		initializeCustomInterfaceElements();
		addSystemMessage('[hangouts+]: Plugin initialized. v' + hangoutsPlus.scriptVersion + '. Type !? for a list of commands.');
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

// The version stored in user preferences
hangoutsPlus.currentVersion = 0.00;

// Tracks if the preferences have been loaded
hangoutsPlus.preferencesInit = false;

// Tracks if the chat was properly initialized
hangoutsPlus.chatInit = false;

// Tracks if the commands were properly initialized
hangoutsPlus.textAreaInit = false;

// Tracks if the mic was auto disabled properly
hangoutsPlus.autoDisableMicInit = false;

// Tracks if the cam was auto disabled properly
hangoutsPlus.autoDisableCamInit = false;

// Tracks if the user has manually scrolled the scrollbar
/* There is currently an issue where this is set to true outside of normal conditions */
hangoutsPlus.fixedScrolling = false;

// Keeps track of where the scrollbar is
hangoutsPlus.fixedScrollingPosition = 0;

// The actual chat area div
hangoutsPlus.chat;

// The text area used to send chat messages
hangoutsPlus.textArea;

// The node of the last received chat message
/* This is used as a mutation observer object because hangouts does not make a new div in the main chat
window when the same user posts multiple messages before another user or system message is received */
hangoutsPlus.lastMessageNode;

// The amount of distance between the bottom of the scrollbar and the scroll position that can be assumed at the bottom
hangoutsPlus.scrollAtBottomThreshold = 12;

// Input history
hangoutsPlus.saveInputHistory = true;
hangoutsPlus.inputHistory = [];
hangoutsPlus.inputHistoryIndex = -1;

hangoutsPlus.emoticonsChatButton;
hangoutsPlus.emojiChatButton;
hangoutsPlus.soundsChatButton;
hangoutsPlus.emoticonsPanel;
hangoutsPlus.emojiPanel;
hangoutsPlus.soundsPanel;

// Method for removing the wbr elements hangouts automatically adds after every 10th character in a word
function removeWordBreaks(node)
{
	try
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
	}
	catch (exception)
	{
		console.log("[hangouts+]: Error removing word breaks: " + exception.message);
	}
	return node;
}

// Custom Emoticons
hangoutsPlus.customEmoticons = true;
hangoutsPlus.customEmoticonData = [];
hangoutsPlus.customEmojiData = [];
hangoutsPlus.customSoundsData = [];

function loadCustomEmoticonList()
{
	var listUrl = 'https://dl.dropboxusercontent.com/u/12577282/cnd/emoticonList.json';
	try
	{
		jQuery.get(listUrl, function (data)
		{
			var emoticonTable = document.getElementById('emoticonTable');
			while (emoticonTable && emoticonTable.childNodes.length > 0)
			{
				emoticonTable.removeChild(emoticonTable.childNodes[0]);
			}
			hangoutsPlus.customEmoticonData = JSON.parse(data);
			for (var i = 0; i < hangoutsPlus.customEmoticonData.length; i++)
			{
				addEmoticonEntry(hangoutsPlus.customEmoticonData[i]);
			}
			setInterval(updateEmoticons, 32);
			addSystemMessage('[hangouts+]: Loaded ' + hangoutsPlus.customEmoticonData.length + ' custom emoticons.');
		});
	}
	catch (exception)
	{
		hangoutsPlus.customEmoticonData = [];
		addSystemMessage('[hangouts+]: Loaded no custom emoticons.');
	}
}

function loadCustomEmojiList()
{
	var listUrl = 'https://dl.dropboxusercontent.com/u/12577282/cnd/emojiList.json';
	try
	{
		jQuery.get(listUrl, function (data)
		{
			var emojiTable = document.getElementById('emojiTable');
			while (emojiTable && emojiTable.childNodes.length > 0)
			{
				emojiTable.removeChild(emojiTable.childNodes[0]);
			}
			hangoutsPlus.customEmojiData = JSON.parse(data);
			for (var i = 0; i < hangoutsPlus.customEmojiData.length; i++)
			{
				addEmojiEntry(hangoutsPlus.customEmojiData[i]);
			}
			addSystemMessage('[hangouts+]: Loaded ' + hangoutsPlus.customEmojiData.length + ' custom emojis.');
		});
	}
	catch (exception)
	{
		hangoutsPlus.customEmojiData = [];
		addSystemMessage('[hangouts+]: Loaded no custom emojis.');
	}
}

function loadCustomSoundsList()
{
	var listUrl = 'https://dl.dropboxusercontent.com/u/12577282/cnd/soundAlertList.json';
	try
	{
		jQuery.get(listUrl, function (data)
		{
			var soundsTable = document.getElementById('soundsTable');
			while (soundsTable && soundsTable.childNodes.length > 0)
			{
				soundsTable.removeChild(soundsTable.childNodes[0]);
			}
			hangoutsPlus.customSoundsData = JSON.parse(data);
			for (var i = 0; i < hangoutsPlus.customSoundsData.length; i++)
			{
				addSoundsEntry(hangoutsPlus.customSoundsData[i]);
			}
			addSystemMessage('[hangouts+]: Loaded ' + hangoutsPlus.customSoundsData.length + ' custom sounds.');
		});
	}
	catch (exception)
	{
		hangoutsPlus.customSoundsData = [];
		addSystemMessage('[hangouts+]: Loaded no custom sounds.');
	}
}

function initializeCustomInterfaceElements()
{
	hangoutsPlus.emoticonsPanel = initializeEmoticonsPanel();
	hangoutsPlus.emojiPanel = initializeEmojiPanel();
	hangoutsPlus.soundsPanel = initializeSoundsPanel();
	hangoutsPlus.emoticonsChatButton = addCustomChatButton('https://dl.dropboxusercontent.com/u/12577282/cnd/emoticons_icon.png');
	hangoutsPlus.emojiChatButton = addCustomChatButton('https://dl.dropboxusercontent.com/u/12577282/cnd/replacements_icon.png');
	hangoutsPlus.soundsChatButton = addCustomChatButton('https://dl.dropboxusercontent.com/u/12577282/cnd/sounds_icon.png');
	initializeTextInputBorder();
	initializeChatLogBorder();

	hangoutsPlus.emoticonsChatButton.onclick = function ()
	{
		toggleDiv(hangoutsPlus.emoticonsPanel, 'block');
	}
	hangoutsPlus.emojiChatButton.onclick = function ()
	{
		toggleDiv(hangoutsPlus.emojiPanel, 'block');
	}
	hangoutsPlus.soundsChatButton.onclick = function ()
	{
		toggleDiv(hangoutsPlus.soundsPanel, 'block');
	}

	$(document).on('click', function (event)
	{
		if (!$(event.target).closest('#emoticonTable').length && !$(event.target).closest(hangoutsPlus.emoticonsChatButton).length)
		{
			hangoutsPlus.emoticonsPanel.style.display = 'none';
		}
	});

	$(document).on('click', function (event)
	{
		if (!$(event.target).closest('#emojiTable').length && !$(event.target).closest(hangoutsPlus.emojiChatButton).length)
		{
			hangoutsPlus.emojiPanel.style.display = 'none';
		}
	});

	$(document).on('click', function (event)
	{
		if (!$(event.target).closest('#soundsTable').length && !$(event.target).closest(hangoutsPlus.soundsChatButton).length)
		{
			hangoutsPlus.soundsPanel.style.display = 'none';
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
		hangoutsPlus.textArea.value += emote.replacement;
		toggleDiv(hangoutsPlus.emoticonsPanel, 'block');
		hangoutsPlus.textArea.focus();
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
	panel.style.right = '60px';
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
		hangoutsPlus.textArea.value += event.target.childNodes[0].nodeValue;
		toggleDiv(hangoutsPlus.emojiPanel, 'block');
		hangoutsPlus.textArea.focus();
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

function addSoundsEntry(sound)
{
	var link = document.createElement('div');
	link.style.cursor = 'pointer';
	link.style.padding = '4px';
	link.style.border = '1px solid #666';
	link.style.display = 'inline-block';
	link.style.width = '30%';
	link.style.fontSize = '12px';
	link.style.lineHeight = '20px';
	link.title = sound.pattern;
	link.sound = sound;
	link.update = function ()
	{
		var soundAlertIndex = -1;
		for (var i = 0; i < hangoutsPlus.soundAlerts.length; i++)
		{
			if (hangoutsPlus.soundAlerts[i].pattern === this.sound.pattern)
			{
				soundAlertIndex = i;
				break;
			}
		}
		if (soundAlertIndex == -1)
		{
			this.style.backgroundColor = '#FFF';
		}
		else
		{
			this.style.backgroundColor = '#9F9';
		}
	}
	link.update();
	link.appendChild(document.createTextNode(sound.alias));
	link.onclick = function (event)
	{
		var soundAlertIndex = -1;
		for (var i = 0; i < hangoutsPlus.soundAlerts.length; i++)
		{
			if (hangoutsPlus.soundAlerts[i].pattern === sound.pattern)
			{
				soundAlertIndex = i;
				break;
			}
		}
		if (soundAlertIndex == -1)
		{
			hangoutsPlus.soundAlerts.push(
			{
				'pattern': sound.pattern,
				'url': sound.url
			});
			addSystemMessage('[hangouts+]: Added alert ' + sound.pattern + ' plays ' + sound.url + '.');
		}
		else
		{
			hangoutsPlus.soundAlerts.splice(soundAlertIndex, 1);
			addSystemMessage('[hangouts+]: Removed alert ' + sound.pattern + ' no longer plays ' + sound.url + '.');
		}
		savePreferences();
		this.update();
	}
	document.getElementById('soundsTable').appendChild(link);
}

function initializeSoundsPanel()
{
	var panel = document.createElement('div');
	panel.id = 'soundsTable';
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
	var chatButtonContainer = $('.Kc-b-m')[0];
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

function initializeTextInputBorder()
{
	hangoutsPlus.textArea.style.height = '65px';
	hangoutsPlus.textArea.style.marginTop = '0px';
	hangoutsPlus.textArea.style.marginBottom = '15px';
	hangoutsPlus.textArea.style.width = '200px';
	return hangoutsPlus.textArea;
}

function initializeChatLogBorder()
{
	var logBorder = $('.pq-pA.a-E-Pc.Aq')[0];
	logBorder.style.bottom = '105px';
	return logBorder;
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