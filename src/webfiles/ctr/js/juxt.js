var scrollPosition;
var toolbarBackBtn = false;
setInterval(checkForUpdates, 30000);
/* global Pjax */
function initCommunities() {
    var buttons = document.querySelectorAll("div[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            cave.snd_playSe("SE_OLV_OK");
            cave.transition_begin();
            //alert(el.getAttribute("data-pjax"))
            pjax.loadUrl(el.getAttribute("data-pjax"));
            cave.brw_scrollImmediately(0,0);
        });
    }
}
function initUserMenu() {
    var buttons = document.querySelectorAll("button[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            cave.snd_playSe("SE_OLV_OK");
            cave.transition_begin();
            pjax.loadUrl(el.getAttribute("data-pjax"));
            cave.brw_scrollImmediately(0,0);
        });
    }
}
function initNotifications() {
    var buttons = document.querySelectorAll("tr[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            cave.snd_playSe("SE_OLV_OK");
            pjax.loadUrl(el.getAttribute("data-pjax"));
            cave.brw_scrollImmediately(0,0);
        });
    }
}
function initCommunityUsers() {
    var users = document.querySelectorAll("img[data-pjax], span[data-pjax], h2[data-pjax]");
    console.log(users)
    if (!users)
        return;
    for (var i = 0; i < users.length; i++) {
        users[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            cave.snd_playSe("SE_OLV_OK");
            cave.brw_scrollImmediately(0,0);
        });
    }
}

cave.toolbar_setCallback(1, function() {
    pjax.back();
    restoreLastScrollPosition();
})
cave.toolbar_setCallback(2, function() {
    cave.toolbar_setActiveButton(2);
    pjax.loadUrl('/feed');
})
cave.toolbar_setCallback(3, function() {
    cave.toolbar_setActiveButton(3);
    pjax.loadUrl('/titles');
})
cave.toolbar_setCallback(4, function() {
    cave.toolbar_setActiveButton(4);
    checkForUpdates();
    pjax.loadUrl('/news/my_news');
})
cave.toolbar_setCallback(5, function() {
    cave.toolbar_setActiveButton(5);
    pjax.loadUrl('/users/menu')
})
cave.toolbar_setCallback(8, function() {
    messageResponse()
})

