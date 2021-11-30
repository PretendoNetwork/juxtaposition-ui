var scrollPosition, pjax;
var updateCheck = setInterval(checkForUpdates, 30000);
{
    var blankMemo = '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';
}

/* global Pjax */
function initNavBar() {
    var buttons = document.querySelectorAll("li[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            for(var i = 0; i < buttons.length; i++) {
                if(buttons[i].classList.contains('selected'))
                    buttons[i].classList.remove('selected');
                if(buttons[i].getAttribute('data-pjax') === el.getAttribute("data-pjax"))
                    buttons[i].classList.add('selected');
            }
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}
function initCommunities() {
    var buttons = document.querySelectorAll("div[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
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
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}
function initCommunityUsers() {
    var users = document.querySelectorAll("img[data-pjax], span[data-pjax], h2[data-pjax]");
    /*users.push(document.querySelectorAll(""));
    users.push(document.querySelectorAll(""));*/
    console.log(users)
    if (!users)
        return;
    for (var i = 0; i < users.length; i++) {
        users[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}

console.log("Document initialized:", window.location.href);
document.addEventListener("pjax:send", function() {
    console.log("Event: pjax:send", arguments);
});
document.addEventListener("pjax:complete", function() {
    console.log("Event: pjax:complete", arguments);
});
document.addEventListener("pjax:error", function() {
    wiiuErrorViewer.openByCodeAndMessage(5984000, 'Error: Unable to load element. \nPlease send code to Jemma on Discord with what you were doing');
});
document.addEventListener("pjax:success", function() {
    console.log("Event: pjax:success", arguments);
    // Init page content
    initNavBar();
    initCommunities();
    initNotifications();
    initCommunityUsers();
});
document.addEventListener("DOMContentLoaded", function() {
    // Init Pjax instance
    pjax = new Pjax({
        elements: [".js-Pjax"],
        selectors: ["#main", "#nav-bar", "title"],
        cacheBust: false
    });
    console.log("Pjax initialized.", pjax);

    // Init page content
    initNavBar();
    initCommunities();
    initNotifications();
    initCommunityUsers();
});

function stopLoading() {
    if (typeof wiiuBrowser !== 'undefined'
        && typeof wiiuBrowser.endStartUp !== 'undefined') {
        wiiuBrowser.endStartUp();
        wiiuSound.playSoundByName('BGM_OLV_MAIN', 3);
        setTimeout(function() {
            wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
        },90000);
    }
}
function exit() {
    wiiu.gamepad.update()
    if(wiiu.gamepad.hold === 8192 || wiiu.gamepad.hold === 40960)
        alert('Debug Menu');
    else {
        wiiuSound.playSoundByName("SE_WAVE_EXIT", 1);
        wiiuBrowser.closeApplication();
    }
}
function back() {
    wiiuSound.playSoundByName('SE_WAVE_MENU', 1);
    wiiuBrowser.showLoadingIcon(!0);
    window.history.back();
}
function showOverlay() {
    wiiuSound.playSoundByName('SE_OLV_OK', 1)
    wiiuSound.playSoundByName('BGM_OLV_SETTING', 3)
    document.getElementById('windowOverlay').style.display = 'block';
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementsByClassName('community-page-header')[0].style.display = 'none';
    document.getElementsByClassName('user-page-back-button')[0].style.display = 'none';
    document.getElementsByClassName('community-page-info-container')[0].style.display = 'none';
    document.getElementsByClassName('community-page-post-box')[0].style.display = 'none';
    document.getElementsByClassName('user-page-tab-table')[0].style.display = 'none';
    document.getElementById('main').style.marginLeft = '14vh';
    document.body.style.backgroundColor = "rgba(0,0,0, 0.5)";
}
function hideOverlay() {
    wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
    document.getElementById('windowOverlay').style.display = 'none';
    document.getElementById('nav-bar').style.display = 'block';
    document.getElementsByClassName('community-page-header')[0].style.display = '';
    document.getElementsByClassName('user-page-back-button')[0].style.display = '';
    document.getElementsByClassName('community-page-info-container')[0].style.display = '';
    document.getElementsByClassName('community-page-post-box')[0].style.display = '';
    document.getElementsByClassName('user-page-tab-table')[0].style.display = '';
    document.getElementById('main').style.marginLeft = '';
    document.body.style.backgroundColor = "rgba(232,236,236,1)";
    wiiuSound.playSoundByName('SE_OLV_CANCEL', 1)
}
function showNewPostScreen() {
    wiiuSound.playSoundByName('SE_OLV_OK', 1)
    wiiuSound.playSoundByName('BGM_OLV_SETTING', 3)
    document.getElementById('windowOverlay').style.display = 'block';
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementsByClassName('community-page-header')[0].style.display = 'none';
    document.getElementsByClassName('community-page-back-button')[0].style.display = 'none';
    document.getElementsByClassName('community-page-info-container')[0].style.display = 'none';
    document.getElementsByClassName('community-page-post-box')[0].style.display = 'none';
    document.getElementsByClassName('community-page-header-overlay')[0].style.display = 'none';
    document.getElementById('community-new-post-wrapper').style.display = 'none';
    document.getElementById('main').style.marginLeft = '14vh';
    document.body.style.backgroundColor = "rgba(0,0,0, 0.5)";
    document.getElementById('post-top-screen-preview').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(true);
    document.getElementById('post-bottom-screen-preview').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(false);
}
function hideNewPostScreen() {
    wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
    document.getElementById('windowOverlay').style.display = 'none';
    document.getElementById('nav-bar').style.display = 'block';
    document.getElementsByClassName('community-page-header')[0].style.display = '';
    document.getElementsByClassName('community-page-back-button')[0].style.display = '';
    document.getElementsByClassName('community-page-info-container')[0].style.display = '';
    document.getElementsByClassName('community-page-post-box')[0].style.display = '';
    document.getElementsByClassName('community-page-header-overlay')[0].style.display = '';
    document.getElementById('community-new-post-wrapper').style.display = '';
    document.getElementById('main').style.marginLeft = '';
    document.body.style.backgroundColor = "rgba(232,236,236,1)";
    wiiuSound.playSoundByName('SE_OLV_CANCEL', 1)
}
function showReplyScreen() {
    wiiuSound.playSoundByName('SE_OLV_OK', 1)
    wiiuSound.playSoundByName('BGM_OLV_SETTING', 3)
    document.getElementById('windowOverlay').style.display = 'block';
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementsByClassName('community-page-post-box')[0].style.display = 'none';
    document.getElementById('community-new-post-wrapper').style.display = 'none';
    document.getElementById('main').style.marginLeft = '15vh';
    document.body.style.backgroundColor = "rgba(0,0,0, 0.5)";
    document.getElementById('post-top-screen-preview').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(true);
    document.getElementById('post-bottom-screen-preview').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(false);
}
function hideReplyScreen() {
    wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
    document.getElementById('windowOverlay').style.display = 'none';
    document.getElementById('nav-bar').style.display = '';
    document.getElementsByClassName('community-page-post-box')[0].style.display = '';
    document.getElementById('community-new-post-wrapper').style.display = '';
    document.getElementById('main').style.marginLeft = '190px';
    document.body.style.backgroundColor = "rgba(232,236,236,1)";
    wiiuSound.playSoundByName('SE_OLV_CANCEL', 1)
}
function yeah(postNode, postID) {
    var yeahCountElement = document.getElementById('yeah-' + postID);
    var yeahcount = yeahCountElement.innerHTML.substr(0, yeahCountElement.innerHTML.indexOf(' '));
    if (postNode.classList.contains("selected")) {
        postNode.classList.remove("selected");
        var params = "postID=" + postID + "&type=down";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/posts/empathy', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
        if(yeahcount > 0) {
            yeahCountElement.innerHTML = --yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
            wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
        }

    }
    else {
        postNode.classList.add("selected");

        var params = "postID=" + postID + "&type=up";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/posts/empathy', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                yeahCountElement.innerHTML = ++yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
            if (this.readyState === 4 && this.status === 423) {
                yeahCountElement.innerHTML = ++yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
        }
        xhttp.send(params);


    }
}
function followCommunity(community) {
    var communityWrapper = document.getElementsByClassName('community-page-follow-button-wrapper')[0];
    var followers = document.getElementsByClassName('community-page-table-text')[0];
    if (communityWrapper.classList.contains("selected")) {
        communityWrapper.classList.remove("selected");
        community.style.color = '#1F8A42';
        var params = "communityID=" + community.id + "&type=false";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/communities/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(params);
        followers.innerHTML = --followers.innerHTML;
        community.innerHTML = 'Follow Community';
        wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
    }
    else {
        var params = "communityID=" + community.id + "&type=true";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/communities/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                communityWrapper.classList.add("selected");
                community.style.color = '#FFFFFF';
                community.innerHTML = 'Following';
                followers.innerHTML = ++followers.innerHTML;
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
            if (this.readyState === 4 && this.status === 423) {
                wiiuErrorViewer.openByCodeAndMessage(5980002, "An error has occurred.\n\nPlease try again later.\n\nIf the problem persists, please make a note of the error code and visit invite.gg/pretendo")
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
        }


        xhttp.send(params);


    }
}
function followUser(user) {
    var userWrapper = user.parentElement;
    var followersElement = document.getElementById('user-page-followers-tab');
    var followers = followersElement.innerHTML.trim().substr(0, followersElement.innerHTML.indexOf(' ') + 1);
    alert(followersElement.innerHTML)
    alert('"' + followers + '"')
    if (userWrapper.classList.contains("selected")) {
        userWrapper.classList.remove("selected");
        user.style.color = '#673DB6';
        var params = "userID=" + user.id + "&type=false";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/users/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(params);

        user.innerHTML = 'Follow User';
        followersElement.innerText = --followers + followersElement.innerHTML.trim().substr(followersElement.innerHTML.indexOf(' '));
        wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
    }
    else {
        userWrapper.classList.add("selected");
        user.style.color = '#FFFFFF';

        var params = "userID=" + user.id + "&type=true";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/users/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                user.innerHTML = 'Following';
                followersElement.innerText = ++followers + followersElement.innerHTML.trim().substr(followersElement.innerHTML.indexOf(' '));
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
            if (this.readyState === 4 && (this.status === 423 || this.status === 404)) {
                userWrapper.classList.remove("selected");
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
        }
        xhttp.send(params);
    }
}
function showMessage(messageID) {
    var scrollHeight = document.body.scrollHeight;
    pjax.loadUrl('/messages/' + messageID);
    wiiuBrowser.showLoadingIcon(!0)
    wiiuSound.playSoundByName('SE_OLV_OK', 1);
    var interval = setInterval(function () {
        if(document.body.scrollHeight !== scrollHeight) {
            window.scroll(0, document.body.scrollHeight);
            clearInterval(interval);
        }
    }, 100);

}
function sendMessage(conversationID, pid) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date +' '+time;
    var messageContents = document.getElementById("message-viewer-input").value;
    if(messageContents.length === 0)
        return;
    var currentThread = document.getElementById('message-viewer-content').innerHTML;
    var newMessage =
        '\n<div class="message-viewer-bubble-sent">\n' +
        '            <p class="message-viewer-bubble-sent-text">' + messageContents + '</p>\n' +
        '        </div>\n' +
    '<div class="message-viewer-bubble-sent-timestamp"><p>' + dateTime + '</p></div>\n';
    var params = "conversationID=" + conversationID + "&message_to_pid=" + pid + "&body=" + messageContents;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/messages/new', true);
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var scrollHeight = document.body.scrollHeight;
            document.getElementById("message-viewer-input").value = '';
            document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage
            var interval = setInterval(function () {
                if(document.body.scrollHeight > scrollHeight) {
                    window.scroll(0, document.body.scrollHeight);
                    clearInterval(interval);
                }
            }, 100);
        }
        if (this.readyState === 4 && (this.status === 423 || this.status === 404)) {
            wiiuErrorViewer.openByCodeAndMessage(5986000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);

}
function sendPainting(conversationID, pid) {
    wiiuMemo.open(false);
    var drawing = wiiuMemo.getImage(false);
    var rawDrawing = wiiuMemo.getImage(true);
    if(drawing !== blankMemo) {
        if(confirm("Send the Drawing?")) {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date +' '+time;
            var currentThread = document.getElementById('message-viewer-content').innerHTML;
            var newMessage =
                '\n<div class="message-viewer-bubble-sent">\n' +
                '            <img class="message-viewer-bubble-sent-memo" src="data:image/bmp;base64,' + drawing + '" >\n' +
                '        </div>\n' +
                '<div class="message-viewer-bubble-sent-timestamp"><p>' + dateTime + '</p></div>\n';
            var scrollHeight = document.body.scrollHeight;
            document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage;
            wiiuMemo.reset();
            var params = "conversationID=" + conversationID + "&message_to_pid=" + pid + "&raw=" + rawDrawing + "&&drawing=" + drawing;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", '/messages/new', true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    document.getElementById("message-viewer-input").value = '';
                    document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage
                    var interval = setInterval(function () {
                        if(document.body.scrollHeight > scrollHeight) {
                            window.scroll(0, document.body.scrollHeight);
                            clearInterval(interval);
                        }
                    }, 100);
                }
                if (this.readyState === 4 && (this.status === 423 || this.status === 404)) {
                    wiiuErrorViewer.openByCodeAndMessage(5986000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
                }
            }
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }
        else
            alert('Canceled');
    }
}
function storeScrollPosition() {
    scrollPosition = document.body.scrollTop;
}
function restoreLastScrollPosition() {
    window.scrollTo(0, scrollPosition);
}
function loadPosts(type) {
    wiiuBrowser.showLoadingIcon(true);
    document.getElementById('recent-tab').classList.remove('active');
    document.getElementById('popular-tab').classList.remove('active');
    document.getElementById('verified-tab').classList.remove('active');
    //0 recent : 1 popular : 2 verified
    switch (type) {
        case 0:
            document.getElementById("recent-tab").classList.add('active');
            type = 'new';
            break;
        case 1:
            document.getElementById("popular-tab").classList.add('active');
            type = 'popular';
            break;
        case 2:
            document.getElementById("verified-tab").classList.add('active');
            type = 'verified';
            break;
    }
    var id = document.getElementsByClassName('community-page-follow-button-text')[0].id
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById('community-posts-inner-body').innerHTML = this.responseText;
            wiiuBrowser.showLoadingIcon(false);
            initCommunityUsers();
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('community-posts-inner-body').innerHTML = '<p class="no-posts-text">No Posts</p>';
            wiiuBrowser.showLoadingIcon(false);
        }
        else if (this.readyState === 4){
            wiiuBrowser.showLoadingIcon(false);
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", '/communities/' + id + '/' + type + '/loadposts', true);
    xhttp.send();

    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);

    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
}
function loadUserPosts(element, pid) {
    wiiuBrowser.showLoadingIcon(!0);
    var offset = Number(element.getAttribute('data-offset'));
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-post-box')[0].innerHTML += this.responseText;
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", "/users/loadPosts" + '?offset=' + offset + '&pid=' + pid, true);
    xhttp.send();

    element.dataset.offset = offset + 10;
    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);
}
function loadCommunityPosts(element, typeCheck) {
    wiiuBrowser.showLoadingIcon(!0);
    var offset = Number(element.getAttribute('data-offset'));
    var id = document.getElementsByClassName('community-page-follow-button-text')[0].id
    var xhttp = new XMLHttpRequest();
    var type = 'new';
    if(!typeCheck) {
        if(document.getElementById('popular-tab').classList.contains('active'))
            type = 'popular';
        else if(document.getElementById('verified-tab').classList.contains('active'))
            type = 'verified';
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-post-box')[0].innerHTML += this.responseText;
            initCommunityUsers();
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", '/communities/' + id + '/' + type + '/loadposts?offset=' + offset, true);
    xhttp.send();

    element.dataset.offset = offset + 10;
    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);
}
function loadFeedPosts(element) {
    var offset = Number(element.getAttribute('data-offset'));
    wiiuBrowser.showLoadingIcon(!0);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById('community-posts-inner-body').innerHTML += this.responseText;
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", '/activity-feed/loadposts?offset=' + offset, true);
    xhttp.send();

    element.dataset.offset = offset + 10;
    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);
}
function switchUserPageTabs(type, id) {
    var typeDomain = '';
    document.getElementById('user-page-posts-tab').classList.remove('selected');
    document.getElementById('user-page-friends-tab').classList.remove('selected');
    document.getElementById('user-page-following-tab').classList.remove('selected');
    document.getElementById('user-page-followers-tab').classList.remove('selected');

    document.getElementById('user-page-posts-triangle').classList.remove('selected');
    document.getElementById('user-page-friends-triangle').classList.remove('selected');
    document.getElementById('user-page-following-triangle').classList.remove('selected');
    document.getElementById('user-page-followers-triangle').classList.remove('selected');
    switch (type) {
        case 0:
            document.getElementById("user-page-posts-tab").classList.add('selected');
            document.getElementById("user-page-posts-triangle").classList.add('selected');
            typeDomain = 'loadPosts';
            break;
        case 1:
            document.getElementById("user-page-friends-tab").classList.add('selected');
            document.getElementById("user-page-friends-triangle").classList.add('selected');
            typeDomain = 'friends';
            break;
        case 2:
            document.getElementById("user-page-following-tab").classList.add('selected');
            document.getElementById("user-page-following-triangle").classList.add('selected');
            typeDomain = 'following';
            break;
        case 3:
            document.getElementById("user-page-followers-tab").classList.add('selected');
            document.getElementById("user-page-followers-triangle").classList.add('selected');
            typeDomain = 'followers';
            break;

    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-post-box')[0].innerHTML = this.responseText;
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing');
        }
    };
    xhttp.open("GET", "/users/" + typeDomain + '?pid=' + id, true);
    xhttp.send();
    wiiuSound.playSoundByName("SE_OLV_OK", 1);
}
function swapPostType(type) {
    document.getElementsByClassName("post-type-button-text")[0].classList.remove('selected');
    document.getElementsByClassName("post-type-button-painting")[0].classList.remove('selected');

    switch (type) {
        case 0:
            document.getElementsByClassName("post-type-button-text")[0].classList.add('selected');
            document.getElementById('post-text-input').style.display = '';
            document.getElementById('post-painting-input').style.display = 'none';
            break;
        case 1:
            document.getElementsByClassName("post-type-button-painting")[0].classList.add('selected');
            document.getElementById('post-text-input').style.display = 'none';
            document.getElementById('post-painting-input').style.display = '';
            break;

    }
    wiiuSound.playSoundByName("SE_OLV_OK", 1);
}
function newPainting(reset) {
    wiiuMemo.open(reset);
    if(wiiuMemo.isFinish()) {
        document.getElementById('memo').src = 'data:image/png;base64,' + wiiuMemo.getImage(false);
        document.getElementById('memo').style.display = '';
        document.getElementById('memo-value').value = wiiuMemo.getImage(true);
    }
}
function loadScreenshots() {
    var dropdown = document.getElementsByClassName('post-screenshot-picker-dropdown')[0];
    if(dropdown.style.display === 'block')
        dropdown.style.display = 'none';
    else
        dropdown.style.display = 'block';
}
function selectScreenshot(select) {
    var screenshot;
    switch (select) {
        case 1:
            screenshot = wiiuMainApplication.getScreenShot(true);
            document.getElementById('screenshot-value').value = screenshot
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundImage = "url('data:image/png;base64," + screenshot + "')";
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundSize = '90%';
            break;
        case 2:
            screenshot = wiiuMainApplication.getScreenShot(false);
            document.getElementById('screenshot-value').value = screenshot;
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundImage = "url('data:image/png;base64," + screenshot + "')";
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundSize = '90%';
            break;
        default:
            document.getElementById('screenshot-value').value = '';
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundImage = '';
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundSize = '';
            break;
    }
}
function searchCommunities() {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("search-bar");
    filter = input.value.toUpperCase();
    table = document.getElementById("community-list");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        for(j = 0; j < tr[i].getElementsByTagName("td").length; j++) {
            td = tr[i].getElementsByTagName("td")[j].children[0].children[1];
            if (td) {
                txtValue = td.textContent || td.innerText;
                console.log(txtValue + '  ' + txtValue.toUpperCase().indexOf(filter))
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].getElementsByTagName("td")[j].style.display = "";
                } else {
                    tr[i].getElementsByTagName("td")[j].style.display = "none";
                }
            }
        }
    }
}
function changeMiiImageReaction(element) {
    if(element.checked) {
        var pfp = document.getElementsByClassName('post-user-icon')[0];
        var newPfp;
        switch (element.value) {
            case '1':
                newPfp = 'smile_open_mouth.png'
                break;
            case '2':
                newPfp = 'wink_left.png'
                break;
            case '3':
                newPfp = 'surprise_open_mouth.png'
                break;
            case '4':
                newPfp = 'frustrated.png'
                break;
            case '5':
                newPfp = 'sorrow.png'
                break;
            default:
                newPfp = 'normal_face.png'
                break;
        }
        pfp.src = pfp.src.substring(0, pfp.src.lastIndexOf('/') + 1) + newPfp;
    }


}

