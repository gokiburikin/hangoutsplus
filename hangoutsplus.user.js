// ==UserScript==
// @name        google hangouts+
// @namespace   https://plus.google.com/hangouts/*
// @include     https://plus.google.com/hangouts/*
// @description Improvements to Google Hangouts
// @version     1.4
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require     https://raw.githubusercontent.com/hazzik/livequery/master/dist/jquery.livequery.min.js
// @downloadURL https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js
// ==/UserScript==

// User preferences
/* Most of these settings are meant to be edited using the commands while in google hangouts.
To access a list of commands, enter the command !? into the chat. */

function initializeVariables()
{
	/* Entries that appear in the arrays in this section are always loaded alongside
	entries users manually add. localstorage is used to save additional entries.

	Script updates will reset these arrays. */

	// Chat message blacklist. Use full names.
	chatBlacklist = [];

	// When true users on the blacklist have their messages completely removed without a trace.
	// When false, their entry will appear in the chatbox, but their message will be replaced with "<message deleted>"
	purgeBlacklistedMessages = false;

	// When true, emulates a twitch.tv style of deleting messages, allowing the user to click them to reveal what was said.
	selectiveHearing = true;

	// Keeps scroll position until you scroll back down. Issues on some browser installations
	enableScrollingFix = true;

	// Disable emoticons
	disableEmoticons = true;

	// Word highlighting
	highlightMatchPatterns = [];
	highlightSoundFilePath = 'https://www.gstatic.com/chat/sounds/hangout_alert_cc041792a9494bf2cb95e160aae459fe.mp3';

	// supports #000, #FFFFFF, and rgba(r,g,b,a) as STRING colors
	highlightColor = 'rgba(0,128,255,0.2)';

	// Word sound alerting. Use Regular Expression
	soundMatchPatterns = [
		'.*[Nn][Yy][Aa][Nn][Pp][Aa][Ss][Uu].*',
		'.*[Nn][Ii][Cc][Oo]\\s[Nn][Ii][Cc][Oo]\\s[Nn][Ii].*',
		'.*[Tt][Ii][Mm][Oo][Tt][Ee][Ii].*',
		'.*[Tt][Uu][Tt][Uu][Rr][Uu].*',
		'.*[Ww][Ee][Hh].*',
		'.*[Qq]_[Qq].*',
		'^\/.*[WwBb][Zz][Zz].*',
		'^\/.*[Ss][Kk][Ii][Tt][Tt][Ee][Rr].*',
		'.*[Ww][Aa][Nn][Gg][Pp][Aa][Ss][Uu].*'
	];
	soundMatchURLs = [
		'https://dl.dropboxusercontent.com/u/12577282/cnd/nyanpasu.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/niconiconi.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/timotei.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/tuturu.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/weh1.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/weh2.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/bzz.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/skitter.wav',
		'https://dl.dropboxusercontent.com/u/12577282/cnd/wangpasu3.wav'
	];
	// Focus chat text area when the window regains focus
	focusChatFromBlur = true;

	// Replace certain words in your message before they're sent
	replacementPatterns = [
		'/scripturl' //,
		//'/sup',
		//'/flex',
		//'/raise',
		//'/sparkles',
		//'/lenny',
		//'/shock',
		//'o_/',
		//'/xoxo',
		//'/highfive',
		//'/kick',
		//'/denko',
		//'/pat',
		//'=\\)',
		//'8\\|',
		//'>:\\(',
		//'/stare',
		//'/lie',
		//'/success',
		//'/devil',
		//'/stab',
		//'/dunno',
		//'/huh',
		//'/what',
		//'/cry',
		//'/sigh',
		//'/woohoo',
		//'/crawl',
		//'/yummy',
		//'/escape',
		//'/sorry'
	];
	replacementValues = [
		'https://raw.githubusercontent.com/gokiburikin/hangoutsplus/master/hangoutsplus.user.js' //,
		//'¯\\_(ツ)_/¯',
		//'ᕦ༼ຈل͜ຈ༽ᕤ',
		//'ヽ༼ຈل͜ຈ༽ﾉ',
		//'(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
		//'( ͡° ͜ʖ ͡°)',
		//'∑(゜Д゜;)',
		//'´ ▽ ` )ﾉ',
		//'(づ￣ ³￣)づ',
		//'(´▽｀)人(´▽｀)',
		//'ヽ(#ﾟДﾟ)ﾉ┌┛Σ(ノ´Д`)ノ',
		//'(´･ω･`)',
		//'(ｏ・_・)ノ(. _ . )',
		//'(๑╹◡╹)',
		//'(⌐■_■)',
		//'(　ﾉ｡ÒㅅÓ)ﾉ',
		//'(=ↀωↀ=)✧',
		//'∠( ᐛ 」∠)＿',
		//'(•̀ᴗ•́)و ̑̑',
		//'←～（o ｀▽´ )oΨ',
		//'∋━━o(｀∀´oメ）～→',
		//'(」ﾟヘﾟ)」',
		//'( ?´_ゝ｀)',
		//'(⊙_☉)',
		//'o(╥﹏╥)o',
		//'(一。一;;）',
		//'Ｏ(≧▽≦)Ｏ',
		//'_:(´ཀ`」 ∠):_',
		//'ヽ(๑╹ڡ╹๑)ﾉ',
		//'C= C= C= ┌(;・ω・)┘',
		//'๑•́ㅿ•̀๑)'
	];

	chatBlacklistAdditions = [];
	replacementValueAdditions = [];
	replacementPatternAdditions = [];
	soundMatchPatternAdditions = [];
	soundMatchURLAdditions = [];
	highlightMatchPatternAdditions = [];
}