function onPageLoad() {
    // Init page content
    pjax.canGoBack();
    initUserMenu();
    initCommunities();
    initNotifications();
    initCommunityUsers();
}
function stopLoading() {
    //loadTab(3);
    cave.transition_end();
    cave.toolbar_setActiveButton(3);
    cave.snd_playBgm('BGM_CAVE_MAIN');
    cave.toolbar_setVisible(true);
}
function toggleToolbar() {
    cave.toolbar_setVisible(false);
}
function toggleBackBtn() {
    if(toolbarBackBtn) {
        cave.toolbar_setButtonType(0);
        toolbarBackBtn = false;
    }

    else {
        cave.toolbar_setButtonType(1);
        toolbarBackBtn = true;
    }

}
function loadMessageThread() {
    storeScrollPosition();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("main").innerHTML = this.responseText;
            toggleBackBtn();
            cave.toolbar_setWideButtonMessage('Click here to reply');
            cave.toolbar_setMode(1);
        }
    };
    xhttp.open("GET", "/message-thread.html", true);
    xhttp.send();
}
function messageResponse() {
    var messageConfirmation;
    var responseType = cave.dialog_twoButton('Reply to Message', 'Select your response type', 'Drawing', 'Text');
    if(responseType) {
        var newMessage = cave.swkbd_callFullKeyboardWithGuide('', 200, 0, false, false, true, 'Type your response here...');
        if(newMessage !== null && newMessage.trim() !== '') {
            messageConfirmation = cave.dialog_twoButton('Send Message?', newMessage, 'No', 'Yes');
            if(messageConfirmation) {
                sendTextMessage(newMessage);
                alert('Sent!');
                cave.brw_scrollImmediately(0,document.body.scrollHeight);
            }
            else
                alert('Canceled');
        }
    }
    else if(!responseType) {
        cave.memo_open();
        var drawing = cave.memo_getImageBmp()
        if(drawing !== blankMemo) {
            messageConfirmation = cave.dialog_twoButton('Send Drawing?', '', 'No', 'Yes');
            if(messageConfirmation) {
                sendDrawingMessage(cave.memo_getImageBmp());
                alert('Sent!');
                cave.brw_scrollImmediately(0,document.body.scrollHeight);
            }
            else
                alert('Canceled');
        }
    }

    else
        cave.error_callFreeErrorViewer(100000, 'idk bro your fucked');
}
function sendTextMessage(messageContents) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date +' '+time;
    var currentThread = document.getElementById('message-viewer-content').innerHTML;
    var newMessage =
        '\n<div class="message-viewer-bubble-sent">\n' +
        '            <p class="message-viewer-bubble-sent-text">' + messageContents + '</p>\n' +
        '        </div>\n' +
        '<div class="message-viewer-bubble-sent-timestamp"><p>' + dateTime + '</p></div>\n' +
        '<img src=\'\' onerror=\'cave.brw_scrollImmediately(0,document.body.scrollHeight);\'>';
    document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage
}
function sendDrawingMessage(memoURI) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date +' '+time;
    var currentThread = document.getElementById('message-viewer-content').innerHTML;
    var newMessage =
        '\n<div class="message-viewer-bubble-sent">\n' +
        '            <img class="message-viewer-bubble-sent-memo" src="data:image/bmp;base64,' + memoURI + '" >\n' +
        '        </div>\n' +
        '<div class="message-viewer-bubble-sent-timestamp"><p>' + dateTime + '</p></div>\n' +
        '<img src=\'\' onerror=\'cave.brw_scrollImmediately(0,document.body.scrollHeight);\'>';
    document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage
}
function searchCommunities(searchBox) {
    var searchText = cave.swkbd_callFullKeyboardWithGuide(searchBox.value, 200, 0, false, false, true, 'Search communities...');
    searchBox.value = searchText;
}
checkForUpdates();
function checkForUpdates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var notificationObj = JSON.parse(this.responseText);
            var notificationCount = notificationObj.news + notificationObj.messages;
            /*Check for Notifications*/
            /**if(document.getElementById("messages-banner-badge")) {
                if(notificationObj.messages > 0  && notificationObj.messages < 99) {
                    document.getElementById("messages-banner-badge").innerHTML = notificationObj.messages;
                    document.getElementById("messages-banner-badge").style.display = "block";
                }
                else if(notificationObj.messages >= 99) {
                    document.getElementById("messages-banner-badge").innerHTML = "99+";
                    document.getElementById("messages-banner-badge").style.display = "block";
                }
                else {
                    document.getElementById("messages-banner-badge").innerHTML = "";
                    document.getElementById("messages-banner-badge").style.display = "none";
                }
            }**/

            if(notificationCount > 0  && notificationCount < 99) {
                cave.toolbar_setNotificationCount(notificationCount);
            }
            else if(notificationCount >= 99) {
                cave.toolbar_setNotificationCount(99);
            }
            else {
                cave.toolbar_setNotificationCount(0);
            }
        }
    };
    xhttp.open("GET", "/notifications.json", true);
    xhttp.send();
}
function filterById(jsonObject, id) {
    return jsonObject.filter(function(jsonObject) {
        return (jsonObject['id'] === id);})[0];
}
function storeScrollPosition() {
    scrollPosition = document.body.scrollTop;
}
function restoreLastScrollPosition() {
    cave.brw_scrollImmediately(0, scrollPosition);
}
function followCommunity(communityWrapper) {
    var community = document.getElementsByClassName('community-page-follow-button-text')[0];
    if (communityWrapper.className.indexOf('selected') !== -1) {
        communityWrapper.className = 'community-page-follow-button';
        community.style.color = '#1F8A42';
        var params = "communityID=" + communityWrapper.id + "&type=false";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/communities/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(params);
        community.innerHTML = 'Follow';
        cave.snd_playSe('SE_OLV_CHECKBOX_UNCHECK');
    }
    else {
        var params = "communityID=" + communityWrapper.id + "&type=true";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/communities/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                communityWrapper.className = 'community-page-follow-button selected';
                community.style.color = 'white';
                community.innerHTML = 'Following';
                cave.snd_playSe('SE_OLV_CHECKBOX_CHECK');
            }
            if (this.readyState === 4 && this.status === 423) {
                cave.error_callFreeErrorViewer(5980002, "An error has occurred.\n\nPlease try again later.\n\nIf the problem persists, please make a \nnote of the error code and visit invite.gg/pretendo")
            }
        }


        xhttp.send(params);


    }
}
function yeah(postNode, postID) {
    cave.transition_begin();
    var yeahCountElement = document.getElementById('yeah-' + postID);
    var yeahcount = yeahCountElement.innerHTML.replace(' Yeahs', '');
    if (postNode.className.indexOf("selected") !== -1) {
        postNode.className = "community-page-post-yeah-button-wrapper";
        var params = "postID=" + postID + "&type=down";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/posts/empathy', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
        yeahCountElement.innerHTML = --yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
        cave.snd_playSe('SE_OLV_CANCEL');
        cave.transition_end();
    }
    else {
        postNode.className += " selected";

        var params = "postID=" + postID + "&type=up";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/posts/empathy', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                //yeahCountElement.innerHTML = ++yeahcount + ' Yeahs';
                yeahCountElement.innerHTML = ++yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
                cave.snd_playSe('SE_OLV_MII_ADD');
                cave.transition_end();
            }
            if (this.readyState === 4 && this.status === 423) {
                yeahCountElement.innerHTML = ++yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
                cave.snd_playSe('SE_OLV_MII_ADD');
                cave.transition_end();
            }
        }
        xhttp.send(params);
    }
}