checkForUpdates();
function checkForUpdates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var notificationObj = JSON.parse(this.responseText);
            /**/
            if(notificationObj.message_count > 0  && notificationObj.message_count < 99) {
                document.getElementById("messages-badge").innerHTML = notificationObj.message_count;
                document.getElementById("messages-badge").style.display = "block";
            }
            else if(notificationObj.messages >= 99) {
                document.getElementById("messages-badge").innerHTML = "99+";
                document.getElementById("messages-badge").style.display = "block";
            }
            else {
                document.getElementById("messages-badge").innerHTML = "";
                document.getElementById("messages-badge").style.display = "none";
            }
            /*Check for Notifications*/
            if(notificationObj.notification_count > 0  && notificationObj.notification_count < 99) {
                document.getElementById("news-badge").innerHTML = notificationObj.notification_count;
                document.getElementById("news-badge").style.display = "block";
            }
            else if(notificationObj.notification_count >= 99) {
                document.getElementById("news-badge").innerHTML = "99+";
                document.getElementById("news-badge").style.display = "block";
            }
            else {
                document.getElementById("news-badge").innerHTML = "";
                document.getElementById("news-badge").style.display = "none";
            }
        }
    };
    xhttp.open("GET", "/notifications.json", true);
    xhttp.send();
}
var bButtonCheck = setInterval(function() {
    wiiu.gamepad.update()
    if(wiiu.gamepad.hold === 16384 && wiiuBrowser.canHistoryBack()) {
        wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
        window.history.back()
    }

}, 250);
/*Debugging*/
if (typeof wiiu === 'undefined') {
    window.wiiu = {
        gamepad: {
            update: function () {
                return true;
            },
            hold: 0
        }
    };
}
if (typeof wiiuSound === 'undefined') {
    window.wiiuSound = {
        playSound: function (soundId, device) {
            this.playSoundByName('id ' + soundId, device);
        },
        playSoundByName: function (name, device) {
            console.log('Play sound ' + name);
        }
    };
}
if (typeof wiiuBrowser === 'undefined') {
    window.wiiuBrowser = {
        closeApplication: function () {
            alert('application has closed');
        },
        showLoadingIcon: function (show) {
            console.log((show ? 'Show' : 'Hide') + ' loading icon');
        },
        endStartUp: function () {
            console.log('endStartUp');
        },
        lockUserOperation: function (lock) {
            console.log((lock ? 'Lock' : 'Unlock') + ' user operations');
        },
        lockHomeButtonMenu: function (lock) {
            console.log((lock ? 'Lock' : 'Unlock') + ' home button menu');
        },
        canHistoryBack: function () {
            return location.pathname !== '/';
        },
        setSwkbdDictionary: function (jsonString) {
            console.log('Set SWKBD dictionary', JSON.parse(jsonString));
            return (Math.random() < 0.5)
                ? {} : { error: { code: 111222, message: 'Test Error Message' } };
        },
        openTvAreaSetting: function () {
            alert('Opened the safety frame setting screen on the Tv side.');
        },
        jumpToBrowser: function (url) {
            console.log(url);
        },
        jumpToEshop: function (query) {
            console.log(query);
        },
        jumpToApplication: function(titleId, flags, communityId, appData, postId) {
            console.log(titleId);
        }
    };
}
if (typeof wiiuMemo === "undefined") {
    window.wiiuMemo = {
        _isFinish: true,
        open: function(reset) {
            console.log('wiiuMemo.open(reset = ' + reset + ')');
            this._isFinish = false;
            var self = this;
            setTimeout(function () { self._isFinish = true; }, 1000);
        },
        isFinish: function() {
            console.log('wiiuMemo.isFinish()');
            return this._isFinish;
        },
        reset: function () {
            console.log('wiiuMemo.reset()');
        },
        getImage: function (isTga) {
            console.log('wiiuMemo.getImage(isTga = ' + isTga + ')');
        }
    };
}
if (typeof wiiuBOSS === 'undefined') {
    window.wiiuBOSS = {
        isRegisteredBossTask: function () {
            console.log('wiiuBOSS.isRegisteredBossTask');
            var result = {
                "isRegistered" : true
            };
            return result;
        },
        registerBossTask: function (languageCode) {
            console.log('wiiuBOSS.registerBossTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        unregisterBossTask: function () {
            console.log('wiiuBOSS.unregisterBossTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        isRegisteredDirectMessageTask: function () {
            console.log('wiiuBOSS.isRegisteredDirectMessageTask');
            var result = {
                "isRegistered" : true
            };
            return result;
        },
        registerDirectMessageTask: function (languageCode) {
            console.log('wiiuBOSS.registerDirectMessageTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        registerDirectMessageTaskEx: function (lifeTime, interval) {
            console.log('wiiuBOSS.registerDirectMessageTaskEx');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        unregisterDirectMessageTask: function () {
            console.log('wiiuBOSS.unregisterDirectMessageTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
    };
}