// * Do not edit below this line * //

// Saves the preferences to local storage
function savePreferences()
{
	try
	{
		if (localStorageTest())
		{
			localStorage.setItem('blacklist', JSON.stringify(chatBlacklistAdditions));
			localStorage.setItem('highlightMatchPatterns', JSON.stringify(highlightMatchPatternAdditions));
			localStorage.setItem('replacementPatterns', JSON.stringify(replacementPatternAdditions));
			localStorage.setItem('replacementValues', JSON.stringify(replacementValueAdditions));
			localStorage.setItem('soundMatchPatterns', JSON.stringify(soundMatchPatternAdditions));
			localStorage.setItem('soundMatchURLs', JSON.stringify(soundMatchURLAdditions));
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
			chatBlacklistAdditions = tryLoadPreference('blacklist', []);
			highlightMatchPatternAdditions = tryLoadPreference('highlightMatchPatterns', []);
			replacementPatternAdditions = tryLoadPreference('replacementPatterns', []);
			replacementValueAdditions = tryLoadPreference('replacementValues', []);
			soundMatchPatternAdditions = tryLoadPreference('soundMatchPatterns', []);
			soundMatchURLAdditions = tryLoadPreference('soundMatchURLs', []);
			highlightColor = tryLoadPreference('highlightColor', highlightColor);
			selectiveHearing = tryLoadPreference('selectiveHearing', selectiveHearing);
			purgeBlacklistedMessages = tryLoadPreference('purgeMode', purgeBlacklistedMessages);
			enableScrollingFix = tryLoadPreference('enableScrollingFix', enableScrollingFix);

			results = 'Loaded ';
			// Load additional highlights
			results += highlightMatchPatterns.length + '+';
			var additions = 0;
			for (var i = 0; i < highlightMatchPatternAdditions.length; i++)
			{
				if (highlightMatchPatterns.indexOf(highlightMatchPatternAdditions[i]) != -1)
				{
					highlightMatchPatternAdditions.splice(i, 1);
					i--;
				}
				else
				{
					additions++;
				}
			}
			results += additions + ' highlights, ';

			// Load additional replacements
			additions = 0;
			results += replacementPatterns.length + '+';
			for (var i = 0; i < replacementPatternAdditions.length; i++)
			{
				if (replacementPatterns.indexOf(replacementPatternAdditions[i]) != -1)
				{
					replacementPatternAdditions.splice(i, 1);
					replacementValueAdditions.splice(i, 1);
					i--;
				}
				else
				{
					additions++;
				}
			}
			results += additions + ' replacements, ';

			// Load additional blacklist entries
			additions = 0;
			results += chatBlacklist.length + '+';
			for (var i = 0; i < chatBlacklistAdditions.length; i++)
			{
				if (chatBlacklist.indexOf(chatBlacklistAdditions[i]) != -1)
				{
					chatBlacklistAdditions.splice(i, 1);
					i--;
				}
				else
				{
					additions++;
				}
			}
			results += additions + ' blacklist entries, ';

			// Load additional alerts
			additions = 0;
			results += ' and ' + soundMatchPatterns.length + '+';
			for (var i = 0; i < soundMatchPatternAdditions.length; i++)
			{
				if (soundMatchPatterns.indexOf(soundMatchPatternAdditions[i]) != -1)
				{
					soundMatchPatternAdditions.splice(i, 1);
					soundMatchURLAdditions.splice(i, 1);
					i--;
				}
				else
				{
					additions++;
				}
			}
			results += additions + ' sound alerts.';
		}
		addSystemMessage('[hangouts+]:' + results);
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
	localStorage.removeItem('highlightMatchPatterns');
	localStorage.removeItem('replacementPatterns');
	localStorage.removeItem('replacementValues');
	localStorage.removeItem('soundMatchPatterns');
	localStorage.removeItem('soundMatchURLs');
	localStorage.removeItem('highlightColor');
	localStorage.removeItem('selectiveHearing');
	localStorage.removeItem('purgeMode');
	localStorage.removeItem('enableScrollingFix');
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

// Returns the outcome of a regex test
function regexMatch(text, pattern)
{
	var regex = new RegExp(pattern);
	return regex.test(text);
}

function getHighlightMatchPatterns()
{
	return highlightMatchPatterns.concat(highlightMatchPatternAdditions);
}

function getChatBlacklist()
{
	return chatBlacklist.concat(chatBlacklistAdditions);
}

function getSoundMatchPatterns()
{
	return soundMatchPatterns.concat(soundMatchPatternAdditions);
}

function getSoundMatchURLs()
{
	return soundMatchURLs.concat(soundMatchURLAdditions);
}

function getReplacementPatterns()
{
	return replacementPatterns.concat(replacementPatternAdditions);
}

function getReplacementValues()
{
	return replacementValues.concat(replacementValueAdditions);
}

// Handles new messages
/* This function deals with the actual content of the message. */
function handleNewMessage(node, chatMessageSender, chatMessageMessage)
{
	// Highlights
	var highlightMatchPatternsJoin = getHighlightMatchPatterns();
	if (highlightMatchPatternsJoin.length > 0)
	{
		var hasPlayed = false;
		if (!hasPlayed)
		{
			for (var i = 0; i < highlightMatchPatternsJoin.length; i++)
			{
				for (var j = 0; j < chatMessageMessage.childNodes.length; j++)
				{
					if (chatMessageMessage.childNodes[j].nodeType == 3)
					{
						var message = chatMessageMessage.childNodes[j].nodeValue;
						if (regexMatch(message, highlightMatchPatternsJoin[i]))
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
	var chatBlacklistJoin = getChatBlacklist();
	for (var j = 0; j < chatBlacklistJoin.length; j++)
	{
		if (chatBlacklistJoin[j].toLowerCase() == chatMessageSender.nodeValue.toLowerCase())
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
	var soundMatchPatternsJoin = getSoundMatchPatterns();
	var soundMatchURLsJoin = getSoundMatchURLs();
	for (var i = 0; i < soundMatchPatternsJoin.length; i++)
	{
		var hasPlayed = false;
		if (!hasPlayed)
		{
			for (var j = 0; j < chatMessageMessage.childNodes.length; j++)
			{
				if (chatMessageMessage.childNodes[j].nodeType == 3)
				{
					var message = chatMessageMessage.childNodes[j].nodeValue;
					if (regexMatch(message, soundMatchPatternsJoin[i]))
					{
						var audio = new Audio(soundMatchURLsJoin[i]);
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
	// Replacements
	var replacementPatternsJoin = getReplacementPatterns();
	var replacementValuesJoin = getReplacementValues();
	var replacementTuples = [];
	if (replacementPatternsJoin.length != replacementValuesJoin.length)
	{
		addSystemMessage('[hangouts+]: Replacement value/pattern count mismatch.');
	}
	for (var i = 0; i < replacementPatternsJoin.length; i++)
	{
		replacementTuples.push(
		{
			'pattern': replacementPatternsJoin[i],
			'value': replacementValuesJoin[i]
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
				text = text.replace(new RegExp(replacementTuples[i].pattern, 'g'), replacementTuples[i].value);
			}
		}
		catch (exception)
		{
			addSystemMessage("replacement failed on " + replacementTuples[i].pattern + ". Probably malformed regex: " + replacementTuples[i].value);
			text = originalText;
			break;
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
			//'popout'
			'raw message'
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
		if (command[1] && chatBlacklistAdditions.indexOf(merged) == -1)
		{
			chatBlacklistAdditions.push(merged);
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
		if (command[1] && chatBlacklistAdditions.indexOf(merged) != -1)
		{
			chatBlacklistAdditions.splice(chatBlacklistAdditions.indexOf(merged), 1);
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
			if (replacementPatternAdditions.indexOf(command[1]) == -1)
			{
				replacementPatternAdditions.push(command[1]);
				replacementValueAdditions.push(merged);
				addSystemMessage('[hangouts+]: Added replacement pattern ' + command[1] + ' to ' + merged + '.');
			}
			else if (replacementPatternAdditions.indexOf(command[1]) != -1)
			{
				if (!merged || merged.length == 0)
				{
					replacementValueAdditions.splice(replacementPatternAdditions.indexOf(command[1]), 1);
					replacementPatternAdditions.splice(replacementPatternAdditions.indexOf(command[1]), 1);
					addSystemMessage('[hangouts+]: Removed replacement pattern ' + command[1] + '.');
				}
				else
				{
					replacementPatternAdditions[replacementPatternAdditions.indexOf(command[1])] = command[1];
					replacementValueAdditions[replacementPatternAdditions.indexOf(command[1])] = merged;
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
			if (soundMatchPatternAdditions.indexOf(command[1]) == -1)
			{
				soundMatchPatternAdditions.push(command[1]);
				soundMatchURLAdditions.push(merged);
				addSystemMessage('[hangouts+]: Added alert ' + command[1] + ' plays ' + merged + '.');
			}
			else if (soundMatchPatternAdditions.indexOf(command[1]) != -1)
			{
				if (!merged || merged.length == 0)
				{
					soundMatchURLAdditions.splice(soundMatchPatternAdditions.indexOf(command[1]), 1);
					soundMatchPatternAdditions.splice(soundMatchPatternAdditions.indexOf(command[1]), 1);
					addSystemMessage('[hangouts+]: Removed alert ' + command[1] + ' no longer plays ' + merged + '.');
				}
				else
				{
					soundMatchPatternAdditions[soundMatchPatternAdditions.indexOf(command[1])] = command[1];
					soundMatchURLAdditions[soundMatchPatternAdditions.indexOf(command[1])] = merged;
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
		var replacementPatternsJoin = getReplacementPatterns();
		var replacementValuesJoin = getReplacementValues();
		if (replacementPatternsJoin.length == 0)
		{
			addSystemMessage('[hangouts+]: No replacement patterns exist.');
		}
		else
		{
			addSystemMessage('[hangouts+]: Replacement patterns:');
			for (var i = 0; i < replacementPatternsJoin.length; i++)
			{
				addSystemMessage('\t' + replacementPatternsJoin[i] + ' to ' + replacementValuesJoin[i]);
			}
		}
	}
	// Sound alerts list alerts command
	else if (command[0] === '!alerts')
	{
		var soundMatchPatternsJoin = getSoundMatchPatterns();
		var soundMatchURLsJoin = getSoundMatchURLs();
		if (soundMatchPatternsJoin.length == 0)
		{
			addSystemMessage('[hangouts+]: No alerts exist.');
		}
		else
		{
			addSystemMessage('[hangouts+]: Alerts:');
			for (var i = 0; i < soundMatchPatternsJoin.length; i++)
			{
				addSystemMessage('\t' + soundMatchPatternsJoin[i] + ' to ' + soundMatchURLsJoin[i]);
			}
		}
	}
	// Highlights command
	/* Handles listing and clearing all highlights */
	else if (command[0] === '!highlights')
	{
		var highlightMatchPatternsJoin = getHighlightMatchPatterns();
		if (highlightMatchPatternsJoin.length == 0)
		{
			addSystemMessage('[hangouts+]: No highlight patterns.');
		}
		else
		{
			if (command[1] === 'clear')
			{
				highlightMatchPatternAdditions = [];
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
				for (var i = 0; i < highlightMatchPatternsJoin.length; i++)
				{
					highlightPatterns += ',' + highlightMatchPatternsJoin[i];
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
			if (highlightMatchPatternAdditions.indexOf(merged) == -1)
			{
				highlightMatchPatternAdditions.push(merged);
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
			if (highlightMatchPatternAdditions.indexOf(merged) != -1)
			{
				highlightMatchPatternAdditions.splice(highlightMatchPatternAdditions.indexOf(merged), 1);
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
		var chatBlacklistJoin = getChatBlacklist();
		if (chatBlacklistJoin.length == 0)
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
				for (var i = 0; i < chatBlacklistJoin.length; i++)
				{
					blacklistedUsers += ',' + chatBlacklistJoin[i];
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
	// Reset all the preferences back to factory defaults
	else if (command[0] === '!popout')
	{
		initializePopoutChat();
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
					if (chat.scrollTop != chat.scrollHeight - chat.clientHeight)
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
						else
						{
							textArea.value = parseInputText(textArea.value);
						}
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

// Placeholders
var chatBlacklist;
var chatBlacklistAdditions;
var purgeBlacklistedMessages;
var selectiveHearing;
var enableScrollingFix;
var disableEmoticons;
var focusChatFromBlur;
var highlightMatchPatterns;
var highlightMatchPatternAdditions;
var highlightSoundFilePath;
var highlightColor;
var soundMatchPatterns;
var soundMatchPatternAdditions;
var soundMatchURLs;
var soundMatchURLAdditions;
var replacementPatterns
var replacementPatternAdditions;
var replacementValues;
var replacementValueAdditions;

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