function loadPosts(type) {
    cave.transition_begin();
    document.getElementById('recent-tab').className = 'community-page-posts-header-tab';
    document.getElementById('popular-tab').className = 'community-page-posts-header-tab';
    document.getElementById('verified-tab').className = 'community-page-posts-header-tab';
    //0 recent : 1 popular : 2 verified
    switch (type) {
        case 0:
            document.getElementById("recent-tab").className +=' active';
            type = 'new';
            break;
        case 1:
            document.getElementById("popular-tab").className +=' active';
            type = 'popular';
            break;
        case 2:
            document.getElementById("verified-tab").className +=' active';
            type = 'verified';
            break;
    }
    var id = document.getElementsByClassName('community-page-follow-button')[0].id
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById('wrapper').innerHTML = this.responseText;
            cave.transition_end();
            initCommunityUsers();
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('wrapper').innerHTML = '<p class="no-posts-text">No Posts</p>';
            cave.transition_end();
        }
        else if (this.readyState === 4){
            cave.transition_end();
            cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", '/communities/' + id + '/' + type + '/loadposts', true);
    xhttp.send();

    cave.snd_playSe("SE_OLV_OK");
    cave.transition_end();
}
function loadUserPosts() {
    cave.transition_begin();
    var id = document.getElementsByClassName('post-user-info-wrapper')[document.getElementsByClassName('post-user-info-wrapper').length - 1].id
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-posts-wrapper')[0].innerHTML += this.responseText;
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", "/users/loadPosts" + '?postID=' + id, true);
    xhttp.send();

    cave.snd_playSe("SE_OLV_OK");
    cave.transition_end();
}
function loadCommunityPosts(element) {
    cave.transition_begin();
    var offset = Number(element.getAttribute('data-offset'));
    var id = document.getElementsByClassName('community-page-follow-button')[0].id
    var xhttp = new XMLHttpRequest();
    var type = 'null';
    if(document.getElementById('recent-tab').className.indexOf('active') !== -1)
        type = 'new';
    else if(document.getElementById('popular-tab').className.indexOf('active') !== -1)
        type = 'popular';
    else if(document.getElementById('verified-tab').className.indexOf('active') !== -1)
        type = 'verified';
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-posts-wrapper')[0].innerHTML += this.responseText;
            initCommunityUsers();
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", '/communities/' + id + '/' + type + '/loadposts?offset=' + offset, true);
    xhttp.send();

    element.setAttribute('data-offset', offset + 10);
    cave.snd_playSe("SE_OLV_OK");
    cave.transition_end();
}


function loadFeedPosts(element) {
    cave.transition_begin();
    var offset = Number(element.getAttribute('data-offset'));
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById('wrapper').innerHTML += this.responseText;
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", '/activity-feed/loadposts?offset=' + offset, true);
    xhttp.send();

    element.setAttribute('data-offset', offset + 10);
    cave.snd_playSe("SE_OLV_OK");
    cave.transition_end();
}

function newPainting(reset) {
    if(reset)
        cave.memo_clear()
    cave.memo_open();
    if(cave.memo_hasValidImage()) {
        document.getElementById('memo').src = 'data:image/png;base64,' + cave.memo_getImageBmp();
        document.getElementById('memo').style.display = '';
        var test;
        try {
            test = cave.memo_getImageRawTga()
        }
        catch (e) {
            alert(e)
        }
        alert(typeof test);
        alert(test.length)
        document.getElementById('memo-value').value = cave.memo_getImageBmp();
    }
}
function loadScreenshots() {
    var screenshot = {
        SCREEN_UPSIDE: 0,
        SCREEN_DOWNSIDE: 1,
        isEnabled: function (e) {
            return void 0 === cave.capture_isEnabledEx ? cave.capture_isEnabled() : cave.capture_isEnabledEx(e)
        },
        isEnabledAnySide: function () {
            return this.isEnabled(this.SCREEN_UPSIDE) || this.isEnabled(this.SCREEN_DOWNSIDE)
        },
        retrieveImagePath: function (e) {
            if (e === this.SCREEN_UPSIDE) return cave.lls_setCaptureImage("upside", 3), cave.lls_getPath("upside");
            if (e === this.SCREEN_DOWNSIDE) return cave.lls_setCaptureImage("downside", 0), cave.lls_getPath("downside");
            throw new Error("Invalid screen id")
        }
    }
    if(!screenshot.isEnabledAnySide()) {
        cave.error_callFreeErrorViewer(5980015, 'Software does not support screenshots');
        return;
    }
    try {
        var top = screenshot.retrieveImagePath(0);
        var bottom = screenshot.retrieveImagePath(1);
        document.getElementById('post-top-screen-preview').src = top;
        document.getElementById('post-bottom-screen-preview').src = bottom;
    }
    catch (e) {
        alert(e);
    }
    var dropdown = document.getElementsByClassName('post-screenshot-picker-dropdown')[0];
    if(dropdown.style.display === 'block')
        dropdown.style.display = 'none';
    else
        dropdown.style.display = 'block';
}

function getScreenshot(url) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {

        }
        else if (this.readyState === 4){
            cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function showNewPostScreen() {
    cave.snd_playSe("SE_OLV_OK");
    cave.snd_playBgm('BGM_CAVE_SYOKAI');
    document.getElementById('windowOverlay').style.display = 'block';
    document.getElementById('community-related-wrapper').style.display = 'none';
    document.getElementsByClassName('community-page-follow-button')[0].style.display = 'none';
    document.getElementsByClassName('community-page-new-post-button')[0].style.display = 'none';
    document.getElementsByClassName('community-page-posts-wrapper')[0].style.display = 'none';
}
function hideNewPostScreen() {
    cave.snd_playBgm('BGM_CAVE_MAIN_LOOP_NOWAIT');
    document.getElementById('windowOverlay').style.display = 'none';
    document.getElementById('community-related-wrapper').style.display = 'block';
    document.getElementsByClassName('community-page-follow-button')[0].style.display = 'block';
    document.getElementsByClassName('community-page-new-post-button')[0].style.display = 'block';
    document.getElementsByClassName('community-page-posts-wrapper')[0].style.display = 'block';
    cave.snd_playSe("SE_OLV_CANCEL");
}

function swapPostType(type) {
    document.getElementsByClassName("post-type-button-text")[0].className = 'post-type-button-text';
    document.getElementsByClassName("post-type-button-painting")[0].className = 'post-type-button-painting';

    switch (type) {
        case 0:
            document.getElementsByClassName("post-type-button-text")[0].className += ' selected';
            document.getElementById('post-text-input').style.display = '';
            document.getElementById('post-painting-input').style.display = 'none';
            break;
        case 1:
            document.getElementsByClassName("post-type-button-painting")[0].className += ' selected';
            document.getElementById('post-text-input').style.display = 'none';
            document.getElementById('post-painting-input').style.display = '';
            break;

    }
    cave.snd_playSe("SE_OLV_OK");
}

function selectEmotion(element) {
    for (var i = 0; i < element.parentElement.parentElement.children.length; i++) {
        var child = element.parentElement.parentElement.children[i];
        if(child.children[1].className.indexOf('selected-') !== -1) {
            child.children[1].className = child.children[1].className.substring(9, child.children[1].className.length);
        }
    }
    element.parentElement.children[1].className = 'selected-' + element.id
}

document.addEventListener("DOMContentLoaded", onPageLoad);